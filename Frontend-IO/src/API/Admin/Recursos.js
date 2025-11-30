import { API_URL } from "../Api.js";

/* ==================== CRUD RECURSOS DE PRODUCCIÓN ==================== */

/**
 * Obtiene todos los recursos de producción
 * @returns {Promise<Object>} - { success, data[], total }
 */
export async function obtenerRecursos() {
  const res = await fetch(`${API_URL}/recursos`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Error al obtener recursos");
  return res.json();
}

/**
 * Obtiene un recurso específico por ID
 * @param {number} id - ID del recurso
 * @returns {Promise<Object>} - { success, data }
 */
export async function obtenerRecursoPorId(id) {
  if (!id || isNaN(id)) {
    throw new Error("ID de recurso inválido");
  }

  const res = await fetch(`${API_URL}/recursos/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Recurso no encontrado");
    }
    throw new Error("Error al obtener el recurso");
  }
  
  return res.json();
}

/**
 * Crea un nuevo recurso de producción
 * @param {Object} recursoData - { nombre, cantidad_disponible, unidad }
 * @returns {Promise<Object>} - { success, message, data }
 */
export async function crearRecurso(recursoData) {
  // Validaciones del lado del cliente
  if (!recursoData.nombre || recursoData.nombre.trim() === '') {
    throw new Error("El nombre del recurso es obligatorio");
  }
  
  if (recursoData.cantidad_disponible === undefined || recursoData.cantidad_disponible === null) {
    throw new Error("La cantidad disponible es obligatoria");
  }
  
  if (!recursoData.unidad || recursoData.unidad.trim() === '') {
    throw new Error("La unidad de medida es obligatoria");
  }

  const res = await fetch(`${API_URL}/recursos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: recursoData.nombre.trim(),
      cantidad_disponible: parseFloat(recursoData.cantidad_disponible),
      unidad: recursoData.unidad.trim()
    }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al crear recurso");
  }
  
  return res.json();
}

/**
 * Actualiza un recurso existente (actualización completa)
 * @param {number} id - ID del recurso
 * @param {Object} recursoData - { nombre, cantidad_disponible, unidad }
 * @returns {Promise<Object>} - { success, message, data }
 */
export async function actualizarRecurso(id, recursoData) {
  if (!id || isNaN(id)) {
    throw new Error("ID de recurso inválido");
  }

  const res = await fetch(`${API_URL}/recursos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recursoData),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al actualizar recurso");
  }
  
  return res.json();
}

/**
 * Actualiza parcialmente un recurso (solo los campos enviados)
 * @param {number} id - ID del recurso
 * @param {Object} camposActualizar - Campos a actualizar
 * @returns {Promise<Object>} - { success, message, data }
 */
export async function actualizarRecursoParcial(id, camposActualizar) {
  if (!id || isNaN(id)) {
    throw new Error("ID de recurso inválido");
  }

  if (!camposActualizar || Object.keys(camposActualizar).length === 0) {
    throw new Error("Debe proporcionar al menos un campo para actualizar");
  }

  const res = await fetch(`${API_URL}/recursos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(camposActualizar),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al actualizar recurso");
  }
  
  return res.json();
}

/**
 * Elimina un recurso de producción
 * @param {number} id - ID del recurso a eliminar
 * @returns {Promise<Object>} - { success, message, data }
 */
export async function eliminarRecurso(id) {
  if (!id || isNaN(id)) {
    throw new Error("ID de recurso inválido");
  }

  const res = await fetch(`${API_URL}/recursos/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al eliminar recurso");
  }
  
  return res.json();
}

/**
 * Obtiene estadísticas de uso de recursos
 * @returns {Promise<Object>} - { success, data[], resumen }
 */
export async function obtenerEstadisticasRecursos() {
  const res = await fetch(`${API_URL}/recursos/estadisticas/general`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) throw new Error("Error al obtener estadísticas");
  return res.json();
}

/**
 * Verifica el estado del servicio de recursos
 * @returns {Promise<Object>} - Estado del servicio
 */
export async function checkHealthRecursos() {
  const res = await fetch(`${API_URL}/recursos/health`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) throw new Error("Servicio de recursos no disponible");
  return res.json();
}

/* ==================== FUNCIONES DE AYUDA Y VALIDACIÓN ==================== */

/**
 * Valida los datos de un recurso antes de enviarlo
 * @param {Object} recursoData - Datos del recurso
 * @returns {Object} - { valido: boolean, errores: string[] }
 */
export function validarDatosRecurso(recursoData) {
  const errores = [];
  
  if (!recursoData.nombre || recursoData.nombre.trim() === '') {
    errores.push("El nombre es obligatorio");
  } else if (recursoData.nombre.length > 50) {
    errores.push("El nombre no puede exceder 50 caracteres");
  }
  
  if (recursoData.cantidad_disponible === undefined || recursoData.cantidad_disponible === null) {
    errores.push("La cantidad disponible es obligatoria");
  } else {
    const cantidad = parseFloat(recursoData.cantidad_disponible);
    if (isNaN(cantidad)) {
      errores.push("La cantidad disponible debe ser un número válido");
    } else if (cantidad < 0) {
      errores.push("La cantidad disponible no puede ser negativa");
    }
  }
  
  if (!recursoData.unidad || recursoData.unidad.trim() === '') {
    errores.push("La unidad es obligatoria");
  } else if (recursoData.unidad.length > 20) {
    errores.push("La unidad no puede exceder 20 caracteres");
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Formatea los datos de un recurso para mostrar en la UI
 * @param {Object} recurso - Datos del recurso
 * @returns {Object} - Recurso formateado
 */
export function formatearRecurso(recurso) {
  return {
    id: recurso.recurso_id,
    nombre: recurso.nombre,
    cantidad: `${recurso.cantidad_disponible} ${recurso.unidad}`,
    cantidadNumerica: parseFloat(recurso.cantidad_disponible),
    unidad: recurso.unidad,
    nombreCompleto: `${recurso.nombre} (${recurso.cantidad_disponible} ${recurso.unidad})`
  };
}

/**
 * Obtiene recursos filtrados por nombre
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} - Recursos que coinciden
 */
export async function buscarRecursos(termino) {
  const resultado = await obtenerRecursos();
  
  if (!resultado.success) {
    throw new Error("Error al buscar recursos");
  }
  
  if (!termino || termino.trim() === '') {
    return resultado.data;
  }
  
  const terminoLower = termino.toLowerCase();
  return resultado.data.filter(r => 
    r.nombre.toLowerCase().includes(terminoLower) ||
    r.unidad.toLowerCase().includes(terminoLower)
  );
}

/**
 * Obtiene recursos con baja disponibilidad
 * @param {number} umbral - Umbral de cantidad (default: 10)
 * @returns {Promise<Array>} - Recursos con poca disponibilidad
 */
export async function obtenerRecursosBajos(umbral = 10) {
  const resultado = await obtenerRecursos();
  
  if (!resultado.success) {
    throw new Error("Error al obtener recursos");
  }
  
  return resultado.data.filter(r => 
    parseFloat(r.cantidad_disponible) < umbral
  );
}

/**
 * Obtiene recursos ordenados por cantidad disponible
 * @param {string} orden - 'asc' o 'desc'
 * @returns {Promise<Array>} - Recursos ordenados
 */
export async function obtenerRecursosOrdenados(orden = 'desc') {
  const resultado = await obtenerRecursos();
  
  if (!resultado.success) {
    throw new Error("Error al obtener recursos");
  }
  
  return resultado.data.sort((a, b) => {
    const cantidadA = parseFloat(a.cantidad_disponible);
    const cantidadB = parseFloat(b.cantidad_disponible);
    
    return orden === 'asc' 
      ? cantidadA - cantidadB 
      : cantidadB - cantidadA;
  });
}

/**
 * Incrementa la cantidad de un recurso
 * @param {number} id - ID del recurso
 * @param {number} incremento - Cantidad a incrementar
 * @returns {Promise<Object>} - Recurso actualizado
 */
export async function incrementarRecurso(id, incremento) {
  if (incremento <= 0) {
    throw new Error("El incremento debe ser mayor a 0");
  }
  
  // Obtener el recurso actual
  const recursoActual = await obtenerRecursoPorId(id);
  
  if (!recursoActual.success) {
    throw new Error("Recurso no encontrado");
  }
  
  const nuevaCantidad = parseFloat(recursoActual.data.cantidad_disponible) + parseFloat(incremento);
  
  // Actualizar solo la cantidad
  return actualizarRecursoParcial(id, {
    cantidad_disponible: nuevaCantidad
  });
}

/**
 * Decrementa la cantidad de un recurso
 * @param {number} id - ID del recurso
 * @param {number} decremento - Cantidad a decrementar
 * @returns {Promise<Object>} - Recurso actualizado
 */
export async function decrementarRecurso(id, decremento) {
  if (decremento <= 0) {
    throw new Error("El decremento debe ser mayor a 0");
  }
  
  // Obtener el recurso actual
  const recursoActual = await obtenerRecursoPorId(id);
  
  if (!recursoActual.success) {
    throw new Error("Recurso no encontrado");
  }
  
  const cantidadActual = parseFloat(recursoActual.data.cantidad_disponible);
  const nuevaCantidad = cantidadActual - parseFloat(decremento);
  
  if (nuevaCantidad < 0) {
    throw new Error(`No hay suficiente disponibilidad. Actual: ${cantidadActual}, Requerido: ${decremento}`);
  }
  
  // Actualizar solo la cantidad
  return actualizarRecursoParcial(id, {
    cantidad_disponible: nuevaCantidad
  });
}

/**
 * Obtiene un resumen de todos los recursos
 * @returns {Promise<Object>} - Resumen con métricas
 */
export async function obtenerResumenRecursos() {
  const resultado = await obtenerRecursos();
  
  if (!resultado.success) {
    throw new Error("Error al obtener resumen");
  }
  
  const recursos = resultado.data;
  const totalRecursos = recursos.length;
  
  // Calcular totales por tipo de unidad
  const porUnidad = recursos.reduce((acc, r) => {
    if (!acc[r.unidad]) {
      acc[r.unidad] = {
        cantidad: 0,
        recursos: 0
      };
    }
    acc[r.unidad].cantidad += parseFloat(r.cantidad_disponible);
    acc[r.unidad].recursos += 1;
    return acc;
  }, {});
  
  return {
    total_recursos: totalRecursos,
    por_unidad: porUnidad,
    recursos_criticos: recursos.filter(r => parseFloat(r.cantidad_disponible) < 10).length,
    recursos_abundantes: recursos.filter(r => parseFloat(r.cantidad_disponible) >= 50).length
  };
}

/**
 * Exporta la lista de recursos a formato legible
 * @returns {Promise<Object>} - Datos para exportar
 */
export async function exportarRecursos() {
  const resultado = await obtenerRecursos();
  
  if (!resultado.success) {
    throw new Error("Error al exportar recursos");
  }
  
  return {
    fecha_exportacion: new Date().toISOString(),
    total_recursos: resultado.total,
    recursos: resultado.data.map(r => ({
      id: r.recurso_id,
      nombre: r.nombre,
      cantidad_disponible: r.cantidad_disponible,
      unidad: r.unidad
    }))
  };
}

/* ==================== OPERACIONES EN LOTE ==================== */

/**
 * Crea múltiples recursos de una vez
 * @param {Array} recursosData - Array de objetos con datos de recursos
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function crearRecursosEnLote(recursosData) {
  if (!Array.isArray(recursosData) || recursosData.length === 0) {
    throw new Error("Debe proporcionar un array de recursos");
  }
  
  const resultados = {
    exitosos: [],
    fallidos: []
  };
  
  for (const recurso of recursosData) {
    try {
      const resultado = await crearRecurso(recurso);
      resultados.exitosos.push({
        recurso: recurso.nombre,
        data: resultado
      });
    } catch (error) {
      resultados.fallidos.push({
        recurso: recurso.nombre,
        error: error.message
      });
    }
  }
  
  return {
    success: resultados.fallidos.length === 0,
    total: recursosData.length,
    exitosos: resultados.exitosos.length,
    fallidos: resultados.fallidos.length,
    detalles: resultados
  };
}

/**
 * Actualiza múltiples recursos con un factor multiplicador
 * @param {Array} ids - Array de IDs de recursos
 * @param {number} factor - Factor multiplicador (ej: 1.5 para aumentar 50%)
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function ajustarRecursosEnLote(ids, factor) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Debe proporcionar un array de IDs");
  }
  
  if (factor <= 0) {
    throw new Error("El factor debe ser mayor a 0");
  }
  
  const resultados = {
    exitosos: [],
    fallidos: []
  };
  
  for (const id of ids) {
    try {
      const recurso = await obtenerRecursoPorId(id);
      const nuevaCantidad = parseFloat(recurso.data.cantidad_disponible) * factor;
      
      const resultado = await actualizarRecursoParcial(id, {
        cantidad_disponible: nuevaCantidad
      });
      
      resultados.exitosos.push({
        id,
        nombre: recurso.data.nombre,
        cantidad_anterior: recurso.data.cantidad_disponible,
        cantidad_nueva: nuevaCantidad
      });
    } catch (error) {
      resultados.fallidos.push({
        id,
        error: error.message
      });
    }
  }
  
  return {
    success: resultados.fallidos.length === 0,
    total: ids.length,
    exitosos: resultados.exitosos.length,
    fallidos: resultados.fallidos.length,
    detalles: resultados
  };
}