import { API_URL } from "../Api.js";

// Obtener todos los docentes
export async function getDocentes() {
    const res = await fetch(`${API_URL}/docentes`);
    if (!res.ok) throw new Error("Error al obtener docentes");
    return res.json();
}

// Obtener un docente por ID
export async function getDocente(id) {
    const res = await fetch(`${API_URL}/docentes/${id}`);
    if (!res.ok) throw new Error("Error al obtener el docente");
    return res.json();
}

// Crear un nuevo docente
export async function createDocente(docente) {
    const res = await fetch(`${API_URL}/docentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docente),
    });
    if (!res.ok) throw new Error("Error al crear el docente");
    return res.json();
}

// Actualizar un docente por ID
export async function updateDocente(id, docente) {
    const res = await fetch(`${API_URL}/docentes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docente),
    });
    if (!res.ok) throw new Error("Error al actualizar el docente");
    return res.json();
}

// Eliminar un docente por ID
export async function deleteDocente(id) {
    const res = await fetch(`${API_URL}/docentes/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar el docente");
    return res.json();
}

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

// Obtener todos los módulos
export async function getModulos() {
    const res = await fetch(`${API_URL}/modulos`);
    if (!res.ok) throw new Error("Error al obtener módulos");
    return res.json();
}

// Obtener proyectos por docente (guía o revisor)
export async function getProyectosByDocente() {
    const res = await fetch(`${API_URL}/proyectos`);
    if (!res.ok) throw new Error("Error al obtener proyectos");
    return res.json();
}