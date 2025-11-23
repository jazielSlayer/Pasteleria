import { connect } from '../database';

/* ==================== LISTAR TODOS LOS CLIENTES ==================== */
export const getClientes = async (req, res) => {
    const pool = await connect();
    const { search, activo = 1 } = req.query;

    try {
        let query = `
            SELECT 
                cliente_id,
                ci,
                nombres,
                apellidos,
                telefono,
                email,
                direccion,
                fecha_nacimiento,
                es_frecuente,
                puntos_acumulados,
                fecha_registro,
                activo
            FROM Clientes
            WHERE activo = ?
        `;
        const values = [activo === '0' ? 0 : 1];

        if (search) {
            query += ` AND (
                nombres LIKE ? OR 
                apellidos LIKE ? OR 
                ci LIKE ? OR 
                telefono LIKE ? OR
                CONCAT(nombres, ' ', apellidos) LIKE ?
            )`;
            const likeTerm = `%${search.trim()}%`;
            values.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
        }

        query += ` ORDER BY apellidos, nombres`;

        const [rows] = await pool.query(query, values);
        res.json(rows);

    } catch (error) {
        console.error('Error fetching clientes:', error);
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

/* ==================== OBTENER UN CLIENTE POR ID ==================== */
export const getCliente = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                cliente_id,
                ci,
                nombres,
                apellidos,
                telefono,
                email,
                direccion,
                fecha_nacimiento,
                es_frecuente,
                puntos_acumulados,
                fecha_registro,
                activo
            FROM Clientes
            WHERE cliente_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching cliente:', error);
        res.status(500).json({ message: 'Error al obtener cliente' });
    }
};

/* ==================== BUSCAR CLIENTE POR CI O TELÉFONO (ideal para caja) ==================== */
export const buscarCliente = async (req, res) => {
    const pool = await connect();
    const { ci, telefono } = req.query;

    if (!ci && !telefono) {
        return res.status(400).json({ message: 'Debe proporcionar ci o telefono' });
    }

    try {
        let query = `SELECT cliente_id, ci, nombres, apellidos, telefono, es_frecuente, puntos_acumulados FROM Clientes WHERE activo = 1`;
        const values = [];

        if (ci) {
            query += ' AND ci = ?';
            values.push(ci.trim());
        }
        if (telefono) {
            query += ' AND telefono = ?';
            values.push(telefono.trim());
        }

        const [rows] = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ 
                message: 'Cliente no encontrado',
                sugerir_crear: true 
            });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error buscando cliente:', error);
        res.status(500).json({ message: 'Error al buscar cliente' });
    }
};

/* ==================== CREAR NUEVO CLIENTE ==================== */
export const createCliente = async (req, res) => {
    const pool = await connect();
    const {
        ci,
        nombres,
        apellidos,
        telefono,
        email,
        direccion,
        fecha_nacimiento,
        es_frecuente = 0
    } = req.body;

    try {
        // Validaciones
        if (!nombres || !apellidos) {
            return res.status(400).json({ message: 'Nombres y apellidos son obligatorios' });
        }

        if (nombres.trim().length < 2 || apellidos.trim().length < 2) {
            return res.status(400).json({ message: 'Nombres y apellidos deben tener al menos 2 caracteres' });
        }

        if (ci) {
            if (!/^\d{5,15}$/.test(ci.replace(/\D/g, ''))) {
                return res.status(400).json({ message: 'CI inválido (solo números, 5-15 dígitos)' });
            }
            const [ciExists] = await pool.query('SELECT cliente_id FROM Clientes WHERE ci = ?', [ci.trim()]);
            if (ciExists.length > 0) {
                return res.status(409).json({ message: 'Ya existe un cliente con este CI' });
            }
        }

        if (telefono && !/^[\d\s\-\+\(\)]{7,15}$/.test(telefono)) {
            return res.status(400).json({ message: 'Teléfono inválido' });
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Email inválido' });
        }

        if (fecha_nacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)) {
            return res.status(400).json({ message: 'Formato de fecha inválido (YYYY-MM-DD)' });
        }

        const [result] = await pool.query(`
            INSERT INTO Clientes 
                (ci, nombres, apellidos, telefono, email, direccion, fecha_nacimiento, es_frecuente, puntos_acumulados)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        `, [
            ci?.trim() || null,
            nombres.trim(),
            apellidos.trim(),
            telefono?.trim() || null,
            email?.trim() || null,
            direccion?.trim() || null,
            fecha_nacimiento || null,
            es_frecuente ? 1 : 0
        ]);

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            cliente_id: result.insertId,
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            es_frecuente: es_frecuente ? true : false
        });

    } catch (error) {
        console.error('Error creating cliente:', error);
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('ci')) {
            return res.status(409).json({ message: 'Ya existe un cliente con este CI' });
        }
        res.status(500).json({ message: 'Error al crear cliente' });
    }
};

/* ==================== ACTUALIZAR CLIENTE ==================== */
export const updateCliente = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    const {
        ci,
        nombres,
        apellidos,
        telefono,
        email,
        direccion,
        fecha_nacimiento,
        es_frecuente,
        activo
    } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [exists] = await pool.query('SELECT cliente_id FROM Clientes WHERE cliente_id = ?', [id]);
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const fields = [];
        const values = [];

        if (nombres !== undefined) { fields.push('nombres = ?'); values.push(nombres.trim()); }
        if (apellidos !== undefined) { fields.push('apellidos = ?'); values.push(apellidos.trim()); }
        if (ci !== undefined) {
            if (ci && !/^\d{5,15}$/.test(ci.replace(/\D/g, ''))) {
                return res.status(400).json({ message: 'CI inválido' });
            }
            const [ciCheck] = await pool.query('SELECT cliente_id FROM Clientes WHERE ci = ? AND cliente_id != ?', [ci, id]);
            if (ciCheck.length > 0) {
                return res.status(409).json({ message: 'Ya existe otro cliente con este CI' });
            }
            fields.push('ci = ?'); values.push(ci?.trim() || null);
        }
        if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono?.trim() || null); }
        if (email !== undefined) { fields.push('email = ?'); values.push(email?.trim() || null); }
        if (direccion !== undefined) { fields.push('direccion = ?'); values.push(direccion?.trim() || null); }
        if (fecha_nacimiento !== undefined) { fields.push('fecha_nacimiento = ?'); values.push(fecha_nacimiento || null); }
        if (es_frecuente !== undefined) { fields.push('es_frecuente = ?'); values.push(es_frecuente ? 1 : 0); }
        if (activo !== undefined) { fields.push('activo = ?'); values.push(activo ? 1 : 0); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
        }

        values.push(id);
        await pool.query(`UPDATE Clientes SET ${fields.join(', ')} WHERE cliente_id = ?`, values);

        res.json({ message: 'Cliente actualizado correctamente' });

    } catch (error) {
        console.error('Error updating cliente:', error);
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

/* ==================== ELIMINAR / DESACTIVAR CLIENTE ==================== */
export const deleteCliente = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        // Verificar si tiene ventas
        const [ventas] = await pool.query('SELECT COUNT(*) AS total FROM Ventas WHERE cliente_id = ?', [id]);
        if (ventas[0].total > 0) {
            // Solo desactivar
            await pool.query('UPDATE Clientes SET activo = 0 WHERE cliente_id = ?', [id]);
            return res.json({ message: 'Cliente desactivado (tiene ventas asociadas)' });
        }

        // Si no tiene ventas, borrar físicamente
        const [result] = await pool.query('DELETE FROM Clientes WHERE cliente_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente eliminado permanentemente' });

    } catch (error) {
        console.error('Error deleting cliente:', error);
        res.status(500).json({ message: 'Error al procesar cliente' });
    }
};