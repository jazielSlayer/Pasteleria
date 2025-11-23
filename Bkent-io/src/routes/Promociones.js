import { Router } from "express";
import { createPromocion, deletePromocion, getPromocion, getPromociones, updatePromocion } from "../controlers/Promociones";

const router = Router();

/**
 * @swagger
 * /personas:
 *   get:
 *     summary: Obtener todas las personas
 *     tags: [Personas]
 *     responses:
 *       200:
 *         description: Lista de personas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único de la persona
 *                   nombres:
 *                     type: string
 *                     description: Nombres de la persona
 *                   apellidopat:
 *                     type: string
 *                     description: Apellido paterno de la persona
 *                   apellidomat:
 *                     type: string
 *                     description: Apellido materno de la persona
 *                   carnet:
 *                     type: string
 *                     description: Número de identificación o carnet de la persona
 *                   direccion:
 *                     type: string
 *                     description: Dirección residencial de la persona
 *                   telefono:
 *                     type: string
 *                     description: Número de teléfono de la persona
 *                   correo:
 *                     type: string
 *                     description: Correo electrónico de la persona
 *                   fecha_nacimiento:
 *                     type: string
 *                     description: Fecha de nacimiento de la persona (formato ISO 8601, ej. YYYY-MM-DD)
 *                   estado:
 *                     type: boolean
 *                     description: Estado activo/inactivo de la persona
 *       500:
 *         description: Error del servidor
 */
router.get("/promociones", getPromociones);

/**
 * @swagger
 * /personas/{id}:
 *   get:
 *     summary: Obtener una persona por su ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la persona
 *     responses:
 *       200:
 *         description: Persona obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID único de la persona
 *                 nombres:
 *                   type: string
 *                   description: Nombres de la persona
 *                 apellidopat:
 *                   type: string
 *                   description: Apellido paterno de la persona
 *                 apellidomat:
 *                   type: string
 *                   description: Apellido materno de la persona
 *                 carnet:
 *                   type: string
 *                   description: Número de identificación o carnet de la persona
 *                 direccion:
 *                   type: string
 *                   description: Dirección residencial de la persona
 *                 telefono:
 *                   type: string
 *                   description: Número de teléfono de la persona
 *                 correo:
 *                   type: string
 *                   description: Correo electrónico de la persona
 *                 fecha_nacimiento:
 *                   type: string
 *                   description: Fecha de nacimiento de la persona (formato ISO 8601, ej. YYYY-MM-DD)
 *                 estado:
 *                   type: boolean
 *                   description: Estado activo/inactivo de la persona
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/promocion/:id", getPromocion);

/**
 * @swagger
 * /personas:
 *   post:
 *     summary: Crear una nueva persona
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidopat
 *               - carnet
 *               - correo
 *             properties:
 *               nombres:
 *                 type: string
 *                 description: Nombres de la persona
 *               apellidopat:
 *                 type: string
 *                 description: Apellido paterno de la persona
 *               apellidomat:
 *                 type: string
 *                 description: Apellido materno de la persona
 *               carnet:
 *                 type: string
 *                 description: Número de identificación o carnet de la persona
 *               direccion:
 *                 type: string
 *                 description: Dirección residencial de la persona
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono de la persona
 *               correo:
 *                 type: string
 *                 description: Correo electrónico de la persona
 *               fecha_nacimiento:
 *                 type: string
 *                 description: Fecha de nacimiento de la persona (formato ISO 8601, ej. YYYY-MM-DD)
 *               estado:
 *                 type: boolean
 *                 description: Estado activo/inactivo de la persona
 *     responses:
 *       201:
 *         description: Persona creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombres:
 *                   type: string
 *                 apellidopat:
 *                   type: string
 *                 apellidomat:
 *                   type: string
 *                 carnet:
 *                   type: string
 *                 direccion:
 *                   type: string
 *                 telefono:
 *                   type: string
 *                 correo:
 *                   type: string
 *                 fecha_nacimiento:
 *                   type: string
 *                 estado:
 *                   type: boolean
 *       400:
 *         description: Solicitud inválida
 *       500:
 *         description: Error del servidor
 */
router.post("/promocion/crear", createPromocion);

/**
 * @swagger
 * /personas/{id}:
 *   put:
 *     summary: Actualizar una persona
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *                 description: Nombres de la persona
 *               apellidopat:
 *                 type: string
 *                 description: Apellido paterno de la persona
 *               apellidomat:
 *                 type: string
 *                 description: Apellido materno de la persona
 *               carnet:
 *                 type: string
 *                 description: Número de identificación o carnet de la persona
 *               direccion:
 *                 type: string
 *                 description: Dirección residencial de la persona
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono de la persona
 *               correo:
 *                 type: string
 *                 description: Correo electrónico de la persona
 *               fecha_nacimiento:
 *                 type: string
 *                 description: Fecha de nacimiento de la persona (formato ISO 8601, ej. YYYY-MM-DD)
 *               estado:
 *                 type: boolean
 *                 description: Estado activo/inactivo de la persona
 *     responses:
 *       200:
 *         description: Persona actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombres:
 *                   type: string
 *                 apellidopat:
 *                   type: string
 *                 apellidomat:
 *                   type: string
 *                 carnet:
 *                   type: string
 *                 direccion:
 *                   type: string
 *                 telefono:
 *                   type: string
 *                 correo:
 *                   type: string
 *                 fecha_nacimiento:
 *                   type: string
 *                 estado:
 *                   type: boolean
 *       400:
 *         description: Solicitud inválida
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/promoacion/update/:id", updatePromocion);

/**
 * @swagger
 * /personas/{id}:
 *   delete:
 *     summary: Eliminar una persona
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la persona
 *     responses:
 *       204:
 *         description: Persona eliminada exitosamente
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/promoacion/delete/:id", deletePromocion);

export default router;