"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updatePromocion = exports.getPromociones = exports.getPromocion = exports.deletePromocion = exports.createPromocion = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/* ==================== LISTAR PROMOCIONES ACTIVAS ==================== */
var getPromociones = exports.getPromociones = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _req$query, _req$query$activa, activa, fecha, hoy, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _req$query = req.query, _req$query$activa = _req$query.activa, activa = _req$query$activa === void 0 ? 1 : _req$query$activa, fecha = _req$query.fecha;
          hoy = fecha || new Date().toISOString().split('T')[0];
          _context.prev = 5;
          _context.next = 8;
          return pool.query("\n            SELECT \n                p.promocion_id,\n                p.nombre,\n                p.descripcion,\n                p.tipo_promocion,\n                p.descuento_porcentaje,\n                p.descuento_fijo_bs,\n                p.cantidad_requerida,\n                p.cantidad_gratis,\n                p.producto_id,\n                pr.codigo AS producto_codigo,\n                pr.nombre AS producto_nombre,\n                p.fecha_inicio,\n                p.fecha_fin,\n                p.activa,\n                CASE \n                    WHEN ? BETWEEN p.fecha_inicio AND p.fecha_fin AND p.activa = 1 THEN 1\n                    ELSE 0 \n                END AS vigente_hoy\n            FROM Promociones p\n            LEFT JOIN Productos pr ON p.producto_id = pr.producto_id\n            WHERE p.activa = ?\n            ORDER BY p.fecha_inicio DESC, p.nombre\n        ", [hoy, activa === '0' ? 0 : 1]);
        case 8:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          rows = _yield$pool$query2[0];
          res.json(rows);
          _context.next = 18;
          break;
        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](5);
          console.error('Error fetching promociones:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener promociones'
          });
        case 18:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[5, 14]]);
  }));
  return function getPromociones(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* ==================== OBTENER UNA PROMOCIÓN POR ID ==================== */
var getPromocion = exports.getPromocion = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, id, _yield$pool$query3, _yield$pool$query4, rows, promo, hoy, vigente;
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
          return pool.query("\n            SELECT \n                p.*,\n                pr.codigo AS producto_codigo,\n                pr.nombre AS producto_nombre,\n                pr.precio_venta\n            FROM Promociones p\n            LEFT JOIN Productos pr ON p.producto_id = pr.producto_id\n            WHERE p.promocion_id = ?\n        ", [id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          rows = _yield$pool$query4[0];
          if (!(rows.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Promoción no encontrada'
          }));
        case 14:
          promo = rows[0];
          hoy = new Date().toISOString().split('T')[0];
          vigente = hoy >= promo.fecha_inicio && hoy <= promo.fecha_fin && promo.activa;
          res.json(_objectSpread(_objectSpread({}, promo), {}, {
            vigente_hoy: vigente
          }));
          _context2.next = 24;
          break;
        case 20:
          _context2.prev = 20;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching promoción:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener promoción'
          });
        case 24:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 20]]);
  }));
  return function getPromocion(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/* ==================== CREAR NUEVA PROMOCIÓN ==================== */
var createPromocion = exports.createPromocion = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, _req$body, nombre, _req$body$descripcion, descripcion, tipo_promocion, _req$body$descuento_p, descuento_porcentaje, _req$body$descuento_f, descuento_fijo_bs, _req$body$cantidad_re, cantidad_requerida, _req$body$cantidad_gr, cantidad_gratis, _req$body$producto_id, producto_id, fecha_inicio, fecha_fin, _req$body$activa, activa, tiposValidos, tipo, _yield$pool$query5, _yield$pool$query6, prod, _yield$pool$query7, _yield$pool$query8, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          _req$body = req.body, nombre = _req$body.nombre, _req$body$descripcion = _req$body.descripcion, descripcion = _req$body$descripcion === void 0 ? null : _req$body$descripcion, tipo_promocion = _req$body.tipo_promocion, _req$body$descuento_p = _req$body.descuento_porcentaje, descuento_porcentaje = _req$body$descuento_p === void 0 ? null : _req$body$descuento_p, _req$body$descuento_f = _req$body.descuento_fijo_bs, descuento_fijo_bs = _req$body$descuento_f === void 0 ? null : _req$body$descuento_f, _req$body$cantidad_re = _req$body.cantidad_requerida, cantidad_requerida = _req$body$cantidad_re === void 0 ? 1 : _req$body$cantidad_re, _req$body$cantidad_gr = _req$body.cantidad_gratis, cantidad_gratis = _req$body$cantidad_gr === void 0 ? 0 : _req$body$cantidad_gr, _req$body$producto_id = _req$body.producto_id, producto_id = _req$body$producto_id === void 0 ? null : _req$body$producto_id, fecha_inicio = _req$body.fecha_inicio, fecha_fin = _req$body.fecha_fin, _req$body$activa = _req$body.activa, activa = _req$body$activa === void 0 ? 1 : _req$body$activa;
          _context3.prev = 4;
          if (!(!nombre || !tipo_promocion || !fecha_inicio || !fecha_fin)) {
            _context3.next = 7;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Nombre, tipo, fecha_inicio y fecha_fin son obligatorios'
          }));
        case 7:
          tiposValidos = ['PORCENTAJE', 'FIJO', '2X1', '3X2', 'GRATIS'];
          if (tiposValidos.includes(tipo_promocion.toUpperCase())) {
            _context3.next = 10;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: "Tipo inv\xE1lido. Use: ".concat(tiposValidos.join(', '))
          }));
        case 10:
          tipo = tipo_promocion.toUpperCase();
          if (!(tipo === 'PORCENTAJE' && (!descuento_porcentaje || descuento_porcentaje <= 0 || descuento_porcentaje > 100))) {
            _context3.next = 13;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Descuento porcentaje debe estar entre 1 y 100'
          }));
        case 13:
          if (!(tipo === 'FIJO' && (!descuento_fijo_bs || descuento_fijo_bs <= 0))) {
            _context3.next = 15;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Descuento fijo debe ser mayor a 0'
          }));
        case 15:
          if (!['2X1', '3X2'].includes(tipo)) {
            _context3.next = 18;
            break;
          }
          if (producto_id) {
            _context3.next = 18;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'producto_id es obligatorio para 2x1 o 3x2'
          }));
        case 18:
          if (!(tipo === 'GRATIS' && (!cantidad_requerida || !cantidad_gratis || cantidad_gratis >= cantidad_requerida))) {
            _context3.next = 20;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Para GRATIS: cantidad_requerida > cantidad_gratis'
          }));
        case 20:
          if (!producto_id) {
            _context3.next = 28;
            break;
          }
          _context3.next = 23;
          return pool.query('SELECT producto_id FROM Productos WHERE producto_id = ? AND activo = 1', [producto_id]);
        case 23:
          _yield$pool$query5 = _context3.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          prod = _yield$pool$query6[0];
          if (!(prod.length === 0)) {
            _context3.next = 28;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Producto no encontrado o inactivo'
          }));
        case 28:
          if (!(new Date(fecha_inicio) > new Date(fecha_fin))) {
            _context3.next = 30;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'fecha_inicio no puede ser mayor a fecha_fin'
          }));
        case 30:
          _context3.next = 32;
          return pool.query("\n            INSERT INTO Promociones \n                (nombre, descripcion, tipo_promocion, descuento_porcentaje, descuento_fijo_bs, \n                 cantidad_requerida, cantidad_gratis, producto_id, fecha_inicio, fecha_fin, activa)\n            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n        ", [nombre.trim(), (descripcion === null || descripcion === void 0 ? void 0 : descripcion.trim()) || null, tipo, descuento_porcentaje ? parseFloat(descuento_porcentaje) : null, descuento_fijo_bs ? parseFloat(descuento_fijo_bs) : null, parseInt(cantidad_requerida) || 1, parseInt(cantidad_gratis) || 0, producto_id ? parseInt(producto_id) : null, fecha_inicio, fecha_fin, activa ? 1 : 0]);
        case 32:
          _yield$pool$query7 = _context3.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          result = _yield$pool$query8[0];
          res.status(201).json({
            message: 'Promoción creada exitosamente',
            promocion_id: result.insertId,
            nombre: nombre.trim(),
            tipo_promocion: tipo,
            vigente_desde: fecha_inicio,
            vigente_hasta: fecha_fin
          });
          _context3.next = 42;
          break;
        case 38:
          _context3.prev = 38;
          _context3.t0 = _context3["catch"](4);
          console.error('Error creating promoción:', _context3.t0);
          res.status(500).json({
            message: 'Error al crear promoción'
          });
        case 42:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[4, 38]]);
  }));
  return function createPromocion(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/* ==================== ACTUALIZAR PROMOCIÓN ==================== */
var updatePromocion = exports.updatePromocion = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, id, campos, _yield$pool$query9, _yield$pool$query10, exists, fields, values, _campos$descripcion;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          id = parseInt(req.params.id);
          campos = req.body;
          if (!(isNaN(id) || id <= 0)) {
            _context4.next = 7;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 7:
          _context4.prev = 7;
          _context4.next = 10;
          return pool.query('SELECT promocion_id FROM Promociones WHERE promocion_id = ?', [id]);
        case 10:
          _yield$pool$query9 = _context4.sent;
          _yield$pool$query10 = (0, _slicedToArray2["default"])(_yield$pool$query9, 1);
          exists = _yield$pool$query10[0];
          if (!(exists.length === 0)) {
            _context4.next = 15;
            break;
          }
          return _context4.abrupt("return", res.status(404).json({
            message: 'Promoción no encontrada'
          }));
        case 15:
          fields = [];
          values = [];
          if (campos.nombre !== undefined) {
            fields.push('nombre = ?');
            values.push(campos.nombre.trim());
          }
          if (campos.descripcion !== undefined) {
            fields.push('descripcion = ?');
            values.push(((_campos$descripcion = campos.descripcion) === null || _campos$descripcion === void 0 ? void 0 : _campos$descripcion.trim()) || null);
          }
          if (campos.tipo_promocion !== undefined) {
            fields.push('tipo_promocion = ?');
            values.push(campos.tipo_promocion.toUpperCase());
          }
          if (campos.descuento_porcentaje !== undefined) {
            fields.push('descuento_porcentaje = ?');
            values.push(campos.descuento_porcentaje ? parseFloat(campos.descuento_porcentaje) : null);
          }
          if (campos.descuento_fijo_bs !== undefined) {
            fields.push('descuento_fijo_bs = ?');
            values.push(campos.descuento_fijo_bs ? parseFloat(campos.descuento_fijo_bs) : null);
          }
          if (campos.cantidad_requerida !== undefined) {
            fields.push('cantidad_requerida = ?');
            values.push(parseInt(campos.cantidad_requerida));
          }
          if (campos.cantidad_gratis !== undefined) {
            fields.push('cantidad_gratis = ?');
            values.push(parseInt(campos.cantidad_gratis));
          }
          if (campos.producto_id !== undefined) {
            fields.push('producto_id = ?');
            values.push(campos.producto_id ? parseInt(campos.producto_id) : null);
          }
          if (campos.fecha_inicio !== undefined) {
            fields.push('fecha_inicio = ?');
            values.push(campos.fecha_inicio);
          }
          if (campos.fecha_fin !== undefined) {
            fields.push('fecha_fin = ?');
            values.push(campos.fecha_fin);
          }
          if (campos.activa !== undefined) {
            fields.push('activa = ?');
            values.push(campos.activa ? 1 : 0);
          }
          if (!(fields.length === 0)) {
            _context4.next = 30;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'No se enviaron datos para actualizar'
          }));
        case 30:
          values.push(id);
          _context4.next = 33;
          return pool.query("UPDATE Promociones SET ".concat(fields.join(', '), " WHERE promocion_id = ?"), values);
        case 33:
          res.json({
            message: 'Promoción actualizada correctamente'
          });
          _context4.next = 40;
          break;
        case 36:
          _context4.prev = 36;
          _context4.t0 = _context4["catch"](7);
          console.error('Error updating promoción:', _context4.t0);
          res.status(500).json({
            message: 'Error al actualizar promoción'
          });
        case 40:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[7, 36]]);
  }));
  return function updatePromocion(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

/* ==================== ELIMINAR / DESACTIVAR PROMOCIÓN ==================== */
var deletePromocion = exports.deletePromocion = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, id, _yield$pool$query11, _yield$pool$query12, promo;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          id = parseInt(req.params.id);
          if (!(isNaN(id) || id <= 0)) {
            _context5.next = 6;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 6:
          _context5.prev = 6;
          _context5.next = 9;
          return pool.query('SELECT activa FROM Promociones WHERE promocion_id = ?', [id]);
        case 9:
          _yield$pool$query11 = _context5.sent;
          _yield$pool$query12 = (0, _slicedToArray2["default"])(_yield$pool$query11, 1);
          promo = _yield$pool$query12[0];
          if (!(promo.length === 0)) {
            _context5.next = 14;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Promoción no encontrada'
          }));
        case 14:
          _context5.next = 16;
          return pool.query('UPDATE Promociones SET activa = 0 WHERE promocion_id = ?', [id]);
        case 16:
          res.json({
            message: 'Promoción desactivada correctamente (recomendado en lugar de eliminar)'
          });
          _context5.next = 23;
          break;
        case 19:
          _context5.prev = 19;
          _context5.t0 = _context5["catch"](6);
          console.error('Error desactivando promoción:', _context5.t0);
          res.status(500).json({
            message: 'Error al procesar promoción'
          });
        case 23:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[6, 19]]);
  }));
  return function deletePromocion(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();