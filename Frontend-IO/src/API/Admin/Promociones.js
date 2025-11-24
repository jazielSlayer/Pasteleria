import { API_URL } from "../Api.js";

export async function getPromociones() {
  const res = await fetch(`${API_URL}/promociones`);
  if (!res.ok) throw new Error("Error al obtener promociones");
  return res.json();
}

export async function getPromocion(id) {
  const res = await fetch(`${API_URL}/promocion/${id}`);
  if (!res.ok) throw new Error("Error al obtener la promoción");
  return res.json();
}

export async function createPromocion(promocion) {
  const res = await fetch(`${API_URL}/promocion/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(promocion),
  });
  if (!res.ok) throw new Error("Error al crear la promoción");
  return res.json();
}

export async function updatePromocion(id, promocion) {
  const res = await fetch(`${API_URL}/promocion/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(promocion),
  });
  if (!res.ok) throw new Error("Error al actualizar la promoción");
  return res.json();
}

export async function deletePromocion(id) {
  const res = await fetch(`${API_URL}/promocion/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar la promoción");
  return res.json();
}