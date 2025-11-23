import { API_URL } from "../Api.js";

// Obtenemos los datos de personas
export async function getAllPersonas() {
  try {
    const response = await fetch(`${API_URL}/personas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching personas: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllPersonas:', error);
    throw error;
  }
}

// Obtenemos los datos de persona por ID
export async function getPersona(id) {
  try {
    const response = await fetch(`${API_URL}/personas/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Persona not found');
      }
      throw new Error(`Error fetching persona: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getPersona:', error);
    throw error;
  }
}

// Creamos una nueva persona
export async function createPersona(data) {
  try {
    const response = await fetch(`${API_URL}/persona/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombres: data.nombres,
        apellidopat: data.apellidopat,
        apellidomat: data.apellidomat,
        carnet: data.carnet,
        direccion: data.direccion,
        telefono: data.telefono,
        correo: data.correo,
        fecha_nacimiento: data.fecha_nacimiento,
        estado: data.estado,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error creating persona: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createPersona:', error);
    throw error;
  }
}

// Actaulaizamos una persona por ID
export async function updatePersona(id, data) {
  try {
    const response = await fetch(`${API_URL}/personas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombres: data.nombres,
        apellidopat: data.apellidopat,
        apellidomat: data.apellidomat,
        carnet: data.carnet,
        direccion: data.direccion,
        telefono: data.telefono,
        correo: data.correo,
        fecha_nacimiento: data.fecha_nacimiento,
        estado: data.estado,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error updating persona: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updatePersona:', error);
    throw error;
  }
}

// Eliminamos una persona por ID
export async function deletePersona(id) {
  try {
    const response = await fetch(`${API_URL}/personas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error deleting persona: ${response.statusText}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error in deletePersona:', error);
    throw error;
  }
}