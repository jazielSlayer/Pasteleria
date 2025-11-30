"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVentasPorCategoria = exports.getStockActual = exports.getPromocionesActivas = exports.getProductosRentables = exports.getMovimientosRecientes = exports.getDashboardDiario = exports.getClientesFrecuentes = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
var getDashboardDiario = exports.getDashboardDiario = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _req$query$fecha, fecha, _yield$pool$query, _yield$pool$query2, resumen, _yield$pool$query3, _yield$pool$query4, topProductos, data, ventas, descuentos, ganancia;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _req$query$fecha = req.query.fecha, fecha = _req$query$fecha === void 0 ? new Date().toISOString().split('T')[0] : _req$query$fecha;
          _context.prev = 4;
          _context.next = 7;
          return pool.query("\n            SELECT \n                COALESCE(SUM(v.total), 0) AS ventas_total_bs,\n                COALESCE(SUM(v.descuento), 0) AS descuentos_aplicados_bs,\n                COUNT(DISTINCT v.venta_id) AS total_ventas,\n                COUNT(vd.detalle_id) AS productos_vendidos,\n                COALESCE(SUM(vd.cantidad * costo.costo_unitario), 0) AS costo_materias_bs,\n                COALESCE(SUM((vd.precio_unitario - costo.costo_unitario) * vd.cantidad), 0) AS ganancia_bruta_bs\n            FROM ventas v\n            LEFT JOIN ventadetalle vd ON v.venta_id = vd.venta_id\n            LEFT JOIN vw_costo_productos costo ON vd.producto_id = costo.producto_id\n            WHERE DATE(v.fecha) = ?\n        ", [fecha]);
        case 7:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          resumen = _yield$pool$query2[0];
          _context.next = 12;
          return pool.query("\n            SELECT \n                p.nombre,\n                p.categoria,\n                SUM(vd.cantidad) AS unidades,\n                SUM(vd.subtotal) AS ingresos_bs\n            FROM ventadetalle vd\n            JOIN productos p ON vd.producto_id = p.producto_id\n            JOIN ventas v ON vd.venta_id = v.venta_id\n            WHERE DATE(v.fecha) = ?\n            GROUP BY vd.producto_id\n            ORDER BY unidades DESC\n            LIMIT 10\n        ", [fecha]);
        case 12:
          _yield$pool$query3 = _context.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          topProductos = _yield$pool$query4[0];
          data = resumen[0];
          ventas = Number(data.ventas_total_bs) || 0;
          descuentos = Number(data.descuentos_aplicados_bs) || 0;
          ganancia = Number(data.ganancia_bruta_bs) || 0;
          res.json({
            fecha: fecha,
            resumen: {
              ventas_total: Number(ventas.toFixed(2)),
              descuentos: Number(descuentos.toFixed(2)),
              ganancia_bruta: Number(ganancia.toFixed(2)),
              margen_porcentual: ventas > 0 ? Number((ganancia / ventas * 100).toFixed(1)) : 0,
              total_ventas: Number(data.total_ventas),
              productos_vendidos: Number(data.productos_vendidos)
            },
            top_productos: topProductos
          });
          _context.next = 26;
          break;
        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](4);
          console.error('Error en dashboard diario:', _context.t0);
          res.status(500).json({
            message: 'Error al cargar dashboard'
          });
        case 26:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 22]]);
  }));
  return function getDashboardDiario(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var getStockActual = exports.getStockActual = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, _yield$pool$query5, _yield$pool$query6, rows, valorTotal, resumen;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context2.sent;
          _context2.prev = 3;
          _context2.next = 6;
          return pool.query("\n            SELECT \n                materia_id,\n                codigo,\n                nombre,\n                unidad,\n                stock_actual,\n                stock_minimo,\n                CASE \n                    WHEN stock_actual <= stock_minimo THEN 'CRITICO'\n                    WHEN stock_actual <= stock_minimo * 2 THEN 'BAJO'\n                    ELSE 'NORMAL'\n                END AS estado_stock,\n                ROUND(costo_promedio, 2) AS costo_unitario,\n                ROUND(stock_actual * costo_promedio, 2) AS valor_inventario_bs\n            FROM MateriasPrimas\n            -- QUITAMOS: WHERE activo = 1  \u2192 \xA1ESA COLUMNA NO EXISTE EN TU TABLA!\n            ORDER BY estado_stock DESC, nombre\n        ");
        case 6:
          _yield$pool$query5 = _context2.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          rows = _yield$pool$query6[0];
          // Cálculo seguro del valor total
          valorTotal = rows.reduce(function (sum, item) {
            var valor = item.valor_inventario_bs || 0;
            return sum + parseFloat(valor);
          }, 0);
          resumen = {
            total_materias: rows.length,
            en_critico: rows.filter(function (r) {
              return r.estado_stock === 'CRITICO';
            }).length,
            en_bajo: rows.filter(function (r) {
              return r.estado_stock === 'BAJO';
            }).length,
            valor_total_inventario: parseFloat(valorTotal.toFixed(2))
          };
          res.json({
            resumen: resumen,
            materias: rows
          });
          _context2.next = 18;
          break;
        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](3);
          console.error('Error stock actual:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener stock'
          });
        case 18:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[3, 14]]);
  }));
  return function getStockActual(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var getProductosRentables = exports.getProductosRentables = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, _req$query$dias, dias, _yield$pool$query7, _yield$pool$query8, rows;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          _req$query$dias = req.query.dias, dias = _req$query$dias === void 0 ? 30 : _req$query$dias;
          _context3.prev = 4;
          _context3.next = 7;
          return pool.query("\n            SELECT \n                p.producto_id,\n                p.codigo,\n                p.nombre,\n                p.categoria,\n                p.precio_venta,\n                COALESCE(c.costo_unitario, 0) AS costo_unitario,\n                ROUND(p.precio_venta - COALESCE(c.costo_unitario, 0), 2) AS margen_unitario_bs,\n                ROUND(((p.precio_venta - COALESCE(c.costo_unitario, 0)) / p.precio_venta) * 100, 1) AS margen_porcentual,\n                COALESCE(SUM(vd.cantidad), 0) AS unidades_vendidas_ultimos_dias,\n                COALESCE(SUM(vd.subtotal), 0) AS ingresos_generados\n            FROM productos p\n            LEFT JOIN vw_costo_productos c ON p.producto_id = c.producto_id\n            LEFT JOIN ventadetalle vd ON p.producto_id = vd.producto_id\n            LEFT JOIN ventas v ON vd.venta_id = v.venta_id \n                AND DATE(v.fecha) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)\n            WHERE p.activo = 1\n            GROUP BY p.producto_id\n            ORDER BY margen_porcentual DESC, unidades_vendidas_ultimos_dias DESC\n            LIMIT 20\n        ", [dias]);
        case 7:
          _yield$pool$query7 = _context3.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          rows = _yield$pool$query8[0];
          res.json(rows);
          _context3.next = 17;
          break;
        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](4);
          console.error('Error productos rentables:', _context3.t0);
          res.status(500).json({
            message: 'Error al calcular rentabilidad'
          });
        case 17:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[4, 13]]);
  }));
  return function getProductosRentables(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var getMovimientosRecientes = exports.getMovimientosRecientes = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, _yield$pool$query9, _yield$pool$query10, rows;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          _context4.prev = 3;
          _context4.next = 6;
          return pool.query("\n            SELECT \n                mi.movimiento_id,\n                mi.fecha,\n                mp.nombre AS materia,\n                mi.tipo,\n                mi.cantidad,\n                mi.usuario,\n                mi.observacion\n            FROM movimientosinventario mi\n            JOIN materiasprimas mp ON mi.materia_id = mp.materia_id\n            ORDER BY mi.fecha DESC\n            LIMIT 100\n        ");
        case 6:
          _yield$pool$query9 = _context4.sent;
          _yield$pool$query10 = (0, _slicedToArray2["default"])(_yield$pool$query9, 1);
          rows = _yield$pool$query10[0];
          res.json(rows);
          _context4.next = 16;
          break;
        case 12:
          _context4.prev = 12;
          _context4.t0 = _context4["catch"](3);
          console.error('Error movimientos recientes:', _context4.t0);
          res.status(500).json({
            message: 'Error al obtener movimientos'
          });
        case 16:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[3, 12]]);
  }));
  return function getMovimientosRecientes(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
var getClientesFrecuentes = exports.getClientesFrecuentes = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, _req$query$limite, limite, _yield$pool$query11, _yield$pool$query12, rows;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          _req$query$limite = req.query.limite, limite = _req$query$limite === void 0 ? 15 : _req$query$limite;
          _context5.prev = 4;
          _context5.next = 7;
          return pool.query("\n            SELECT \n                c.cliente_id,\n                c.nit_ci,\n                c.nombre,\n                c.telefono,\n                c.tipo AS tipo_cliente,\n                COUNT(v.venta_id) AS total_compras,\n                COALESCE(SUM(v.total), 0) AS total_gastado_bs,\n                MAX(v.fecha) AS ultima_compra\n            FROM clientes c\n            LEFT JOIN ventas v ON c.cliente_id = v.cliente_id\n            GROUP BY c.cliente_id\n            HAVING total_compras > 0\n            ORDER BY total_gastado_bs DESC\n            LIMIT ?\n        ", [parseInt(limite)]);
        case 7:
          _yield$pool$query11 = _context5.sent;
          _yield$pool$query12 = (0, _slicedToArray2["default"])(_yield$pool$query11, 1);
          rows = _yield$pool$query12[0];
          res.json(rows);
          _context5.next = 17;
          break;
        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](4);
          console.error('Error clientes frecuentes:', _context5.t0);
          res.status(500).json({
            message: 'Error al obtener clientes'
          });
        case 17:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[4, 13]]);
  }));
  return function getClientesFrecuentes(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
var getPromocionesActivas = exports.getPromocionesActivas = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var pool, _yield$pool$query13, _yield$pool$query14, rows;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context6.sent;
          _context6.prev = 3;
          _context6.next = 6;
          return pool.query("\n            SELECT \n                p.promocion_id,\n                p.nombre,\n                p.tipo,\n                p.valor,\n                p.fecha_inicio,\n                p.fecha_fin,\n                p.producto_id,\n                COALESCE(COUNT(v.venta_id), 0) AS veces_aplicada,\n                COALESCE(SUM(v.descuento), 0) AS descuento_total_otorgado\n            FROM promociones p\n            LEFT JOIN ventas v ON v.promocion_id = p.promocion_id\n                AND DATE(v.fecha) BETWEEN p.fecha_inicio AND p.fecha_fin\n            WHERE p.activo = 1\n              AND CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin\n            GROUP BY p.promocion_id\n            ORDER BY veces_aplicada DESC\n        ");
        case 6:
          _yield$pool$query13 = _context6.sent;
          _yield$pool$query14 = (0, _slicedToArray2["default"])(_yield$pool$query13, 1);
          rows = _yield$pool$query14[0];
          res.json(rows);
          _context6.next = 16;
          break;
        case 12:
          _context6.prev = 12;
          _context6.t0 = _context6["catch"](3);
          console.error('Error promociones:', _context6.t0);
          res.status(500).json({
            message: 'Error al obtener promociones'
          });
        case 16:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[3, 12]]);
  }));
  return function getPromocionesActivas(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();
var getVentasPorCategoria = exports.getVentasPorCategoria = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res) {
    var pool, _yield$pool$query15, _yield$pool$query16, rows;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context7.sent;
          _context7.prev = 3;
          _context7.next = 6;
          return pool.query("\n            SELECT \n                p.categoria,\n                COUNT(DISTINCT p.producto_id) AS productos_en_categoria,\n                SUM(vd.cantidad) AS unidades_vendidas,\n                SUM(vd.subtotal) AS ingresos_bs,\n                ROUND(SUM(vd.subtotal) / NULLIF(SUM(vd.cantidad), 0), 2) AS precio_promedio\n            FROM ventadetalle vd\n            JOIN productos p ON vd.producto_id = p.producto_id\n            JOIN ventas v ON vd.venta_id = v.venta_id\n            WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\n            GROUP BY p.categoria\n            ORDER BY ingresos_bs DESC\n        ");
        case 6:
          _yield$pool$query15 = _context7.sent;
          _yield$pool$query16 = (0, _slicedToArray2["default"])(_yield$pool$query15, 1);
          rows = _yield$pool$query16[0];
          res.json(rows);
          _context7.next = 16;
          break;
        case 12:
          _context7.prev = 12;
          _context7.t0 = _context7["catch"](3);
          console.error('Error ventas por categoría:', _context7.t0);
          res.status(500).json({
            message: 'Error al obtener ventas por categoría'
          });
        case 16:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[3, 12]]);
  }));
  return function getVentasPorCategoria(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();