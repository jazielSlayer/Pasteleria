import { API_URL } from "../Api.js";

export const loginUser = async (credentials, login) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from backend:', errorData);
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response:', data);
    const userData = {
      ...data,
      roles: Array.isArray(data.roles) 
        ? data.roles.map(role => ({
            ...role,
            name: role.name.toLowerCase()
          }))
        : data.role 
          ? [{ name: data.role.toLowerCase() }]
          : [],
    };
    console.log('Normalized userData:', userData);

    localStorage.setItem('user', JSON.stringify(userData));
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    if (typeof login === 'function') {
      login(userData);
    } else {
      console.warn('Función login no proporcionada. El contexto de autenticación no se actualizó.');
    }

    return userData;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    const userData = {
      ...data,
      roles: Array.isArray(data.roles) 
        ? data.roles.map(role => ({
            ...role,
            name: role.name.toLowerCase()
          }))
        : data.role 
          ? [{ name: data.role.toLowerCase() }]
          : [],
    };

    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error("Error checking auth:", error);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    return null;
  }
};