import { connect } from '../database';

/* ==================== LISTAR PROMOCIONES ACTIVAS ==================== */
export const getPromociones = async (req, res) => {
    const pool = await connect();
    const { activa = 1, fecha } = req.query;
    const hoy = fecha || new Date().toISOString().split('T')[0];

    try {
        const [rows] = await pool.query(`
            SELECT 
                p.promocion_id,
                p.nombre,
                p.descripcion,
                p.tipo_promocion,
                p.descuento_porcentaje,
                p.descuento_fijo_bs,
                p.cantidad_requerida,
                p.cantidad_gratis,
                p.producto_id,
                pr.codigo AS producto_codigo,
                pr.nombre AS producto_nombre,
                p.fecha_inicio,
                p.fecha_fin,
                p.activa,
                CASE 
                    WHEN ? BETWEEN p.fecha_inicio AND p.fecha_fin AND p.activa = 1 THEN 1
                    ELSE 0 
                END AS vigente_hoy
            FROM Promociones p
            LEFT JOIN Productos pr ON p.producto_id = pr.producto_id
            WHERE p.activa = ?
            ORDER BY p.fecha_inicio DESC, p.nombre
        `, [hoy, activa === '0' ? 0 : 1]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching promociones:', error);
        res.status(500).json({ message: 'Error al obtener promociones' });
    }
};

/* ==================== OBTENER UNA PROMOCIÓN POR ID ==================== */
export const getPromocion = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                p.*,
                pr.codigo AS producto_codigo,
                pr.nombre AS producto_nombre,
                pr.precio_venta
            FROM Promociones p
            LEFT JOIN Productos pr ON p.producto_id = pr.producto_id
            WHERE p.promocion_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        const promo = rows[0];
        const hoy = new Date().toISOString().split('T')[0];
        const vigente = hoy >= promo.fecha_inicio && hoy <= promo.fecha_fin && promo.activa;

        res.json({
            ...promo,
            vigente_hoy: vigente
        });
    } catch (error) {
        console.error('Error fetching promoción:', error);
        res.status(500).json({ message: 'Error al obtener promoción' });
    }
};

/* ==================== CREAR NUEVA PROMOCIÓN ==================== */
export const createPromocion = async (req, res) => {
    const pool = await connect();
    const {
        nombre,
        descripcion = null,
        tipo_promocion,           // 'PORCENTAJE', 'FIJO', '2X1', 'GRATIS'
        descuento_porcentaje = null,
        descuento_fijo_bs = null,
        cantidad_requerida = 1,
        cantidad_gratis = 0,
        producto_id = null,
        fecha_inicio,
        fecha_fin,
        activa = 1
    } = req.body;

    try {
        // Validaciones
        if (!nombre || !tipo_promocion || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ message: 'Nombre, tipo, fecha_inicio y fecha_fin son obligatorios' });
        }

        const tiposValidos = ['PORCENTAJE', 'FIJO', '2X1', '3X2', 'GRATIS'];
        if (!tiposValidos.includes(tipo_promocion.toUpperCase())) {
            return res.status(400).json({ 
                message: `Tipo inválido. Use: ${tiposValidos.join(', ')}` 
            });
        }

        const tipo = tipo_promocion.toUpperCase();

        if (tipo === 'PORCENTAJE' && (!descuento_porcentaje || descuento_porcentaje <= 0 || descuento_porcentaje > 100)) {
            return res.status(400).json({ message: 'Descuento porcentaje debe estar entre 1 y 100' });
        }

        if (tipo === 'FIJO' && (!descuento_fijo_bs || descuento_fijo_bs <= 0)) {
            return res.status(400).json({ message: 'Descuento fijo debe ser mayor a 0' });
        }

        if (['2X1', '3X2'].includes(tipo)) {
            if (!producto_id) {
                return res.status(400).json({ message: 'producto_id es obligatorio para 2x1 o 3x2' });
            }
        }

        if (tipo === 'GRATIS' && (!cantidad_requerida || !cantidad_gratis || cantidad_gratis >= cantidad_requerida)) {
            return res.status(400).json({ message: 'Para GRATIS: cantidad_requerida > cantidad_gratis' });
        }

        if (producto_id) {
            const [prod] = await pool.query('SELECT producto_id FROM Productos WHERE producto_id = ? AND activo = 1', [producto_id]);
            if (prod.length === 0) {
                return res.status(400).json({ message: 'Producto no encontrado o inactivo' });
            }
        }

        if (new Date(fecha_inicio) > new Date(fecha_fin)) {
            return res.status(400).json({ message: 'fecha_inicio no puede ser mayor a fecha_fin' });
        }

        const [result] = await pool.query(`
            INSERT INTO Promociones 
                (nombre, descripcion, tipo_promocion, descuento_porcentaje, descuento_fijo_bs, 
                 cantidad_requerida, cantidad_gratis, producto_id, fecha_inicio, fecha_fin, activa)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nombre.trim(),
            descripcion?.trim() || null,
            tipo,
            descuento_porcentaje ? parseFloat(descuento_porcentaje) : null,
            descuento_fijo_bs ? parseFloat(descuento_fijo_bs) : null,
            parseInt(cantidad_requerida) || 1,
            parseInt(cantidad_gratis) || 0,
            producto_id ? parseInt(producto_id) : null,
            fecha_inicio,
            fecha_fin,
            activa ? 1 : 0
        ]);

        res.status(201).json({
            message: 'Promoción creada exitosamente',
            promocion_id: result.insertId,
            nombre: nombre.trim(),
            tipo_promocion: tipo,
            vigente_desde: fecha_inicio,
            vigente_hasta: fecha_fin
        });

    } catch (error) {
        console.error('Error creating promoción:', error);
        res.status(500).json({ message: 'Error al crear promoción' });
    }
};

/* ==================== ACTUALIZAR PROMOCIÓN ==================== */
export const updatePromocion = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    const campos = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [exists] = await pool.query('SELECT promocion_id FROM Promociones WHERE promocion_id = ?', [id]);
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        const fields = [];
        const values = [];

        if (campos.nombre !== undefined) { fields.push('nombre = ?'); values.push(campos.nombre.trim()); }
        if (campos.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(campos.descripcion?.trim() || null); }
        if (campos.tipo_promocion !== undefined) { fields.push('tipo_promocion = ?'); values.push(campos.tipo_promocion.toUpperCase()); }
        if (campos.descuento_porcentaje !== undefined) { fields.push('descuento_porcentaje = ?'); values.push(campos.descuento_porcentaje ? parseFloat(campos.descuento_porcentaje) : null); }
        if (campos.descuento_fijo_bs !== undefined) { fields.push('descuento_fijo_bs = ?'); values.push(campos.descuento_fijo_bs ? parseFloat(campos.descuento_fijo_bs) : null); }
        if (campos.cantidad_requerida !== undefined) { fields.push('cantidad_requerida = ?'); values.push(parseInt(campos.cantidad_requerida)); }
        if (campos.cantidad_gratis !== undefined) { fields.push('cantidad_gratis = ?'); values.push(parseInt(campos.cantidad_gratis)); }
        if (campos.producto_id !== undefined) { fields.push('producto_id = ?'); values.push(campos.producto_id ? parseInt(campos.producto_id) : null); }
        if (campos.fecha_inicio !== undefined) { fields.push('fecha_inicio = ?'); values.push(campos.fecha_inicio); }
        if (campos.fecha_fin !== undefined) { fields.push('fecha_fin = ?'); values.push(campos.fecha_fin); }
        if (campos.activa !== undefined) { fields.push('activa = ?'); values.push(campos.activa ? 1 : 0); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
        }

        values.push(id);
        await pool.query(`UPDATE Promociones SET ${fields.join(', ')} WHERE promocion_id = ?`, values);

        res.json({ message: 'Promoción actualizada correctamente' });

    } catch (error) {
        console.error('Error updating promoción:', error);
        res.status(500).json({ message: 'Error al actualizar promoción' });
    }
};

/* ==================== ELIMINAR / DESACTIVAR PROMOCIÓN ==================== */
export const deletePromocion = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [promo] = await pool.query('SELECT activa FROM Promociones WHERE promocion_id = ?', [id]);
        if (promo.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        // Solo desactivar (mejor práctica)
        await pool.query('UPDATE Promociones SET activa = 0 WHERE promocion_id = ?', [id]);

        res.json({ 
            message: 'Promoción desactivada correctamente (recomendado en lugar de eliminar)' 
        });

    } catch (error) {
        console.error('Error desactivando promoción:', error);
        res.status(500).json({ message: 'Error al procesar promoción' });
    }
};