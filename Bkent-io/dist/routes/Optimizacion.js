"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _ProduccionOptima = require("../controlers/ProduccionOptima.js");
// src/routes/optimization.routes.js

var router = (0, _express.Router)();

/**
 * POST /api/optimization/maximizar
 * Maximiza la utilidad de producción según stock disponible
 * 
 * Body (opcional):
 * {
 *   "restriccionesDemanda": [
 *     {"producto_id": 1, "cantidad_maxima": 50},
 *     {"producto_id": 2, "cantidad_maxima": 300}
 *   ]
 * }
 */
router.post('/optimizacion/maximizar', _ProduccionOptima.maximizarProduccion);

/**
 * POST /api/optimization/minimizar
 * Minimiza costos de producción cumpliendo demanda
 * 
 * Body:
 * {
 *   "demanda": [
 *     {"producto_id": 1, "cantidad_requerida": 50},
 *     {"producto_id": 2, "cantidad_requerida": 120}
 *   ]
 * }
 */
router.post('/optimizacion/minimizar', _ProduccionOptima.minimizarCostos);

/**
 * POST /api/optimization/personalizada
 * Resuelve un problema de programación lineal personalizado
 * 
 * Body:
 * {
 *   "tipo": "maximizar",  // o "minimizar"
 *   "funcion_objetivo": "Maximizar utilidad",
 *   "variables": [
 *     {"nombre": "x1", "coeficiente": 40},
 *     {"nombre": "x2", "coeficiente": 8},
 *     {"nombre": "x3", "coeficiente": 2}
 *   ],
 *   "restricciones": [
 *     {
 *       "nombre": "Mano_de_obra",
 *       "tipo": "<=",
 *       "valor": 40,
 *       "coeficientes": [
 *         {"variable": "x1", "valor": 2},
 *         {"variable": "x2", "valor": 0.2},
 *         {"variable": "x3", "valor": 0.1}
 *       ]
 *     },
 *     {
 *       "nombre": "Horno",
 *       "tipo": "<=",
 *       "valor": 12,
 *       "coeficientes": [
 *         {"variable": "x1", "valor": 1.5},
 *         {"variable": "x2", "valor": 0.1},
 *         {"variable": "x3", "valor": 0.05}
 *       ]
 *     }
 *   ]
 * }
 */
router.post('/optimizacion/personalizada', _ProduccionOptima.optimizacionPersonalizada);
var _default = exports["default"] = router;