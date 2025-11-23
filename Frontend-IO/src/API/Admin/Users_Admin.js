import { API_URL } from "../Api.js";
// Obtener todos los usuarios
export async function getUsers() {
	const res = await fetch(`${API_URL}/users`);
	if (!res.ok) throw new Error("Error al obtener usuarios");
	return res.json();
}

// Obtener el número total de usuarios
export async function getUserCount() {
	const res = await fetch(`${API_URL}/users/count`);
	if (!res.ok) throw new Error("Error al obtener el conteo de usuarios");
	return res.json();
}

// Obtener un usuario por ID
export async function getUser(id) {
	const res = await fetch(`${API_URL}/users/${id}`);
	if (!res.ok) throw new Error("Error al obtener el usuario");
	return res.json();
}

// Crear un nuevo usuario
export async function saveUser(user) {
	const res = await fetch(`${API_URL}/users`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(user),
	});
	if (!res.ok) throw new Error("Error al guardar el usuario");
	return res.json();
}

// Eliminar un usuario por ID
export async function deleteUser(id) {
	const res = await fetch(`${API_URL}/users/${id}`, {
		method: "DELETE",
	});
	if (!res.ok) throw new Error("Error al eliminar el usuario");
	return res.json();
}

// Actualizar un usuario por ID
export async function updateUser(id, user) {
	const res = await fetch(`${API_URL}/users/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(user),
	});
	if (!res.ok) throw new Error("Error al actualizar el usuario");
	return res.json();
}

// Registrar un nuevo usuario
export async function registerUser(user) {
	const res = await fetch(`${API_URL}/users/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(user),
	});
	if (!res.ok) throw new Error("Error al registrar el usuario");
	return res.json();
}

// Login de usuario
export async function loginUser(credentials) {
	const res = await fetch(`${API_URL}/users/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(credentials),
	});
	if (!res.ok) throw new Error("Error al iniciar sesión");
	return res.json();
}

