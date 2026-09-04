import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import {
  getCliente,
  getInteraccionesDeCliente,
  actualizarEtapaCliente,
  crearInteraccion,
} from "../services/api";
import "./ClienteDetalle.css";

const ETAPAS = ["Prospecto", "Activo", "Frecuente", "Inactivo"];
const TIPOS = ["Llamada", "Correo", "Reunion", "Otro"];

export default function ClienteDetalle() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [interacciones, setInteracciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [nuevaInteraccion, setNuevaInteraccion] = useState({ tipo: "Llamada", descripcion: "" });
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
      await crearInteraccion({ cliente_id: id, ...nuevaInteraccion });
      setNuevaInteraccion({ tipo: "Llamada", descripcion: "" });
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <Layout titulo="Cliente"><p>Cargando...</p></Layout>;
  if (error && !cliente) return <Layout titulo="Cliente"><p className="detalle__error">Error: {error}</p></Layout>;

  return (
    <Layout titulo={cliente.nombre}>
      <Link to="/clientes" className="detalle__back">← Volver a clientes</Link>

      <div className="detalle__layout">
        <section className="detalle__info">
          <h2>Información</h2>
          <p><strong>Correo:</strong> {cliente.correo}</p>
          <p><strong>Teléfono:</strong> {cliente.telefono || "—"}</p>
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

        <section className="detalle__interacciones">
          <h2>Historial de interacciones</h2>

          <form className="detalle__form" onSubmit={handleRegistrarInteraccion}>
            <select
              value={nuevaInteraccion.tipo}
              onChange={(e) => setNuevaInteraccion((p) => ({ ...p, tipo: e.target.value }))}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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

          {interacciones.length === 0 ? (
            <p className="detalle__empty">Sin interacciones registradas todavía.</p>
          ) : (
            <ul className="detalle__timeline">
              {interacciones.map((i) => (
                <li key={i.id}>
                  <span className="detalle__timeline-tipo">{i.tipo}</span>
                  <p>{i.descripcion || "—"}</p>
                  <time>{new Date(i.fecha).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}