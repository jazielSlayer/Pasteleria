import { API_URL } from "../Api.js";

// Obtenemos todos los datos de pago
export async function getAllPagos() {
  try {
    const response = await fetch(`${API_URL}/pagos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching pagos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllPagos:', error);
    throw error;
  }
}

// obtenemos los datos por id
export async function getPago(id) {
  try {
    const response = await fetch(`${API_URL}/pagos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Pago not found');
      }
      throw new Error(`Error fetching pago: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getPago:', error);
    throw error;
  }
}

// Creamos un nuevo pago
export async function createPago(data) {
  try {
    const response = await fetch(`${API_URL}/pagos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_estudiante: data.id_estudiante,
        monto: data.monto,
        metodo: data.metodo,
        comprobante: data.comprobante,
        fecha: data.fecha,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error creating pago: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createPago:', error);
    throw error;
  }
}

// Actauliazamos un pago por id
export async function updatePago(id, data) {
  try {
    const response = await fetch(`${API_URL}/pagos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_estudiante: data.id_estudiante,
        monto: data.monto,
        metodo: data.metodo,
        comprobante: data.comprobante,
        fecha: data.fecha,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error updating pago: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updatePago:', error);
    throw error;
  }
}

// Eliminamos un pago por ID
export async function deletePago(id) {
  try {
    const response = await fetch(`${API_URL}/pagos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error deleting pago: ${response.statusText}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Error in deletePago:', error);
    throw error;
  }
}

// Obtenemos el pago del estudiante por ID
export async function getPagoEstudiante(id_estudiante) {
  try {
    const response = await fetch(`${API_URL}/pago/estudiante/${id_estudiante}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching pagos for estudiante: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getPagoEstudiante:', error);
    throw error;
  }
}