const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Clientes
export const getClientes = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/clientes${query ? `?${query}` : ""}`);
};
export const getCliente = (id) => request(`/clientes/${id}`);
export const crearCliente = (datos) =>
  request("/clientes", { method: "POST", body: JSON.stringify(datos) });
export const actualizarCliente = (id, datos) =>
  request(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(datos) });
export const actualizarEtapaCliente = (id, etapa_crm) =>
  request(`/clientes/${id}/etapa`, { method: "PUT", body: JSON.stringify({ etapa_crm }) });
export const eliminarCliente = (id) =>
  request(`/clientes/${id}`, { method: "DELETE" });

// Interacciones
export const getInteraccionesDeCliente = (clienteId) =>
  request(`/clientes/${clienteId}/interacciones`);
export const crearInteraccion = (datos) =>
  request("/interacciones", { method: "POST", body: JSON.stringify(datos) });

// Metricas
export const getMetricas = (dias) =>
  request(`/metricas${dias ? `?dias=${dias}` : ""}`);