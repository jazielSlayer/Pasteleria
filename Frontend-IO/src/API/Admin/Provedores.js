import { API_URL } from "../Api.js";

export async function getProveedores() {
  const res = await fetch(`${API_URL}/provedores`);
  if (!res.ok) throw new Error("Error al obtener proveedores");
  return res.json();
}

export async function getProveedor(id) {
  const res = await fetch(`${API_URL}/provedor/${id}`);
  if (!res.ok) throw new Error("Error al obtener el proveedor");
  return res.json();
}

export async function createProveedor(proveedor) {
  const res = await fetch(`${API_URL}/provedor/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  if (!res.ok) throw new Error("Error al crear el proveedor");
  return res.json();
}

export async function updateProveedor(id, proveedor) {
  const res = await fetch(`${API_URL}/provedor/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  if (!res.ok) throw new Error("Error al actualizar el proveedor");
  return res.json();
}

export async function deleteProveedor(id) {
  const res = await fetch(`${API_URL}/provedor/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el proveedor");
  return res.json();
}