import "./Topbar.css";

export default function Topbar({ titulo }) {
  return (
    <header className="topbar">
      <h1 className="topbar__title">{titulo}</h1>
      <div className="topbar__user">
        {/* TODO (sabado): reemplazar por el usuario real de Supabase Auth */}
        <span>Admin</span>
      </div>
    </header>
  );
}