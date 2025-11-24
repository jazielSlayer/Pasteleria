// src/controlers/Clientes.js  → Versión 100% funcional con tu BD real
import { connect } from '../database';

export const getClientes = async (req, res) => {
    const pool = await connect();
    const { search, tipo } = req.query;

    try {
        let query = `SELECT cliente_id, nombre, nit_ci, telefono, tipo, descuento_porcentaje FROM clientes WHERE 1=1`;
        const values = [];

        if (search) {
            query += ` AND (nombre LIKE ? OR nit_ci LIKE ? OR telefono LIKE ?)`;
            const term = `%${search.trim()}%`;
            values.push(term, term, term);
        }

        if (tipo && ['MOSTRADOR', 'MAYORISTA', 'EVENTO'].includes(tipo)) {
            query += ` AND tipo = ?`;
            values.push(tipo);
        }

        query += ` ORDER BY nombre`;

        const [rows] = await pool.query(query, values);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching clientes:', error);
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

export const getCliente = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    try {
        const [rows] = await pool.query(`SELECT * FROM clientes WHERE cliente_id = ?`, [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cliente' });
    }
};

export const buscarCliente = async (req, res) => {
    const pool = await connect();
    const { nit_ci, telefono } = req.query;

    if (!nit_ci && !telefono) {
        return res.status(400).json({ message: 'Debe enviar nit_ci o telefono' });
    }

    try {
        let query = `SELECT cliente_id, nombre, nit_ci, telefono, tipo, descuento_porcentaje FROM clientes WHERE 1=1`;
        const values = [];

        if (nit_ci) { query += ` AND nit_ci = ?`; values.push(nit_ci.trim()); }
        if (telefono) { query += ` AND telefono = ?`; values.push(telefono.trim()); }

        const [rows] = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado', sugerir_crear: true });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error buscando cliente' });
    }
};

export const createCliente = async (req, res) => {
    const pool = await connect();
    const { nombre, nit_ci, telefono, tipo = 'MOSTRADOR', descuento_porcentaje = 0 } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ message: 'Nombre es obligatorio y debe tener al menos 3 caracteres' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO clientes (nombre, nit_ci, telefono, tipo, descuento_porcentaje) VALUES (?, ?, ?, ?, ?)`,
            [nombre.trim(), nit_ci?.trim() || null, telefono?.trim() || null, tipo, descuento_porcentaje]
        );

        res.status(201).json({
            message: 'Cliente creado',
            cliente_id: result.insertId,
            nombre: nombre.trim(),
            tipo,
            descuento_porcentaje
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear cliente' });
    }
};

export const updateCliente = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    const { nombre, nit_ci, telefono, tipo, descuento_porcentaje } = req.body;

    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    try {
        const fields = [];
        const values = [];

        if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre.trim()); }
        if (nit_ci !== undefined) { fields.push('nit_ci = ?'); values.push(nit_ci?.trim() || null); }
        if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono?.trim() || null); }
        if (tipo !== undefined) { fields.push('tipo = ?'); values.push(tipo); }
        if (descuento_porcentaje !== undefined) { fields.push('descuento_porcentaje = ?'); values.push(descuento_porcentaje); }

        if (fields.length === 0) return res.status(400).json({ message: 'No hay datos para actualizar' });

        values.push(id);
        await pool.query(`UPDATE clientes SET ${fields.join(', ')} WHERE cliente_id = ?`, values);

        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar' });
    }
};

export const deleteCliente = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    try {
        // Si tiene ventas, solo desactivar (opcional: podrías añadir campo activo)
        const [ventas] = await pool.query('SELECT COUNT(*) as total FROM ventas WHERE cliente_id = ?', [id]);
        if (ventas[0].total > 0) {
            return res.json({ message: 'No se puede eliminar: el cliente tiene ventas asociadas' });
        }

        await pool.query('DELETE FROM clientes WHERE cliente_id = ?', [id]);
        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};