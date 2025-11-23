import { API_URL } from "../Api.js";

// Obtenemos todos los datos de los talleres
export async function getAllTalleres() {
  try {
    const response = await fetch(`${API_URL}/talleres`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching talleres: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllTalleres:', error);
    throw error;
  }
}

// Obtenemos los datos del taller por ID
export async function getTaller(id) {
  try {
    const response = await fetch(`${API_URL}/taller/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Taller not found');
      }
      throw new Error(`Error fetching taller: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getTaller:', error);
    throw error;
  }
}

// Creamos un nuevo taller 
export async function createTaller(data) {
  try {
    const response = await fetch(`${API_URL}/create-taller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: data.titulo,
        id_metodologia: data.id_metodologia,
        tipo_taller: data.tipo_taller,
        evaluacion_final: data.evaluacion_final,
        duracion: data.duracion,
        resultado: data.resultado,
        fecha_realizacion: data.fecha_realizacion,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error creating taller: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createTaller:', error);
    throw error;
  }
}

// Actaulizamos un taller por ID
export async function updateTaller(id, data) {
  try {
    const response = await fetch(`${API_URL}/update-taller/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: data.titulo,
        id_metodologia: data.id_metodologia,
        tipo_taller: data.tipo_taller,
        evaluacion_final: data.evaluacion_final,
        duracion: data.duracion,
        resultado: data.resultado,
        fecha_realizacion: data.fecha_realizacion,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error updating taller: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateTaller:', error);
    throw error;
  }
}

// Eliminamos un taller por ID
export async function deleteTaller(id) {
  try {
    const response = await fetch(`${API_URL}/delete-taller/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error deleting taller: ${response.statusText}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error in deleteTaller:', error);
    throw error;
  }
}