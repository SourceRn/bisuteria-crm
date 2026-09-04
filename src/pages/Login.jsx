import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: "", password: "" });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO (sabado): reemplazar por supabase.auth.signInWithPassword({ email, password })
    // y guardar el token/usuario en un AuthContext antes de navegar.
    navigate("/");
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
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="login__submit">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}