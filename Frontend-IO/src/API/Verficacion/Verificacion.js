import { API_URL } from "../Api";

// Envía un código de autenticación por correo
export async function sendAuthCode(email) {
  try {
    const response = await fetch(`${API_URL}/api/send-auth-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error(`Error sending auth code: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in sendAuthCode:', error);
    throw error;
  }
}

// Verifica un código de autenticación
export async function verifyAuthCode(email, code) {
  try {
    const response = await fetch(`${API_URL}/api/verify-auth-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Código inválido o expirado');
      }
      throw new Error(`Error verifying auth code: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in verifyAuthCode:', error);
    throw error;
  }
}