"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _Provedor = require("../controlers/Provedor");
var router = (0, _express.Router)();

/**
 * @swagger
 * /avances:
 *   get:
 *     summary: Obtener todos los registros de avances de estudiantes
 *     tags: [Avances]
 *     responses:
 *       200:
 *         description: Lista de avances obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del registro de avance
 *                   id_estudiante:
 *                     type: integer
 *                     description: ID del estudiante asociado al avance
 *                   id_modulo:
 *                     type: integer
 *                     description: ID del módulo asociado al avance
 *                   responsable:
 *                     type: string
 *                     description: Nombre o identificador del responsable que registró el avance
 *                   fecha:
 *                     type: string
 *                     description: Fecha del registro del avance (formato ISO 8601, ej. YYYY-MM-DD)
 *                   estado:
 *                     type: string
 *                     description: Estado del avance (ej. en progreso, completado, retrasado)
 *       500:
 *         description: Error del servidor
 */
router.get("/provedores", _Provedor.getProveedores);

/**
 * @swagger
 * /avances/{id}:
 *   get:
 *     summary: Obtener un registro de avance por su ID
 *     tags: [Avances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de avance
 *     responses:
 *       200:
 *         description: Registro de avance obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID único del registro de avance
 *                 id_estudiante:
 *                   type: integer
 *                   description: ID del estudiante asociado al avance
 *                 id_modulo:
 *                   type: integer
 *                   description: ID del módulo asociado al avance
 *                 responsable:
 *                   type: string
 *                   description: Nombre o identificador del responsable que registró el avance
 *                 fecha:
 *                   type: string
 *                   description: Fecha del registro del avance (formato ISO 8601, ej. YYYY-MM-DD)
 *                 estado:
 *                   type: string
 *                   description: Estado del avance (ej. en progreso, completado, retrasado)
 *       404:
 *         description: Registro de avance no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/provedor/:id", _Provedor.getProveedor);

/**
 * @swagger
 * /avances:
 *   post:
 *     summary: Crear un nuevo registro de avance
 *     tags: [Avances]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_estudiante
 *               - id_modulo
 *               - responsable
 *               - fecha
 *               - estado
 *             properties:
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del estudiante asociado al avance
 *               id_modulo:
 *                 type: integer
 *                 description: ID del módulo asociado al avance
 *               responsable:
 *                 type: string
 *                 description: Nombre o identificador del responsable que registró el avance
 *               fecha:
 *                 type: string
 *                 description: Fecha del registro del avance (formato ISO 8601, ej. YYYY-MM-DD)
 *               estado:
 *                 type: string
 *                 description: Estado del avance (ej. en progreso, completado, retrasado)
 *     responses:
 *       201:
 *         description: Registro de avance creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 id_estudiante:
 *                   type: integer
 *                 id_modulo:
 *                   type: integer
 *                 responsable:
 *                   type: string
 *                 fecha:
 *                   type: string
 *                 estado:
 *                   type: string
 *       400:
 *         description: Solicitud inválida
 *       500:
 *         description: Error del servidor
 */
router.post("/provedor/create", _Provedor.createProveedor);

/**
 * @swagger
 * /avances/{id}:
 *   put:
 *     summary: Actualizar un registro de avance
 *     tags: [Avances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de avance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del estudiante asociado al avance
 *               id_modulo:
 *                 type: integer
 *                 description: ID del módulo asociado al avance
 *               responsable:
 *                 type: string
 *                 description: Nombre o identificador del responsable que registró el avance
 *               fecha:
 *                 type: string
 *                 description: Fecha del registro del avance (formato ISO 8601, ej. YYYY-MM-DD)
 *               estado:
 *                 type: string
 *                 description: Estado del avance (ej. en progreso, completado, retrasado)
 *     responses:
 *       200:
 *         description: Registro de avance actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 id_estudiante:
 *                   type: integer
 *                 id_modulo:
 *                   type: integer
 *                 responsable:
 *                   type: string
 *                 fecha:
 *                   type: string
 *                 estado:
 *                   type: string
 *       400:
 *         description: Solicitud inválida
 *       404:
 *         description: Registro de avance no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/provedor/update/:id", _Provedor.updateProveedor);

/**
 * @swagger
 * /avances/{id}:
 *   delete:
 *     summary: Eliminar un registro de avance
 *     tags: [Avances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de avance
 *     responses:
 *       204:
 *         description: Registro de avance eliminado exitosamente
 *       404:
 *         description: Registro de avance no encontrado
 *       500:
 *         description: Error del servidor
 */
router["delete"]("/provedor/delete/:id", _Provedor.deleteProveedor);
var _default = exports["default"] = router;