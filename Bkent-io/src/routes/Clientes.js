// routes/permissions.js

import { Router } from "express"; 
import { buscarCliente, createCliente, deleteCliente, getCliente, getClientes, updateCliente } from "../controlers/Clientes";

const router = Router();

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Obtener todos los permisos
 *     tags: [Permisos]
 *     responses:
 *       200:
 *         description: Lista de permisos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del permiso
 *                   nombre:
 *                     type: string
 *                     description: Nombre del permiso
 *                   descripcion:
 *                     type: string
 *                     description: Descripción del permiso
 *                   estado:
 *                     type: boolean
 *                     description: Estado activo/inactivo del permiso
 *       500:
 *         description: Error del servidor
 */
router.get("/clientes", getClientes);

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Obtener un permiso por su ID
 *     tags: [Permisos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del permiso
 *     responses:
 *       200:
 *         description: Permiso obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID único del permiso
 *                 nombre:
 *                   type: string
 *                   description: Nombre del permiso
 *                 descripcion:
 *                   type: string
 *                   description: Descripción del permiso
 *                 estado:
 *                   type: boolean
 *                   description: Estado activo/inactivo del permiso
 *       404:
 *         description: Permiso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/cliente/:id", getCliente);

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Crear un nuevo permiso
 *     tags: [Permisos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del permiso
 *               descripcion:
 *                 type: string
 *                 description: Descripción del permiso
 *               estado:
 *                 type: boolean
 *                 description: Estado activo/inactivo del permiso
 *     responses:
 *       201:
 *         description: Permiso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 estado:
 *                   type: boolean
 *       400:
 *         description: Solicitud inválida
 *       500:
 *         description: Error del servidor
 */
router.post("/cliente/buscar", buscarCliente);

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Actualizar un permiso
 *     tags: [Permisos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del permiso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del permiso
 *               descripcion:
 *                 type: string
 *                 description: Descripción del permiso
 *               estado:
 *                 type: boolean
 *                 description: Estado activo/inactivo del permiso
 *     responses:
 *       200:
 *         description: Permiso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 estado:
 *                   type: boolean
 *       400:
 *         description: Solicitud inválida
 *       404:
 *         description: Permiso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/cliente/create", createCliente);

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Eliminar un permiso
 *     tags: [Permisos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del permiso
 *     responses:
 *       204:
 *         description: Permiso eliminado exitosamente
 *       404:
 *         description: Permiso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/cliente/update/:id", updateCliente);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   get:
 *     summary: Obtener los permisos asignados a un rol
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del rol
 *     responses:
 *       200:
 *         description: Lista de permisos asignados al rol obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del permiso
 *                   nombre:
 *                     type: string
 *                     description: Nombre del permiso
 *                   descripcion:
 *                     type: string
 *                     description: Descripción del permiso
 *                   estado:
 *                     type: boolean
 *                     description: Estado activo/inactivo del permiso
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/cliente/delete/:id", deleteCliente);


export default router;