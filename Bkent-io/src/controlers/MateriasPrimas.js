import { connect } from '../database';

/* ==================== OBTENER TODAS LAS MATERIAS PRIMAS ==================== */
export const getMateriasPrimas = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                mp.materia_id,
                mp.codigo,
                mp.nombre,
                mp.unidad,
                mp.stock_minimo,
                mp.stock_actual,
                mp.costo_promedio,
                mp.proveedor_preferido_id,
                p.nombre AS proveedor_preferido_nombre
            FROM MateriasPrimas mp
            LEFT JOIN Proveedores p ON mp.proveedor_preferido_id = p.proveedor_id AND p.activo = 1
            ORDER BY mp.nombre ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching materias primas:', error);
        res.status(500).json({ message: 'Error al obtener materias primas' });
    }
};

/* ==================== OBTENER UNA MATERIA PRIMA POR ID ==================== */
export const getMateriaPrima = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                mp.*,
                p.nombre AS proveedor_preferido_nombre
            FROM MateriasPrimas mp
            LEFT JOIN Proveedores p ON mp.proveedor_preferido_id = p.proveedor_id AND p.activo = 1
            WHERE mp.materia_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Materia prima no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching materia prima:', error);
        res.status(500).json({ message: 'Error al obtener materia prima' });
    }
};

/* ==================== BUSCAR MATERIA PRIMA POR CÓDIGO (útil en compras) ==================== */
export const getMateriaPrimaByCodigo = async (req, res) => {
    const pool = await connect();
    const { codigo } = req.query;

    if (!codigo || codigo.trim() === '') {
        return res.status(400).json({ message: 'El parámetro "codigo" es requerido' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                mp.*,
                p.nombre AS proveedor_preferido_nombre
            FROM MateriasPrimas mp
            LEFT JOIN Proveedores p ON mp.proveedor_preferido_id = p.proveedor_id
            WHERE mp.codigo = ?
        `, [codigo.trim().toUpperCase()]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Materia prima no encontrada con ese código' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error buscando por código:', error);
        res.status(500).json({ message: 'Error al buscar materia prima' });
    }
};

/* ==================== CREAR NUEVA MATERIA PRIMA ==================== */
export const createMateriaPrima = async (req, res) => {
    const pool = await connect();
    const {
        codigo,
        nombre,
        unidad,
        stock_minimo = 0,
        stock_actual = 0,
        costo_promedio = 0,
        proveedor_preferido_id = null
    } = req.body;

    try {
        // Validaciones
        if (!codigo || !nombre || !unidad) {
            return res.status(400).json({ message: 'Código, nombre y unidad son obligatorios' });
        }

        if (!/^[A-Z0-9\-_]{3,20}$/.test(codigo.trim())) {
            return res.status(400).json({ message: 'Código inválido (solo mayúsculas, números, guiones y _ , 3-20 caracteres)' });
        }

        if (nombre.trim().length < 3) {
            return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres' });
        }

        const unidadesValidas = ['kg', 'g', 'litro', 'ml', 'unidad', 'docena', 'paquete', 'caja'];
        if (!unidadesValidas.includes(unidad.toLowerCase())) {
            return res.status(400).json({ message: `Unidad no válida. Use: ${unidadesValidas.join(', ')}` });
        }

        if (proveedor_preferido_id) {
            const [prov] = await pool.query('SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ? AND activo = 1', [proveedor_preferido_id]);
            if (prov.length === 0) {
                return res.status(400).json({ message: 'Proveedor preferido no existe o está inactivo' });
            }
        }

        const [result] = await pool.query(`
            INSERT INTO MateriasPrimas 
                (codigo, nombre, unidad, stock_minimo, stock_actual, costo_promedio, proveedor_preferido_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            codigo.trim().toUpperCase(),
            nombre.trim(),
            unidad.toLowerCase(),
            parseFloat(stock_minimo) || 0,
            parseFloat(stock_actual) || 0,
            parseFloat(costo_promedio) || 0,
            proveedor_preferido_id ? parseInt(proveedor_preferido_id) : null
        ]);

        res.status(201).json({
            message: 'Materia prima creada exitosamente',
            materia_id: result.insertId,
            codigo: codigo.trim().toUpperCase(),
            nombre: nombre.trim()
        });

    } catch (error) {
        console.error('Error creating materia prima:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe una materia prima con ese código' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'Proveedor preferido inválido' });
        }
        res.status(500).json({ message: 'Error al crear materia prima' });
    }
};

/* ==================== ACTUALIZAR MATERIA PRIMA ==================== */
export const updateMateriaPrima = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    const {
        codigo,
        nombre,
        unidad,
        stock_minimo,
        stock_actual,
        costo_promedio,
        proveedor_preferido_id
    } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [exists] = await pool.query('SELECT materia_id FROM MateriasPrimas WHERE materia_id = ?', [id]);
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Materia prima no encontrada' });
        }

        const fields = [];
        const values = [];

        if (codigo !== undefined) {
            if (!/^[A-Z0-9\-_]{3,20}$/.test(codigo.trim())) {
                return res.status(400).json({ message: 'Código inválido' });
            }
            fields.push('codigo = ?');
            values.push(codigo.trim().toUpperCase());
        }
        if (nombre !== undefined) {
            if (nombre.trim().length < 3) return res.status(400).json({ message: 'Nombre muy corto' });
            fields.push('nombre = ?');
            values.push(nombre.trim());
        }
        if (unidad !== undefined) {
            const unidadesValidas = ['kg', 'g', 'litro', 'ml', 'unidad', 'docena', 'paquete', 'caja'];
            if (!unidadesValidas.includes(unidad.toLowerCase())) {
                return res.status(400).json({ message: `Unidad no válida` });
            }
            fields.push('unidad = ?');
            values.push(unidad.toLowerCase());
        }
        if (stock_minimo !== undefined) { fields.push('stock_minimo = ?'); values.push(parseFloat(stock_minimo) || 0); }
        if (stock_actual !== undefined) { fields.push('stock_actual = ?'); values.push(parseFloat(stock_actual) || 0); }
        if (costo_promedio !== undefined) { fields.push('costo_promedio = ?'); values.push(parseFloat(costo_promedio) || 0); }
        if (proveedor_preferido_id !== undefined) {
            if (proveedor_preferido_id === null) {
                fields.push('proveedor_preferido_id = NULL');
            } else {
                const [prov] = await pool.query('SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ? AND activo = 1', [proveedor_preferido_id]);
                if (prov.length === 0) return res.status(400).json({ message: 'Proveedor preferido inválido' });
                fields.push('proveedor_preferido_id = ?');
                values.push(parseInt(proveedor_preferido_id));
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
        }

        values.push(id);
        await pool.query(`UPDATE MateriasPrimas SET ${fields.join(', ')} WHERE materia_id = ?`, values);

        res.json({ message: 'Materia prima actualizada correctamente' });

    } catch (error) {
        console.error('Error updating materia prima:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe otra materia prima con ese código' });
        }
        res.status(500).json({ message: 'Error al actualizar materia prima' });
    }
};

/* ==================== ELIMINAR MATERIA PRIMA (solo si no tiene movimientos) ==================== */
export const deleteMateriaPrima = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        // Verificar si tiene movimientos o está en recetas
        const [enUso] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM CompraDetalle WHERE materia_id = ?) AS en_compras,
                (SELECT COUNT(*) FROM RecetaDetalle WHERE materia_id = ?) AS en_recetas,
                (SELECT COUNT(*) FROM MovimientosInventario WHERE materia_id = ?) AS en_movimientos
        `, [id, id, id]);

        const uso = enUso[0];
        if (uso.en_compras > 0 || uso.en_recetas > 0 || uso.en_movimientos > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar: la materia prima tiene compras, recetas o movimientos asociados' 
            });
        }

        const [result] = await pool.query('DELETE FROM MateriasPrimas WHERE materia_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Materia prima no encontrada' });
        }

        res.json({ message: 'Materia prima eliminada correctamente' });

    } catch (error) {
        console.error('Error deleting materia prima:', error);
        res.status(500).json({ message: 'Error al eliminar materia prima' });
    }
};