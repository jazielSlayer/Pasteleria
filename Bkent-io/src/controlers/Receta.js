import { connect } from '../database';

export const getRecetas = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                r.receta_id,
                r.producto_id,
                p.codigo,
                p.nombre AS producto_nombre,
                p.categoria,
                r.porciones_salida,
                r.costo_mano_obra,
                r.costo_energia,
                COALESCE(v.costo_unitario, 0) AS costo_total_unitario,
                COALESCE(v.margen_unitario, p.precio_venta) AS margen_unitario
            FROM Recetas r
            JOIN Productos p ON r.producto_id = p.producto_id
            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id
            WHERE p.activo = 1
            ORDER BY p.nombre
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching recetas:', error);
        res.status(500).json({ message: 'Error al obtener recetas' });
    }
};

export const getReceta = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        // Primero buscar la receta (por receta_id o producto_id)
        const [recetaRows] = await pool.query(`
            SELECT 
                r.receta_id,
                r.producto_id,
                r.porciones_salida,
                r.costo_mano_obra,
                r.costo_energia,
                p.codigo,
                p.nombre AS producto_nombre,
                p.precio_venta,
                p.es_por_peso,
                COALESCE(v.costo_unitario, 0) AS costo_total_unitario,
                COALESCE(v.margen_unitario, p.precio_venta) AS margen_unitario
            FROM Recetas r
            JOIN Productos p ON r.producto_id = p.producto_id
            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id
            WHERE r.receta_id = ? OR r.producto_id = ?
        `, [id, id]);

        if (recetaRows.length === 0) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }

        const receta = recetaRows[0];

        // Obtener ingredientes
        const [ingredientes] = await pool.query(`
            SELECT 
                rd.id,
                rd.materia_id,
                mp.codigo,
                mp.nombre AS materia_nombre,
                mp.unidad,
                rd.cantidad,
                mp.costo_promedio,
                ROUND(rd.cantidad * mp.costo_promedio, 4) AS costo_ingrediente
            FROM RecetaDetalle rd
            JOIN MateriasPrimas mp ON rd.materia_id = mp.materia_id
            WHERE rd.receta_id = ?
            ORDER BY mp.nombre
        `, [receta.receta_id]);

        // Convertir explícitamente a números
        const costo_materias = ingredientes.reduce((sum, i) => {
            return sum + parseFloat(i.costo_ingrediente || 0);
        }, 0);
        
        const costo_mano_obra = parseFloat(receta.costo_mano_obra || 0);
        const costo_energia = parseFloat(receta.costo_energia || 0);
        const costo_total = costo_materias + costo_mano_obra + costo_energia;
        const porciones = parseInt(receta.porciones_salida) || 1;
        const costo_por_porcion = porciones > 0 ? costo_total / porciones : 0;
        const precio_venta = parseFloat(receta.precio_venta);
        const margen_por_porcion = precio_venta - costo_por_porcion;

        // Convertir ingredientes para la respuesta
        const ingredientesFormateados = ingredientes.map(ing => ({
            id: ing.id,
            materia_id: ing.materia_id,
            codigo: ing.codigo,
            materia_nombre: ing.materia_nombre,
            unidad: ing.unidad,
            cantidad: parseFloat(ing.cantidad),
            costo_promedio: parseFloat(ing.costo_promedio),
            costo_ingrediente: parseFloat(ing.costo_ingrediente)
        }));

        res.json({
            receta_id: receta.receta_id,
            producto_id: receta.producto_id,
            producto: {
                codigo: receta.codigo,
                nombre: receta.producto_nombre,
                precio_venta: precio_venta,
                es_por_peso: Boolean(receta.es_por_peso)
            },
            porciones_salida: porciones,
            costo_mano_obra: parseFloat(costo_mano_obra.toFixed(2)),
            costo_energia: parseFloat(costo_energia.toFixed(2)),
            costo_materias_prima: parseFloat(costo_materias.toFixed(4)),
            costo_total_produccion: parseFloat(costo_total.toFixed(4)),
            costo_por_porcion: parseFloat(costo_por_porcion.toFixed(4)),
            margen_por_porcion: parseFloat(margen_por_porcion.toFixed(4)),
            ingredientes: ingredientesFormateados
        });

    } catch (error) {
        console.error('Error fetching receta:', error);
        res.status(500).json({ message: 'Error al obtener receta' });
    }
};

export const createReceta = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            producto_id,
            porciones_salida = 1,
            costo_mano_obra = 0,
            costo_energia = 0,
            ingredientes // [{ materia_id, cantidad }]
        } = req.body;

        // Validaciones
        if (!producto_id || !ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
            return res.status(400).json({ message: 'Faltan datos: producto_id e ingredientes[] obligatorios' });
        }

        const [producto] = await connection.query('SELECT producto_id FROM Productos WHERE producto_id = ? AND activo = 1', [producto_id]);
        if (producto.length === 0) {
            return res.status(400).json({ message: 'Producto no encontrado o inactivo' });
        }

        // Verificar que no exista ya una receta para este producto
        const [existe] = await connection.query('SELECT receta_id FROM Recetas WHERE producto_id = ?', [producto_id]);
        if (existe.length > 0) {
            return res.status(400).json({ message: 'Ya existe una receta para este producto' });
        }

        if (porciones_salida <= 0) {
            return res.status(400).json({ message: 'Porciones de salida debe ser mayor a 0' });
        }

        // Validar cada ingrediente
        for (const ing of ingredientes) {
            const { materia_id, cantidad } = ing;
            if (!materia_id || !cantidad || cantidad <= 0) {
                throw new Error('Cada ingrediente debe tener materia_id y cantidad > 0');
            }

            const [materia] = await connection.query('SELECT materia_id FROM MateriasPrimas WHERE materia_id = ?', [materia_id]);
            if (materia.length === 0) {
                throw new Error(`Materia prima ID ${materia_id} no existe`);
            }
        }

        // Crear cabezera
        const [result] = await connection.query(`
            INSERT INTO Recetas (producto_id, porciones_salida, costo_mano_obra, costo_energia)
            VALUES (?, ?, ?, ?)
        `, [producto_id, porciones_salida, parseFloat(costo_mano_obra), parseFloat(costo_energia)]);

        const receta_id = result.insertId;

        // Insertar ingredientes
        for (const ing of ingredientes) {
            await connection.query(`
                INSERT INTO RecetaDetalle (receta_id, materia_id, cantidad)
                VALUES (?, ?, ?)
            `, [receta_id, ing.materia_id, parseFloat(ing.cantidad)]);
        }

        await connection.commit();

        res.status(201).json({
            message: 'Receta creada exitosamente',
            receta_id,
            producto_id,
            porciones_salida,
            total_ingredientes: ingredientes.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating receta:', error);
        res.status(500).json({ 
            message: 'Error al crear receta',
            error: error.message || 'Datos inválidos'
        });
    } finally {
        connection.release();
    }
};

export const updateReceta = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();
    const id = parseInt(req.params.id);

    try {
        await connection.beginTransaction();

        const {
            porciones_salida,
            costo_mano_obra = 0,
            costo_energia = 0,
            ingredientes
        } = req.body;

        if (!ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
            return res.status(400).json({ message: 'Debe enviar al menos un ingrediente' });
        }

        // Verificar que la receta exista
        const [receta] = await connection.query('SELECT * FROM Recetas WHERE receta_id = ?', [id]);
        if (receta.length === 0) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }

        // Validar ingredientes
        for (const ing of ingredientes) {
            if (!ing.materia_id || !ing.cantidad || ing.cantidad <= 0) {
                throw new Error('Ingrediente inválido');
            }
            const [m] = await connection.query('SELECT materia_id FROM MateriasPrimas WHERE materia_id = ?', [ing.materia_id]);
            if (m.length === 0) throw new Error(`Materia prima ${ing.materia_id} no existe`);
        }

        // Actualizar cabezera
        await connection.query(`
            UPDATE Recetas 
            SET porciones_salida = ?, costo_mano_obra = ?, costo_energia = ?
            WHERE receta_id = ?
        `, [porciones_salida || receta[0].porciones_salida, parseFloat(costo_mano_obra), parseFloat(costo_energia), id]);

        // Borrar ingredientes anteriores
        await connection.query('DELETE FROM RecetaDetalle WHERE receta_id = ?', [id]);

        // Insertar nuevos
        for (const ing of ingredientes) {
            await connection.query(`
                INSERT INTO RecetaDetalle (receta_id, materia_id, cantidad)
                VALUES (?, ?, ?)
            `, [id, ing.materia_id, parseFloat(ing.cantidad)]);
        }

        await connection.commit();
        res.json({ message: 'Receta actualizada correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating receta:', error);
        res.status(500).json({ message: 'Error al actualizar receta' });
    } finally {
        connection.release();
    }
};

export const deleteReceta = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();
    const id = parseInt(req.params.id);

    try {
        await connection.beginTransaction();

        // Verificar si se ha usado en producción
        const [usada] = await connection.query(`
            SELECT COUNT(*) AS total 
            FROM ProduccionDiaria pd
            JOIN Recetas r ON pd.producto_id = r.producto_id
            WHERE r.receta_id = ?
        `, [id]);

        if (usada[0].total > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar: esta receta ya se usó en producción' 
            });
        }

        // Eliminar detalle primero
        await connection.query('DELETE FROM RecetaDetalle WHERE receta_id = ?', [id]);
        // Luego la receta
        const [result] = await connection.query('DELETE FROM Recetas WHERE receta_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }

        await connection.commit();
        res.json({ message: 'Receta eliminada correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error deleting receta:', error);
        res.status(500).json({ message: 'Error al eliminar receta' });
    } finally {
        connection.release();
    }
};