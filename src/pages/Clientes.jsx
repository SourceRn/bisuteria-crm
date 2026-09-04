import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getClientes, crearCliente } from "../services/api";
import "./Clientes.css";

const ETAPAS = ["Prospecto", "Activo", "Frecuente", "Inactivo"];

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [etapa, setEtapa] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", correo: "", telefono: "" });
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    setCargando(true);
    const params = {};
    if (buscar) params.buscar = buscar;
    if (etapa) params.etapa = etapa;

    getClientes(params)
      .then(setClientes)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    const timeout = setTimeout(cargar, 300); // debounce simple para la busqueda
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar, etapa]);

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
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="clientes__empty">No hay clientes con esos filtros.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </Layout>
  );
}