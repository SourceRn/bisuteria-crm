import { NavLink } from "react-router-dom";
import { IconX } from "@tabler/icons-react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const LINKS_BASE = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/clientes", label: "Clientes" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/reportes", label: "Reportes" },
  { to: "/mi-actividad", label: "Mi actividad" },
];

export default function Sidebar({ isOpen, onClose }) {
  const { esAdmin } = useAuth();
  const links = esAdmin ? [...LINKS_BASE, { to: "/usuarios", label: "Usuarios" }] : LINKS_BASE;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <span className="sidebar__brand">Yatzari CRM</span>
          <button className="sidebar__close" onClick={onClose} aria-label="Cerrar menú">
            <IconX size={20} stroke={1.6} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}