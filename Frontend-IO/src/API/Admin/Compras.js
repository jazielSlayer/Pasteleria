import { API_URL } from "../Api.js";

export async function getCompras() {
  const res = await fetch(`${API_URL}/compras`);
  if (!res.ok) throw new Error("Error al obtener compras");
  return res.json();
}

export async function getCompra(id) {
  const res = await fetch(`${API_URL}/compra/${id}`);
  if (!res.ok) throw new Error("Error al obtener la compra");
  return res.json();
}

export async function createCompra(compra) {
  const res = await fetch(`${API_URL}/cerate/compra`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(compra),
  });
  if (!res.ok) throw new Error("Error al crear la compra");
  return res.json();
}

export async function recibirCompra(id) {
  const res = await fetch(`${API_URL}/recibir/compra/${id}`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Error al recibir la compra");
  return res.json();
}

export async function cancelarCompra(id) {
  const res = await fetch(`${API_URL}/cancelar/compra/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al cancelar la compra");
  return res.json();
}