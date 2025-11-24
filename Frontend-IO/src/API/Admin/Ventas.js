import { API_URL } from "../Api.js";

export async function getVentas() {
  const res = await fetch(`${API_URL}/ventas`);
  if (!res.ok) throw new Error("Error al obtener ventas");
  return res.json();
}

export async function getVenta(id) {
  const res = await fetch(`${API_URL}/venta/${id}`);
  if (!res.ok) throw new Error("Error al obtener la venta");
  return res.json();
}

export async function createVenta(venta) {
  const res = await fetch(`${API_URL}/venta/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(venta),
  });
  if (!res.ok) throw new Error("Error al crear la venta");
  return res.json();
}

export async function anularVenta(id) {
  const res = await fetch(`${API_URL}/venta/anular/${id}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al anular la venta");
  return res.json();
}