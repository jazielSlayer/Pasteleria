import { connect } from '../database';

export const getVentas = async (req, res) => {
    const pool = await connect();
    const { fecha, cliente_id } = req.query;

    try {
        let query = `
            SELECT 
                v.venta_id,
                v.fecha,
                v.cliente_id,
                c.nombre AS cliente_nombre,
                c.nit_ci AS cliente_ci,
                v.subtotal,
                v.descuento,
                v.total,
                v.metodo_pago,
                v.vendedor,
                v.numero_factura
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
            WHERE 1=1
        `;
        const values = [];

        if (fecha) {
            query += ' AND DATE(v.fecha) = ?';
            values.push(fecha);
        }
        if (cliente_id) {
            query += ' AND v.cliente_id = ?';
            values.push(cliente_id);
        }

        query += ' ORDER BY v.fecha DESC';

        const [rows] = await pool.query(query, values);
        res.json(rows);

    } catch (error) {
        console.error('Error fetching ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas', error: error.message });
    }
};

export const getVenta = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) return res.status(400).json({ message: 'ID inválido' });

    try {
        const [cabezera] = await pool.query(`
            SELECT 
                v.*,
                c.nombre AS cliente_nombre,
                c.nit_ci AS cliente_ci
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
            WHERE v.venta_id = ?
        `, [id]);

        if (cabezera.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const [detalle] = await pool.query(`
            SELECT 
                vd.*,
                p.codigo,
                p.nombre AS producto_nombre,
                p.precio_venta
            FROM ventadetalle vd
            JOIN productos p ON vd.producto_id = p.producto_id
            WHERE vd.venta_id = ?
            ORDER BY vd.detalle_id
        `, [id]);

        res.json({
            ...cabezera[0],
            items: detalle,
            items_count: detalle.length
        });

    } catch (error) {
        console.error('Error fetching venta:', error);
        res.status(500).json({ message: 'Error al obtener venta', error: error.message });
    }
};

export const createVenta = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            cliente_id = null,
            items = [],
            metodo_pago = 'EFECTIVO',
            vendedor = 'Caja',
            tipo_comprobante = 'FACTURA',        // ← NUEVO
            numero_factura = null                // ← NUEVO
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Debe agregar al menos un producto' });
        }

        let subtotal = 0;
        let descuento_cliente = 0;
        const detalleFinal = [];

        for (const item of items) {
            const { producto_id, cantidad } = item;
            if (!producto_id || !cantidad || cantidad <= 0) {
                throw new Error('Producto y cantidad son obligatorios');
            }

            const [prod] = await connection.query(
                'SELECT producto_id, nombre, precio_venta FROM productos WHERE producto_id = ? AND activo = 1',
                [producto_id]
            );

            if (prod.length === 0) {
                throw new Error(`Producto ID ${producto_id} no encontrado o inactivo`);
            }

            const producto = prod[0];
            const precio = parseFloat(producto.precio_venta);
            const subtotalItem = precio * parseFloat(cantidad);
            subtotal += subtotalItem;

            detalleFinal.push({
                producto_id,
                cantidad: parseFloat(cantidad),
                precio_unitario: precio,
                subtotal: subtotalItem
            });
        }

        // Aplicar descuento por cliente (si tiene porcentaje)
        if (cliente_id) {
            const [cli] = await connection.query(
                'SELECT descuento_porcentaje FROM clientes WHERE cliente_id = ?',
                [cliente_id]
            );
            if (cli.length > 0 && cli[0].descuento_porcentaje > 0) {
                descuento_cliente = subtotal * (cli[0].descuento_porcentaje / 100);
            }
        }

        const total = subtotal - descuento_cliente;

        const [result] = await connection.query(`
            INSERT INTO ventas 
                (cliente_id, subtotal, descuento, total, metodo_pago, vendedor, tipo_comprobante, numero_factura)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [cliente_id, subtotal, descuento_cliente, total, metodo_pago, vendedor, tipo_comprobante, numero_factura]);

        const venta_id = result.insertId;

        // Insertar detalle (sin tocar stock)
        for (const item of detalleFinal) {
            await connection.query(`
                INSERT INTO ventadetalle 
                    (venta_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, [venta_id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]);
        }

        await connection.commit();

        res.status(201).json({
            message: 'Venta registrada exitosamente',
            venta_id,
            subtotal: parseFloat(subtotal.toFixed(2)),
            descuento: parseFloat(descuento_cliente.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            items_count: items.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error creando venta:', error);
        res.status(500).json({ 
            message: 'Error al crear venta', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

export const anularVenta = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();
    const id = parseInt(req.params.id);

    try {
        await connection.beginTransaction();

        const [venta] = await connection.query(
            'SELECT * FROM ventas WHERE venta_id = ? AND DATE(fecha) = CURDATE()',
            [id]
        );

        if (venta.length === 0) {
            return res.status(400).json({ message: 'Venta no encontrada o no es del día actual' });
        }

        // Revertir stock
        await connection.query(`
            UPDATE productos p
            JOIN ventadetalle vd ON p.producto_id = vd.producto_id
            SET p.stock_actual = p.stock_actual + vd.cantidad
            WHERE vd.venta_id = ?
        `, [id]);

        // Anular venta
        await connection.query(`
            UPDATE ventas 
            SET total = 0, descuento = subtotal, metodo_pago = 'ANULADA'
            WHERE venta_id = ?
        `, [id]);

        await connection.commit(); // ¡AHORA SÍ ES COMMIT, NO MYTHOLOGY!

        res.json({ message: 'Venta anulada y stock restaurado correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error anulando venta:', error);
        res.status(500).json({ message: 'Error al anular venta' });
    } finally {
        connection.release();
    }
};