import { API_URL } from "../Api.js";

export async function getProductos() {
  const res = await fetch(`${API_URL}/productos`);
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}

export async function getProducto(id) {
  const res = await fetch(`${API_URL}/producto/${id}`);
  if (!res.ok) throw new Error("Error al obtener el producto");
  return res.json();
}

export async function getProductoByCodigo(codigo) {
  const res = await fetch(`${API_URL}/producto/codigo?codigo=${codigo}`);
  if (!res.ok) throw new Error("Error al buscar producto por código");
  return res.json();
}

export async function createProducto(producto) {
  const res = await fetch(`${API_URL}/producto/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error("Error al crear el producto");
  return res.json();
}

export async function updateProducto(id, producto) {
  const res = await fetch(`${API_URL}/producto/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error("Error al actualizar el producto");
  return res.json();
}

export async function deleteProducto(id) {
  const res = await fetch(`${API_URL}/producto/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el producto");
  return res.json();
}