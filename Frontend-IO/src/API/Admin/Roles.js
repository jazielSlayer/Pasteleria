import { API_URL } from "../Api.js";

// Obtener todos los roles
export async function getAllRoles() {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error al obtener roles: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getAllRoles:', error);
    throw error;
  }
}

// Obtener un rol específico por ID
export async function getRole(id) {
  try {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Rol no encontrado');
      }
      throw new Error(`Error al obtener rol: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getRole:', error);
    throw error;
  }
}

// Crear un nuevo rol
export async function createRole(data) {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        descripcion: data.descripcion || null,
        start_path: data.start_path,
        is_default: data.is_default || false,
        guard_name: data.guard_name || 'web',
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400) {
        throw new Error(errorData.message || 'Campos obligatorios faltantes');
      }
      if (response.status === 409) {
        throw new Error(errorData.message || 'Ya existe un rol con este nombre y guard_name');
      }
      throw new Error(errorData.message || `Error al crear rol: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en createRole:', error);
    throw error;
  }
}

// Actualizar un rol por ID
export async function updateRole(id, data) {
  try {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        descripcion: data.descripcion || null,
        start_path: data.start_path,
        is_default: data.is_default,
        guard_name: data.guard_name || 'web',
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error(errorData.message || 'Rol no encontrado');
      }
      if (response.status === 409) {
        throw new Error(errorData.message || 'Ya existe un rol con este nombre y guard_name');
      }
      throw new Error(errorData.message || `Error al actualizar rol: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en updateRole:', error);
    throw error;
  }
}

// Eliminar un rol por ID
export async function deleteRole(id) {
  try {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error(errorData.message || 'Rol no encontrado');
      }
      if (response.status === 400) {
        throw new Error(errorData.message || 'No se puede eliminar el rol porque está asignado a usuarios o permisos');
      }
      throw new Error(errorData.message || `Error al eliminar rol: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en deleteRole:', error);
    throw error;
  }
}

// Obtener todos los permisos
export async function getAllPermissions() {
  try {
    const response = await fetch(`${API_URL}/permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error al obtener permisos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getAllPermissions:', error);
    throw error;
  }
}

// Obtener permisos para un rol específico
export async function getPermissionsByRole(roleId) {
  try {
    const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Rol no encontrado');
      }
      throw new Error(`Error al obtener permisos para el rol: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getPermissionsByRole:', error);
    throw error;
  }
}

// Asignar un permiso a un rol
export async function assignPermissionToRole(roleId, permissionId) {
  try {
    const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        permission_id: permissionId,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error(errorData.message || 'Rol o permiso no encontrado');
      }
      if (response.status === 409) {
        throw new Error(errorData.message || 'El permiso ya está asignado a este rol');
      }
      throw new Error(errorData.message || `Error al asignar permiso al rol: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en assignPermissionToRole:', error);
    throw error;
  }
}

// Eliminar un permiso de un rol
export async function removePermissionFromRole(roleId, permissionId) {
  try {
    const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        permission_id: permissionId,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error(errorData.message || 'Rol o permiso no encontrado');
      }
      throw new Error(errorData.message || `Error al eliminar permiso del rol: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en removePermissionFromRole:', error);
    throw error;
  }
}

// Obtener usuarios con su rol
export async function getUsersWithRoles() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error al obtener usuarios: ${response.statusText}`);
    }
    const users = await response.json();
    // Asegurar que cada usuario tenga un array con su rol (máximo uno)
    return users.map(user => ({
      ...user,
      roles: user.id_roles && user.role_name ? [{ id: user.id_roles, name: user.role_name }] : []
    }));
  } catch (error) {
    console.error('Error en getUsersWithRoles:', error);
    throw error;
  }
}

// Asignar o eliminar un rol de un usuario
export async function assignRoleToUser(userId, roleId) {
  console.log('Assigning role - Input:', { userId, roleId });
  try {
    const response = await fetch(`${API_URL}/users/${userId}/assign-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role_id: roleId === undefined ? null : roleId, // Convertir undefined a null
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error response from backend:', errorData);
      if (response.status === 404) {
        throw new Error(errorData.message || 'Usuario o rol no encontrado');
      }
      if (response.status === 400) {
        throw new Error(errorData.message || 'Solicitud inválida: parámetros incorrectos');
      }
      throw new Error(errorData.message || `Error al asignar rol al usuario: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en assignRoleToUser:', error);
    throw error;
  }
}

// Obtener rol de un usuario por correo
export async function getUserRoleByEmail(email) {
  try {
    const response = await fetch(`${API_URL}/users/role-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400) {
        throw new Error(errorData.message || 'Correo requerido');
      }
      if (response.status === 404) {
        throw new Error(errorData.message || 'Usuario no encontrado');
      }
      throw new Error(errorData.message || `Error al obtener rol: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('getUserRoleByEmail response:', data);
    return data.role && data.role !== 'Sin rol asignado' 
      ? [{ id: data.role_id, name: data.role.toLowerCase() }]
      : [];
  } catch (error) {
    console.error('Error en getUserRoleByEmail:', error);
    throw error;
  }
}