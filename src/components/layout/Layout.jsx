import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ titulo, children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, minHeight: "100vh" }}>
        <Topbar titulo={titulo} />
        <main style={{ padding: 32 }}>{children}</main>
      </div>
    </div>
  );
}