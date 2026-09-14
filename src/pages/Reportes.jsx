import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import Layout from "../components/layout/Layout";
import { getEvaluaciones } from "../services/api";
import "./Reportes.css";

export default function Reportes() {
  const [tipo, setTipo] = useState("semanal");
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    getEvaluaciones({ tipo })
      .then(setEvaluaciones)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [tipo]);

  const datosGrafica = evaluaciones.map((e) => ({
    fecha: new Date(e.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
    total_clientes: e.notas?.total_clientes ?? 0,
    clientes_activos: e.notas?.clientes_activos ?? 0,
    clientes_inactivos: e.notas?.clientes_inactivos ?? 0,
    total_interacciones: e.notas?.total_interacciones ?? 0,
    sin_contacto_reciente: e.notas?.clientes_sin_interaccion_reciente ?? 0,
  }));

  return (
    <Layout titulo="Reportes">
      <div className="reportes__toolbar">
        <button
          className={`reportes__tab ${tipo === "semanal" ? "is-active" : ""}`}
          onClick={() => setTipo("semanal")}
        >
          Semanal
        </button>
        <button
          className={`reportes__tab ${tipo === "mensual" ? "is-active" : ""}`}
          onClick={() => setTipo("mensual")}
        >
          Mensual
        </button>
      </div>

      {error && <p className="reportes__error">Error: {error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : evaluaciones.length === 0 ? (
        <p className="reportes__empty">
          Todavía no hay reportes {tipo === "semanal" ? "semanales" : "mensuales"} generados.
          Se crean automáticamente {tipo === "semanal" ? "cada lunes" : "el día 1 de cada mes"}.
        </p>
      ) : (
        <>
          <div className="reportes__panel">
            <h2>Tendencia de clientes</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DE" />
                <XAxis dataKey="fecha" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="total_clientes" stroke="#8985BC" name="Total clientes" strokeWidth={2} />
                <Line type="monotone" dataKey="clientes_activos" stroke="#4C5A46" name="Activos" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="reportes__panel">
            <h2>Activos vs inactivos por periodo</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DE" />
                <XAxis dataKey="fecha" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="clientes_activos" stackId="a" fill="#9CAE93" name="Activos" />
                <Bar dataKey="clientes_inactivos" stackId="a" fill="#E8C4C4" name="Inactivos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="reportes__panel">
            <h2>Interacciones y clientes en riesgo</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DE" />
                <XAxis dataKey="fecha" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total_interacciones" fill="#B8935A" name="Interacciones" />
                <Bar dataKey="sin_contacto_reciente" fill="#D4537E" name="Sin contacto reciente" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Layout>
  );
}