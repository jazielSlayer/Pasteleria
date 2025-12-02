import { API_URL } from "../Api.js";

/* ==================== OPTIMIZACIÓN DE PRODUCCIÓN ==================== */

/**
 * Optimiza la producción para maximizar utilidad
 * Usa el algoritmo de programación lineal HiGHS
 * @returns {Promise<Object>} Resultado de la optimización
 */
export async function optimizarProduccion() {
  const res = await fetch(`${API_URL}/produccion/optimizar`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Error al optimizar producción");
  return res.json();
}

/**
 * Analiza la sensibilidad de un recurso específico
 * @param {string} recurso - Nombre del recurso a analizar
 * @param {number} incremento - Cantidad a incrementar (puede ser negativo)
 * @returns {Promise<Object>} Análisis de sensibilidad
 */
export async function analizarSensibilidad(recurso, incremento) {
  const res = await fetch(`${API_URL}/produccion/sensibilidad`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recurso, incremento }),
  });
  if (!res.ok) throw new Error("Error al analizar sensibilidad");
  return res.json();
}

/**
 * Planifica la producción para un período de varios días
 * @param {number} dias - Número de días a planificar
 * @returns {Promise<Object>} Plan de producción para el período
 */
export async function planificarProduccionPeriodo(dias) {
  if (!dias || dias <= 0) {
    throw new Error("El número de días debe ser mayor a 0");
  }

  const res = await fetch(`${API_URL}/produccion/planificar/${dias}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Error al planificar período");
  return res.json();
}

/**
 * Maximiza las ganancias con coeficientes de ganancia
 * @returns {Promise<Object>} Resultado de la optimización con ecuación detallada
 */
export async function maximizarGanancias() {
  const res = await fetch(`${API_URL}/maximizar-ganancias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Error al maximizar ganancias");
  return res.json();
}

/**
 * Analiza la sensibilidad de los coeficientes de ganancia
 * @returns {Promise<Object>} Análisis de sensibilidad de coeficientes
 */
export async function analizarCoeficientes() {
  const res = await fetch(`${API_URL}/analizar-coeficientes`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Error al analizar coeficientes");
  return res.json();
}

/**
 * Health check del servicio de optimización
 * @returns {Promise<Object>} Estado del servicio
 */
export async function checkHealthOptimizacion() {
  const res = await fetch(`${API_URL}/health`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Servicio de optimización no disponible");
  return res.json();
}

/* ==================== ANÁLISIS Y REPORTES ==================== */

/**
 * Obtiene recomendaciones estratégicas basadas en la última optimización
 * @returns {Promise<Array>} Lista de recomendaciones priorizadas
 */
export async function getRecomendaciones() {
  const resultado = await optimizarProduccion();
  
  if (!resultado.success) {
    throw new Error(resultado.message || "No se pudo obtener recomendaciones");
  }
  
  return resultado.recomendaciones || [];
}

/**
 * Obtiene el estado actual de los recursos de producción
 * @returns {Promise<Array>} Estado de recursos
 */
export async function getEstadoRecursos() {
  const resultado = await optimizarProduccion();
  
  if (!resultado.success) {
    throw new Error(resultado.message || "No se pudo obtener estado de recursos");
  }
  
  return resultado.recursos || [];
}

/**
 * Identifica cuellos de botella en la producción
 * @returns {Promise<Array>} Recursos que están limitando la producción
 */
export async function getCuellosBotella() {
  const resultado = await optimizarProduccion();
  
  if (!resultado.success) {
    throw new Error(resultado.message || "No se pudo identificar cuellos de botella");
  }
  
  const saturados = resultado.recursos?.filter(r => r.estado === 'Saturado') || [];
  return saturados.map(r => ({
    recurso: r.recurso,
    uso: r.porcentaje_uso,
    precio_sombra: r.precio_sombra,
    impacto: r.precio_sombra > 0 
      ? `Aumentar en 1 unidad generaría ${r.precio_sombra.toFixed(2)} Bs adicionales`
      : 'Este recurso está saturado pero no aumenta la utilidad actualmente'
  }));
}

/**
 * Identifica recursos subutilizados
 * @param {number} umbral - Porcentaje de uso mínimo (default: 50%)
 * @returns {Promise<Array>} Recursos con capacidad ociosa
 */
export async function getRecursosSubutilizados(umbral = 50) {
  const resultado = await optimizarProduccion();
  
  if (!resultado.success) {
    throw new Error(resultado.message || "No se pudo obtener recursos subutilizados");
  }
  
  return resultado.recursos?.filter(r => r.porcentaje_uso < umbral) || [];
}

/* ==================== COMPARACIÓN Y SIMULACIÓN ==================== */

/**
 * Compara múltiples escenarios de sensibilidad para un recurso
 * @param {string} recursoNombre - Nombre del recurso
 * @param {Array<number>} incrementos - Lista de incrementos a probar
 * @returns {Promise<Array>} Resultados comparativos
 */
export async function compararEscenarios(recursoNombre, incrementos) {
  const escenarios = await Promise.all(
    incrementos.map(inc => analizarSensibilidad(recursoNombre, inc))
  );
  
  return escenarios.map((resultado, index) => ({
    incremento: incrementos[index],
    ...resultado
  }));
}

/**
 * Simula el impacto de aumentar múltiples recursos
 * @param {Array} cambios - [{ recurso, incremento }]
 * @returns {Promise<Object>} Análisis agregado del impacto
 */
export async function simularCambiosMultiples(cambios) {
  const analisis = await Promise.all(
    cambios.map(c => analizarSensibilidad(c.recurso, c.incremento))
  );
  
  const utilidadTotal = analisis.reduce((sum, a) => sum + (a.diferencia_utilidad || 0), 0);
  const roiPromedio = analisis.reduce((sum, a) => sum + (a.roi_por_unidad || 0), 0) / analisis.length;
  
  return {
    cambios_propuestos: cambios,
    resultados_individuales: analisis,
    utilidad_total_adicional: Math.round(utilidadTotal * 100) / 100,
    roi_promedio: Math.round(roiPromedio * 100) / 100,
    recomendacion: utilidadTotal > 0 
      ? `Los cambios propuestos generarían ${utilidadTotal.toFixed(2)} Bs adicionales`
      : "Los cambios propuestos no mejoran la utilidad"
  };
}

/* ==================== VALIDACIONES Y HELPERS ==================== */

/**
 * Valida que existan los datos necesarios para optimizar
 * @returns {Promise<Object>} Estado de validación
 */
export async function validarDatosOptimizacion() {
  try {
    const resultado = await optimizarProduccion();
    
    return {
      valido: resultado.success,
      mensaje: resultado.message || "Sistema listo para optimizar",
      errores: resultado.success ? [] : [resultado.message]
    };
  } catch (error) {
    return {
      valido: false,
      mensaje: "Error al validar datos",
      errores: [error.message]
    };
  }
}

/**
 * Formatea los resultados de optimización para visualización
 * @param {Object} resultado - Resultado crudo de optimizarProduccion()
 * @returns {Object} Datos formateados para UI
 */
export function formatearResultadosOptimizacion(resultado) {
  if (!resultado.success) {
    return {
      exito: false,
      mensaje: resultado.message,
      datos: null
    };
  }
  
  return {
    exito: true,
    utilidad: `Bs ${resultado.utilidad_maxima.toLocaleString()}`,
    produccion: resultado.produccion.map(p => ({
      producto: p.nombre,
      cantidad: `${p.cantidad_producir} unidades`,
      utilidad: `Bs ${p.utilidad_total.toLocaleString()}`
    })),
    recursos_criticos: resultado.recursos
      .filter(r => r.estado === 'Saturado')
      .map(r => r.recurso),
    recomendaciones_principales: resultado.recomendaciones
      .filter(r => r.prioridad === 'ALTA')
      .map(r => r.mensaje)
  };
}

/**
 * Obtiene estadísticas resumidas de la optimización
 * @returns {Promise<Object>} Métricas clave
 */
export async function getEstadisticasOptimizacion() {
  const resultado = await optimizarProduccion();
  
  if (!resultado.success) {
    throw new Error(resultado.message || "Error al obtener estadísticas");
  }
  
  const totalProductos = resultado.resumen?.total_productos || 0;
  const productosProducir = resultado.resumen?.productos_a_producir || 0;
  const recursosSaturados = resultado.resumen?.recursos_saturados || 0;
  const recursosDisponibles = resultado.resumen?.recursos_disponibles || 0;
  
  return {
    utilidad_maxima: resultado.utilidad_maxima,
    total_productos: totalProductos,
    productos_a_producir: productosProducir,
    productos_excluidos: totalProductos - productosProducir,
    tasa_inclusion: totalProductos > 0 
      ? Math.round((productosProducir / totalProductos) * 100) 
      : 0,
    recursos_saturados: recursosSaturados,
    recursos_con_holgura: recursosDisponibles - recursosSaturados,
    eficiencia_recursos: recursosDisponibles > 0
      ? Math.round(((recursosDisponibles - recursosSaturados) / recursosDisponibles) * 100)
      : 0,
    tiene_cuellos_botella: recursosSaturados > 0,
    recomendaciones_altas: resultado.recomendaciones?.filter(r => r.prioridad === 'ALTA').length || 0
  };
}

/**
 * Exporta el plan de producción a formato legible
 * @param {number} dias - Días a planificar (opcional)
 * @returns {Promise<Object>} Plan exportable
 */
export async function exportarPlanProduccion(dias = 1) {
  const resultado = dias > 1 
    ? await planificarProduccionPeriodo(dias)
    : await optimizarProduccion();
    
  if (!resultado.success) {
    throw new Error("No se pudo generar el plan de producción");
  }
  
  const fecha = new Date().toISOString().split('T')[0];
  
  return {
    fecha_generacion: fecha,
    periodo_dias: dias,
    utilidad_esperada: resultado.utilidad_maxima || resultado.utilidad_total_periodo,
    productos: resultado.produccion || resultado.produccion_diaria,
    recursos: resultado.recursos || resultado.recursos_necesarios_periodo,
    recomendaciones: resultado.recomendaciones || [],
    modelo_lp: resultado.modelo_lp
  };
}