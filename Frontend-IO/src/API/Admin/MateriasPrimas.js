import { API_URL } from "../Api.js";

export async function getMateriasPrimas() {
  const res = await fetch(`${API_URL}/Materias/Primas`);
  if (!res.ok) throw new Error("Error al obtener materias primas");
  return res.json();
}

export async function getMateriaPrima(id) {
  const res = await fetch(`${API_URL}/Materia/Prima/${id}`);
  if (!res.ok) throw new Error("Error al obtener la materia prima");
  return res.json();
}

export async function createMateriaPrima(materia) {
  const res = await fetch(`${API_URL}/Materia/Prima/Create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(materia),
  });
  if (!res.ok) throw new Error("Error al crear la materia prima");
  return res.json();
}

export async function updateMateriaPrima(id, materia) {
  const res = await fetch(`${API_URL}/Materia/Prima/Update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(materia),
  });
  if (!res.ok) throw new Error("Error al actualizar la materia prima");
  return res.json();
}

export async function deleteMateriaPrima(id) {
  const res = await fetch(`${API_URL}/Materia/Prima/Delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar la materia prima");
  return res.json();
}