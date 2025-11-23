import { API_URL } from "../Api.js";

// Obtenemos todos los datos de modulos
export async function getAllModulos () {
  try {
    const response = await fetch(`${API_URL}/modulos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching modulos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllModulos:', error);
    throw error;
  }
}

// Obtenemos los datos de modulo por ID
export async function getModulo(id) {
  try {
    const response = await fetch(`${API_URL}/modulos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Modulo not found');
      }
      throw new Error(`Error fetching modulo: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getModulo:', error);
    throw error;
  }
}

// Creamos nuevo modulo
export async function createModulo(data) {
  try {
    const response = await fetch(`${API_URL}/modulos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo: data.codigo,
        nombre: data.nombre,
        id_docente: data.id_docente,
        id_metodologia: data.id_metodologia,
        duracion: data.duracion,
        descripcion: data.descripcion,
        fecha_inicio: data.fecha_inicio,
        fecha_finalizacion: data.fecha_finalizacion,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error creating modulo: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createModulo:', error);
    throw error;
  }
}

// Actualizamos los datos del modulo por ID
export async function updateModulo(id, data) {
  try {
    const response = await fetch(`${API_URL}/modulos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo: data.codigo,
        nombre: data.nombre,
        id_docente: data.id_docente,
        id_metodologia: data.id_metodologia,
        duracion: data.duracion,
        descripcion: data.descripcion,
        fecha_inicio: data.fecha_inicio,
        fecha_finalizacion: data.fecha_finalizacion,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error updating modulo: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateModulo:', error);
    throw error;
  }
}

// Eliominamos los datos por ID
export async function deleteModulo(id) {
  try {
    const response = await fetch(`${API_URL}/modulos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error deleting modulo: ${response.statusText}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error in deleteModulo:', error);
    throw error;
  }
}