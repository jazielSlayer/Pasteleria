import { API_URL } from "../Api.js";

export async function getClientes() {
  const res = await fetch(`${API_URL}/clientes`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return res.json();
}

export async function getCliente(id) {
  const res = await fetch(`${API_URL}/cliente/${id}`);
  if (!res.ok) throw new Error("Error al obtener el cliente");
  return res.json();
}

export async function buscarCliente(termino) {
  const res = await fetch(`${API_URL}/cliente/buscar?q=${termino}`);
  if (!res.ok) throw new Error("Error al buscar cliente");
  return res.json();
}

export async function createCliente(cliente) {
  const res = await fetch(`${API_URL}/cliente/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) throw new Error("Error al crear el cliente");
  return res.json();
}

export async function updateCliente(id, cliente) {
  const res = await fetch(`${API_URL}/cliente/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) throw new Error("Error al actualizar el cliente");
  return res.json();
}

export async function deleteCliente(id) {
  const res = await fetch(`${API_URL}/cliente/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el cliente");
  return res.json();
}