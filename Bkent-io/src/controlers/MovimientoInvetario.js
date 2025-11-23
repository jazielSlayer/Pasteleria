import { connect } from '../database';

/* ==================== LISTAR MOVIMIENTOS DE INVENTARIO ==================== */
export const getMovimientos = async (req, res) => {
    const pool = await connect();
    const { 
        tipo, 
        materia_id, 
        fecha_desde, 
        fecha_hasta, 
        limit = 100 
    } = req.query;

    try {
        let query = `
            SELECT 
                mi.movimiento_id,
                mi.materia_id,
                mp.codigo,
                mp.nombre AS materia_nombre,
                mp.unidad,
                mi.tipo,
                mi.cantidad,
                mi.fecha,
                mi.usuario,
                mi.referencia_id,
                mi.observacion,
                ROUND(mi.cantidad * mp.costo_promedio, 4) AS costo_total_bs
            FROM MovimientosInventario mi
            JOIN MateriasPrimas mp ON mi.materia_id = mp.materia_id
        `;
        const conditions = [];
        const values = [];

        if (tipo) {
            conditions.push('mi.tipo = ?');
            values.push(tipo.toUpperCase());
        }
        if (materia_id) {
            conditions.push('mi.materia_id = ?');
            values.push(materia_id);
        }
        if (fecha_desde) {
            conditions.push('DATE(mi.fecha) >= ?');
            values.push(fecha_desde);
        }
        if (fecha_hasta) {
            conditions.push('DATE(mi.fecha) <= ?');
            values.push(fecha_hasta);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY mi.fecha DESC, mi.movimiento_id DESC';
        if (limit) query += ' LIMIT ?';
        values.push(parseInt(limit));

        const [rows] = await pool.query(query, values);
        res.json(rows);

    } catch (error) {
        console.error('Error fetching movimientos:', error);
        res.status(500).json({ message: 'Error al obtener movimientos de inventario' });
    }
};

/* ==================== OBTENER UN MOVIMIENTO POR ID ==================== */
export const getMovimiento = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                mi.*,
                mp.codigo,
                mp.nombre AS materia_nombre,
                mp.unidad,
                ROUND(mi.cantidad * mp.costo_promedio, 4) AS costo_total_bs
            FROM MovimientosInventario mi
            JOIN MateriasPrimas mp ON mi.materia_id = mp.materia_id
            WHERE mi.movimiento_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching movimiento:', error);
        res.status(500).json({ message: 'Error al obtener movimiento' });
    }
};

/* ==================== REGISTRAR MERMA O AJUSTE MANUAL (únicos permitidos manualmente) ==================== */
export const createMovimientoManual = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();

    const {
        materia_id,
        tipo,           // Solo 'MERMA' o 'AJUSTE'
        cantidad,       // Positivo = entrada, Negativo = salida
        usuario,        // Nombre del usuario que realiza el ajuste
        observacion = null
    } = req.body;

    try {
        await connection.beginTransaction();

        // Validaciones
        if (!materia_id || !tipo || !cantidad || !usuario) {
            return res.status(400).json({ message: 'Faltan campos: materia_id, tipo, cantidad y usuario son obligatorios' });
        }

        const tipoUpper = tipo.toUpperCase();
        if (!['MERMA', 'AJUSTE'].includes(tipoUpper)) {
            return res.status(400).json({ 
                message: 'Tipo inválido. Solo se permite MERMA o AJUSTE para registro manual' 
            });
        }

        if (isNaN(cantidad) || cantidad === 0) {
            return res.status(400).json({ message: 'Cantidad debe ser diferente de cero' });
        }

        const [materia] = await connection.query('SELECT materia_id, nombre, stock_actual FROM MateriasPrimas WHERE materia_id = ?', [materia_id]);
        if (materia.length === 0) {
            return res.status(400).json({ message: 'Materia prima no encontrada' });
        }

        const cantidadAbs = Math.abs(parseFloat(cantidad));
        const esSalida = cantidad < 0 || tipoUpper === 'MERMA';

        // Si es salida, verificar stock suficiente
        if (esSalida && materia[0].stock_actual < cantidadAbs) {
            return res.status(400).json({ 
                message: `Stock insuficiente. Disponible: ${materia[0].stock_actual} ${materia[0].nombre}` 
            });
        }

        // Actualizar stock
        const nuevoStock = esSalida 
            ? materia[0].stock_actual - cantidadAbs 
            : materia[0].stock_actual + cantidadAbs;

        await connection.query(
            'UPDATE MateriasPrimas SET stock_actual = ? WHERE materia_id = ?',
            [nuevoStock, materia_id]
        );

        // Registrar movimiento
        const [result] = await connection.query(`
            INSERT INTO MovimientosInventario 
                (materia_id, tipo, cantidad, usuario, observacion)
            VALUES (?, ?, ?, ?, ?)
        `, [
            materia_id,
            tipoUpper,
            parseFloat(cantidad), // Guarda con signo: negativo = salida
            usuario.trim(),
            observacion?.trim() || null
        ]);

        await connection.commit();

        res.status(201).json({
            message: tipoUpper === 'MERMA' ? 'Merma registrada correctamente' : 'Ajuste de inventario registrado',
            movimiento_id: result.insertId,
            materia: materia[0].nombre,
            tipo: tipoUpper,
            cantidad: parseFloat(cantidad),
            stock_actual: nuevoStock
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error creando movimiento manual:', error);
        res.status(500).json({ message: 'Error al registrar movimiento' });
    } finally {
        connection.release();
    }
};

/* ==================== NO PERMITIR CREAR MANUALMENTE COMPRA/PRODUCCION (se hace desde sus módulos) ==================== */
export const createMovimiento = async (req, res) => {
    res.status(403).json({ 
        message: 'No permitido: Los movimientos de COMPRA, PRODUCCION y DEVOLUCION se registran automáticamente desde sus módulos respectivos. Usa /movimientos/manual para mermas o ajustes.' 
    });
};

/* ==================== ELIMINAR MOVIMIENTO (solo AJUSTE o MERMA recientes, con revertir stock) ==================== */
export const deleteMovimiento = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();
    const id = parseInt(req.params.id);

    try {
        await connection.beginTransaction();

        const [mov] = await connection.query(`
            SELECT mi.*, mp.stock_actual 
            FROM MovimientosInventario mi
            JOIN MateriasPrimas mp ON mi.materia_id = mp.materia_id
            WHERE mi.movimiento_id = ?
        `, [id]);

        if (mov.length === 0) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }

        const movimiento = mov[0];

        // Solo permitir eliminar MERMA o AJUSTE, y que no sea muy antiguo
        if (!['MERMA', 'AJUSTE'].includes(movimiento.tipo)) {
            return res.status(403).json({ 
                message: 'Solo se pueden eliminar movimientos de tipo MERMA o AJUSTE' 
            });
        }

        const horasTranscurridas = (new Date() - new Date(movimiento.fecha)) / (1000 * 60 * 60);
        if (horasTranscurridas > 24) {
            return res.status(403).json({ 
                message: 'No se puede eliminar: han pasado más de 24 horas' 
            });
        }

        // Revertir stock
        const stockRevertido = movimiento.cantidad < 0 
            ? movimiento.stock_actual - movimiento.cantidad  // era salida → sumar
            : movimiento.stock_actual - movimiento.cantidad; // era entrada → restar

        await connection.query(
            'UPDATE MateriasPrimas SET stock_actual = ? WHERE materia_id = ?',
            [stockRevertido, movimiento.materia_id]
        );

        // Eliminar movimiento
        await connection.query('DELETE FROM MovimientosInventario WHERE movimiento_id = ?', [id]);

        await connection.commit();

        res.json({ 
            message: 'Movimiento eliminado y stock revertido correctamente',
            stock_actual_nuevo: stockRevertido
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error eliminando movimiento:', error);
        res.status(500).json({ message: 'Error al eliminar movimiento' });
    } finally {
        connection.release();
    }
};