import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

export default function Layout({ titulo, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="layout">
      <Sidebar isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />
      <div className="layout__content">
        <Topbar titulo={titulo} onMenuClick={() => setMenuAbierto(true)} />
        <main className="layout__main">{children}</main>
      </div>
    </div>
  );
}