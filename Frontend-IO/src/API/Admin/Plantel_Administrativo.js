import { API_URL } from "../Api.js";

// Obtenemos los datos los planteles
export async function getAllPlanteles() {
  try {
    const response = await fetch(`${API_URL}/planteles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching planteles: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllPlanteles:', error);
    throw error;
  }
}

// Obtenemos los datos de plantel por  ID
export async function getPlantel(id) {
  try {
    const response = await fetch(`${API_URL}/planteles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Plantel not found');
      }
      throw new Error(`Error fetching plantel: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getPlantel:', error);
    throw error;
  }
}

// Creamos un nuevo plantel
export async function createPlantel(data) {
  try {
    const response = await fetch(`${API_URL}/planteles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        per_id: data.per_id,
        cargo: data.cargo,
        unidad: data.unidad,
        estado: data.estado,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error creating plantel: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createPlantel:', error);
    throw error;
  }
}

// Actualizamos un plantel por ID
export async function updatePlantel(id, data) {
  try {
    const response = await fetch(`${API_URL}/planteles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        per_id: data.per_id,
        cargo: data.cargo,
        unidad: data.unidad,
        estado: data.estado,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error updating plantel: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updatePlantel:', error);
    throw error;
  }
}

// Eliminamos un plantel por ID
export async function deletePlantel(id) {
  try {
    const response = await fetch(`${API_URL}/planteles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error deleting plantel: ${response.statusText}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error in deletePlantel:', error);
    throw error;
  }
}