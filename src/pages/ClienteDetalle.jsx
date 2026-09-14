import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import {
  getCliente,
  getInteraccionesDeCliente,
  actualizarEtapaCliente,
  crearInteraccion,
  getUsuarios,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./ClienteDetalle.css";

const ETAPAS = ["Prospecto", "Activo", "Frecuente", "Inactivo"];
const TIPOS = ["Llamada", "Correo", "Reunion", "Otro"];

export default function ClienteDetalle() {
  const { id } = useParams();
  const { perfil } = useAuth();

  const [cliente, setCliente] = useState(null);
  const [interacciones, setInteracciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [nuevaInteraccion, setNuevaInteraccion] = useState({
    tipo: "Llamada",
    descripcion: "",
    fecha: "",
    usuario_id: "",
  });
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    setCargando(true);
    Promise.all([getCliente(id), getInteraccionesDeCliente(id)])
      .then(([c, i]) => {
        setCliente(c);
        setInteracciones(i);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    getUsuarios()
      .then((lista) => {
        setUsuarios(lista);
        if (perfil?.id) {
          setNuevaInteraccion((prev) => ({ ...prev, usuario_id: perfil.id }));
        }
      })
      .catch((err) => console.error("No se pudo cargar la lista de usuarios:", err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCambiarEtapa(e) {
    const nuevaEtapa = e.target.value;
    try {
      const actualizado = await actualizarEtapaCliente(id, nuevaEtapa);
      setCliente(actualizado);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegistrarInteraccion(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearInteraccion({
        cliente_id: id,
        usuario_id: nuevaInteraccion.usuario_id || perfil?.id,
        tipo: nuevaInteraccion.tipo,
        descripcion: nuevaInteraccion.descripcion,
        fecha: nuevaInteraccion.fecha ? new Date(nuevaInteraccion.fecha).toISOString() : undefined,
      });
      setNuevaInteraccion({ tipo: "Llamada", descripcion: "", fecha: "", usuario_id: perfil?.id || "" });
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <Layout titulo="Cliente"><p>Cargando...</p></Layout>;
  if (error && !cliente) return <Layout titulo="Cliente"><p className="detalle__error">Error: {error}</p></Layout>;

  // Separacion clave: pedidos (generados por el storefront) vs interacciones humanas
  const pedidos = interacciones.filter((i) => i.tipo === "Pedido");
  const interaccionesHumanas = interacciones.filter((i) => i.tipo !== "Pedido");

  return (
    <Layout titulo={cliente.nombre}>
      <Link to="/clientes" className="detalle__back">← Volver a clientes</Link>

      <div className="detalle__layout">
        <section className="detalle__info">
          <h2>Información</h2>
          <p><strong>Correo:</strong> {cliente.correo}</p>
          <p><strong>Teléfono:</strong> {cliente.telefono || "—"}</p>
          <p><strong>Empresa:</strong> {cliente.empresa || "—"}</p>
          <p><strong>Estado:</strong> <span className={`estado-badge estado-badge--${cliente.estado}`}>{cliente.estado}</span></p>
          <p><strong>Registrado:</strong> {new Date(cliente.fecha_registro).toLocaleDateString()}</p>

          <label className="detalle__etapa-label">
            Etapa CRM
            <select value={cliente.etapa_crm} onChange={handleCambiarEtapa}>
              {ETAPAS.map((et) => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </label>
        </section>

        <div className="detalle__main">
          {/* Bloque 1: Registrar Interaccion (solo el formulario) */}
          <section className="detalle__block">
            <h2>Registrar interacción</h2>
            <form className="detalle__form" onSubmit={handleRegistrarInteraccion}>
              <div className="detalle__form-row">
                <select
                  value={nuevaInteraccion.tipo}
                  onChange={(e) => setNuevaInteraccion((p) => ({ ...p, tipo: e.target.value }))}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <input
                  type="datetime-local"
                  value={nuevaInteraccion.fecha}
                  onChange={(e) => setNuevaInteraccion((p) => ({ ...p, fecha: e.target.value }))}
                />

                <select
                  value={nuevaInteraccion.usuario_id}
                  onChange={(e) => setNuevaInteraccion((p) => ({ ...p, usuario_id: e.target.value }))}
                >
                  <option value="">Responsable...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Descripción..."
                value={nuevaInteraccion.descripcion}
                onChange={(e) => setNuevaInteraccion((p) => ({ ...p, descripcion: e.target.value }))}
              />

              <button type="submit" disabled={guardando}>
                {guardando ? "..." : "Registrar"}
              </button>
            </form>
          </section>

          {/* Bloque 2: Pedidos — generados automaticamente por el storefront */}
          <section className="detalle__block">
            <h2>Pedidos</h2>
            {pedidos.length === 0 ? (
              <p className="detalle__empty">Este cliente no ha realizado pedidos todavía.</p>
            ) : (
              <ul className="detalle__timeline detalle__timeline--pedidos">
                {pedidos.map((p) => (
                  <li key={p.id}>
                    <span className="detalle__timeline-tipo detalle__timeline-tipo--pedido">Pedido</span>
                    <p>{p.descripcion || "—"}</p>
                    <time>{new Date(p.fecha).toLocaleString()}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Bloque 3: Historial de interacciones humanas (llamadas, correos, reuniones, etc.) */}
          <section className="detalle__block">
            <h2>Historial de interacciones</h2>
            {interaccionesHumanas.length === 0 ? (
              <p className="detalle__empty">Sin interacciones registradas todavía.</p>
            ) : (
              <ul className="detalle__timeline">
                {interaccionesHumanas.map((i) => (
                  <li key={i.id}>
                    <div className="detalle__timeline-header">
                      <span className="detalle__timeline-tipo">{i.tipo}</span>
                      <span className="detalle__timeline-responsable">
                        {i.usuario_nombre || "Sin responsable asignado"}
                      </span>
                    </div>
                    <p>{i.descripcion || "—"}</p>
                    <time>{new Date(i.fecha).toLocaleString()}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}