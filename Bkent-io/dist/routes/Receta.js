"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _Receta = require("../controlers/Receta");
var router = (0, _express.Router)();

/**
 * @swagger
 * /modulos:
 *   get:
 *     summary: Obtener todos los módulos
 *     tags: [Módulos]
 *     responses:
 *       200:
 *         description: Lista de módulos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del módulo
 *                   codigo:
 *                     type: string
 *                     description: Código identificador del módulo
 *                   nombre:
 *                     type: string
 *                     description: Nombre del módulo
 *                   id_docente:
 *                     type: integer
 *                     description: ID del docente asignado al módulo
 *                   id_metodologia:
 *                     type: integer
 *                     description: ID de la metodología asociada al módulo
 *                   duracion:
 *                     type: string
 *                     description: Duración del módulo (ej. '8 semanas')
 *                   descripcion:
 *                     type: string
 *                     description: Descripción detallada del módulo
 *                   fecha_inicio:
 *                     type: string
 *                     description: Fecha de inicio del módulo (formato ISO 8601, ej. YYYY-MM-DD)
 *                   fecha_finalizacion:
 *                     type: string
 *                     description: Fecha de finalización del módulo (formato ISO 8601, ej. YYYY-MM-DD)
 *       500:
 *         description: Error del servidor
 */
router.get("/recetas", _Receta.getRecetas);

/**
 * @swagger
 * /modulos/{id}:
 *   get:
 *     summary: Obtener un módulo por su ID
 *     tags: [Módulos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del módulo
 *     responses:
 *       200:
 *         description: Módulo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID único del módulo
 *                 codigo:
 *                   type: string
 *                   description: Código identificador del módulo
 *                 nombre:
 *                   type: string
 *                   description: Nombre del módulo
 *                 id_docente:
 *                   type: integer
 *                   description: ID del docente asignado al módulo
 *                 id_metodologia:
 *                   type: integer
 *                   description: ID de la metodología asociada al módulo
 *                 duracion:
 *                   type: string
 *                   description: Duración del módulo (ej. '8 semanas')
 *                 descripcion:
 *                   type: string
 *                   description: Descripción detallada del módulo
 *                 fecha_inicio:
 *                   type: string
 *                   description: Fecha de inicio del módulo (formato ISO 8601, ej. YYYY-MM-DD)
 *                 fecha_finalizacion:
 *                   type: string
 *                   description: Fecha de finalización del módulo (formato ISO 8601, ej. YYYY-MM-DD)
 *       404:
 *         description: Módulo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/recetas/:id", _Receta.getReceta);
router.post("/receta/create", _Receta.createReceta);
router.put("/receta/update/:id", _Receta.updateReceta);
router["delete"]("/receta/delete/:id", _Receta.deleteReceta);
var _default = exports["default"] = router;