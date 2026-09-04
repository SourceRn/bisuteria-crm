import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "../components/layout/Layout";
import { getMetricas } from "../services/api";
import "./Dashboard.css";

const COLORS = ["#9CAE93", "#B3AEDD"]; // activos, inactivos

export default function Dashboard() {
  const [metricas, setMetricas] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getMetricas()
      .then(setMetricas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Layout titulo="Dashboard">
      {cargando && <p>Cargando métricas...</p>}
      {error && <p className="dashboard__error">Error: {error}</p>}

      {metricas && (
        <>
          <div className="dashboard__counters">
            <div className="dashboard__card">
              <p className="dashboard__card-label">Total de clientes</p>
              <p className="dashboard__card-value">{metricas.total_clientes}</p>
            </div>
            <div className="dashboard__card">
              <p className="dashboard__card-label">Clientes activos</p>
              <p className="dashboard__card-value">{metricas.clientes_activos}</p>
            </div>
            <div className="dashboard__card">
              <p className="dashboard__card-label">Clientes inactivos</p>
              <p className="dashboard__card-value">{metricas.clientes_inactivos}</p>
            </div>
            <div className="dashboard__card">
              <p className="dashboard__card-label">Sin interacción reciente</p>
              <p className="dashboard__card-value dashboard__card-value--warning">
                {metricas.clientes_sin_interaccion_reciente.total}
              </p>
            </div>
          </div>

          <div className="dashboard__panels">
            <div className="dashboard__panel">
              <h2>Activos vs inactivos</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Activos", value: metricas.clientes_activos },
                      { name: "Inactivos", value: metricas.clientes_inactivos },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                  >
                    {COLORS.map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard__panel">
              <h2>Clientes en riesgo</h2>
              {metricas.clientes_sin_interaccion_reciente.clientes.length === 0 ? (
                <p className="dashboard__empty">Ningún cliente sin contacto reciente 🎉</p>
              ) : (
                <ul className="dashboard__risk-list">
                  {metricas.clientes_sin_interaccion_reciente.clientes.slice(0, 5).map((c) => (
                    <li key={c.id}>
                      <Link to={`/clientes/${c.id}`}>{c.nombre}</Link>
                      <span>{c.etapa_crm}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}