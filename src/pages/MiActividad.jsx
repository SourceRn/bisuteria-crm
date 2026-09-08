import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getMiActividad } from "../services/api";
import "./MiActividad.css";

export default function MiActividad() {
  const [actividad, setActividad] = useState([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  function cargar() {
    setCargando(true);
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    getMiActividad(params)
      .then(setActividad)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  return (
    <Layout titulo="Mi actividad">
      <div className="actividad__toolbar">
        <label>
          Desde
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </label>
      </div>

      {error && <p className="actividad__error">Error: {error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : actividad.length === 0 ? (
        <p className="actividad__empty">No has registrado interacciones en este periodo.</p>
      ) : (
        <table className="actividad__table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {actividad.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.fecha).toLocaleString()}</td>
                <td><Link to={`/clientes/${a.cliente_id}`}>{a.cliente_nombre}</Link></td>
                <td>{a.tipo}</td>
                <td>{a.descripcion || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}