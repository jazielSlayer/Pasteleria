import { connect } from '../database';

/* ==================== LISTAR TODOS LOS PRODUCTOS ==================== */
export const getProductos = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.producto_id,
                p.codigo,
                p.nombre,
                p.categoria,
                p.precio_venta,
                p.es_por_peso,
                p.activo,
                COALESCE(v.costo_unitario, 0) AS costo_unitario,
                COALESCE(v.margen_unitario, p.precio_venta) AS margen_unitario,
                CASE WHEN r.producto_id IS NOT NULL THEN 1 ELSE 0 END AS tiene_receta
            FROM Productos p
            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id
            LEFT JOIN Recetas r ON p.producto_id = r.producto_id
            WHERE p.activo = 1
            ORDER BY p.categoria, p.nombre
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching productos:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

/* ==================== OBTENER UN PRODUCTO POR ID ==================== */
export const getProducto = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                p.*,
                COALESCE(v.costo_unitario, 0) AS costo_unitario,
                COALESCE(v.margen_unitario, p.precio_venta) AS margen_unitario,
                CASE WHEN r.producto_id IS NOT NULL THEN 1 ELSE 0 END AS tiene_receta
            FROM Productos p
            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id
            LEFT JOIN Recetas r ON p.producto_id = r.producto_id
            WHERE p.producto_id = ? AND p.activo = 1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o inactivo' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching producto:', error);
        res.status(500).json({ message: 'Error al obtener producto' });
    }
};

/* ==================== BUSCAR PRODUCTO POR CÓDIGO (ideal para punto de venta) ==================== */
export const getProductoByCodigo = async (req, res) => {
    const pool = await connect();
    const { codigo } = req.query;

    if (!codigo || codigo.trim() === '') {
        return res.status(400).json({ message: 'Parámetro "codigo" requerido' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                producto_id,
                codigo,
                nombre,
                precio_venta,
                es_por_peso
            FROM Productos
            WHERE codigo = ? AND activo = 1
        `, [codigo.trim().toUpperCase()]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado con ese código' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error buscando por código:', error);
        res.status(500).json({ message: 'Error al buscar producto' });
    }
};

/* ==================== CREAR NUEVO PRODUCTO ==================== */
export const createProducto = async (req, res) => {
    const pool = await connect();
    const {
        codigo,
        nombre,
        categoria = 'GENERAL',
        precio_venta,
        es_por_peso = 0
    } = req.body;

    try {
        // Validaciones
        if (!codigo || !nombre || !precio_venta) {
            return res.status(400).json({ message: 'Código, nombre y precio de venta son obligatorios' });
        }

        if (!/^[A-Z0-9\-_]{3,20}$/.test(codigo.trim())) {
            return res.status(400).json({ message: 'Código inválido (máx 20 caracteres, solo letras mayúsculas, números, - y _)' });
        }

        if (nombre.trim().length < 3) {
            return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres' });
        }

        if (isNaN(precio_venta) || parseFloat(precio_venta) <= 0) {
            return res.status(400).json({ message: 'Precio de venta debe ser mayor a 0' });
        }

        const categoriasValidas = ['TORTAS', 'PASTELES', 'PAN DULCE', 'GALLETAS', 'BEBIDAS', 'POSTRES', 'GENERAL'];
        if (categoria && !categoriasValidas.includes(categoria.toUpperCase())) {
            return res.status(400).json({ message: `Categoría inválida. Use: ${categoriasValidas.join(', ')}` });
        }

        const [result] = await pool.query(`
            INSERT INTO Productos 
                (codigo, nombre, categoria, precio_venta, es_por_peso, activo)
            VALUES (?, ?, ?, ?, ?, 1)
        `, [
            codigo.trim().toUpperCase(),
            nombre.trim(),
            categoria.trim().toUpperCase(),
            parseFloat(precio_venta).toFixed(2),
            es_por_peso ? 1 : 0
        ]);

        res.status(201).json({
            message: 'Producto creado exitosamente',
            producto_id: result.insertId,
            codigo: codigo.trim().toUpperCase(),
            nombre: nombre.trim(),
            precio_venta: parseFloat(precio_venta).toFixed(2)
        });

    } catch (error) {
        console.error('Error creating producto:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe un producto con ese código' });
        }
        res.status(500).json({ message: 'Error al crear producto' });
    }
};

/* ==================== ACTUALIZAR PRODUCTO ==================== */
export const updateProducto = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);
    const {
        codigo,
        nombre,
        categoria,
        precio_venta,
        es_por_peso,
        activo
    } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [exists] = await pool.query('SELECT producto_id FROM Productos WHERE producto_id = ?', [id]);
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
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
        if (categoria !== undefined) {
            const categoriasValidas = ['TORTAS', 'PASTELES', 'PAN DULCE', 'GALLETAS', 'BEBIDAS', 'POSTRES', 'GENERAL'];
            if (!categoriasValidas.includes(categoria.toUpperCase())) {
                return res.status(400).json({ message: 'Categoría inválida' });
            }
            fields.push('categoria = ?');
            values.push(categoria.toUpperCase());
        }
        if (precio_venta !== undefined) {
            if (isNaN(precio_venta) || parseFloat(precio_venta) <= 0) {
                return res.status(400).json({ message: 'Precio inválido' });
            }
            fields.push('precio_venta = ?');
            values.push(parseFloat(precio_venta).toFixed(2));
        }
        if (es_por_peso !== undefined) {
            fields.push('es_por_peso = ?');
            values.push(es_por_peso ? 1 : 0);
        }
        if (activo !== undefined) {
            fields.push('activo = ?');
            values.push(activo ? 1 : 0);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
        }

        values.push(id);
        await pool.query(`UPDATE Productos SET ${fields.join(', ')} WHERE producto_id = ?`, values);

        res.json({ message: 'Producto actualizado correctamente' });

    } catch (error) {
        console.error('Error updating producto:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe otro producto con ese código' });
        }
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

/* ==================== ELIMINAR / DESACTIVAR PRODUCTO ==================== */
export const deleteProducto = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        // Verificar si tiene ventas o producción
        const [enUso] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM VentaDetalle WHERE producto_id = ?) AS en_ventas,
                (SELECT COUNT(*) FROM ProduccionDiaria WHERE producto_id = ?) AS en_produccion,
                (SELECT COUNT(*) FROM Recetas WHERE producto_id = ?) AS tiene_receta
        `, [id, id, id]);

        const uso = enUso[0];
        if (uso.en_ventas > 0 || uso.en_produccion > 0) {
            // Solo desactivar
            await pool.query('UPDATE Productos SET activo = 0 WHERE producto_id = ?', [id]);
            return res.json({ message: 'Producto desactivado (tiene ventas o producción)' });
        }

        // Si no tiene movimientos críticos, borrar físicamente (opcional)
        if (uso.tiene_receta > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar: tiene receta asociada. Desactívalo.' 
            });
        }

        const [result] = await pool.query('DELETE FROM Productos WHERE producto_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado permanentemente' });

    } catch (error) {
        console.error('Error deleting producto:', error);
        res.status(500).json({ message: 'Error al procesar producto' });
    }
};