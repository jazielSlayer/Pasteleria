import { connect } from '../database';

export const getPromociones = async (req, res) => {
    const pool = await connect();
    const { activo = 1 } = req.query;
    const hoy = new Date().toISOString().split('T')[0];

    try {
        const [rows] = await pool.query(`
            SELECT 
                p.promocion_id,
                p.nombre,
                p.tipo,
                p.valor,
                p.producto_id,
                pr.codigo AS producto_codigo,
                pr.nombre AS producto_nombre,
                p.fecha_inicio,
                p.fecha_fin,
                p.minimo_cantidad,
                p.activo,
                CASE 
                    WHEN ? BETWEEN p.fecha_inicio AND p.fecha_fin AND p.activo = 1 THEN 1
                    ELSE 0 
                END AS vigente_hoy
            FROM promociones p
            LEFT JOIN productos pr ON p.producto_id = pr.producto_id
            WHERE p.activo = ?
            ORDER BY p.fecha_inicio DESC, p.nombre
        `, [hoy, activo]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching promociones:', error);
        res.status(500).json({ message: 'Error al obtener promociones' });
    }
};

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
            FROM promociones p
            LEFT JOIN productos pr ON p.producto_id = pr.producto_id
            WHERE p.promocion_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        const promo = rows[0];
        const hoy = new Date().toISOString().split('T')[0];
        const vigente = hoy >= promo.fecha_inicio && hoy <= promo.fecha_fin && promo.activo === 1;

        res.json({
            ...promo,
            vigente_hoy: vigente ? 1 : 0
        });
    } catch (error) {
        console.error('Error fetching promoción:', error);
        res.status(500).json({ message: 'Error al obtener promoción' });
    }
};

export const createPromocion = async (req, res) => {
    const pool = await connect();
    const {
        nombre,
        tipo,                    // '2x1', 'DESCUENTO_%', 'PRODUCTO_GRATIS', 'COMBO'
        valor,                   // % o cantidad gratis
        producto_id = null,
        fecha_inicio,
        fecha_fin,
        minimo_cantidad = 1,
        activo = 1
    } = req.body;

    try {
        // Validaciones básicas
        if (!nombre || !tipo || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ message: 'Nombre, tipo y fechas son obligatorios' });
        }

        const tiposValidos = ['2x1', 'DESCUENTO_%', 'PRODUCTO_GRATIS', 'COMBO'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ message: `Tipo inválido. Use: ${tiposValidos.join(', ')}` });
        }

        if (tipo === 'DESCUENTO_%' && (!valor || valor <= 0 || valor > 100)) {
            return res.status(400).json({ message: 'El valor para DESCUENTO_% debe estar entre 1 y 100' });
        }

        if (tipo === '2x1' && (!producto_id)) {
            return res.status(400).json({ message: 'producto_id es obligatorio para 2x1' });
        }

        if (producto_id) {
            const [prod] = await pool.query('SELECT producto_id FROM productos WHERE producto_id = ? AND activo = 1', [producto_id]);
            if (prod.length === 0) {
                return res.status(400).json({ message: 'Producto no encontrado o inactivo' });
            }
        }

        if (new Date(fecha_inicio) > new Date(fecha_fin)) {
            return res.status(400).json({ message: 'fecha_inicio no puede ser mayor a fecha_fin' });
        }

        const [result] = await pool.query(`
            INSERT INTO promociones 
                (nombre, tipo, valor, producto_id, fecha_inicio, fecha_fin, minimo_cantidad, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nombre.trim(),
            tipo,
            valor ? parseFloat(valor) : null,
            producto_id ? parseInt(producto_id) : null,
            fecha_inicio,
            fecha_fin,
            parseInt(minimo_cantidad) || 1,
            activo ? 1 : 0
        ]);

        res.status(201).json({
            message: 'Promoción creada exitosamente',
            promocion_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating promoción:', error);
        res.status(500).json({ message: 'Error al crear promoción' });
    }
};

export const updatePromocion = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    const campos = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [exists] = await pool.query('SELECT promocion_id FROM promociones WHERE promocion_id = ?', [id]);
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        const fields = [];
        const values = [];

        if (campos.nombre !== undefined) { fields.push('nombre = ?'); values.push(campos.nombre.trim()); }
        if (campos.tipo !== undefined) { fields.push('tipo = ?'); values.push(campos.tipo); }
        if (campos.valor !== undefined) { fields.push('valor = ?'); values.push(campos.valor ? parseFloat(campos.valor) : null); }
        if (campos.producto_id !== undefined) { fields.push('producto_id = ?'); values.push(campos.producto_id ? parseInt(campos.producto_id) : null); }
        if (campos.fecha_inicio !== undefined) { fields.push('fecha_inicio = ?'); values.push(campos.fecha_inicio); }
        if (campos.fecha_fin !== undefined) { fields.push('fecha_fin = ?'); values.push(campos.fecha_fin); }
        if (campos.minimo_cantidad !== undefined) { fields.push('minimo_cantidad = ?'); values.push(parseInt(campos.minimo_cantidad)); }
        if (campos.activo !== undefined) { fields.push('activo = ?'); values.push(campos.activo ? 1 : 0); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
        }

        values.push(id);
        await pool.query(`UPDATE promociones SET ${fields.join(', ')} WHERE promocion_id = ?`, values);

        res.json({ message: 'Promoción actualizada correctamente' });

    } catch (error) {
        console.error('Error updating promoción:', error);
        res.status(500).json({ message: 'Error al actualizar promoción' });
    }
};

export const deletePromocion = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [promo] = await pool.query('SELECT promocion_id FROM promociones WHERE promocion_id = ?', [id]);
        if (promo.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        await pool.query('UPDATE promociones SET activo = 0 WHERE promocion_id = ?', [id]);

        res.json({ message: 'Promoción desactivada correctamente' });

    } catch (error) {
        console.error('Error desactivando promoción:', error);
        res.status(500).json({ message: 'Error al procesar promoción' });
    }
};