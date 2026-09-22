import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const LINKS_BASE = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/clientes", label: "Clientes" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/reportes", label: "Reportes" },
  { to: "/mi-actividad", label: "Mi actividad" },
];

export default function Sidebar() {
  const { esAdmin } = useAuth();
  const links = esAdmin ? [...LINKS_BASE, { to: "/usuarios", label: "Usuarios" }] : LINKS_BASE;

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Yatzari CRM</div>
      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}