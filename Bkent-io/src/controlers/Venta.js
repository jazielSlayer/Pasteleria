import { connect } from '../database';

/* ==================== LISTAR VENTAS (con filtros) ==================== */
export const getVentas = async (req, res) => {
    const pool = await connect();
    const { fecha, cliente_id, tipo = 'MOSTRADOR' } = req.query;

    try {
        let query = `
            SELECT 
                v.venta_id,
                v.fecha,
                v.cliente_id,
                c.nombres + ' ' + c.apellidos AS cliente_nombre,
                c.ci AS cliente_ci,
                v.total_bs,
                v.descuento_bs,
                v.total_final_bs,
                v.tipo_venta,
                v.usuario,
                v.estado
            FROM Ventas v
            LEFT JOIN Clientes c ON v.cliente_id = c.cliente_id
            WHERE v.tipo_venta = ?
        `;
        const values = [tipo];

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
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};

/* ==================== OBTENER VENTA COMPLETA + DETALLE ==================== */
export const getVenta = async (req, res) => {
    const pool = await connect();
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) return res.status(400).json({ message: 'ID inválido' });

    try {
        // Cabezera
        const [cabezera] = await pool.query(`
            SELECT 
                v.*,
                c.nombres + ' ' + c.apellidos AS cliente_nombre,
                c.ci AS cliente_ci,
                c.es_frecuente
            FROM Ventas v
            LEFT JOIN Clientes c ON v.cliente_id = c.cliente_id
            WHERE v.venta_id = ?
        `, [id]);

        if (cabezera.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        // Detalle
        const [detalle] = await pool.query(`
            SELECT 
                vd.*,
                p.codigo,
                p.nombre AS producto_nombre,
                p.precio_venta,
                COALESCE(costo.costo_unitario, 0) AS costo_unitario,
                ROUND(vd.cantidad * COALESCE(costo.costo_unitario, 0), 2) AS costo_total
            FROM VentaDetalle vd
            JOIN Productos p ON vd.producto_id = p.producto_id
            LEFT JOIN vw_costo_productos costo ON p.producto_id = costo.producto_id
            WHERE vd.venta_id = ?
            ORDER BY vd.item
        `, [id]);

        const ganancia = detalle.reduce((sum, item) => {
            return sum + (item.precio_unitario * item.cantidad) - item.costo_total;
        }, 0);

        res.json({
            ...cabezera[0],
            items: detalle,
            ganancia_bruta: parseFloat(ganancia.toFixed(2)),
            items_count: detalle.length
        });

    } catch (error) {
        console.error('Error fetching venta:', error);
        res.status(500).json({ message: 'Error al obtener venta' });
    }
};

/* ==================== REGISTRAR VENTA COMPLETA (con promociones y descuento de stock) ==================== */
export const createVenta = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            cliente_id = null,
            items,                    // [{ producto_id, cantidad }]
            tipo_venta = 'MOSTRADOR', // MOSTRADOR, PEDIDO, DELIVERY
            usuario = 'Caja',
            aplicar_promociones = true
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items son obligatorios' });
        }

        // Validar productos y calcular total + promociones
        let subtotal = 0;
        let descuento_total = 0;
        const detalleValidado = [];

        for (const item of items) {
            const { producto_id, cantidad } = item;
            if (!producto_id || !cantidad || cantidad <= 0) {
                throw new Error('Cada item debe tener producto_id y cantidad > 0');
            }

            const [prod] = await connection.query(`
                SELECT p.*, COALESCE(v.costo_unitario, 0) AS costo_unitario
                FROM Productos p
                LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id
                WHERE p.producto_id = ? AND p.activo = 1
            `, [producto_id]);

            if (prod.length === 0) {
                throw new Error(`Producto ${producto_id} no encontrado o inactivo`);
            }

            const producto = prod[0];
            let precio_final = producto.precio_venta;
            let descuento_item = 0;
            let promo_aplicada = null;

            // Aplicar promociones activas
            if (aplicar_promociones) {
                const hoy = new Date().toISOString().split('T')[0];
                const [promo] = await connection.query(`
                    SELECT * FROM Promociones
                    WHERE producto_id = ? AND activa = 1
                      AND ? BETWEEN fecha_inicio AND fecha_fin
                    ORDER BY descuento_porcentaje DESC, descuento_fijo_bs DESC
                    LIMIT 1
                `, [producto_id, hoy]);

                if (promo.length > 0) {
                    const p = promo[0];
                    if (p.tipo_promocion === 'PORCENTAJE') {
                        descuento_item = precio_final * (p.descuento_porcentaje / 100);
                        precio_final -= descuento_item;
                        promo_aplicada = `${p.descuento_porcentaje}% OFF`;
                    } else if (p.tipo_promocion === 'FIJO') {
                        descuento_item = p.descuento_fijo_bs;
                        precio_final = Math.max(0, precio_final - descuento_item);
                        promo_aplicada = `${p.descuento_fijo_bs} Bs OFF`;
                    } else if (p.tipo_promocion === '2X1' && cantidad >= 2) {
                        const pagados = Math.floor(cantidad / 2);
                        descuento_item = precio_final * (cantidad - pagados);
                        precio_final = precio_final * pagados / cantidad;
                        promo_aplicada = '2x1';
                    }
                }
            }

            const subtotal_item = precio_final * cantidad;
            subtotal += producto.precio_venta * cantidad;
            descuento_total += descuento_item * cantidad;

            detalleValidado.push({
                producto_id,
                cantidad: parseFloat(cantidad),
                precio_unitario: parseFloat(producto.precio_venta.toFixed(2)),
                precio_final: parseFloat(precio_final.toFixed(2)),
                descuento_unitario: parseFloat(descuento_item.toFixed(2)),
                subtotal: parseFloat(subtotal_item.toFixed(2)),
                promo_aplicada
            });
        }

        const total_final = detalleValidado.reduce((sum, i) => sum + i.subtotal, 0);

        // Registrar cabezera
        const [ventaResult] = await connection.query(`
            INSERT INTO Ventas 
                (cliente_id, subtotal_bs, descuento_bs, total_final_bs, tipo_venta, usuario)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            cliente_id || null,
            parseFloat(subtotal.toFixed(2)),
            parseFloat(descuento_total.toFixed(2)),
            parseFloat(total_final.toFixed(2)),
            tipo_venta,
            usuario
        ]);

        const venta_id = ventaResult.insertId;

        // Registrar detalle
        for (let i = 0; i < detalleValidado.length; i++) {
            const item = detalleValidado[i];
            await connection.query(`
                INSERT INTO VentaDetalle 
                    (venta_id, item, producto_id, cantidad, precio_unitario, precio_final, descuento_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                venta_id, i + 1, item.producto_id, item.cantidad,
                item.precio_unitario, item.precio_final, item.descuento_unitario, item.subtotal
            ]);

            // Descontar del inventario (solo MOSTRADOR)
            if (tipo_venta === 'MOSTRADOR') {
                await connection.query(`
                    UPDATE Productos SET stock_actual = stock_actual - ? WHERE producto_id = ?
                `, [item.cantidad, item.producto_id]);
            }
        }

        // Acumular puntos si es cliente frecuente
        if (cliente_id) {
            const puntos = Math.floor(total_final / 10); // 1 punto por cada 10 Bs
            if (puntos > 0) {
                await connection.query(`
                    UPDATE Clientes SET puntos_acumulados = puntos_acumulados + ? WHERE cliente_id = ?
                `, [puntos, cliente_id]);
            }
        }

        await connection.commit();

        res.status(201).json({
            message: 'Venta registrada exitosamente',
            venta_id,
            total_final_bs: parseFloat(total_final.toFixed(2)),
            descuento_aplicado: parseFloat(descuento_total.toFixed(2)),
            items: detalleValidado.length,
            puntos_ganados: cliente_id ? Math.floor(total_final / 10) : 0
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error creando venta:', error);
        res.status(500).json({ 
            message: 'Error al registrar venta',
            error: error.message || 'Datos inválidos'
        });
    } finally {
        connection.release();
    }
};

/* ==================== ANULAR VENTA (solo del día actual - revierte stock) ==================== */
export const anularVenta = async (req, res) => {
    const pool = await connect();
    const connection = await pool.getConnection();
    const id = parseInt(req.params.id);

    try {
        await connection.beginTransaction();

        const [venta] = await connection.query('SELECT * FROM Ventas WHERE venta_id = ? AND DATE(fecha) = CURDATE()', [id]);
        if (venta.length === 0) {
            return res.status(400).json({ message: 'Venta no encontrada o no es del día actual' });
        }

        const v = venta[0];

        // Revertir stock
        if (v.tipo_venta === 'MOSTRADOR') {
            await connection.query(`
                UPDATE Productos p
                JOIN VentaDetalle vd ON p.producto_id = vd.producto_id
                SET p.stock_actual = p.stock_actual + vd.cantidad
                WHERE vd.venta_id = ?
            `, [id]);
        }

        // Marcar como anulada
        await connection.query('UPDATE Ventas SET estado = "ANULADA", total_final_bs = 0 WHERE venta_id = ?', [id]);

        await connection.commit();
        res.json({ message: 'Venta anulada y stock revertido correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error anulando venta:', error);
        res.status(500).json({ message: 'Error al anular venta' });
    } finally {
        connection.release();
    }
};