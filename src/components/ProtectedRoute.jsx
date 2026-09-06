import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { session, cargando } = useAuth();

  if (cargando) {
    return <div style={{ padding: 40 }}>Cargando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}