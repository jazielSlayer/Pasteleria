"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVentas = exports.getVenta = exports.createVenta = exports.anularVenta = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/* ==================== LISTAR VENTAS (con filtros) ==================== */
var getVentas = exports.getVentas = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _req$query, fecha, cliente_id, _req$query$tipo, tipo, query, values, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _req$query = req.query, fecha = _req$query.fecha, cliente_id = _req$query.cliente_id, _req$query$tipo = _req$query.tipo, tipo = _req$query$tipo === void 0 ? 'MOSTRADOR' : _req$query$tipo;
          _context.prev = 4;
          query = "\n            SELECT \n                v.venta_id,\n                v.fecha,\n                v.cliente_id,\n                c.nombres + ' ' + c.apellidos AS cliente_nombre,\n                c.ci AS cliente_ci,\n                v.total_bs,\n                v.descuento_bs,\n                v.total_final_bs,\n                v.tipo_venta,\n                v.usuario,\n                v.estado\n            FROM Ventas v\n            LEFT JOIN Clientes c ON v.cliente_id = c.cliente_id\n            WHERE v.tipo_venta = ?\n        ";
          values = [tipo];
          if (fecha) {
            query += ' AND DATE(v.fecha) = ?';
            values.push(fecha);
          }
          if (cliente_id) {
            query += ' AND v.cliente_id = ?';
            values.push(cliente_id);
          }
          query += ' ORDER BY v.fecha DESC';
          _context.next = 12;
          return pool.query(query, values);
        case 12:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          rows = _yield$pool$query2[0];
          res.json(rows);
          _context.next = 22;
          break;
        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](4);
          console.error('Error fetching ventas:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener ventas'
          });
        case 22:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 18]]);
  }));
  return function getVentas(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* ==================== OBTENER VENTA COMPLETA + DETALLE ==================== */
var getVenta = exports.getVenta = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, id, _yield$pool$query3, _yield$pool$query4, cabezera, _yield$pool$query5, _yield$pool$query6, detalle, ganancia;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context2.sent;
          id = parseInt(req.params.id);
          if (!(isNaN(id) || id <= 0)) {
            _context2.next = 6;
            break;
          }
          return _context2.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 6:
          _context2.prev = 6;
          _context2.next = 9;
          return pool.query("\n            SELECT \n                v.*,\n                c.nombres + ' ' + c.apellidos AS cliente_nombre,\n                c.ci AS cliente_ci,\n                c.es_frecuente\n            FROM Ventas v\n            LEFT JOIN Clientes c ON v.cliente_id = c.cliente_id\n            WHERE v.venta_id = ?\n        ", [id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          cabezera = _yield$pool$query4[0];
          if (!(cabezera.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Venta no encontrada'
          }));
        case 14:
          _context2.next = 16;
          return pool.query("\n            SELECT \n                vd.*,\n                p.codigo,\n                p.nombre AS producto_nombre,\n                p.precio_venta,\n                COALESCE(costo.costo_unitario, 0) AS costo_unitario,\n                ROUND(vd.cantidad * COALESCE(costo.costo_unitario, 0), 2) AS costo_total\n            FROM VentaDetalle vd\n            JOIN Productos p ON vd.producto_id = p.producto_id\n            LEFT JOIN vw_costo_productos costo ON p.producto_id = costo.producto_id\n            WHERE vd.venta_id = ?\n            ORDER BY vd.item\n        ", [id]);
        case 16:
          _yield$pool$query5 = _context2.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          detalle = _yield$pool$query6[0];
          ganancia = detalle.reduce(function (sum, item) {
            return sum + item.precio_unitario * item.cantidad - item.costo_total;
          }, 0);
          res.json(_objectSpread(_objectSpread({}, cabezera[0]), {}, {
            items: detalle,
            ganancia_bruta: parseFloat(ganancia.toFixed(2)),
            items_count: detalle.length
          }));
          _context2.next = 27;
          break;
        case 23:
          _context2.prev = 23;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching venta:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener venta'
          });
        case 27:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 23]]);
  }));
  return function getVenta(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/* ==================== REGISTRAR VENTA COMPLETA (con promociones y descuento de stock) ==================== */
var createVenta = exports.createVenta = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, connection, _req$body, _req$body$cliente_id, cliente_id, items, _req$body$tipo_venta, tipo_venta, _req$body$usuario, usuario, _req$body$aplicar_pro, aplicar_promociones, subtotal, descuento_total, detalleValidado, _iterator, _step, _item, producto_id, cantidad, _yield$connection$que3, _yield$connection$que4, prod, producto, precio_final, descuento_item, promo_aplicada, hoy, _yield$connection$que5, _yield$connection$que6, promo, p, pagados, subtotal_item, total_final, _yield$connection$que, _yield$connection$que2, ventaResult, venta_id, i, item, puntos;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          _context3.next = 5;
          return pool.getConnection();
        case 5:
          connection = _context3.sent;
          _context3.prev = 6;
          _context3.next = 9;
          return connection.beginTransaction();
        case 9:
          _req$body = req.body, _req$body$cliente_id = _req$body.cliente_id, cliente_id = _req$body$cliente_id === void 0 ? null : _req$body$cliente_id, items = _req$body.items, _req$body$tipo_venta = _req$body.tipo_venta, tipo_venta = _req$body$tipo_venta === void 0 ? 'MOSTRADOR' : _req$body$tipo_venta, _req$body$usuario = _req$body.usuario, usuario = _req$body$usuario === void 0 ? 'Caja' : _req$body$usuario, _req$body$aplicar_pro = _req$body.aplicar_promociones, aplicar_promociones = _req$body$aplicar_pro === void 0 ? true : _req$body$aplicar_pro;
          if (!(!items || !Array.isArray(items) || items.length === 0)) {
            _context3.next = 12;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Items son obligatorios'
          }));
        case 12:
          // Validar productos y calcular total + promociones
          subtotal = 0;
          descuento_total = 0;
          detalleValidado = [];
          _iterator = _createForOfIteratorHelper(items);
          _context3.prev = 16;
          _iterator.s();
        case 18:
          if ((_step = _iterator.n()).done) {
            _context3.next = 48;
            break;
          }
          _item = _step.value;
          producto_id = _item.producto_id, cantidad = _item.cantidad;
          if (!(!producto_id || !cantidad || cantidad <= 0)) {
            _context3.next = 23;
            break;
          }
          throw new Error('Cada item debe tener producto_id y cantidad > 0');
        case 23:
          _context3.next = 25;
          return connection.query("\n                SELECT p.*, COALESCE(v.costo_unitario, 0) AS costo_unitario\n                FROM Productos p\n                LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id\n                WHERE p.producto_id = ? AND p.activo = 1\n            ", [producto_id]);
        case 25:
          _yield$connection$que3 = _context3.sent;
          _yield$connection$que4 = (0, _slicedToArray2["default"])(_yield$connection$que3, 1);
          prod = _yield$connection$que4[0];
          if (!(prod.length === 0)) {
            _context3.next = 30;
            break;
          }
          throw new Error("Producto ".concat(producto_id, " no encontrado o inactivo"));
        case 30:
          producto = prod[0];
          precio_final = producto.precio_venta;
          descuento_item = 0;
          promo_aplicada = null; // Aplicar promociones activas
          if (!aplicar_promociones) {
            _context3.next = 42;
            break;
          }
          hoy = new Date().toISOString().split('T')[0];
          _context3.next = 38;
          return connection.query("\n                    SELECT * FROM Promociones\n                    WHERE producto_id = ? AND activa = 1\n                      AND ? BETWEEN fecha_inicio AND fecha_fin\n                    ORDER BY descuento_porcentaje DESC, descuento_fijo_bs DESC\n                    LIMIT 1\n                ", [producto_id, hoy]);
        case 38:
          _yield$connection$que5 = _context3.sent;
          _yield$connection$que6 = (0, _slicedToArray2["default"])(_yield$connection$que5, 1);
          promo = _yield$connection$que6[0];
          if (promo.length > 0) {
            p = promo[0];
            if (p.tipo_promocion === 'PORCENTAJE') {
              descuento_item = precio_final * (p.descuento_porcentaje / 100);
              precio_final -= descuento_item;
              promo_aplicada = "".concat(p.descuento_porcentaje, "% OFF");
            } else if (p.tipo_promocion === 'FIJO') {
              descuento_item = p.descuento_fijo_bs;
              precio_final = Math.max(0, precio_final - descuento_item);
              promo_aplicada = "".concat(p.descuento_fijo_bs, " Bs OFF");
            } else if (p.tipo_promocion === '2X1' && cantidad >= 2) {
              pagados = Math.floor(cantidad / 2);
              descuento_item = precio_final * (cantidad - pagados);
              precio_final = precio_final * pagados / cantidad;
              promo_aplicada = '2x1';
            }
          }
        case 42:
          subtotal_item = precio_final * cantidad;
          subtotal += producto.precio_venta * cantidad;
          descuento_total += descuento_item * cantidad;
          detalleValidado.push({
            producto_id: producto_id,
            cantidad: parseFloat(cantidad),
            precio_unitario: parseFloat(producto.precio_venta.toFixed(2)),
            precio_final: parseFloat(precio_final.toFixed(2)),
            descuento_unitario: parseFloat(descuento_item.toFixed(2)),
            subtotal: parseFloat(subtotal_item.toFixed(2)),
            promo_aplicada: promo_aplicada
          });
        case 46:
          _context3.next = 18;
          break;
        case 48:
          _context3.next = 53;
          break;
        case 50:
          _context3.prev = 50;
          _context3.t0 = _context3["catch"](16);
          _iterator.e(_context3.t0);
        case 53:
          _context3.prev = 53;
          _iterator.f();
          return _context3.finish(53);
        case 56:
          total_final = detalleValidado.reduce(function (sum, i) {
            return sum + i.subtotal;
          }, 0); // Registrar cabezera
          _context3.next = 59;
          return connection.query("\n            INSERT INTO Ventas \n                (cliente_id, subtotal_bs, descuento_bs, total_final_bs, tipo_venta, usuario)\n            VALUES (?, ?, ?, ?, ?, ?)\n        ", [cliente_id || null, parseFloat(subtotal.toFixed(2)), parseFloat(descuento_total.toFixed(2)), parseFloat(total_final.toFixed(2)), tipo_venta, usuario]);
        case 59:
          _yield$connection$que = _context3.sent;
          _yield$connection$que2 = (0, _slicedToArray2["default"])(_yield$connection$que, 1);
          ventaResult = _yield$connection$que2[0];
          venta_id = ventaResult.insertId; // Registrar detalle
          i = 0;
        case 64:
          if (!(i < detalleValidado.length)) {
            _context3.next = 74;
            break;
          }
          item = detalleValidado[i];
          _context3.next = 68;
          return connection.query("\n                INSERT INTO VentaDetalle \n                    (venta_id, item, producto_id, cantidad, precio_unitario, precio_final, descuento_unitario, subtotal)\n                VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n            ", [venta_id, i + 1, item.producto_id, item.cantidad, item.precio_unitario, item.precio_final, item.descuento_unitario, item.subtotal]);
        case 68:
          if (!(tipo_venta === 'MOSTRADOR')) {
            _context3.next = 71;
            break;
          }
          _context3.next = 71;
          return connection.query("\n                    UPDATE Productos SET stock_actual = stock_actual - ? WHERE producto_id = ?\n                ", [item.cantidad, item.producto_id]);
        case 71:
          i++;
          _context3.next = 64;
          break;
        case 74:
          if (!cliente_id) {
            _context3.next = 79;
            break;
          }
          puntos = Math.floor(total_final / 10); // 1 punto por cada 10 Bs
          if (!(puntos > 0)) {
            _context3.next = 79;
            break;
          }
          _context3.next = 79;
          return connection.query("\n                    UPDATE Clientes SET puntos_acumulados = puntos_acumulados + ? WHERE cliente_id = ?\n                ", [puntos, cliente_id]);
        case 79:
          _context3.next = 81;
          return connection.commit();
        case 81:
          res.status(201).json({
            message: 'Venta registrada exitosamente',
            venta_id: venta_id,
            total_final_bs: parseFloat(total_final.toFixed(2)),
            descuento_aplicado: parseFloat(descuento_total.toFixed(2)),
            items: detalleValidado.length,
            puntos_ganados: cliente_id ? Math.floor(total_final / 10) : 0
          });
          _context3.next = 90;
          break;
        case 84:
          _context3.prev = 84;
          _context3.t1 = _context3["catch"](6);
          _context3.next = 88;
          return connection.rollback();
        case 88:
          console.error('Error creando venta:', _context3.t1);
          res.status(500).json({
            message: 'Error al registrar venta',
            error: _context3.t1.message || 'Datos inválidos'
          });
        case 90:
          _context3.prev = 90;
          connection.release();
          return _context3.finish(90);
        case 93:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 84, 90, 93], [16, 50, 53, 56]]);
  }));
  return function createVenta(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/* ==================== ANULAR VENTA (solo del día actual - revierte stock) ==================== */
var anularVenta = exports.anularVenta = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, connection, id, _yield$connection$que7, _yield$connection$que8, venta, v;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          _context4.next = 5;
          return pool.getConnection();
        case 5:
          connection = _context4.sent;
          id = parseInt(req.params.id);
          _context4.prev = 7;
          _context4.next = 10;
          return connection.beginTransaction();
        case 10:
          _context4.next = 12;
          return connection.query('SELECT * FROM Ventas WHERE venta_id = ? AND DATE(fecha) = CURDATE()', [id]);
        case 12:
          _yield$connection$que7 = _context4.sent;
          _yield$connection$que8 = (0, _slicedToArray2["default"])(_yield$connection$que7, 1);
          venta = _yield$connection$que8[0];
          if (!(venta.length === 0)) {
            _context4.next = 17;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Venta no encontrada o no es del día actual'
          }));
        case 17:
          v = venta[0]; // Revertir stock
          if (!(v.tipo_venta === 'MOSTRADOR')) {
            _context4.next = 21;
            break;
          }
          _context4.next = 21;
          return connection.query("\n                UPDATE Productos p\n                JOIN VentaDetalle vd ON p.producto_id = vd.producto_id\n                SET p.stock_actual = p.stock_actual + vd.cantidad\n                WHERE vd.venta_id = ?\n            ", [id]);
        case 21:
          _context4.next = 23;
          return connection.query('UPDATE Ventas SET estado = "ANULADA", total_final_bs = 0 WHERE venta_id = ?', [id]);
        case 23:
          _context4.next = 25;
          return connection.commit();
        case 25:
          res.json({
            message: 'Venta anulada y stock revertido correctamente'
          });
          _context4.next = 34;
          break;
        case 28:
          _context4.prev = 28;
          _context4.t0 = _context4["catch"](7);
          _context4.next = 32;
          return connection.rollback();
        case 32:
          console.error('Error anulando venta:', _context4.t0);
          res.status(500).json({
            message: 'Error al anular venta'
          });
        case 34:
          _context4.prev = 34;
          connection.release();
          return _context4.finish(34);
        case 37:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[7, 28, 34, 37]]);
  }));
  return function anularVenta(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();