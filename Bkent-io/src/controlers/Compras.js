import { connect } from '../database';

// ======================== LISTAR TODAS LAS COMPRAS ========================
export const getCompras = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.compra_id,
                c.fecha_compra,
                c.numero_factura,
                c.total_bs,
                c.estado,
                p.nombre AS proveedor_nombre,
                p.nit AS proveedor_nit
            FROM Compras c
            JOIN Proveedores p ON c.proveedor_id = p.proveedor_id
            WHERE p.activo = 1
            ORDER BY c.fecha_compra DESC, c.compra_id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching compras:', error);
        res.status(500).json({ message: 'Error al obtener compras' });
    }
};

// ======================== OBTENER UNA COMPRA + DETALLE ========================
export const getCompra = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID de compra inválido' });
    }

    try {
        // Cabezera
        const [cabezera] = await pool.query(`
            SELECT 
                c.*,
                p.nombre AS proveedor_nombre,
                p.nit AS proveedor_nit,
                p.telefono AS proveedor_telefono
            FROM Compras c
            JOIN Proveedores p ON c.proveedor_id = p.proveedor_id
            WHERE c.compra_id = ?
        `, [id]);

        if (cabezera.length === 0) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        // Detalle
        const [detalle] = await pool.query(`
            SELECT 
                cd.detalle_id,
                cd.materia_id,
                mp.codigo,
                mp.nombre AS materia_nombre,
                mp.unidad,
                cd.cantidad,
                cd.precio_unitario,
                cd.subtotal
            FROM CompraDetalle cd
            JOIN MateriasPrimas mp ON cd.materia_id = mp.materia_id
            WHERE cd.compra_id = ?
            ORDER BY mp.nombre
        `, [id]);

        res.json({
            ...cabezera[0],
            items: detalle
        });

    } catch (error) {
        console.error('Error fetching compra:', error);
        res.status(500).json({ message: 'Error al obtener compra' });
    }
};

// ======================== CREAR NUEVA COMPRA (con detalle) ========================
export const createCompra = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const {
            proveedor_id,
            numero_factura,
            items // [{ materia_id, cantidad, precio_unitario }]
        } = req.body;

        // Validaciones
        if (!proveedor_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Faltan datos: proveedor_id y items[] son obligatorios' });
        }

        const [prov] = await connection.query('SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ? AND activo = 1', [proveedor_id]);
        if (prov.length === 0) {
            return res.status(400).json({ message: 'Proveedor no encontrado o inactivo' });
        }

        let total_bs = 0;
        const detalleValidado = [];

        for (const item of items) {
            const { materia_id, cantidad, precio_unitario } = item;

            if (!materia_id || !cantidad || !precio_unitario) {
                throw new Error('Todos los items deben tener materia_id, cantidad y precio_unitario');
            }

            if (cantidad <= 0 || precio_unitario <= 0) {
                throw new Error('Cantidad y precio deben ser mayores a 0');
            }

            const [materia] = await connection.query('SELECT materia_id, nombre FROM MateriasPrimas WHERE materia_id = ?', [materia_id]);
            if (materia.length === 0) {
                throw new Error(`Materia prima ID ${materia_id} no existe`);
            }

            const subtotal = parseFloat(cantidad) * parseFloat(precio_unitario);
            total_bs += subtotal;

            detalleValidado.push({
                materia_id: parseInt(materia_id),
                cantidad: parseFloat(cantidad),
                precio_unitario: parseFloat(precio_unitario),
                subtotal
            });
        }

        // Insertar cabezera
        const [resultCabezera] = await connection.query(`
            INSERT INTO Compras (proveedor_id, numero_factura, total_bs, estado)
            VALUES (?, ?, ?, 'PENDIENTE')
        `, [proveedor_id, numero_factura?.trim() || null, parseFloat(total_bs.toFixed(2))]);

        const compra_id = resultCabezera.insertId;

        // Insertar detalle
        for (const item of detalleValidado) {
            await connection.query(`
                INSERT INTO CompraDetalle (compra_id, materia_id, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            `, [compra_id, item.materia_id, item.cantidad, item.precio_unitario]);
        }

        await connection.commit();

        res.status(201).json({
            message: 'Compra creada exitosamente',
            compra_id,
            total_bs: parseFloat(total_bs.toFixed(2)),
            estado: 'PENDIENTE',
            items_count: detalleValidado.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating compra:', error);
        res.status(500).json({ 
            message: 'Error al crear compra',
            error: error.message || 'Datos inválidos en el detalle'
        });
    } finally {
        connection.release();
    }
};

// ======================== RECIBIR COMPRA (actualiza stock y costo promedio) ========================
export const recibirCompra = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        await connection.beginTransaction();

        const [compra] = await connection.query('SELECT * FROM Compras WHERE compra_id = ? AND estado = "PENDIENTE"', [id]);
        if (compra.length === 0) {
            return res.status(400).json({ message: 'Compra no encontrada o ya fue recibida/cancelada' });
        }

        const [detalles] = await connection.query('SELECT * FROM CompraDetalle WHERE compra_id = ?', [id]);

        for (const item of detalles) {
            const { materia_id, cantidad, precio_unitario } = item;

            // Obtener stock actual y costo promedio actual
            const [mp] = await connection.query('SELECT stock_actual, costo_promedio FROM MateriasPrimas WHERE materia_id = ?', [materia_id]);
            const actual = mp[0];

            const nuevo_stock = actual.stock_actual + cantidad;
            const costo_nuevo = ((actual.stock_actual * actual.costo_promedio) + (cantidad * precio_unitario)) / nuevo_stock;

            // Actualizar materia prima
            await connection.query(`
                UPDATE MateriasPrimas 
                SET stock_actual = ?, costo_promedio = ? 
                WHERE materia_id = ?
            `, [nuevo_stock, parseFloat(costo_nuevo.toFixed(4)), materia_id]);

            // Registrar movimiento
            await connection.query(`
                INSERT INTO MovimientosInventario 
                    (materia_id, tipo, cantidad, referencia_id, observacion)
                VALUES (?, 'COMPRA', ?, ?, 'Compra recibida')
            `, [materia_id, cantidad, id]);
        }

        // Marcar como recibida
        await connection.query('UPDATE Compras SET estado = "RECIBIDA" WHERE compra_id = ?', [id]);

        await connection.commit();

        res.json({ message: 'Compra recibida correctamente. Stock y costos actualizados.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error recibiendo compra:', error);
        res.status(500).json({ message: 'Error al recibir la compra' });
    } finally {
        connection.release();
    }
};

// ======================== CANCELAR COMPRA (solo si está PENDIENTE) ========================
export const cancelarCompra = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    try {
        const [result] = await pool.query(`
            UPDATE Compras SET estado = 'CANCELADA' 
            WHERE compra_id = ? AND estado = 'PENDIENTE'
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Compra no encontrada o ya fue procesada' });
        }

        res.json({ message: 'Compra cancelada correctamente' });
    } catch (error) {
        console.error('Error cancelando compra:', error);
        res.status(500).json({ message: 'Error al cancelar compra' });
    }
};