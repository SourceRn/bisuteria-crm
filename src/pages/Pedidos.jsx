import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getPedidos, getResumenPedidos } from "../services/api";
import "./Pedidos.css";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function cargar() {
    setCargando(true);
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    Promise.all([getPedidos(params), getResumenPedidos()])
      .then(([p, r]) => {
        setPedidos(p);
        setResumen(r);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  return (
    <Layout titulo="Pedidos">
      {resumen && (
        <div className="pedidos__counters">
          <div className="pedidos__card">
            <p className="pedidos__card-label">Total de pedidos</p>
            <p className="pedidos__card-value">{resumen.total_pedidos}</p>
          </div>
          <div className="pedidos__card">
            <p className="pedidos__card-label">Clientes con al menos un pedido</p>
            <p className="pedidos__card-value">{resumen.clientes_con_pedido}</p>
          </div>
          <div className="pedidos__card">
            <p className="pedidos__card-label">Últimos 30 días</p>
            <p className="pedidos__card-value">{resumen.pedidos_ultimos_30_dias}</p>
          </div>
        </div>
      )}

      <div className="pedidos__toolbar">
        <label>
          Desde
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </label>
      </div>

      {error && <p className="pedidos__error">Error: {error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : pedidos.length === 0 ? (
        <p className="pedidos__empty">No hay pedidos registrados en este periodo.</p>
      ) : (
        <table className="pedidos__table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Correo</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="pedidos__row" onClick={() => navigate(`/clientes/${p.cliente_id}`)}>
                <td>{new Date(p.fecha).toLocaleDateString()}</td>
                <td><span className="pedidos__row-name">{p.cliente_nombre}</span></td>
                <td>{p.cliente_correo}</td>
                <td>{p.descripcion || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}