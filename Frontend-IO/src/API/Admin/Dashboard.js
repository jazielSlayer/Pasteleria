import { API_URL } from "../Api.js";

export async function getDashboardDiario() {
  const res = await fetch(`${API_URL}/Dashboartd/Diario`);
  if (!res.ok) throw new Error("Error al obtener dashboard diario");
  return res.json();
}

export async function getStockActual() {
  const res = await fetch(`${API_URL}/Stock/Actual`);
  if (!res.ok) throw new Error("Error al obtener stock actual");
  return res.json();
}

export async function getProductosRentables() {
  const res = await fetch(`${API_URL}/Productos/Rentables`);
  if (!res.ok) throw new Error("Error al obtener productos rentables");
  return res.json();
}

export async function getMovimientosRecientes() {
  const res = await fetch(`${API_URL}/movimientos/recientes`);
  if (!res.ok) throw new Error("Error al obtener movimientos recientes");
  return res.json();
}

export async function getClientesFrecuentes() {
  const res = await fetch(`${API_URL}/clientes/frecuentes`);
  if (!res.ok) throw new Error("Error al obtener clientes frecuentes");
  return res.json();
}

export async function getPromocionesActivas() {
  const res = await fetch(`${API_URL}/promociones/activas`);
  if (!res.ok) throw new Error("Error al obtener promociones activas");
  return res.json();
}

export async function getVentasPorCategoria() {
  const res = await fetch(`${API_URL}/ventanas/categoria`);
  if (!res.ok) throw new Error("Error al obtener ventas por categoría");
  return res.json();
}