import { connect } from '../database';

export const getDashboardDiario = async (req, res) => {
    const pool = await connect();
    const { fecha = new Date().toISOString().split('T')[0] } = req.query;

    try {
        const [resumen] = await pool.query(`
            SELECT 
                COALESCE(SUM(v.total), 0) AS ventas_total_bs,
                COALESCE(SUM(v.descuento), 0) AS descuentos_aplicados_bs,
                COUNT(DISTINCT v.venta_id) AS total_ventas,
                COUNT(vd.detalle_id) AS productos_vendidos,
                COALESCE(SUM(vd.cantidad * costo.costo_unitario), 0) AS costo_materias_bs,
                COALESCE(SUM((vd.precio_unitario - costo.costo_unitario) * vd.cantidad), 0) AS ganancia_bruta_bs
            FROM ventas v
            LEFT JOIN ventadetalle vd ON v.venta_id = vd.venta_id
            LEFT JOIN vw_costo_productos costo ON vd.producto_id = costo.producto_id
            WHERE DATE(v.fecha) = ?
        `, [fecha]);

        const [topProductos] = await pool.query(`
            SELECT 
                p.nombre,
                p.categoria,
                SUM(vd.cantidad) AS unidades,
                SUM(vd.subtotal) AS ingresos_bs
            FROM ventadetalle vd
            JOIN productos p ON vd.producto_id = p.producto_id
            JOIN ventas v ON vd.venta_id = v.venta_id
            WHERE DATE(v.fecha) = ?
            GROUP BY vd.producto_id
            ORDER BY unidades DESC
            LIMIT 10
        `, [fecha]);

                const data = resumen[0];

        const ventas = Number(data.ventas_total_bs) || 0;
        const descuentos = Number(data.descuentos_aplicados_bs) || 0;
        const ganancia = Number(data.ganancia_bruta_bs) || 0;

        res.json({
            fecha,
            resumen: {
                ventas_total: Number(ventas.toFixed(2)),
                descuentos: Number(descuentos.toFixed(2)),
                ganancia_bruta: Number(ganancia.toFixed(2)),
                margen_porcentual: ventas > 0 ? Number(((ganancia / ventas) * 100).toFixed(1)) : 0,
                total_ventas: Number(data.total_ventas),
                productos_vendidos: Number(data.productos_vendidos)
            },
            top_productos: topProductos
        });

    } catch (error) {
        console.error('Error en dashboard diario:', error);
        res.status(500).json({ message: 'Error al cargar dashboard' });
    }
};

export const getStockActual = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                materia_id,
                codigo,
                nombre,
                unidad,
                stock_actual,
                stock_minimo,
                CASE 
                    WHEN stock_actual <= stock_minimo THEN 'CRITICO'
                    WHEN stock_actual <= stock_minimo * 2 THEN 'BAJO'
                    ELSE 'NORMAL'
                END AS estado_stock,
                ROUND(costo_promedio, 2) AS costo_unitario,
                ROUND(stock_actual * costo_promedio, 2) AS valor_inventario_bs
            FROM MateriasPrimas
            -- QUITAMOS: WHERE activo = 1  → ¡ESA COLUMNA NO EXISTE EN TU TABLA!
            ORDER BY estado_stock DESC, nombre
        `);

        // Cálculo seguro del valor total
        const valorTotal = rows.reduce((sum, item) => {
            const valor = item.valor_inventario_bs || 0;
            return sum + parseFloat(valor);
        }, 0);

        const resumen = {
            total_materias: rows.length,
            en_critico: rows.filter(r => r.estado_stock === 'CRITICO').length,
            en_bajo: rows.filter(r => r.estado_stock === 'BAJO').length,
            valor_total_inventario: parseFloat(valorTotal.toFixed(2))
        };

        res.json({ resumen, materias: rows });

    } catch (error) {
        console.error('Error stock actual:', error);
        res.status(500).json({ message: 'Error al obtener stock' });
    }
};

export const getProductosRentables = async (req, res) => {
    const pool = await connect();
    const { dias = 30 } = req.query;

    try {
        const [rows] = await pool.query(`
            SELECT 
                p.producto_id,
                p.codigo,
                p.nombre,
                p.categoria,
                p.precio_venta,
                COALESCE(c.costo_unitario, 0) AS costo_unitario,
                ROUND(p.precio_venta - COALESCE(c.costo_unitario, 0), 2) AS margen_unitario_bs,
                ROUND(((p.precio_venta - COALESCE(c.costo_unitario, 0)) / p.precio_venta) * 100, 1) AS margen_porcentual,
                COALESCE(SUM(vd.cantidad), 0) AS unidades_vendidas_ultimos_dias,
                COALESCE(SUM(vd.subtotal), 0) AS ingresos_generados
            FROM productos p
            LEFT JOIN vw_costo_productos c ON p.producto_id = c.producto_id
            LEFT JOIN ventadetalle vd ON p.producto_id = vd.producto_id
            LEFT JOIN ventas v ON vd.venta_id = v.venta_id 
                AND DATE(v.fecha) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            WHERE p.activo = 1
            GROUP BY p.producto_id
            ORDER BY margen_porcentual DESC, unidades_vendidas_ultimos_dias DESC
            LIMIT 20
        `, [dias]);

        res.json(rows);
    } catch (error) {
        console.error('Error productos rentables:', error);
        res.status(500).json({ message: 'Error al calcular rentabilidad' });
    }
};

export const getMovimientosRecientes = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                mi.movimiento_id,
                mi.fecha,
                mp.nombre AS materia,
                mi.tipo,
                mi.cantidad,
                mi.usuario,
                mi.observacion
            FROM movimientosinventario mi
            JOIN materiasprimas mp ON mi.materia_id = mp.materia_id
            ORDER BY mi.fecha DESC
            LIMIT 100
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error movimientos recientes:', error);
        res.status(500).json({ message: 'Error al obtener movimientos' });
    }
};

export const getClientesFrecuentes = async (req, res) => {
    const pool = await connect();
    const { limite = 15 } = req.query;

    try {
        const [rows] = await pool.query(`
            SELECT 
                c.cliente_id,
                c.nit_ci,
                c.nombre,
                c.telefono,
                c.tipo AS tipo_cliente,
                COUNT(v.venta_id) AS total_compras,
                COALESCE(SUM(v.total), 0) AS total_gastado_bs,
                MAX(v.fecha) AS ultima_compra
            FROM clientes c
            LEFT JOIN ventas v ON c.cliente_id = v.cliente_id
            GROUP BY c.cliente_id
            HAVING total_compras > 0
            ORDER BY total_gastado_bs DESC
            LIMIT ?
        `, [parseInt(limite)]);

        res.json(rows);
    } catch (error) {
        console.error('Error clientes frecuentes:', error);
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

export const getPromocionesActivas = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.promocion_id,
                p.nombre,
                p.tipo,
                p.valor,
                p.fecha_inicio,
                p.fecha_fin,
                p.producto_id,
                COALESCE(COUNT(v.venta_id), 0) AS veces_aplicada,
                COALESCE(SUM(v.descuento), 0) AS descuento_total_otorgado
            FROM promociones p
            LEFT JOIN ventas v ON v.promocion_id = p.promocion_id
                AND DATE(v.fecha) BETWEEN p.fecha_inicio AND p.fecha_fin
            WHERE p.activo = 1
              AND CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin
            GROUP BY p.promocion_id
            ORDER BY veces_aplicada DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error promociones:', error);
        res.status(500).json({ message: 'Error al obtener promociones' });
    }
};

export const getVentasPorCategoria = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.categoria,
                COUNT(DISTINCT p.producto_id) AS productos_en_categoria,
                SUM(vd.cantidad) AS unidades_vendidas,
                SUM(vd.subtotal) AS ingresos_bs,
                ROUND(SUM(vd.subtotal) / NULLIF(SUM(vd.cantidad), 0), 2) AS precio_promedio
            FROM ventadetalle vd
            JOIN productos p ON vd.producto_id = p.producto_id
            JOIN ventas v ON vd.venta_id = v.venta_id
            WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY p.categoria
            ORDER BY ingresos_bs DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error ventas por categoría:', error);
        res.status(500).json({ message: 'Error al obtener ventas por categoría' });
    }
};