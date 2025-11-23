import { API_URL } from "../Api.js";

// Obtenemos todos los datos de metodologia
export async function getAllMetodologias() {
  try {
    const response = await fetch(`${API_URL}/metodologias`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching metodologias: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllMetodologias:', error);
    throw error;
  }
}

// Obtenemos los datos de moetodologi por ID
export async function getMetodologia(id) {
  try {
    const response = await fetch(`${API_URL}/metodologias/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Metodologia not found');
      }
      throw new Error(`Error fetching metodologia: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getMetodologia:', error);
    throw error;
  }
}

// Creamos una nueva metodologia
export async function createMetodologia(data) {
  try {
    const response = await fetch(`${API_URL}/metodologia/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: data.nombre,
        descripcion: data.descripcion,
        objetivos: data.objetivos,
        numero_modulos: data.numero_modulos,
        fecha_inicio: data.fecha_inicio,
        fecha_finalizacion: data.fecha_finalizacion,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error creating metodologia: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createMetodologia:', error);
    throw error;
  }
}

// Actualizamos los datos de la metodologia por ID
export async function updateMetodologia(id, data) {
  try {
    const response = await fetch(`${API_URL}/metodologias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: data.nombre,
        descripcion: data.descripcion,
        objetivos: data.objetivos,
        numero_modulos: data.numero_modulos,
        fecha_inicio: data.fecha_inicio,
        fecha_finalizacion: data.fecha_finalizacion,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error updating metodologia: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateMetodologia:', error);
    throw error;
  }
}

// Eliminamos los datos de metodologia por ID
export async function deleteMetodologia(id) {
  try {
    const response = await fetch(`${API_URL}/metodologias/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error deleting metodologia: ${response.statusText}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error in deleteMetodologia:', error);
    throw error;
  }
}