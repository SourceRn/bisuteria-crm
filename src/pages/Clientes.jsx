import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { getClientes, crearCliente, actualizarCliente, eliminarCliente } from "../services/api";
import "./Clientes.css";

const ETAPAS = ["Prospecto", "Activo", "Frecuente", "Inactivo"];
const ESTADOS = ["activo", "inactivo"];

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [etapa, setEtapa] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [estado, setEstado] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", correo: "", telefono: "" });
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null); // guarda el cliente completo que se está editando
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const { esAdmin } = useAuth();

  function cargar() {
    setCargando(true);
    const params = {};
    if (buscar) params.buscar = buscar;
    if (etapa) params.etapa = etapa;
    if (estado) params.estado = estado;

    getClientes(params)
      .then(setClientes)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    const timeout = setTimeout(cargar, 300); // debounce simple para la busqueda
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar, etapa, estado]);

  async function handleCrear(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearCliente(nuevo);
      setNuevo({ nombre: "", correo: "", telefono: "" });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarEdicion(e) {
    e.preventDefault();
    setGuardandoEdicion(true);
    try {
      await actualizarCliente(editando.id, {
        nombre: editando.nombre,
        correo: editando.correo,
        telefono: editando.telefono,
        estado: editando.estado,
      });
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function handleEliminar(cliente) {
    const confirmado = window.confirm(`¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    try {
      await eliminarCliente(cliente.id);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout titulo="Clientes">
      <div className="clientes__toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="clientes__search"
        />
        <select value={etapa} onChange={(e) => setEtapa(e.target.value)} className="clientes__filter">
          <option value="">Todas las etapas</option>
          {ETAPAS.map((et) => (
            <option key={et} value={et}>{et}</option>
          ))}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="clientes__filter">
          <option value="">Todos los estados</option>
          {ESTADOS.map((es) => (
            <option key={es} value={es}>{es}</option>
          ))}
        </select>
        <button className="clientes__new-btn" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Nuevo cliente"}
        </button>
      </div>

      {mostrarForm && (
        <form className="clientes__form" onSubmit={handleCrear}>
          <input
            type="text"
            placeholder="Nombre"
            required
            value={nuevo.nombre}
            onChange={(e) => setNuevo((p) => ({ ...p, nombre: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Correo"
            required
            value={nuevo.correo}
            onChange={(e) => setNuevo((p) => ({ ...p, correo: e.target.value }))}
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={nuevo.telefono}
            onChange={(e) => setNuevo((p) => ({ ...p, telefono: e.target.value }))}
          />
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      {error && <p className="clientes__error">Error: {error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <table className="clientes__table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Etapa</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td><Link to={`/clientes/${c.id}`}>{c.nombre}</Link></td>
                <td>{c.correo}</td>
                <td>{c.telefono || "—"}</td>
                <td><span className={`etapa-badge etapa-badge--${c.etapa_crm.toLowerCase()}`}>{c.etapa_crm}</span></td>
                <td>{c.estado}</td>
                <td>
                  <button className="clientes__edit-btn" onClick={() => setEditando({ ...c, telefono: c.telefono || "" })}>
                    Editar
                  </button>
                  {esAdmin && (
                    <button className="clientes__delete-btn" onClick={() => handleEliminar(c)}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={6} className="clientes__empty">No hay clientes con esos filtros.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {editando && (
        <div className="clientes__modal-overlay" onClick={() => setEditando(null)}>
          <form
            className="clientes__modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleGuardarEdicion}
          >
            <h2>Editar cliente</h2>

            <label>
              Nombre
              <input
                type="text"
                required
                value={editando.nombre}
                onChange={(e) => setEditando((p) => ({ ...p, nombre: e.target.value }))}
              />
            </label>

            <label>
              Correo
              <input
                type="email"
                required
                value={editando.correo}
                onChange={(e) => setEditando((p) => ({ ...p, correo: e.target.value }))}
              />
            </label>

            <label>
              Teléfono
              <input
                type="tel"
                value={editando.telefono || ""}
                onChange={(e) => setEditando((p) => ({ ...p, telefono: e.target.value }))}
              />
            </label>

            <label>
              Estado
              <select
                value={editando.estado}
                onChange={(e) => setEditando((p) => ({ ...p, estado: e.target.value }))}
              >
                {ESTADOS.map((es) => (
                  <option key={es} value={es}>{es}</option>
                ))}
              </select>
            </label>

            <div className="clientes__modal-actions">
              <button type="button" onClick={() => setEditando(null)}>
                Cancelar
              </button>
              <button type="submit" disabled={guardandoEdicion}>
                {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}