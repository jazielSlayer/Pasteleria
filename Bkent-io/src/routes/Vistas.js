import { Router } from "express";
import { getClientesFrecuentes, getDashboardDiario, getMovimientosRecientes, getProductosRentables, getPromocionesActivas, getStockActual, getVentasPorCategoria } from "../controlers/Vistas";

const router = Router();
/**
 * @swagger
 * /historiales:
 *   get:
 *     summary: Obtener todos los registros de auditoría
 *     tags: [Historiales]
 *     responses:
 *       200:
 *         description: Lista de registros de auditoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del registro de auditoría
 *                   entidad_afectada:
 *                     type: string
 *                     description: Nombre de la entidad afectada por la operación (ej. tabla o recurso)
 *                   descripcion_operacion:
 *                     type: string
 *                     description: Descripción de la operación realizada
 *                   fecha_operacion:
 *                     type: string
 *                     description: Fecha y hora de la operación (formato ISO 8601, ej. YYYY-MM-DDTHH:mm:ssZ)
 *                   usuario:
 *                     type: string
 *                     description: Identificador o nombre del usuario que realizó la operación
 *       500:
 *         description: Error del servidor
 */
router.get("/Dashboartd/Diario", getDashboardDiario);

/**
 * @swagger
 * /historiales/{id}:
 *   get:
 *     summary: Obtener un registro de auditoría por su ID
 *     tags: [Historiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de auditoría
 *     responses:
 *       200:
 *         description: Registro de auditoría obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID único del registro de auditoría
 *                 entidad_afectada:
 *                   type: string
 *                   description: Nombre de la entidad afectada por la operación (ej. tabla o recurso)
 *                 descripcion_operacion:
 *                   type: string
 *                   description: Descripción de la operación realizada
 *                 fecha_operacion:
 *                   type: string
 *                   description: Fecha y hora de la operación (formato ISO 8601, ej. YYYY-MM-DDTHH:mm:ssZ)
 *                 usuario:
 *                   type: string
 *                   description: Identificador o nombre del usuario que realizó la operación
 *       404:
 *         description: Registro de auditoría no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/Stock/Actual", getStockActual);

/**
 * @swagger
 * /historiales:
 *   get:
 *     summary: Obtener todos los registros de auditoría
 *     tags: [Historiales]
 *     responses:
 *       200:
 *         description: Lista de registros de auditoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del registro de auditoría
 *                   entidad_afectada:
 *                     type: string
 *                     description: Nombre de la entidad afectada por la operación (ej. tabla o recurso)
 *                   descripcion_operacion:
 *                     type: string
 *                     description: Descripción de la operación realizada
 *                   fecha_operacion:
 *                     type: string
 *                     description: Fecha y hora de la operación (formato ISO 8601, ej. YYYY-MM-DDTHH:mm:ssZ)
 *                   usuario:
 *                     type: string
 *                     description: Identificador o nombre del usuario que realizó la operación
 *       500:
 *         description: Error del servidor
 */
router.get("/Productos/Rentables", getProductosRentables);

/**
 * @swagger
 * /historiales/{id}:
 *   get:
 *     summary: Obtener un registro de auditoría por su ID
 *     tags: [Historiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de auditoría
 *     responses:
 *       200:
 *         description: Registro de auditoría obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID único del registro de auditoría
 *                 entidad_afectada:
 *                   type: string
 *                   description: Nombre de la entidad afectada por la operación (ej. tabla o recurso)
 *                 descripcion_operacion:
 *                   type: string
 *                   description: Descripción de la operación realizada
 *                 fecha_operacion:
 *                   type: string
 *                   description: Fecha y hora de la operación (formato ISO 8601, ej. YYYY-MM-DDTHH:mm:ssZ)
 *                 usuario:
 *                   type: string
 *                   description: Identificador o nombre del usuario que realizó la operación
 *       404:
 *         description: Registro de auditoría no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/movimientos/recientes", getMovimientosRecientes);
/**
 * @swagger
 * /historiales:
 *   get:
 *     summary: Obtener todos los registros de auditoría
 *     tags: [Historiales]
 *     responses:
 *       200:
 *         description: Lista de registros de auditoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del registro de auditoría
 *                   entidad_afectada:
 *                     type: string
 *                     description: Nombre de la entidad afectada por la operación (ej. tabla o recurso)
 *                   descripcion_operacion:
 *                     type: string
 *                     description: Descripción de la operación realizada
 *                   fecha_operacion:
 *                     type: string
 *                     description: Fecha y hora de la operación (formato ISO 8601, ej. YYYY-MM-DDTHH:mm:ssZ)
 *                   usuario:
 *                     type: string
 *                     description: Identificador o nombre del usuario que realizó la operación
 *       500:
 *         description: Error del servidor
 */
router.get("/clientes/frecuentes", getClientesFrecuentes);

/**
 * @swagger
 * /historiales/{id}:
 *   get:
 *     summary: Obtener un registro de auditoría por su ID
 *     tags: [Historiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de auditoría
 *     responses:
 *       200:
 *         description: Registro de auditoría obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID único del registro de auditoría
 *                 entidad_afectada:
 *                   type: string
 *                   description: Nombre de la entidad afectada por la operación (ej. tabla o recurso)
 *                 descripcion_operacion:
 *                   type: string
 *                   description: Descripción de la operación realizada
 *                 fecha_operacion:
 *                   type: string
 *                   description: Fecha y hora de la operación (formato ISO 8601, ej. YYYY-MM-DDTHH:mm:ssZ)
 *                 usuario:
 *                   type: string
 *                   description: Identificador o nombre del usuario que realizó la operación
 *       404:
 *         description: Registro de auditoría no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/promociones/activas", getPromocionesActivas);

router.get("/ventanas/categoria", getVentasPorCategoria);

export default router;