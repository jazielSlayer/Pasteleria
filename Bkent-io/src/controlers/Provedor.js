import { connect } from '../database';

export const getProveedores = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                proveedor_id,
                nombre,
                nit,
                telefono,
                direccion,
                contacto,
                plazo_pago_dias,
                activo
            FROM Proveedores
            WHERE activo = 1
            ORDER BY nombre ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching proveedores:', error);
        res.status(500).json({ message: 'Error al obtener proveedores' });
    } finally {
        // Esto es OPCIONAL pero recomendado: liberar conexión
        // pool.end(); // No lo hagas aquí si usas pool global
    }
};

export const getProveedor = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                proveedor_id,
                nombre,
                nit,
                telefono,
                direccion,
                contacto,
                plazo_pago_dias,
                activo
            FROM Proveedores
            WHERE proveedor_id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching proveedor:', error);
        res.status(500).json({ message: 'Error al obtener proveedor' });
    }
};

export const createProveedor = async (req, res) => {
    const pool = await connect();
    const {
        nombre,
        nit = null,
        telefono = null,
        direccion = null,
        contacto = null,
        plazo_pago_dias = 30
    } = req.body;

    try {
        if (!nombre || nombre.trim().length < 3) {
            return res.status(400).json({ message: 'El nombre es obligatorio (mín. 3 caracteres)' });
        }

        const [result] = await pool.query(`
            INSERT INTO Proveedores 
                (nombre, nit, telefono, direccion, contacto, plazo_pago_dias, activo)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [nombre.trim(), nit?.trim() || null, telefono?.trim() || null, 
            direccion?.trim() || null, contacto?.trim() || null, parseInt(plazo_pago_dias)]);

        res.status(201).json({
            message: 'Proveedor creado exitosamente',
            proveedor_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating proveedor:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe un proveedor con ese NIT' });
        }
        res.status(500).json({ message: 'Error al crear proveedor' });
    }
};

export const updateProveedor = async (req, res) => {
    const pool = await connect();
    const id = req.params.id;
    const updates = req.body;

    try {
        const fields = [];
        const values = [];

        if (updates.nombre !== undefined) { fields.push('nombre = ?'); values.push(updates.nombre.trim()); }
        if (updates.nit !== undefined) { fields.push('nit = ?'); values.push(updates.nit?.trim() || null); }
        if (updates.telefono !== undefined) { fields.push('telefono = ?'); values.push(updates.telefono?.trim() || null); }
        if (updates.direccion !== undefined) { fields.push('direccion = ?'); values.push(updates.direccion?.trim() || null); }
        if (updates.contacto !== undefined) { fields.push('contacto = ?'); values.push(updates.contacto?.trim() || null); }
        if (updates.plazo_pago_dias !== undefined) { fields.push('plazo_pago_dias = ?'); values.push(parseInt(updates.plazo_pago_dias)); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
        }

        values.push(id);

        await pool.query(
            `UPDATE Proveedores SET ${fields.join(', ')} WHERE proveedor_id = ?`,
            values
        );

        res.json({ message: 'Proveedor actualizado correctamente' });

    } catch (error) {
        console.error('Error updating proveedor:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe otro proveedor con ese NIT' });
        }
        res.status(500).json({ message: 'Error al actualizar proveedor' });
    }
};

export const deleteProveedor = async (req, res) => {
    const pool = await connect();
    const id = req.params.id;

    try {
        const [result] = await pool.query(
            'UPDATE Proveedores SET activo = 0 WHERE proveedor_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        res.json({ message: 'Proveedor desactivado correctamente' });

    } catch (error) {
        console.error('Error desactivando proveedor:', error);
        res.status(500).json({ message: 'Error al desactivar proveedor' });
    }
};