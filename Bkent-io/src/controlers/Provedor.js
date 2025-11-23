import { connect } from '../database';

/* ==================== OBTENER TODOS LOS PROVEEDORES ==================== */
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
                activo,
                created_at,
                updated_at
            FROM Proveedores
            WHERE activo = 1
            ORDER BY nombre ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching proveedores:', error);
        res.status(500).json({ message: 'Error al obtener proveedores' });
    }
};

/* ==================== OBTENER UN PROVEEDOR POR ID ==================== */
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

/* ==================== CREAR NUEVO PROVEEDOR ==================== */
export const createProveedor = async (req, res) => {
    const pool = await connect();
    const {
        nombre,
        nit,
        telefono,
        direccion,
        contacto,
        plazo_pago_dias = 30,
        activo = 1
    } = req.body;

    try {
        // Validaciones básicas
        if (!nombre || nombre.trim().length < 3) {
            return res.status(400).json({ message: 'El nombre del proveedor es obligatorio y debe tener al menos 3 caracteres' });
        }

        if (nit && !/^\d{4,20}$/.test(nit.replace(/[^0-9]/g, ''))) {
            return res.status(400).json({ message: 'NIT inválido (solo números, mínimo 4 dígitos)' });
        }

        if (telefono && !/^[\d\s\-\+\(\)]{8,15}$/.test(telefono)) {
            return res.status(400).json({ message: 'Teléfono inválido' });
        }

        if (plazo_pago_dias && (isNaN(plazo_pago_dias) || plazo_pago_dias < 0 || plazo_pago_dias > 365)) {
            return res.status(400).json({ message: 'Plazo de pago debe estar entre 0 y 365 días' });
        }

        const [result] = await pool.query(`
            INSERT INTO Proveedores 
                (nombre, nit, telefono, direccion, contacto, plazo_pago_dias, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            nombre.trim(),
            nit?.trim() || null,
            telefono?.trim() || null,
            direccion?.trim() || null,
            contacto?.trim() || null,
            parseInt(plazo_pago_dias),
            activo ? 1 : 0
        ]);

        res.status(201).json({
            message: 'Proveedor creado exitosamente',
            proveedor_id: result.insertId,
            nombre: nombre.trim()
        });

    } catch (error) {
        console.error('Error creating proveedor:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe un proveedor con ese NIT o datos duplicados' });
        }
        res.status(500).json({ message: 'Error al crear proveedor' });
    }
};

/* ==================== ACTUALIZAR PROVEEDOR ==================== */
export const updateProveedor = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    const {
        nombre,
        nit,
        telefono,
        direccion,
        contacto,
        plazo_pago_dias,
        activo
    } = req.body;

    try {
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ message: 'ID de proveedor inválido' });
        }

        // Verificar que existe
        const [exists] = await pool.query('SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ?', [id]);
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        // Validaciones si se envían campos
        if (nombre !== undefined && nombre.trim().length < 3) {
            return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres' });
        }

        if (nit !== undefined && nit && !/^\d{4,20}$/.test(nit.replace(/[^0-9]/g, ''))) {
            return res.status(400).json({ message: 'NIT inválido' });
        }

        if (telefono !== undefined && telefono && !/^[\d\s\-\+\(\)]{8,15}$/.test(telefono)) {
            return res.status(400).json({ message: 'Teléfono inválido' });
        }

        const fields = [];
        const values = [];

        if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre.trim()); }
        if (nit !== undefined) { fields.push('nit = ?'); values.push(nit?.trim() || null); }
        if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono?.trim() || null); }
        if (direccion !== undefined) { fields.push('direccion = ?'); values.push(direccion?.trim() || null); }
        if (contacto !== undefined) { fields.push('contacto = ?'); values.push(contacto?.trim() || null); }
        if (plazo_pago_dias !== undefined) { fields.push('plazo_pago_dias = ?'); values.push(parseInt(plazo_pago_dias)); }
        if (activo !== undefined) { fields.push('activo = ?'); values.push(activo ? 1 : 0); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
        }

        await pool.query(
            `UPDATE Proveedores SET ${fields.join(', ')} WHERE proveedor_id = ?`,
            [...values, id]
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

/* ==================== ELIMINAR (O DESACTIVAR) PROVEEDOR ==================== */
// Recomiendo desactivar en lugar de borrar físicamente (por integridad referencial)
export const deleteProveedor = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    try {
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        // Opción segura: desactivar en lugar de borrar
        const [result] = await pool.query(
            'UPDATE Proveedores SET activo = 0 WHERE proveedor_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        res.json({ message: 'Proveedor desactivado correctamente' });

        // Si realmente quieres borrado físico (cuidado con FK):
        // const [result] = await pool.query('DELETE FROM Proveedores WHERE proveedor_id = ?', [id]);
        // if (result.affectedRows === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });

    } catch (error) {
        console.error('Error deleting proveedor:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                message: 'No se puede eliminar: el proveedor tiene compras asociadas. Desactívalo en su lugar.' 
            });
        }
        res.status(500).json({ message: 'Error al eliminar proveedor' });
    }
};