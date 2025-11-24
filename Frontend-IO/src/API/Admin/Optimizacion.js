import { API_URL } from "../Api.js";


/**
 * Maximiza la utilidad de producción según stock disponible
 * @param {Object} restricciones - Restricciones opcionales de demanda
 * @param {Array} restricciones.restriccionesDemanda - [{ producto_id, cantidad_maxima }]
 * @returns {Promise<Object>} - { estado, utilidad_maxima, produccion: [...] }
 */
export async function maximizarProduccion(restricciones = {}) {
  const res = await fetch(`${API_URL}/optimizacion/maximizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(restricciones),
  });
  if (!res.ok) throw new Error("Error al maximizar producción");
  return res.json();
}


/**
 * Minimiza costos de producción cumpliendo demanda requerida
 * @param {Array} demanda - [{ producto_id, cantidad_requerida }]
 * @returns {Promise<Object>} - { estado, costo_minimo, plan_produccion: [...] }
 */
export async function minimizarCostos(demanda) {
  if (!demanda || demanda.length === 0) {
    throw new Error("Debe especificar la demanda de productos");
  }

  const res = await fetch(`${API_URL}/optimizacion/minimizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ demanda }),
  });
  if (!res.ok) throw new Error("Error al minimizar costos");
  return res.json();
}

/* ==================== OPTIMIZACIÓN PERSONALIZADA ==================== */
/**
 * Resuelve un problema de programación lineal personalizado
 * @param {Object} problema - Definición del problema
 * @param {string} problema.tipo - "maximizar" o "minimizar"
 * @param {string} problema.funcion_objetivo - Descripción de la función objetivo
 * @param {Array} problema.variables - [{ nombre, coeficiente, descripcion? }]
 * @param {Array} problema.restricciones - [{ nombre, tipo, valor, descripcion?, coeficientes: [{ variable, valor }] }]
 * @returns {Promise<Object>} - { tipo_problema, estado, valor_optimo, valores_variables: {...} }
 */
export async function optimizacionPersonalizada(problema) {
  const { tipo, funcion_objetivo, variables, restricciones } = problema;

  if (!tipo || !funcion_objetivo || !variables || !restricciones) {
    throw new Error("Faltan parámetros requeridos del problema");
  }

  const res = await fetch(`${API_URL}/optimizacion/personalizada`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(problema),
  });
  if (!res.ok) throw new Error("Error al resolver optimización personalizada");
  return res.json();
}

/* ==================== OBTENER INFO DE ENDPOINTS ==================== */
/**
 * Obtiene información sobre los endpoints disponibles
 * @returns {Promise<Object>} - Información de los endpoints
 */
export async function getOptimizacionInfo() {
  const res = await fetch(`${API_URL}/optimizacion/test`);
  if (!res.ok) throw new Error("Error al obtener información de optimización");
  return res.json();
}


/**
 * Resuelve el problema ejemplo de tortas, cupcakes y galletas
 * Maximizar Z = 40x₁ + 8x₂ + 2x₃
 * @returns {Promise<Object>} - Solución del problema
 */
export async function resolverEjemploTortas() {
  const problema = {
    tipo: "maximizar",
    funcion_objetivo: "Maximizar utilidad de tortas, cupcakes y galletas",
    variables: [
      { nombre: "x1", coeficiente: 40, descripcion: "Tortas" },
      { nombre: "x2", coeficiente: 8, descripcion: "Cupcakes" },
      { nombre: "x3", coeficiente: 2, descripcion: "Galletas" }
    ],
    restricciones: [
      {
        nombre: "Mano_de_obra",
        tipo: "<=",
        valor: 40,
        descripcion: "Horas de mano de obra disponibles",
        coeficientes: [
          { variable: "x1", valor: 2 },
          { variable: "x2", valor: 0.2 },
          { variable: "x3", valor: 0.1 }
        ]
      },
      {
        nombre: "Horno",
        tipo: "<=",
        valor: 12,
        descripcion: "Horas de horno disponibles",
        coeficientes: [
          { variable: "x1", valor: 1.5 },
          { variable: "x2", valor: 0.1 },
          { variable: "x3", valor: 0.05 }
        ]
      },
      {
        nombre: "Harina",
        tipo: "<=",
        valor: 30,
        descripcion: "Kg de harina disponibles",
        coeficientes: [
          { variable: "x1", valor: 3 },
          { variable: "x2", valor: 0.2 },
          { variable: "x3", valor: 0.1 }
        ]
      },
      {
        nombre: "Demanda_Tortas",
        tipo: "<=",
        valor: 50,
        descripcion: "Demanda máxima de tortas",
        coeficientes: [{ variable: "x1", valor: 1 }]
      },
      {
        nombre: "Demanda_Cupcakes",
        tipo: "<=",
        valor: 300,
        descripcion: "Demanda máxima de cupcakes",
        coeficientes: [{ variable: "x2", valor: 1 }]
      },
      {
        nombre: "Demanda_Galletas",
        tipo: "<=",
        valor: 500,
        descripcion: "Demanda máxima de galletas",
        coeficientes: [{ variable: "x3", valor: 1 }]
      }
    ]
  };

  return optimizacionPersonalizada(problema);
}

/* ==================== HELPERS PARA CONSTRUCCIÓN DE PROBLEMAS ==================== */

/**
 * Crea una variable para el problema de optimización
 * @param {string} nombre - Nombre de la variable (ej: "x1", "x2")
 * @param {number} coeficiente - Coeficiente en la función objetivo
 * @param {string} descripcion - Descripción opcional
 */
export function crearVariable(nombre, coeficiente, descripcion = "") {
  return { nombre, coeficiente, descripcion };
}

/**
 * Crea una restricción para el problema de optimización
 * @param {string} nombre - Nombre de la restricción
 * @param {string} tipo - "<=", ">=", o "="
 * @param {number} valor - Valor del lado derecho
 * @param {Array} coeficientes - [{ variable, valor }]
 * @param {string} descripcion - Descripción opcional
 */
export function crearRestriccion(nombre, tipo, valor, coeficientes, descripcion = "") {
  return { nombre, tipo, valor, coeficientes, descripcion };
}

/**
 * Valida que un problema esté correctamente estructurado
 * @param {Object} problema - El problema a validar
 * @returns {Object} - { valido: boolean, errores: string[] }
 */
export function validarProblema(problema) {
  const errores = [];

  if (!problema.tipo || !["maximizar", "minimizar"].includes(problema.tipo)) {
    errores.push("El tipo debe ser 'maximizar' o 'minimizar'");
  }

  if (!problema.funcion_objetivo || problema.funcion_objetivo.trim() === "") {
    errores.push("Debe especificar la función objetivo");
  }

  if (!problema.variables || problema.variables.length === 0) {
    errores.push("Debe definir al menos una variable");
  }

  if (!problema.restricciones || problema.restricciones.length === 0) {
    errores.push("Debe definir al menos una restricción");
  }

  if (problema.variables) {
    problema.variables.forEach((v, i) => {
      if (!v.nombre) errores.push(`Variable ${i + 1}: falta el nombre`);
      if (v.coeficiente === undefined) errores.push(`Variable ${i + 1}: falta el coeficiente`);
    });
  }

  if (problema.restricciones) {
    problema.restricciones.forEach((r, i) => {
      if (!r.tipo || !["<=", ">=", "="].includes(r.tipo)) {
        errores.push(`Restricción ${i + 1}: tipo inválido (debe ser <=, >= o =)`);
      }
      if (r.valor === undefined) {
        errores.push(`Restricción ${i + 1}: falta el valor`);
      }
      if (!r.coeficientes || r.coeficientes.length === 0) {
        errores.push(`Restricción ${i + 1}: falta definir coeficientes`);
      }
    });
  }

  return {
    valido: errores.length === 0,
    errores
  };
}