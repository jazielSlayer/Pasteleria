"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getProduccionDiaria = exports.getProduccion = exports.createProduccion = exports.anularProduccion = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var getProduccionDiaria = exports.getProduccionDiaria = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _req$query, fecha, producto_id, query, values, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _req$query = req.query, fecha = _req$query.fecha, producto_id = _req$query.producto_id;
          _context.prev = 4;
          query = "\n            SELECT \n                pd.produccion_id,\n                pd.fecha,\n                pd.producto_id,\n                p.codigo,\n                p.nombre AS producto_nombre,\n                p.categoria,\n                pd.cantidad_producida,\n                pd.observacion,\n                r.porciones_salida,\n                COALESCE(v.costo_unitario, 0) AS costo_unitario_bs,\n                ROUND(pd.cantidad_producida * COALESCE(v.costo_unitario, 0), 2) AS costo_total_produccion\n            FROM ProduccionDiaria pd\n            JOIN Productos p ON pd.producto_id = p.producto_id\n            LEFT JOIN Recetas r ON p.producto_id = r.producto_id\n            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id\n            WHERE p.activo = 1\n        ";
          values = [];
          if (fecha) {
            query += ' AND DATE(pd.fecha) = ?';
            values.push(fecha);
          }
          if (producto_id) {
            query += ' AND pd.producto_id = ?';
            values.push(producto_id);
          }
          query += ' ORDER BY pd.fecha DESC, pd.produccion_id DESC';
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
          console.error('Error fetching producción diaria:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener producción diaria'
          });
        case 22:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 18]]);
  }));
  return function getProduccionDiaria(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var getProduccion = exports.getProduccion = /*#__PURE__*/function () {
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
          return pool.query("\n            SELECT \n                pd.*,\n                p.codigo,\n                p.nombre AS producto_nombre,\n                p.precio_venta,\n                r.porciones_salida,\n                COALESCE(v.costo_unitario, 0) AS costo_unitario_bs,\n                ROUND(pd.cantidad_producida * COALESCE(v.costo_unitario, 0), 2) AS costo_total_bs\n            FROM ProduccionDiaria pd\n            JOIN Productos p ON pd.producto_id = p.producto_id\n            LEFT JOIN Recetas r ON p.producto_id = r.producto_id\n            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id\n            WHERE pd.produccion_id = ? AND p.activo = 1\n        ", [id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          rows = _yield$pool$query4[0];
          if (!(rows.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Producción no encontrada'
          }));
        case 14:
          res.json(rows[0]);
          _context2.next = 21;
          break;
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching producción:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener producción'
          });
        case 21:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 17]]);
  }));
  return function getProduccion(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var createProduccion = exports.createProduccion = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, connection, _req$body, producto_id, cantidad_producida, _req$body$observacion, observacion, _req$body$usuario, usuario, cantProd, _yield$connection$que, _yield$connection$que2, producto, _yield$connection$que3, _yield$connection$que4, receta, factor, faltantes, _iterator, _step, ing, requerido, _iterator2, _step2, _ing, _requerido, _yield$connection$que5, _yield$connection$que6, result;
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
          _req$body = req.body, producto_id = _req$body.producto_id, cantidad_producida = _req$body.cantidad_producida, _req$body$observacion = _req$body.observacion, observacion = _req$body$observacion === void 0 ? null : _req$body$observacion, _req$body$usuario = _req$body.usuario, usuario = _req$body$usuario === void 0 ? 'Sistema' : _req$body$usuario; // Validaciones
          if (!(!producto_id || !cantidad_producida)) {
            _context3.next = 12;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'producto_id y cantidad_producida son obligatorios'
          }));
        case 12:
          cantProd = parseFloat(cantidad_producida);
          if (!(isNaN(cantProd) || cantProd <= 0)) {
            _context3.next = 15;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Cantidad producida debe ser mayor a 0'
          }));
        case 15:
          _context3.next = 17;
          return connection.query('SELECT * FROM Productos WHERE producto_id = ? AND activo = 1', [producto_id]);
        case 17:
          _yield$connection$que = _context3.sent;
          _yield$connection$que2 = (0, _slicedToArray2["default"])(_yield$connection$que, 1);
          producto = _yield$connection$que2[0];
          if (!(producto.length === 0)) {
            _context3.next = 22;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Producto no encontrado o inactivo'
          }));
        case 22:
          _context3.next = 24;
          return connection.query("\n            SELECT r.*, rd.materia_id, rd.cantidad AS cantidad_por_receta, mp.stock_actual, mp.nombre AS materia_nombre, mp.unidad\n            FROM Recetas r\n            JOIN RecetaDetalle rd ON r.receta_id = rd.receta_id\n            JOIN MateriasPrimas mp ON rd.materia_id = mp.materia_id\n            WHERE r.producto_id = ?\n        ", [producto_id]);
        case 24:
          _yield$connection$que3 = _context3.sent;
          _yield$connection$que4 = (0, _slicedToArray2["default"])(_yield$connection$que3, 1);
          receta = _yield$connection$que4[0];
          if (!(receta.length === 0)) {
            _context3.next = 29;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'No se puede producir: el producto no tiene receta registrada'
          }));
        case 29:
          // Calcular insumos necesarios por la cantidad producida
          factor = cantProd / receta[0].porciones_salida; // Validar stock suficiente
          faltantes = [];
          _iterator = _createForOfIteratorHelper(receta);
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              ing = _step.value;
              requerido = ing.cantidad_por_receta * factor;
              if (ing.stock_actual < requerido) {
                faltantes.push({
                  materia: ing.materia_nombre,
                  unidad: ing.unidad,
                  disponible: ing.stock_actual,
                  requerido: parseFloat(requerido.toFixed(4))
                });
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          if (!(faltantes.length > 0)) {
            _context3.next = 35;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Stock insuficiente para producir',
            faltantes: faltantes
          }));
        case 35:
          // Descontar insumos del inventario
          _iterator2 = _createForOfIteratorHelper(receta);
          _context3.prev = 36;
          _iterator2.s();
        case 38:
          if ((_step2 = _iterator2.n()).done) {
            _context3.next = 47;
            break;
          }
          _ing = _step2.value;
          _requerido = _ing.cantidad_por_receta * factor;
          _context3.next = 43;
          return connection.query('UPDATE MateriasPrimas SET stock_actual = stock_actual - ? WHERE materia_id = ?', [_requerido, _ing.materia_id]);
        case 43:
          _context3.next = 45;
          return connection.query("\n                INSERT INTO MovimientosInventario \n                    (materia_id, tipo, cantidad, usuario, referencia_id, observacion)\n                VALUES (?, 'PRODUCCION', ?, ?, ?, ?)\n            ", [_ing.materia_id, -_requerido,
          // negativo = salida
          usuario, null, // referencia_id opcional
          "Producci\xF3n de ".concat(cantProd, " ").concat(producto[0].nombre)]);
        case 45:
          _context3.next = 38;
          break;
        case 47:
          _context3.next = 52;
          break;
        case 49:
          _context3.prev = 49;
          _context3.t0 = _context3["catch"](36);
          _iterator2.e(_context3.t0);
        case 52:
          _context3.prev = 52;
          _iterator2.f();
          return _context3.finish(52);
        case 55:
          _context3.next = 57;
          return connection.query("\n            INSERT INTO ProduccionDiaria \n                (producto_id, cantidad_producida, observacion)\n            VALUES (?, ?, ?)\n        ", [producto_id, cantProd, (observacion === null || observacion === void 0 ? void 0 : observacion.trim()) || null]);
        case 57:
          _yield$connection$que5 = _context3.sent;
          _yield$connection$que6 = (0, _slicedToArray2["default"])(_yield$connection$que5, 1);
          result = _yield$connection$que6[0];
          _context3.next = 62;
          return connection.commit();
        case 62:
          res.status(201).json({
            message: 'Producción registrada exitosamente',
            produccion_id: result.insertId,
            producto: producto[0].nombre,
            cantidad_producida: cantProd,
            insumos_descontados: receta.length,
            fecha: new Date().toISOString().split('T')[0]
          });
          _context3.next = 71;
          break;
        case 65:
          _context3.prev = 65;
          _context3.t1 = _context3["catch"](6);
          _context3.next = 69;
          return connection.rollback();
        case 69:
          console.error('Error registrando producción:', _context3.t1);
          res.status(500).json({
            message: 'Error al registrar producción',
            error: _context3.t1.message
          });
        case 71:
          _context3.prev = 71;
          connection.release();
          return _context3.finish(71);
        case 74:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 65, 71, 74], [36, 49, 52, 55]]);
  }));
  return function createProduccion(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var anularProduccion = exports.anularProduccion = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, connection, id, _yield$connection$que7, _yield$connection$que8, prod, produccion, hoy, _yield$connection$que9, _yield$connection$que10, insumos, _iterator3, _step3, ing;
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
          return connection.query("\n            SELECT pd.*, p.nombre AS producto_nombre\n            FROM ProduccionDiaria pd\n            JOIN Productos p ON pd.producto_id = p.producto_id\n            WHERE pd.produccion_id = ?\n        ", [id]);
        case 12:
          _yield$connection$que7 = _context4.sent;
          _yield$connection$que8 = (0, _slicedToArray2["default"])(_yield$connection$que7, 1);
          prod = _yield$connection$que8[0];
          if (!(prod.length === 0)) {
            _context4.next = 17;
            break;
          }
          return _context4.abrupt("return", res.status(404).json({
            message: 'Producción no encontrada'
          }));
        case 17:
          produccion = prod[0]; // Solo permitir anular si es del día actual
          hoy = new Date().toISOString().split('T')[0];
          if (!(produccion.fecha.toISOString().split('T')[0] !== hoy)) {
            _context4.next = 21;
            break;
          }
          return _context4.abrupt("return", res.status(403).json({
            message: 'Solo se pueden anular producciones del día actual'
          }));
        case 21:
          _context4.next = 23;
          return connection.query("\n            SELECT rd.materia_id, rd.cantidad * (pd.cantidad_producida / r.porciones_salida) AS cantidad_usada\n            FROM RecetaDetalle rd\n            JOIN Recetas r ON rd.receta_id = r.receta_id\n            JOIN ProduccionDiaria pd ON r.producto_id = pd.producto_id\n            WHERE pd.produccion_id = ?\n        ", [id]);
        case 23:
          _yield$connection$que9 = _context4.sent;
          _yield$connection$que10 = (0, _slicedToArray2["default"])(_yield$connection$que9, 1);
          insumos = _yield$connection$que10[0];
          // Revertir stock
          _iterator3 = _createForOfIteratorHelper(insumos);
          _context4.prev = 27;
          _iterator3.s();
        case 29:
          if ((_step3 = _iterator3.n()).done) {
            _context4.next = 37;
            break;
          }
          ing = _step3.value;
          _context4.next = 33;
          return connection.query('UPDATE MateriasPrimas SET stock_actual = stock_actual + ? WHERE materia_id = ?', [ing.cantidad_usada, ing.materia_id]);
        case 33:
          _context4.next = 35;
          return connection.query("\n                INSERT INTO MovimientosInventario \n                    (materia_id, tipo, cantidad, usuario, observacion)\n                VALUES (?, 'AJUSTE', ?, 'Sistema', ?)\n            ", [ing.materia_id, ing.cantidad_usada, "Anulaci\xF3n de producci\xF3n #".concat(id)]);
        case 35:
          _context4.next = 29;
          break;
        case 37:
          _context4.next = 42;
          break;
        case 39:
          _context4.prev = 39;
          _context4.t0 = _context4["catch"](27);
          _iterator3.e(_context4.t0);
        case 42:
          _context4.prev = 42;
          _iterator3.f();
          return _context4.finish(42);
        case 45:
          _context4.next = 47;
          return connection.query('DELETE FROM ProduccionDiaria WHERE produccion_id = ?', [id]);
        case 47:
          _context4.next = 49;
          return connection.commit();
        case 49:
          res.json({
            message: 'Producción anulada y stock revertido correctamente',
            producto: produccion.producto_nombre,
            cantidad_anulada: produccion.cantidad_producida
          });
          _context4.next = 58;
          break;
        case 52:
          _context4.prev = 52;
          _context4.t1 = _context4["catch"](7);
          _context4.next = 56;
          return connection.rollback();
        case 56:
          console.error('Error anulando producción:', _context4.t1);
          res.status(500).json({
            message: 'Error al anular producción'
          });
        case 58:
          _context4.prev = 58;
          connection.release();
          return _context4.finish(58);
        case 61:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[7, 52, 58, 61], [27, 39, 42, 45]]);
  }));
  return function anularProduccion(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();