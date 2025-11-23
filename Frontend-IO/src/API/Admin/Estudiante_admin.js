
import { API_URL } from "../Api.js";

// Obtener todos los estudiantes
export async function getEstudiantes() {
    const res = await fetch(`${API_URL}/estudiantes`);
    if (!res.ok) throw new Error("Error al obtener estudiantes");
    return res.json();
}

// Obtener un estudiante por ID
export async function getEstudiante(id) {
    const res = await fetch(`${API_URL}/estudiantes/${id}`);
    if (!res.ok) throw new Error("Error al obtener el estudiante");
    return res.json();
}

// Crear un nuevo estudiante
export async function createEstudiante(estudiante) {
    const res = await fetch(`${API_URL}/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estudiante),
    });
    if (!res.ok) throw new Error("Error al crear el estudiante");
    return res.json();
}

// Actualizar un estudiante por ID
export async function updateEstudiante(id, estudiante) {
    const res = await fetch(`${API_URL}/estudiantes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estudiante),
    });
    if (!res.ok) throw new Error("Error al actualizar el estudiante");
    return res.json();
}

// Eliminar un estudiante por ID
export async function deleteEstudiante(id) {
    const res = await fetch(`${API_URL}/estudiantes/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar el estudiante");
    return res.json();
}

