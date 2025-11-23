import { API_URL } from "../Api.js";
// Obtener proyecto(s) de un estudiante por su ID
export async function getProyectoEstudiante(id_estudiante) {
	const res = await fetch(`${API_URL}/proyectos/estudiante/${id_estudiante}`);
	if (!res.ok) throw new Error("Error al obtener el/los proyecto(s) del estudiante");
	return res.json();
}

export async function getPagoEstudiante(id_estudiante) {
	const res = await fetch(`${API_URL}/pago/estudiante/${id_estudiante}`);
	if (!res.ok) throw new Error("Error al obtener el/los pago(s) del estudiante");
	return res.json();
}

// Actualizar un estudiante
export async function updateEstudiante(id, estudiante) {
	const res = await fetch(`${API_URL}/estudiantes/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(estudiante),
	});
	if (!res.ok) throw new Error("Error al actualizar el estudiante");
	return res.json();
}


