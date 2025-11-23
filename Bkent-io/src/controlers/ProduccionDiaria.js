import { connect } from '../database';

/* ==================== LISTAR PRODUCCIÓN DIARIA ==================== */
export const getProduccionDiaria = async (req, res) => {
    const pool = await connect();
    const { fecha, producto_id } = req.query;

    try {
        let query = `
            SELECT 
                pd.produccion_id,
                pd.fecha,
                pd.producto_id,
                p.codigo,
                p.nombre AS producto_nombre,
                p.categoria,
                pd.cantidad_producida,
                pd.observacion,
                r.porciones_salida,
                COALESCE(v.costo_unitario, 0) AS costo_unitario_bs,
                ROUND(pd.cantidad_producida * COALESCE(v.costo_unitario, 0), 2) AS costo_total_produccion
            FROM ProduccionDiaria pd
            JOIN Productos p ON pd.producto_id = p.producto_id
            LEFT JOIN Recetas r ON p.producto_id = r.producto_id
            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id
            WHERE p.activo = 1
        `;
        const values = [];

        if (fecha) {
            query += ' AND DATE(pd.fecha) = ?';
            values.push(fecha);
        }
        if (producto_id) {
            query += ' AND pd.producto_id = ?';
            values.push(producto_id);
        }

        query += ' ORDER BY pd.fecha DESC, pd.produccion_id DESC';

        const [rows] = await pool.query(query, values);
        res.json(rows);

    } catch (error) {
        console.error('Error fetching producción diaria:', error);
        res.status(500).json({ message: 'Error al obtener producción diaria' });
    }
};

/* ==================== OBTENER UNA PRODUCCIÓN POR ID ==================== */
export const getProduccion = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                pd.*,
                p.codigo,
                p.nombre AS producto_nombre,
                p.precio_venta,
                r.porciones_salida,
                COALESCE(v.costo_unitario, 0) AS costo_unitario_bs,
                ROUND(pd.cantidad_producida * COALESCE(v.costo_unitario, 0), 2) AS costo_total_bs
            FROM ProduccionDiaria pd
            JOIN Productos p ON pd.producto_id = p.producto_id
            LEFT JOIN Recetas r ON p.producto_id = r.producto_id
            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id
            WHERE pd.produccion_id = ? AND p.activo = 1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producción no encontrada' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching producción:', error);
        res.status(500).json({ message: 'Error al obtener producción' });
    }
};

/* ==================== REGISTRAR PRODUCCIÓN DIARIA (con descuento automático de insumos) ==================== */
export const createProduccion = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            producto_id,
            cantidad_producida,
            observacion = null,
            usuario = 'Sistema'  // Puedes pasar el nombre del usuario autenticado
        } = req.body;

        // Validaciones
        if (!producto_id || !cantidad_producida) {
            return res.status(400).json({ message: 'producto_id y cantidad_producida son obligatorios' });
        }

        const cantProd = parseFloat(cantidad_producida);
        if (isNaN(cantProd) || cantProd <= 0) {
            return res.status(400).json({ message: 'Cantidad producida debe ser mayor a 0' });
        }

        // Verificar producto activo
        const [producto] = await connection.query('SELECT * FROM Productos WHERE producto_id = ? AND activo = 1', [producto_id]);
        if (producto.length === 0) {
            return res.status(400).json({ message: 'Producto no encontrado o inactivo' });
        }

        // Verificar que tenga receta
        const [receta] = await connection.query(`
            SELECT r.*, rd.materia_id, rd.cantidad AS cantidad_por_receta, mp.stock_actual, mp.nombre AS materia_nombre, mp.unidad
            FROM Recetas r
            JOIN RecetaDetalle rd ON r.receta_id = rd.receta_id
            JOIN MateriasPrimas mp ON rd.materia_id = mp.materia_id
            WHERE r.producto_id = ?
        `, [producto_id]);

        if (receta.length === 0) {
            return res.status(400).json({ 
                message: 'No se puede producir: el producto no tiene receta registrada' 
            });
        }

        // Calcular insumos necesarios por la cantidad producida
        const factor = cantProd / receta[0].porciones_salida;

        // Validar stock suficiente
        const faltantes = [];
        for (const ing of receta) {
            const requerido = ing.cantidad_por_receta * factor;
            if (ing.stock_actual < requerido) {
                faltantes.push({
                    materia: ing.materia_nombre,
                    unidad: ing.unidad,
                    disponible: ing.stock_actual,
                    requerido: parseFloat(requerido.toFixed(4))
                });
            }
        }

        if (faltantes.length > 0) {
            return res.status(400).json({
                message: 'Stock insuficiente para producir',
                faltantes
            });
        }

        // Descontar insumos del inventario
        for (const ing of receta) {
            const requerido = ing.cantidad_por_receta * factor;
            await connection.query(
                'UPDATE MateriasPrimas SET stock_actual = stock_actual - ? WHERE materia_id = ?',
                [requerido, ing.materia_id]
            );

            // Registrar movimiento de salida por producción
            await connection.query(`
                INSERT INTO MovimientosInventario 
                    (materia_id, tipo, cantidad, usuario, referencia_id, observacion)
                VALUES (?, 'PRODUCCION', ?, ?, ?, ?)
            `, [
                ing.materia_id,
                -requerido,  // negativo = salida
                usuario,
                null,  // referencia_id opcional
                `Producción de ${cantProd} ${producto[0].nombre}`
            ]);
        }

        // Registrar producción
        const [result] = await connection.query(`
            INSERT INTO ProduccionDiaria 
                (producto_id, cantidad_producida, observacion)
            VALUES (?, ?, ?)
        `, [producto_id, cantProd, observacion?.trim() || null]);

        await connection.commit();

        res.status(201).json({
            message: 'Producción registrada exitosamente',
            produccion_id: result.insertId,
            producto: producto[0].nombre,
            cantidad_producida: cantProd,
            insumos_descontados: receta.length,
            fecha: new Date().toISOString().split('T')[0]
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error registrando producción:', error);
        res.status(500).json({ 
            message: 'Error al registrar producción',
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

/* ==================== ANULAR PRODUCCIÓN (revierte insumos - solo del día actual) ==================== */
export const anularProduccion = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();
    const id = parseInt(req.params.id);

    try {
        await connection.beginTransaction();

        const [prod] = await connection.query(`
            SELECT pd.*, p.nombre AS producto_nombre
            FROM ProduccionDiaria pd
            JOIN Productos p ON pd.producto_id = p.producto_id
            WHERE pd.produccion_id = ?
        `, [id]);

        if (prod.length === 0) {
            return res.status(404).json({ message: 'Producción no encontrada' });
        }

        const produccion = prod[0];

        // Solo permitir anular si es del día actual
        const hoy = new Date().toISOString().split('T')[0];
        if (produccion.fecha.toISOString().split('T')[0] !== hoy) {
            return res.status(403).json({ 
                message: 'Solo se pueden anular producciones del día actual' 
            });
        }

        // Obtener insumos usados
        const [insumos] = await connection.query(`
            SELECT rd.materia_id, rd.cantidad * (pd.cantidad_producida / r.porciones_salida) AS cantidad_usada
            FROM RecetaDetalle rd
            JOIN Recetas r ON rd.receta_id = r.receta_id
            JOIN ProduccionDiaria pd ON r.producto_id = pd.producto_id
            WHERE pd.produccion_id = ?
        `, [id]);

        // Revertir stock
        for (const ing of insumos) {
            await connection.query(
                'UPDATE MateriasPrimas SET stock_actual = stock_actual + ? WHERE materia_id = ?',
                [ing.cantidad_usada, ing.materia_id]
            );

            await connection.query(`
                INSERT INTO MovimientosInventario 
                    (materia_id, tipo, cantidad, usuario, observacion)
                VALUES (?, 'AJUSTE', ?, 'Sistema', ?)
            `, [ing.materia_id, ing.cantidad_usada, `Anulación de producción #${id}`]);
        }

        // Eliminar producción
        await connection.query('DELETE FROM ProduccionDiaria WHERE produccion_id = ?', [id]);

        await connection.commit();

        res.json({ 
            message: 'Producción anulada y stock revertido correctamente',
            producto: produccion.producto_nombre,
            cantidad_anulada: produccion.cantidad_producida
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error anulando producción:', error);
        res.status(500).json({ message: 'Error al anular producción' });
    } finally {
        connection.release();
    }
};