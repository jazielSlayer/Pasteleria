import { API_URL } from "../Api.js";

// Obtenemos todos los programas
export async function getAllProgramas() {
  try {
    const response = await fetch(`${API_URL}/programas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching programas: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllProgramas:', error);
    throw error;
  }
}

// Obtenemos los datos los datos de programa por ID
export async function getPrograma(id) {
  try {
    const response = await fetch(`${API_URL}/programas/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Programa not found');
      }
      throw new Error(`Error fetching programa: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getPrograma:', error);
    throw error;
  }
}

// Creamos un nuevo programa
export async function createPrograma(data) {
  try {
    const response = await fetch(`${API_URL}/programa/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo: data.codigo,
        nombre_programa: data.nombre_programa,
        modalidad: data.modalidad,
        facultad: data.facultad,
        nivel: data.nivel,
        estado: data.estado,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error creating programa: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createPrograma:', error);
    throw error;
  }
}

// Actalizamos un programa por ID
export async function updatePrograma(id, data) {
  try {
    const response = await fetch(`${API_URL}/programas/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo: data.codigo,
        nombre_programa: data.nombre_programa,
        modalidad: data.modalidad,
        facultad: data.facultad,
        nivel: data.nivel,
        estado: data.estado,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error updating programa: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updatePrograma:', error);
    throw error;
  }
}

// Eliminamos un programa por ID
export async function deletePrograma(id) {
  try {
    const response = await fetch(`${API_URL}/programas/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error deleting programa: ${response.statusText}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error in deletePrograma:', error);
    throw error;
  }
}