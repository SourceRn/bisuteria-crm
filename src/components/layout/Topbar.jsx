import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Topbar.css";
import { IconChevronDown, IconLogout, IconMenu2 } from "@tabler/icons-react";

export default function Topbar({ titulo, onMenuClick }) {
  const { usuario, perfil, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef(null);

  const inicial = usuario?.email?.charAt(0).toUpperCase() || "?";

  // Cierra el menu si se hace click fuera de el
  useEffect(() => {
    function handleClickFuera(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuClick} aria-label="Abrir menú">
          <IconMenu2 size={20} stroke={1.6} />
        </button>
        <h1 className="topbar__title">{titulo}</h1>
      </div>

      <div className="topbar__user" ref={menuRef}>
        <button className="topbar__trigger" onClick={() => setAbierto((v) => !v)}>
          <span className="topbar__avatar">{inicial}</span>
          <span className="topbar__email">{usuario?.email}</span>
          <IconChevronDown size={14} stroke={1.8} />
        </button>

        {abierto && (
          <div className="topbar__menu">
            <div className="topbar__menu-header">
              <p className="topbar__menu-email">{usuario?.email}</p>
              <p className="topbar__menu-role">
                {perfil?.rol === "admin" ? "Administrador" : "Usuario"}
              </p>            
            </div>
            <button className="topbar__menu-item" onClick={handleLogout}>
              <IconLogout size={15} stroke={1.8} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}