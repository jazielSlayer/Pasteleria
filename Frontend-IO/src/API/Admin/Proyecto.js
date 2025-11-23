import { API_URL } from "../Api.js";

// === 1. LISTAR TODOS LOS PROYECTOS ===
export async function getAllProyectos() {
  try {
    const response = await fetch(`${API_URL}/proyectos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('getAllProyectos:', error);
    throw error;
  }
}

// === 2. OBTENER UN PROYECTO POR ID (NUEVO) ===
export async function getProyectoById(id) {
  if (!id || isNaN(id)) throw new Error('ID inválido');
  try {
    const response = await fetch(`${API_URL}/proyecto/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Proyecto no encontrado: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('getProyectoById:', error);
    throw error;
  }
}

// === 3. BÚSQUEDA CON FILTROS + PAGINACIÓN (NUEVA RUTA) ===
export async function searchProyectos(filters = {}) {
  try {
    const params = new URLSearchParams();

    // Paginación
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 10);

    // Filtros
    if (filters.titulo?.trim()) params.append('titulo', filters.titulo.trim());
    if (filters.area_conocimiento?.trim()) params.append('area_conocimiento', filters.area_conocimiento.trim());
    if (filters.estudiante?.trim()) params.append('estudiante', filters.estudiante.trim());

    const url = `${API_URL}/proyectos/search?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
    }
    return await response.json(); // { data: [], pagination: {} }
  } catch (error) {
    console.error('searchProyectos error:', error);
    throw error;
  }
}

// === 4. CREAR PROYECTO (RUTA CORREGIDA) ===
export async function createProyecto(data) {
  try {
    const response = await fetch(`${API_URL}/proyecto/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_estudiante: data.id_estudiante,
        id_docente_guia: data.id_docente_guia,
        id_docente_revisor: data.id_docente_revisor,
        titulo: data.titulo,
        linea_investigacion: data.linea_investigacion,
        area_conocimiento: data.area_conocimiento,
        fecha_entrega: data.fecha_entrega,
        fecha_defensa: data.fecha_defensa || null,
        resumen: data.resumen || null,
        observacion: data.observacion || null,
        calificacion: data.calificacion || null,
        calificacion2: data.calificacion2 || null,
        calificacion_final: data.calificacion_final || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createProyecto:', error);
    throw error;
  }
}

// === 5. ACTUALIZAR PROYECTO (RUTA CORREGIDA) ===
export async function updateProyecto(id, data) {
  if (!id || isNaN(id)) throw new Error('ID inválido');
  try {
    const response = await fetch(`${API_URL}/proyecto/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_estudiante: data.id_estudiante,
        id_docente_guia: data.id_docente_guia,
        id_docente_revisor: data.id_docente_revisor,
        titulo: data.titulo,
        linea_investigacion: data.linea_investigacion,
        area_conocimiento: data.area_conocimiento,
        calificacion: data.calificacion,
        calificacion2: data.calificacion2,
        calificacion_final: data.calificacion_final,
        fecha_entrega: data.fecha_entrega,
        fecha_defensa: data.fecha_defensa,
        resumen: data.resumen,
        observacion: data.observacion,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateProyecto:', error);
    throw error;
  }
}

// === 6. ELIMINAR PROYECTO (RUTA CORREGIDA) ===
export async function deleteProyecto(id) {
  if (!id || isNaN(id)) throw new Error('ID inválido');
  try {
    const response = await fetch(`${API_URL}/proyecto/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error: ${response.status}`);
    }
    return { success: true, message: 'Proyecto eliminado' };
  } catch (error) {
    console.error('Error in deleteProyecto:', error);
    throw error;
  }
}

// === 7. PROYECTOS POR ESTUDIANTE (RUTA CORREGIDA) ===
export async function getProyectoEstudiante(id_estudiante) {
  if (!id_estudiante || isNaN(id_estudiante)) throw new Error('ID de estudiante inválido');
  try {
    const response = await fetch(`${API_URL}/proyectos/estudiante/${id_estudiante}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getProyectoEstudiante:', error);
    throw error;
  }
}

// === 8. PROYECTOS POR DOCENTE (RUTA CORREGIDA) ===
export async function getProyectoDocente(id_docente) {
  if (!id_docente || isNaN(id_docente)) throw new Error('ID de docente inválido');
  try {
    const response = await fetch(`${API_URL}/proyecto/docente/${id_docente}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getProyectoDocente:', error);
    throw error;
  }
}