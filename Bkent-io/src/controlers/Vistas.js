import { connect } from '../database';

/* ==================== DASHBOARD PRINCIPAL - RESUMEN DIARIO ==================== */
export const getDashboardDiario = async (req, res) => {
    const pool = await connect();
    const { fecha = new Date().toISOString().split('T')[0] } = req.query;

    try {
        const [resumen] = await pool.query(`
            SELECT 
                COALESCE(SUM(v.total_final_bs), 0) AS ventas_total_bs,
                COALESCE(SUM(v.descuento_bs), 0) AS descuentos_aplicados_bs,
                COUNT(DISTINCT v.venta_id) AS total_ventas,
                COUNT(vd.item) AS productos_vendidos,
                COALESCE(SUM(vd.cantidad * costo.costo_unitario), 0) AS costo_materias_bs,
                COALESCE(SUM((vd.precio_final - costo.costo_unitario) * vd.cantidad), 0) AS ganancia_bruta_bs
            FROM Ventas v
            LEFT JOIN VentaDetalle vd ON v.venta_id = vd.venta_id
            LEFT JOIN vw_costo_productos costo ON vd.producto_id = costo.producto_id
            WHERE DATE(v.fecha) = ?
              AND v.estado != 'ANULADA'
        `, [fecha]);

        const [topProductos] = await pool.query(`
            SELECT 
                p.nombre,
                p.categoria,
                SUM(vd.cantidad) AS unidades,
                SUM(vd.subtotal) AS ingresos_bs
            FROM VentaDetalle vd
            JOIN Productos p ON vd.producto_id = p.producto_id
            JOIN Ventas v ON vd.venta_id = v.venta_id
            WHERE DATE(v.fecha) = ? AND v.estado != 'ANULADA'
            GROUP BY vd.producto_id
            ORDER BY unidades DESC
            LIMIT 10
        `, [fecha]);

        res.json({
            fecha,
            resumen: {
                ventas_total: parseFloat(resumen[0].ventas_total_bs.toFixed(2)),
                descuentos: parseFloat(resumen[0].descuentos_aplicados_bs.toFixed(2)),
                ganancia_bruta: parseFloat(resumen[0].ganancia_bruta_bs.toFixed(2)),
                margen_porcentual: resumen[0].ventas_total_bs > 0 
                    ? parseFloat(((resumen[0].ganancia_bruta_bs / resumen[0].ventas_total_bs) * 100).toFixed(1))
                    : 0,
                total_ventas: Number(resumen[0].total_ventas),
                productos_vendidos: Number(resumen[0].productos_vendidos)
            },
            top_productos: topProductos
        });

    } catch (error) {
        console.error('Error en dashboard diario:', error);
        res.status(500).json({ message: 'Error al cargar dashboard' });
    }
};

/* ==================== STOCK ACTUAL CON ALERTAS ==================== */
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
            WHERE activo = 1
            ORDER BY estado_stock DESC, nombre
        `);

        const resumen = {
            total_materias: rows.length,
            en_critico: rows.filter(r => r.estado_stock === 'CRITICO').length,
            en_bajo: rows.filter(r => r.estado_stock === 'BAJO').length,
            valor_total_inventario: parseFloat(rows.reduce((sum, r) => sum + r.valor_inventario_bs, 0, 0).toFixed(2))
        };

        res.json({ resumen, materias: rows });
    } catch (error) {
        console.error('Error stock actual:', error);
        res.status(500).json({ message: 'Error al obtener stock' });
    }
};

/* ==================== PRODUCTOS MÁS RENTABLES (con costo real) ==================== */
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
            FROM Productos p
            LEFT JOIN vw_costo_productos c ON p.producto_id = c.producto_id
            LEFT JOIN VentaDetalle vd ON p.producto_id = vd.producto_id
            LEFT JOIN Ventas v ON vd.venta_id = v.venta_id AND DATE(v.fecha) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
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

/* ==================== MOVIMIENTOS DE INVENTARIO (últimos 100) ==================== */
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
            FROM MovimientosInventario mi
            JOIN MateriasPrimas mp ON mi.materia_id = mp.materia_id
            ORDER BY mi.fecha DESC, mi.movimiento_id DESC
            LIMIT 100
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error movimientos recientes:', error);
        res.status(500).json({ message: 'Error al obtener movimientos' });
    }
};

/* ==================== CLIENTES FRECUENTES ==================== */
export const getClientesFrecuentes = async (req, res) => {
    const pool = await connect();
    const { limite = 15 } = req.query;

    try {
        const [rows] = await pool.query(`
            SELECT 
                c.cliente_id,
                c.ci,
                c.nombres + ' ' + c.apellidos AS nombre_completo,
                c.telefono,
                COUNT(v.venta_id) AS total_compras,
                COALESCE(SUM(v.total_final_bs), 0) AS total_gastado_bs,
                c.puntos_acumulados,
                MAX(v.fecha) AS ultima_compra
            FROM Clientes c
            LEFT JOIN Ventas v ON c.cliente_id = v.cliente_id AND v.estado != 'ANULADA'
            WHERE c.activo = 1
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

/* ==================== PROMOCIONES ACTIVAS Y SU IMPACTO ==================== */
export const getPromocionesActivas = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.promocion_id,
                p.nombre,
                p.tipo_promocion,
                p.fecha_inicio,
                p.fecha_fin,
                COALESCE(COUNT(vd.venta_id), 0) AS veces_aplicada,
                COALESCE(SUM(vd.descuento_unitario * vd.cantidad), 0) AS descuento_total_otorgado
            FROM Promociones p
            LEFT JOIN VentaDetalle vd ON p.producto_id = vd.producto_id
                AND vd.descuento_unitario > 0
                AND DATE(vd.fecha_registro) BETWEEN p.fecha_inicio AND p.fecha_fin
            WHERE p.activa = 1
                AND CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin
            GROUP BY p.promocion_id
            ORDER BY veces_aplicada DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error promociones:', error);
        res.status(500).json({ message: 'Error al obtener promociones activas' });
    }
};

/* ==================== VENTAS POR CATEGORÍA (últimos 30 días) ==================== */
export const getVentasPorCategoria = async (req, res) => {
    const pool = await connect();
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.categoria,
                COUNT(*) AS productos_en_categoria,
                SUM(vd.cantidad) AS unidades_vendidas,
                SUM(vd.subtotal) AS ingresos_bs,
                ROUND(AVG(vd.precio_final), 2) AS ticket_promedio
            FROM VentaDetalle vd
            JOIN Productos p ON vd.producto_id = p.producto_id
            JOIN Ventas v ON vd.venta_id = v.venta_id
            WHERE v.estado != 'ANULADA'
              AND v.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY p.categoria
            ORDER BY ingresos_bs DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error ventas por categoría:', error);
        res.status(500).json({ message: 'Error al obtener ventas por categoría' });
    }
};