import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import PasswordInput from "../components/ui/PasswordInput";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ correo: "", password: "" });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await login(form.correo, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <h1 className="login__title">Yatzari CRM</h1>
        <p className="login__subtitle">Inicia sesión para continuar</p>

        <label>
          Correo electrónico
          <input
            type="email"
            name="correo"
            required
            value={form.correo}
            onChange={handleChange}
          />
        </label>

        <label>
          Contraseña
          <PasswordInput
            name="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </label>

        {error && <p className="login__error">{error}</p>}

        <button type="submit" className="login__submit" disabled={cargando}>
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}