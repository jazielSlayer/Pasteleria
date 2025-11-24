import { API_URL } from "../Api.js";

export async function getMovimientos() {
  const res = await fetch(`${API_URL}/movimientos`);
  if (!res.ok) throw new Error("Error al obtener movimientos");
  return res.json();
}

export async function getMovimiento(id) {
  const res = await fetch(`${API_URL}/movimiento/${id}`);
  if (!res.ok) throw new Error("Error al obtener el movimiento");
  return res.json();
}

export async function createMovimiento(movimiento) {
  const res = await fetch(`${API_URL}/movimiento/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movimiento),
  });
  if (!res.ok) throw new Error("Error al crear el movimiento");
  return res.json();
}

export async function createMovimientoManual(movimiento) {
  const res = await fetch(`${API_URL}/movimiento/manual/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movimiento),
  });
  if (!res.ok) throw new Error("Error al crear el movimiento manual");
  return res.json();
}

export async function deleteMovimiento(id) {
  const res = await fetch(`${API_URL}/movimiento/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el movimiento");
  return res.json();
}