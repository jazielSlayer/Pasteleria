"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMovimientos = exports.getMovimiento = exports.deleteMovimiento = exports.createMovimientoManual = exports.createMovimiento = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
/* ==================== LISTAR MOVIMIENTOS DE INVENTARIO ==================== */
var getMovimientos = exports.getMovimientos = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _req$query, tipo, materia_id, fecha_desde, fecha_hasta, _req$query$limit, limit, query, conditions, values, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _req$query = req.query, tipo = _req$query.tipo, materia_id = _req$query.materia_id, fecha_desde = _req$query.fecha_desde, fecha_hasta = _req$query.fecha_hasta, _req$query$limit = _req$query.limit, limit = _req$query$limit === void 0 ? 100 : _req$query$limit;
          _context.prev = 4;
          query = "\n            SELECT \n                mi.movimiento_id,\n                mi.materia_id,\n                mp.codigo,\n                mp.nombre AS materia_nombre,\n                mp.unidad,\n                mi.tipo,\n                mi.cantidad,\n                mi.fecha,\n                mi.usuario,\n                mi.referencia_id,\n                mi.observacion,\n                ROUND(mi.cantidad * mp.costo_promedio, 4) AS costo_total_bs\n            FROM MovimientosInventario mi\n            JOIN MateriasPrimas mp ON mi.materia_id = mp.materia_id\n        ";
          conditions = [];
          values = [];
          if (tipo) {
            conditions.push('mi.tipo = ?');
            values.push(tipo.toUpperCase());
          }
          if (materia_id) {
            conditions.push('mi.materia_id = ?');
            values.push(materia_id);
          }
          if (fecha_desde) {
            conditions.push('DATE(mi.fecha) >= ?');
            values.push(fecha_desde);
          }
          if (fecha_hasta) {
            conditions.push('DATE(mi.fecha) <= ?');
            values.push(fecha_hasta);
          }
          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
          }
          query += ' ORDER BY mi.fecha DESC, mi.movimiento_id DESC';
          if (limit) query += ' LIMIT ?';
          values.push(parseInt(limit));
          _context.next = 18;
          return pool.query(query, values);
        case 18:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          rows = _yield$pool$query2[0];
          res.json(rows);
          _context.next = 28;
          break;
        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](4);
          console.error('Error fetching movimientos:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener movimientos de inventario'
          });
        case 28:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 24]]);
  }));
  return function getMovimientos(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* ==================== OBTENER UN MOVIMIENTO POR ID ==================== */
var getMovimiento = exports.getMovimiento = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, id, _yield$pool$query3, _yield$pool$query4, rows;
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
          return pool.query("\n            SELECT \n                mi.*,\n                mp.codigo,\n                mp.nombre AS materia_nombre,\n                mp.unidad,\n                ROUND(mi.cantidad * mp.costo_promedio, 4) AS costo_total_bs\n            FROM MovimientosInventario mi\n            JOIN MateriasPrimas mp ON mi.materia_id = mp.materia_id\n            WHERE mi.movimiento_id = ?\n        ", [id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          rows = _yield$pool$query4[0];
          if (!(rows.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Movimiento no encontrado'
          }));
        case 14:
          res.json(rows[0]);
          _context2.next = 21;
          break;
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching movimiento:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener movimiento'
          });
        case 21:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 17]]);
  }));
  return function getMovimiento(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/* ==================== REGISTRAR MERMA O AJUSTE MANUAL (únicos permitidos manualmente) ==================== */
var createMovimientoManual = exports.createMovimientoManual = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, connection, _req$body, materia_id, tipo, cantidad, usuario, _req$body$observacion, observacion, tipoUpper, _yield$connection$que, _yield$connection$que2, materia, cantidadAbs, esSalida, nuevoStock, _yield$connection$que3, _yield$connection$que4, result;
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
          _req$body = req.body, materia_id = _req$body.materia_id, tipo = _req$body.tipo, cantidad = _req$body.cantidad, usuario = _req$body.usuario, _req$body$observacion = _req$body.observacion, observacion = _req$body$observacion === void 0 ? null : _req$body$observacion;
          _context3.prev = 7;
          _context3.next = 10;
          return connection.beginTransaction();
        case 10:
          if (!(!materia_id || !tipo || !cantidad || !usuario)) {
            _context3.next = 12;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Faltan campos: materia_id, tipo, cantidad y usuario son obligatorios'
          }));
        case 12:
          tipoUpper = tipo.toUpperCase();
          if (['MERMA', 'AJUSTE'].includes(tipoUpper)) {
            _context3.next = 15;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Tipo inválido. Solo se permite MERMA o AJUSTE para registro manual'
          }));
        case 15:
          if (!(isNaN(cantidad) || cantidad === 0)) {
            _context3.next = 17;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Cantidad debe ser diferente de cero'
          }));
        case 17:
          _context3.next = 19;
          return connection.query('SELECT materia_id, nombre, stock_actual FROM MateriasPrimas WHERE materia_id = ?', [materia_id]);
        case 19:
          _yield$connection$que = _context3.sent;
          _yield$connection$que2 = (0, _slicedToArray2["default"])(_yield$connection$que, 1);
          materia = _yield$connection$que2[0];
          if (!(materia.length === 0)) {
            _context3.next = 24;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Materia prima no encontrada'
          }));
        case 24:
          cantidadAbs = Math.abs(parseFloat(cantidad));
          esSalida = cantidad < 0 || tipoUpper === 'MERMA'; // Si es salida, verificar stock suficiente
          if (!(esSalida && materia[0].stock_actual < cantidadAbs)) {
            _context3.next = 28;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: "Stock insuficiente. Disponible: ".concat(materia[0].stock_actual, " ").concat(materia[0].nombre)
          }));
        case 28:
          // Actualizar stock
          nuevoStock = esSalida ? materia[0].stock_actual - cantidadAbs : materia[0].stock_actual + cantidadAbs;
          _context3.next = 31;
          return connection.query('UPDATE MateriasPrimas SET stock_actual = ? WHERE materia_id = ?', [nuevoStock, materia_id]);
        case 31:
          _context3.next = 33;
          return connection.query("\n            INSERT INTO MovimientosInventario \n                (materia_id, tipo, cantidad, usuario, observacion)\n            VALUES (?, ?, ?, ?, ?)\n        ", [materia_id, tipoUpper, parseFloat(cantidad),
          // Guarda con signo: negativo = salida
          usuario.trim(), (observacion === null || observacion === void 0 ? void 0 : observacion.trim()) || null]);
        case 33:
          _yield$connection$que3 = _context3.sent;
          _yield$connection$que4 = (0, _slicedToArray2["default"])(_yield$connection$que3, 1);
          result = _yield$connection$que4[0];
          _context3.next = 38;
          return connection.commit();
        case 38:
          res.status(201).json({
            message: tipoUpper === 'MERMA' ? 'Merma registrada correctamente' : 'Ajuste de inventario registrado',
            movimiento_id: result.insertId,
            materia: materia[0].nombre,
            tipo: tipoUpper,
            cantidad: parseFloat(cantidad),
            stock_actual: nuevoStock
          });
          _context3.next = 47;
          break;
        case 41:
          _context3.prev = 41;
          _context3.t0 = _context3["catch"](7);
          _context3.next = 45;
          return connection.rollback();
        case 45:
          console.error('Error creando movimiento manual:', _context3.t0);
          res.status(500).json({
            message: 'Error al registrar movimiento'
          });
        case 47:
          _context3.prev = 47;
          connection.release();
          return _context3.finish(47);
        case 50:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[7, 41, 47, 50]]);
  }));
  return function createMovimientoManual(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/* ==================== NO PERMITIR CREAR MANUALMENTE COMPRA/PRODUCCION (se hace desde sus módulos) ==================== */
var createMovimiento = exports.createMovimiento = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          res.status(403).json({
            message: 'No permitido: Los movimientos de COMPRA, PRODUCCION y DEVOLUCION se registran automáticamente desde sus módulos respectivos. Usa /movimientos/manual para mermas o ajustes.'
          });
        case 1:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function createMovimiento(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

/* ==================== ELIMINAR MOVIMIENTO (solo AJUSTE o MERMA recientes, con revertir stock) ==================== */
var deleteMovimiento = exports.deleteMovimiento = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, connection, id, _yield$connection$que5, _yield$connection$que6, mov, movimiento, horasTranscurridas, stockRevertido;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          _context5.next = 5;
          return pool.getConnection();
        case 5:
          connection = _context5.sent;
          id = parseInt(req.params.id);
          _context5.prev = 7;
          _context5.next = 10;
          return connection.beginTransaction();
        case 10:
          _context5.next = 12;
          return connection.query("\n            SELECT mi.*, mp.stock_actual \n            FROM MovimientosInventario mi\n            JOIN MateriasPrimas mp ON mi.materia_id = mp.materia_id\n            WHERE mi.movimiento_id = ?\n        ", [id]);
        case 12:
          _yield$connection$que5 = _context5.sent;
          _yield$connection$que6 = (0, _slicedToArray2["default"])(_yield$connection$que5, 1);
          mov = _yield$connection$que6[0];
          if (!(mov.length === 0)) {
            _context5.next = 17;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Movimiento no encontrado'
          }));
        case 17:
          movimiento = mov[0]; // Solo permitir eliminar MERMA o AJUSTE, y que no sea muy antiguo
          if (['MERMA', 'AJUSTE'].includes(movimiento.tipo)) {
            _context5.next = 20;
            break;
          }
          return _context5.abrupt("return", res.status(403).json({
            message: 'Solo se pueden eliminar movimientos de tipo MERMA o AJUSTE'
          }));
        case 20:
          horasTranscurridas = (new Date() - new Date(movimiento.fecha)) / (1000 * 60 * 60);
          if (!(horasTranscurridas > 24)) {
            _context5.next = 23;
            break;
          }
          return _context5.abrupt("return", res.status(403).json({
            message: 'No se puede eliminar: han pasado más de 24 horas'
          }));
        case 23:
          // Revertir stock
          stockRevertido = movimiento.cantidad < 0 ? movimiento.stock_actual - movimiento.cantidad // era salida → sumar
          : movimiento.stock_actual - movimiento.cantidad; // era entrada → restar
          _context5.next = 26;
          return connection.query('UPDATE MateriasPrimas SET stock_actual = ? WHERE materia_id = ?', [stockRevertido, movimiento.materia_id]);
        case 26:
          _context5.next = 28;
          return connection.query('DELETE FROM MovimientosInventario WHERE movimiento_id = ?', [id]);
        case 28:
          _context5.next = 30;
          return connection.commit();
        case 30:
          res.json({
            message: 'Movimiento eliminado y stock revertido correctamente',
            stock_actual_nuevo: stockRevertido
          });
          _context5.next = 39;
          break;
        case 33:
          _context5.prev = 33;
          _context5.t0 = _context5["catch"](7);
          _context5.next = 37;
          return connection.rollback();
        case 37:
          console.error('Error eliminando movimiento:', _context5.t0);
          res.status(500).json({
            message: 'Error al eliminar movimiento'
          });
        case 39:
          _context5.prev = 39;
          connection.release();
          return _context5.finish(39);
        case 42:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[7, 33, 39, 42]]);
  }));
  return function deleteMovimiento(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();