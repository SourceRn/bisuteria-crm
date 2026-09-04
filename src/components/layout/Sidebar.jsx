import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/clientes", label: "Clientes" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Yatzari CRM</div>
      <nav className="sidebar__nav">
        {LINKS.map((link) => (
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