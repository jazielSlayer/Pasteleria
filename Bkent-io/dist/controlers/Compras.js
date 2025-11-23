"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recibirCompra = exports.getCompras = exports.getCompra = exports.createCompra = exports.cancelarCompra = void 0;
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
// ======================== LISTAR TODAS LAS COMPRAS ========================
var getCompras = exports.getCompras = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _context.prev = 3;
          _context.next = 6;
          return pool.query("\n            SELECT \n                c.compra_id,\n                c.fecha_compra,\n                c.numero_factura,\n                c.total_bs,\n                c.estado,\n                p.nombre AS proveedor_nombre,\n                p.nit AS proveedor_nit\n            FROM Compras c\n            JOIN Proveedores p ON c.proveedor_id = p.proveedor_id\n            WHERE p.activo = 1\n            ORDER BY c.fecha_compra DESC, c.compra_id DESC\n        ");
        case 6:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          rows = _yield$pool$query2[0];
          res.json(rows);
          _context.next = 16;
          break;
        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](3);
          console.error('Error fetching compras:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener compras'
          });
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 12]]);
  }));
  return function getCompras(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// ======================== OBTENER UNA COMPRA + DETALLE ========================
var getCompra = exports.getCompra = /*#__PURE__*/function () {
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
            message: 'ID de compra inválido'
          }));
        case 6:
          _context2.prev = 6;
          _context2.next = 9;
          return pool.query("\n            SELECT \n                c.*,\n                p.nombre AS proveedor_nombre,\n                p.nit AS proveedor_nit,\n                p.telefono AS proveedor_telefono\n            FROM Compras c\n            JOIN Proveedores p ON c.proveedor_id = p.proveedor_id\n            WHERE c.compra_id = ?\n        ", [id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          cabezera = _yield$pool$query4[0];
          if (!(cabezera.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Compra no encontrada'
          }));
        case 14:
          _context2.next = 16;
          return pool.query("\n            SELECT \n                cd.detalle_id,\n                cd.materia_id,\n                mp.codigo,\n                mp.nombre AS materia_nombre,\n                mp.unidad,\n                cd.cantidad,\n                cd.precio_unitario,\n                cd.subtotal\n            FROM CompraDetalle cd\n            JOIN MateriasPrimas mp ON cd.materia_id = mp.materia_id\n            WHERE cd.compra_id = ?\n            ORDER BY mp.nombre\n        ", [id]);
        case 16:
          _yield$pool$query5 = _context2.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          detalle = _yield$pool$query6[0];
          res.json(_objectSpread(_objectSpread({}, cabezera[0]), {}, {
            items: detalle
          }));
          _context2.next = 26;
          break;
        case 22:
          _context2.prev = 22;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching compra:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener compra'
          });
        case 26:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 22]]);
  }));
  return function getCompra(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

// ======================== CREAR NUEVA COMPRA (con detalle) ========================
var createCompra = exports.createCompra = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, connection, _req$body, proveedor_id, numero_factura, items, _yield$connection$que, _yield$connection$que2, prov, total_bs, detalleValidado, _iterator, _step, _item, materia_id, cantidad, precio_unitario, _yield$connection$que5, _yield$connection$que6, materia, subtotal, _yield$connection$que3, _yield$connection$que4, resultCabezera, compra_id, _i, _detalleValidado, item;
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
          _req$body = req.body, proveedor_id = _req$body.proveedor_id, numero_factura = _req$body.numero_factura, items = _req$body.items; // Validaciones
          if (!(!proveedor_id || !items || !Array.isArray(items) || items.length === 0)) {
            _context3.next = 12;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Faltan datos: proveedor_id y items[] son obligatorios'
          }));
        case 12:
          _context3.next = 14;
          return connection.query('SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ? AND activo = 1', [proveedor_id]);
        case 14:
          _yield$connection$que = _context3.sent;
          _yield$connection$que2 = (0, _slicedToArray2["default"])(_yield$connection$que, 1);
          prov = _yield$connection$que2[0];
          if (!(prov.length === 0)) {
            _context3.next = 19;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Proveedor no encontrado o inactivo'
          }));
        case 19:
          total_bs = 0;
          detalleValidado = [];
          _iterator = _createForOfIteratorHelper(items);
          _context3.prev = 22;
          _iterator.s();
        case 24:
          if ((_step = _iterator.n()).done) {
            _context3.next = 43;
            break;
          }
          _item = _step.value;
          materia_id = _item.materia_id, cantidad = _item.cantidad, precio_unitario = _item.precio_unitario;
          if (!(!materia_id || !cantidad || !precio_unitario)) {
            _context3.next = 29;
            break;
          }
          throw new Error('Todos los items deben tener materia_id, cantidad y precio_unitario');
        case 29:
          if (!(cantidad <= 0 || precio_unitario <= 0)) {
            _context3.next = 31;
            break;
          }
          throw new Error('Cantidad y precio deben ser mayores a 0');
        case 31:
          _context3.next = 33;
          return connection.query('SELECT materia_id, nombre FROM MateriasPrimas WHERE materia_id = ?', [materia_id]);
        case 33:
          _yield$connection$que5 = _context3.sent;
          _yield$connection$que6 = (0, _slicedToArray2["default"])(_yield$connection$que5, 1);
          materia = _yield$connection$que6[0];
          if (!(materia.length === 0)) {
            _context3.next = 38;
            break;
          }
          throw new Error("Materia prima ID ".concat(materia_id, " no existe"));
        case 38:
          subtotal = parseFloat(cantidad) * parseFloat(precio_unitario);
          total_bs += subtotal;
          detalleValidado.push({
            materia_id: parseInt(materia_id),
            cantidad: parseFloat(cantidad),
            precio_unitario: parseFloat(precio_unitario),
            subtotal: subtotal
          });
        case 41:
          _context3.next = 24;
          break;
        case 43:
          _context3.next = 48;
          break;
        case 45:
          _context3.prev = 45;
          _context3.t0 = _context3["catch"](22);
          _iterator.e(_context3.t0);
        case 48:
          _context3.prev = 48;
          _iterator.f();
          return _context3.finish(48);
        case 51:
          _context3.next = 53;
          return connection.query("\n            INSERT INTO Compras (proveedor_id, numero_factura, total_bs, estado)\n            VALUES (?, ?, ?, 'PENDIENTE')\n        ", [proveedor_id, (numero_factura === null || numero_factura === void 0 ? void 0 : numero_factura.trim()) || null, parseFloat(total_bs.toFixed(2))]);
        case 53:
          _yield$connection$que3 = _context3.sent;
          _yield$connection$que4 = (0, _slicedToArray2["default"])(_yield$connection$que3, 1);
          resultCabezera = _yield$connection$que4[0];
          compra_id = resultCabezera.insertId; // Insertar detalle
          _i = 0, _detalleValidado = detalleValidado;
        case 58:
          if (!(_i < _detalleValidado.length)) {
            _context3.next = 65;
            break;
          }
          item = _detalleValidado[_i];
          _context3.next = 62;
          return connection.query("\n                INSERT INTO CompraDetalle (compra_id, materia_id, cantidad, precio_unitario)\n                VALUES (?, ?, ?, ?)\n            ", [compra_id, item.materia_id, item.cantidad, item.precio_unitario]);
        case 62:
          _i++;
          _context3.next = 58;
          break;
        case 65:
          _context3.next = 67;
          return connection.commit();
        case 67:
          res.status(201).json({
            message: 'Compra creada exitosamente',
            compra_id: compra_id,
            total_bs: parseFloat(total_bs.toFixed(2)),
            estado: 'PENDIENTE',
            items_count: detalleValidado.length
          });
          _context3.next = 76;
          break;
        case 70:
          _context3.prev = 70;
          _context3.t1 = _context3["catch"](6);
          _context3.next = 74;
          return connection.rollback();
        case 74:
          console.error('Error creating compra:', _context3.t1);
          res.status(500).json({
            message: 'Error al crear compra',
            error: _context3.t1.message || 'Datos inválidos en el detalle'
          });
        case 76:
          _context3.prev = 76;
          connection.release();
          return _context3.finish(76);
        case 79:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 70, 76, 79], [22, 45, 48, 51]]);
  }));
  return function createCompra(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

// ======================== RECIBIR COMPRA (actualiza stock y costo promedio) ========================
var recibirCompra = exports.recibirCompra = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, connection, id, _yield$connection$que7, _yield$connection$que8, compra, _yield$connection$que9, _yield$connection$que10, detalles, _iterator2, _step2, item, materia_id, cantidad, precio_unitario, _yield$connection$que11, _yield$connection$que12, mp, actual, nuevo_stock, costo_nuevo;
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
          if (!(isNaN(id) || id <= 0)) {
            _context4.next = 9;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 9:
          _context4.prev = 9;
          _context4.next = 12;
          return connection.beginTransaction();
        case 12:
          _context4.next = 14;
          return connection.query('SELECT * FROM Compras WHERE compra_id = ? AND estado = "PENDIENTE"', [id]);
        case 14:
          _yield$connection$que7 = _context4.sent;
          _yield$connection$que8 = (0, _slicedToArray2["default"])(_yield$connection$que7, 1);
          compra = _yield$connection$que8[0];
          if (!(compra.length === 0)) {
            _context4.next = 19;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Compra no encontrada o ya fue recibida/cancelada'
          }));
        case 19:
          _context4.next = 21;
          return connection.query('SELECT * FROM CompraDetalle WHERE compra_id = ?', [id]);
        case 21:
          _yield$connection$que9 = _context4.sent;
          _yield$connection$que10 = (0, _slicedToArray2["default"])(_yield$connection$que9, 1);
          detalles = _yield$connection$que10[0];
          _iterator2 = _createForOfIteratorHelper(detalles);
          _context4.prev = 25;
          _iterator2.s();
        case 27:
          if ((_step2 = _iterator2.n()).done) {
            _context4.next = 44;
            break;
          }
          item = _step2.value;
          materia_id = item.materia_id, cantidad = item.cantidad, precio_unitario = item.precio_unitario; // Obtener stock actual y costo promedio actual
          _context4.next = 32;
          return connection.query('SELECT stock_actual, costo_promedio FROM MateriasPrimas WHERE materia_id = ?', [materia_id]);
        case 32:
          _yield$connection$que11 = _context4.sent;
          _yield$connection$que12 = (0, _slicedToArray2["default"])(_yield$connection$que11, 1);
          mp = _yield$connection$que12[0];
          actual = mp[0];
          nuevo_stock = actual.stock_actual + cantidad;
          costo_nuevo = (actual.stock_actual * actual.costo_promedio + cantidad * precio_unitario) / nuevo_stock; // Actualizar materia prima
          _context4.next = 40;
          return connection.query("\n                UPDATE MateriasPrimas \n                SET stock_actual = ?, costo_promedio = ? \n                WHERE materia_id = ?\n            ", [nuevo_stock, parseFloat(costo_nuevo.toFixed(4)), materia_id]);
        case 40:
          _context4.next = 42;
          return connection.query("\n                INSERT INTO MovimientosInventario \n                    (materia_id, tipo, cantidad, referencia_id, observacion)\n                VALUES (?, 'COMPRA', ?, ?, 'Compra recibida')\n            ", [materia_id, cantidad, id]);
        case 42:
          _context4.next = 27;
          break;
        case 44:
          _context4.next = 49;
          break;
        case 46:
          _context4.prev = 46;
          _context4.t0 = _context4["catch"](25);
          _iterator2.e(_context4.t0);
        case 49:
          _context4.prev = 49;
          _iterator2.f();
          return _context4.finish(49);
        case 52:
          _context4.next = 54;
          return connection.query('UPDATE Compras SET estado = "RECIBIDA" WHERE compra_id = ?', [id]);
        case 54:
          _context4.next = 56;
          return connection.commit();
        case 56:
          res.json({
            message: 'Compra recibida correctamente. Stock y costos actualizados.'
          });
          _context4.next = 65;
          break;
        case 59:
          _context4.prev = 59;
          _context4.t1 = _context4["catch"](9);
          _context4.next = 63;
          return connection.rollback();
        case 63:
          console.error('Error recibiendo compra:', _context4.t1);
          res.status(500).json({
            message: 'Error al recibir la compra'
          });
        case 65:
          _context4.prev = 65;
          connection.release();
          return _context4.finish(65);
        case 68:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[9, 59, 65, 68], [25, 46, 49, 52]]);
  }));
  return function recibirCompra(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

// ======================== CANCELAR COMPRA (solo si está PENDIENTE) ========================
var cancelarCompra = exports.cancelarCompra = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, id, _yield$pool$query7, _yield$pool$query8, result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          id = parseInt(req.params.id);
          _context5.prev = 4;
          _context5.next = 7;
          return pool.query("\n            UPDATE Compras SET estado = 'CANCELADA' \n            WHERE compra_id = ? AND estado = 'PENDIENTE'\n        ", [id]);
        case 7:
          _yield$pool$query7 = _context5.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          result = _yield$pool$query8[0];
          if (!(result.affectedRows === 0)) {
            _context5.next = 12;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'Compra no encontrada o ya fue procesada'
          }));
        case 12:
          res.json({
            message: 'Compra cancelada correctamente'
          });
          _context5.next = 19;
          break;
        case 15:
          _context5.prev = 15;
          _context5.t0 = _context5["catch"](4);
          console.error('Error cancelando compra:', _context5.t0);
          res.status(500).json({
            message: 'Error al cancelar compra'
          });
        case 19:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[4, 15]]);
  }));
  return function cancelarCompra(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();