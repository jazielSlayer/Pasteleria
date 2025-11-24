import { API_URL } from "../Api.js";

export async function getProduccionDiaria() {
  const res = await fetch(`${API_URL}/produccion/diaria`);
  if (!res.ok) throw new Error("Error al obtener producción diaria");
  return res.json();
}

export async function getProduccion(id) {
  const res = await fetch(`${API_URL}/produccion/diaria/${id}`);
  if (!res.ok) throw new Error("Error al obtener la producción");
  return res.json();
}

export async function createProduccion(produccion) {
  const res = await fetch(`${API_URL}/produccion/diaria/crear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produccion),
  });
  if (!res.ok) throw new Error("Error al crear la producción");
  return res.json();
}

export async function anularProduccion(id) {
  const res = await fetch(`${API_URL}/produccion/anular/${id}`);
  if (!res.ok) throw new Error("Error al anular la producción");
  return res.json();
}