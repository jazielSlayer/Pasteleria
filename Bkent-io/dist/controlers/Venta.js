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
    var pool, _req$query, fecha, cliente_id, query, values, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _req$query = req.query, fecha = _req$query.fecha, cliente_id = _req$query.cliente_id;
          _context.prev = 4;
          query = "\n            SELECT \n                v.venta_id,\n                v.fecha,\n                v.cliente_id,\n                c.nombre AS cliente_nombre,\n                c.nit_ci AS cliente_ci,\n                v.subtotal,\n                v.descuento,\n                v.total,\n                v.metodo_pago,\n                v.vendedor,\n                v.numero_factura\n            FROM ventas v\n            LEFT JOIN clientes c ON v.cliente_id = c.cliente_id\n            WHERE 1=1\n        ";
          values = [];
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
            message: 'Error al obtener ventas',
            error: _context.t0.message
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

/* ==================== OBTENER VENTA + DETALLE ==================== */
var getVenta = exports.getVenta = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, id, _yield$pool$query3, _yield$pool$query4, cabezera, _yield$pool$query5, _yield$pool$query6, detalle;
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
          return pool.query("\n            SELECT \n                v.*,\n                c.nombre AS cliente_nombre,\n                c.nit_ci AS cliente_ci\n            FROM ventas v\n            LEFT JOIN clientes c ON v.cliente_id = c.cliente_id\n            WHERE v.venta_id = ?\n        ", [id]);
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
          return pool.query("\n            SELECT \n                vd.*,\n                p.codigo,\n                p.nombre AS producto_nombre,\n                p.precio_venta\n            FROM ventadetalle vd\n            JOIN productos p ON vd.producto_id = p.producto_id\n            WHERE vd.venta_id = ?\n            ORDER BY vd.detalle_id\n        ", [id]);
        case 16:
          _yield$pool$query5 = _context2.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          detalle = _yield$pool$query6[0];
          res.json(_objectSpread(_objectSpread({}, cabezera[0]), {}, {
            items: detalle,
            items_count: detalle.length
          }));
          _context2.next = 26;
          break;
        case 22:
          _context2.prev = 22;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching venta:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener venta',
            error: _context2.t0.message
          });
        case 26:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 22]]);
  }));
  return function getVenta(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/* ==================== CREAR VENTA (CORREGIDO PARA TU SISTEMA REAL) ==================== */
var createVenta = exports.createVenta = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, connection, _req$body, _req$body$cliente_id, cliente_id, _req$body$items, items, _req$body$metodo_pago, metodo_pago, _req$body$vendedor, vendedor, _req$body$tipo_compro, tipo_comprobante, _req$body$numero_fact, numero_factura, subtotal, descuento_cliente, detalleFinal, _iterator, _step, _item, producto_id, cantidad, _yield$connection$que5, _yield$connection$que6, prod, producto, precio, subtotalItem, _yield$connection$que, _yield$connection$que2, cli, total, _yield$connection$que3, _yield$connection$que4, result, venta_id, _i, _detalleFinal, item;
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
          _req$body = req.body, _req$body$cliente_id = _req$body.cliente_id, cliente_id = _req$body$cliente_id === void 0 ? null : _req$body$cliente_id, _req$body$items = _req$body.items, items = _req$body$items === void 0 ? [] : _req$body$items, _req$body$metodo_pago = _req$body.metodo_pago, metodo_pago = _req$body$metodo_pago === void 0 ? 'EFECTIVO' : _req$body$metodo_pago, _req$body$vendedor = _req$body.vendedor, vendedor = _req$body$vendedor === void 0 ? 'Caja' : _req$body$vendedor, _req$body$tipo_compro = _req$body.tipo_comprobante, tipo_comprobante = _req$body$tipo_compro === void 0 ? 'FACTURA' : _req$body$tipo_compro, _req$body$numero_fact = _req$body.numero_factura, numero_factura = _req$body$numero_fact === void 0 ? null : _req$body$numero_fact;
          if (!(!Array.isArray(items) || items.length === 0)) {
            _context3.next = 12;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Debe agregar al menos un producto'
          }));
        case 12:
          subtotal = 0;
          descuento_cliente = 0;
          detalleFinal = [];
          _iterator = _createForOfIteratorHelper(items);
          _context3.prev = 16;
          _iterator.s();
        case 18:
          if ((_step = _iterator.n()).done) {
            _context3.next = 37;
            break;
          }
          _item = _step.value;
          producto_id = _item.producto_id, cantidad = _item.cantidad;
          if (!(!producto_id || !cantidad || cantidad <= 0)) {
            _context3.next = 23;
            break;
          }
          throw new Error('Producto y cantidad son obligatorios');
        case 23:
          _context3.next = 25;
          return connection.query('SELECT producto_id, nombre, precio_venta FROM productos WHERE producto_id = ? AND activo = 1', [producto_id]);
        case 25:
          _yield$connection$que5 = _context3.sent;
          _yield$connection$que6 = (0, _slicedToArray2["default"])(_yield$connection$que5, 1);
          prod = _yield$connection$que6[0];
          if (!(prod.length === 0)) {
            _context3.next = 30;
            break;
          }
          throw new Error("Producto ID ".concat(producto_id, " no encontrado o inactivo"));
        case 30:
          producto = prod[0];
          precio = parseFloat(producto.precio_venta);
          subtotalItem = precio * parseFloat(cantidad);
          subtotal += subtotalItem;
          detalleFinal.push({
            producto_id: producto_id,
            cantidad: parseFloat(cantidad),
            precio_unitario: precio,
            subtotal: subtotalItem
          });
        case 35:
          _context3.next = 18;
          break;
        case 37:
          _context3.next = 42;
          break;
        case 39:
          _context3.prev = 39;
          _context3.t0 = _context3["catch"](16);
          _iterator.e(_context3.t0);
        case 42:
          _context3.prev = 42;
          _iterator.f();
          return _context3.finish(42);
        case 45:
          if (!cliente_id) {
            _context3.next = 52;
            break;
          }
          _context3.next = 48;
          return connection.query('SELECT descuento_porcentaje FROM clientes WHERE cliente_id = ?', [cliente_id]);
        case 48:
          _yield$connection$que = _context3.sent;
          _yield$connection$que2 = (0, _slicedToArray2["default"])(_yield$connection$que, 1);
          cli = _yield$connection$que2[0];
          if (cli.length > 0 && cli[0].descuento_porcentaje > 0) {
            descuento_cliente = subtotal * (cli[0].descuento_porcentaje / 100);
          }
        case 52:
          total = subtotal - descuento_cliente;
          _context3.next = 55;
          return connection.query("\n            INSERT INTO ventas \n                (cliente_id, subtotal, descuento, total, metodo_pago, vendedor, tipo_comprobante, numero_factura)\n            VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n        ", [cliente_id, subtotal, descuento_cliente, total, metodo_pago, vendedor, tipo_comprobante, numero_factura]);
        case 55:
          _yield$connection$que3 = _context3.sent;
          _yield$connection$que4 = (0, _slicedToArray2["default"])(_yield$connection$que3, 1);
          result = _yield$connection$que4[0];
          venta_id = result.insertId; // Insertar detalle (sin tocar stock)
          _i = 0, _detalleFinal = detalleFinal;
        case 60:
          if (!(_i < _detalleFinal.length)) {
            _context3.next = 67;
            break;
          }
          item = _detalleFinal[_i];
          _context3.next = 64;
          return connection.query("\n                INSERT INTO ventadetalle \n                    (venta_id, producto_id, cantidad, precio_unitario, subtotal)\n                VALUES (?, ?, ?, ?, ?)\n            ", [venta_id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]);
        case 64:
          _i++;
          _context3.next = 60;
          break;
        case 67:
          _context3.next = 69;
          return connection.commit();
        case 69:
          res.status(201).json({
            message: 'Venta registrada exitosamente',
            venta_id: venta_id,
            subtotal: parseFloat(subtotal.toFixed(2)),
            descuento: parseFloat(descuento_cliente.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            items_count: items.length
          });
          _context3.next = 78;
          break;
        case 72:
          _context3.prev = 72;
          _context3.t1 = _context3["catch"](6);
          _context3.next = 76;
          return connection.rollback();
        case 76:
          console.error('Error creando venta:', _context3.t1);
          res.status(500).json({
            message: 'Error al crear venta',
            error: _context3.t1.message
          });
        case 78:
          _context3.prev = 78;
          connection.release();
          return _context3.finish(78);
        case 81:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 72, 78, 81], [16, 39, 42, 45]]);
  }));
  return function createVenta(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/* ==================== ANULAR VENTA (solo del día actual) ==================== */
var anularVenta = exports.anularVenta = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, connection, id, _yield$connection$que7, _yield$connection$que8, venta;
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
          return connection.query('SELECT * FROM ventas WHERE venta_id = ? AND DATE(fecha) = CURDATE()', [id]);
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
          _context4.next = 19;
          return connection.query("\n            UPDATE productos p\n            JOIN ventadetalle vd ON p.producto_id = vd.producto_id\n            SET p.stock_actual = p.stock_actual + vd.cantidad\n            WHERE vd.venta_id = ?\n        ", [id]);
        case 19:
          _context4.next = 21;
          return connection.query("\n            UPDATE ventas \n            SET total = 0, descuento = subtotal, metodo_pago = 'ANULADA'\n            WHERE venta_id = ?\n        ", [id]);
        case 21:
          _context4.next = 23;
          return connection.commit();
        case 23:
          // ¡AHORA SÍ ES COMMIT, NO MYTHOLOGY!

          res.json({
            message: 'Venta anulada y stock restaurado correctamente'
          });
          _context4.next = 32;
          break;
        case 26:
          _context4.prev = 26;
          _context4.t0 = _context4["catch"](7);
          _context4.next = 30;
          return connection.rollback();
        case 30:
          console.error('Error anulando venta:', _context4.t0);
          res.status(500).json({
            message: 'Error al anular venta'
          });
        case 32:
          _context4.prev = 32;
          connection.release();
          return _context4.finish(32);
        case 35:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[7, 26, 32, 35]]);
  }));
  return function anularVenta(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();