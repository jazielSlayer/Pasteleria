import { API_URL } from "../Api.js";

export async function getRecetas() {
  const res = await fetch(`${API_URL}/recetas`);
  if (!res.ok) throw new Error("Error al obtener recetas");
  return res.json();
}

export async function getReceta(id) {
  const res = await fetch(`${API_URL}/recetas/${id}`);
  if (!res.ok) throw new Error("Error al obtener la receta");
  return res.json();
}

export async function createReceta(receta) {
  const res = await fetch(`${API_URL}/receta/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receta),
  });
  if (!res.ok) throw new Error("Error al crear la receta");
  return res.json();
}

export async function updateReceta(id, receta) {
  const res = await fetch(`${API_URL}/receta/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receta),
  });
  if (!res.ok) throw new Error("Error al actualizar la receta");
  return res.json();
}

export async function deleteReceta(id) {
  const res = await fetch(`${API_URL}/receta/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar la receta");
  return res.json();
}