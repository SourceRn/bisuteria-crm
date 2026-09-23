import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { getUsuarios, crearUsuarioAdmin, actualizarUsuarioAdmin, eliminarUsuarioAdmin } from "../services/api";
import "./Usuarios.css";
import PasswordInput from "../components/ui/PasswordInput";

const ROLES = ["admin", "usuario"];

export default function Usuarios() {
  const { esAdmin, perfil } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", correo: "", password: "", confirmarPassword: "", rol: "usuario" });
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    setCargando(true);
    getUsuarios()
      .then(setUsuarios)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleCrear(e) {
    e.preventDefault();

    if (nuevo.password !== nuevo.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setGuardando(true);
    try {
      await crearUsuarioAdmin({
        nombre: nuevo.nombre,
        correo: nuevo.correo,
        password: nuevo.password,
        rol: nuevo.rol,
      });
      setNuevo({ nombre: "", correo: "", password: "", confirmarPassword: "", rol: "usuario" });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleActivo(usuario) {
    try {
      await actualizarUsuarioAdmin(usuario.id, { activo: !usuario.activo });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEliminar(usuario) {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar a "${usuario.nombre}" del sistema? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      await eliminarUsuarioAdmin(usuario.id);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!esAdmin) {
    return (
      <Layout titulo="Usuarios">
        <p className="usuarios__error">No tienes permiso para ver esta sección.</p>
      </Layout>
    );
  }

  return (
    <Layout titulo="Usuarios">
      <div className="usuarios__toolbar">
        <button className="usuarios__new-btn" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Nuevo usuario"}
        </button>
      </div>

      {mostrarForm && (
        <form className="usuarios__form" onSubmit={handleCrear}>
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
          <PasswordInput
            placeholder="Contraseña (min. 6 caracteres)"
            required
            minLength={6}
            value={nuevo.password}
            onChange={(e) => setNuevo((p) => ({ ...p, password: e.target.value }))}
          />
          <PasswordInput
            placeholder="Confirmar contraseña"
            required
            minLength={6}
            value={nuevo.confirmarPassword}
            onChange={(e) => setNuevo((p) => ({ ...p, confirmarPassword: e.target.value }))}
          />
          <select value={nuevo.rol} onChange={(e) => setNuevo((p) => ({ ...p, rol: e.target.value }))}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button type="submit" disabled={guardando}>
            {guardando ? "Creando..." : "Crear"}
          </button>
        </form>
      )}

      {error && <p className="usuarios__error">Error: {error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <table className="usuarios__table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>
                  <span className={`rol-badge rol-badge--${u.rol}`}>{u.rol}</span>
                </td>
                <td>
                  <span className={`estado-badge estado-badge--${u.activo ? "activo" : "inactivo"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="usuarios__actions">
                  {u.id === perfil?.id ? (
                    <span className="usuarios__self">Tú</span>
                  ) : (
                    <>
                      <button onClick={() => handleToggleActivo(u)}>
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button className="usuarios__delete-btn" onClick={() => handleEliminar(u)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}