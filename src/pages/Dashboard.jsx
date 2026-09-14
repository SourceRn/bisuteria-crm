import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "../components/layout/Layout";
import { getMetricas } from "../services/api";
import "./Dashboard.css";

const COLORS = ["#9CAE93", "#B3AEDD"]; // activos, inactivos

export default function Dashboard() {
  const [metricas, setMetricas] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

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
              <div className="dashboard__pie-layout">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Activos", value: metricas.clientes_activos },
                        { name: "Inactivos", value: metricas.clientes_inactivos },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={75}
                    >
                      {COLORS.map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="dashboard__pie-legend">
                  {[
                    { label: "Activos", valor: metricas.clientes_activos, color: COLORS[0] },
                    { label: "Inactivos", valor: metricas.clientes_inactivos, color: COLORS[1] },
                  ].map((item) => {
                    const total = metricas.clientes_activos + metricas.clientes_inactivos;
                    const porcentaje = total > 0 ? Math.round((item.valor / total) * 100) : 0;
                    return (
                      <div key={item.label} className="dashboard__pie-legend-item">
                        <span className="dashboard__pie-dot" style={{ background: item.color }} />
                        <div>
                          <p className="dashboard__pie-legend-label">{item.label}</p>
                          <p className="dashboard__pie-legend-value">
                            {item.valor} <span>({porcentaje}%)</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="dashboard__panel">
              <h2>Clientes en riesgo</h2>
              {metricas.clientes_sin_interaccion_reciente.clientes.length === 0 ? (
                <p className="dashboard__empty">Ningún cliente sin contacto reciente</p>
              ) : (
                <ul className="dashboard__risk-list">
                  {metricas.clientes_sin_interaccion_reciente.clientes.slice(0, 5).map((c) => (
                    <li
                      key={c.id}
                      className="dashboard__risk-row"
                      onClick={() => navigate(`/clientes/${c.id}`)}
                    >
                      <span className="dashboard__risk-name">{c.nombre}</span>
                      <span className={`etapa-badge etapa-badge--${c.etapa_crm.toLowerCase()}`}>{c.etapa_crm}</span>
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