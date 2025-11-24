"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.optimizacionPersonalizada = exports.minimizarCostos = exports.maximizarProduccion = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
var _javascriptLpSolver = _interopRequireDefault(require("javascript-lp-solver"));
var maximizarProduccion = exports.maximizarProduccion = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _yield$pool$query, _yield$pool$query2, productos, _yield$pool$query3, _yield$pool$query4, materiasPrimas, _yield$pool$query5, _yield$pool$query6, consumos, model, restriccionesDemanda, resultado, solucion;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _context.prev = 3;
          _context.next = 6;
          return pool.query("\n            SELECT \n                p.producto_id,\n                p.codigo,\n                p.nombre,\n                p.precio_venta,\n                COALESCE(c.costo_unitario, 0) as costo_unitario,\n                COALESCE(c.margen_unitario, 0) as margen_unitario\n            FROM productos p\n            LEFT JOIN vw_costo_productos c ON p.producto_id = c.producto_id\n            WHERE p.activo = 1\n        ");
        case 6:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          productos = _yield$pool$query2[0];
          if (!(productos.length === 0)) {
            _context.next = 11;
            break;
          }
          return _context.abrupt("return", res.status(404).json({
            message: 'No hay productos activos'
          }));
        case 11:
          _context.next = 13;
          return pool.query("\n            SELECT \n                mp.materia_id,\n                mp.nombre,\n                mp.stock_actual,\n                mp.unidad\n            FROM materiasprimas mp\n            WHERE mp.stock_actual > 0\n        ");
        case 13:
          _yield$pool$query3 = _context.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          materiasPrimas = _yield$pool$query4[0];
          _context.next = 18;
          return pool.query("\n            SELECT \n                r.producto_id,\n                rd.materia_id,\n                rd.cantidad / r.porciones_salida as cantidad_por_unidad\n            FROM recetas r\n            INNER JOIN recetadetalle rd ON r.receta_id = rd.receta_id\n        ");
        case 18:
          _yield$pool$query5 = _context.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          consumos = _yield$pool$query6[0];
          // Construir el modelo de programación lineal
          model = {
            optimize: "utilidad",
            opType: "max",
            constraints: {},
            variables: {}
          }; // Agregar variables de decisión (productos)
          productos.forEach(function (producto) {
            var codigoVar = "x".concat(producto.producto_id);
            model.variables[codigoVar] = (0, _defineProperty2["default"])({
              utilidad: producto.margen_unitario || producto.precio_venta * 0.3
            }, producto.nombre, 1);
          });

          // Agregar restricciones de materias primas
          materiasPrimas.forEach(function (materia) {
            var nombreRestriccion = "stock_".concat(materia.materia_id);
            model.constraints[nombreRestriccion] = {
              max: materia.stock_actual
            };

            // Agregar consumo de cada producto para esta materia prima
            productos.forEach(function (producto) {
              var codigoVar = "x".concat(producto.producto_id);
              var consumo = consumos.find(function (c) {
                return c.producto_id === producto.producto_id && c.materia_id === materia.materia_id;
              });
              if (consumo && !model.variables[codigoVar][nombreRestriccion]) {
                model.variables[codigoVar][nombreRestriccion] = consumo.cantidad_por_unidad;
              }
            });
          });

          // Agregar restricciones de demanda (opcional, desde req.body)
          restriccionesDemanda = req.body.restriccionesDemanda;
          if (restriccionesDemanda) {
            restriccionesDemanda.forEach(function (rest) {
              var producto = productos.find(function (p) {
                return p.producto_id === rest.producto_id;
              });
              if (producto) {
                var codigoVar = "x".concat(producto.producto_id);
                var nombreRest = "demanda_".concat(producto.producto_id);
                model.constraints[nombreRest] = {
                  max: rest.cantidad_maxima
                };
                if (model.variables[codigoVar]) {
                  model.variables[codigoVar][nombreRest] = 1;
                }
              }
            });
          }

          // Resolver el modelo
          resultado = _javascriptLpSolver["default"].Solve(model); // Formatear resultado
          solucion = {
            estado: resultado.feasible ? "ÓPTIMO" : "NO FACTIBLE",
            utilidad_maxima: resultado.result || 0,
            produccion: []
          };
          productos.forEach(function (producto) {
            var codigoVar = "x".concat(producto.producto_id);
            var cantidad = resultado[codigoVar] || 0;
            if (cantidad > 0) {
              solucion.produccion.push({
                producto_id: producto.producto_id,
                codigo: producto.codigo,
                nombre: producto.nombre,
                cantidad: Math.round(cantidad * 100) / 100,
                utilidad_unitaria: producto.margen_unitario,
                utilidad_total: Math.round(cantidad * producto.margen_unitario * 100) / 100
              });
            }
          });
          res.json(solucion);
          _context.next = 36;
          break;
        case 32:
          _context.prev = 32;
          _context.t0 = _context["catch"](3);
          console.error('Error en maximización:', _context.t0);
          res.status(500).json({
            message: 'Error al optimizar producción',
            error: _context.t0.message
          });
        case 36:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 32]]);
  }));
  return function maximizarProduccion(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* ==================== MINIMIZAR COSTOS DE PRODUCCIÓN ==================== */
var minimizarCostos = exports.minimizarCostos = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, demanda, _yield$pool$query7, _yield$pool$query8, productos, _yield$pool$query9, _yield$pool$query10, materiasPrimas, _yield$pool$query11, _yield$pool$query12, consumos, model, resultado, solucion;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context2.sent;
          demanda = req.body.demanda; // Array de {producto_id, cantidad_requerida}
          _context2.prev = 4;
          if (!(!demanda || demanda.length === 0)) {
            _context2.next = 7;
            break;
          }
          return _context2.abrupt("return", res.status(400).json({
            message: 'Debe especificar la demanda de productos'
          }));
        case 7:
          _context2.next = 9;
          return pool.query("\n            SELECT \n                p.producto_id,\n                p.codigo,\n                p.nombre,\n                COALESCE(c.costo_unitario, p.precio_venta * 0.5) as costo_unitario\n            FROM productos p\n            LEFT JOIN vw_costo_productos c ON p.producto_id = c.producto_id\n            WHERE p.activo = 1\n        ");
        case 9:
          _yield$pool$query7 = _context2.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          productos = _yield$pool$query8[0];
          _context2.next = 14;
          return pool.query("\n            SELECT \n                mp.materia_id,\n                mp.nombre,\n                mp.stock_actual,\n                mp.costo_promedio,\n                mp.unidad\n            FROM materiasprimas mp\n        ");
        case 14:
          _yield$pool$query9 = _context2.sent;
          _yield$pool$query10 = (0, _slicedToArray2["default"])(_yield$pool$query9, 1);
          materiasPrimas = _yield$pool$query10[0];
          _context2.next = 19;
          return pool.query("\n            SELECT \n                r.producto_id,\n                rd.materia_id,\n                rd.cantidad / r.porciones_salida as cantidad_por_unidad\n            FROM recetas r\n            INNER JOIN recetadetalle rd ON r.receta_id = rd.receta_id\n        ");
        case 19:
          _yield$pool$query11 = _context2.sent;
          _yield$pool$query12 = (0, _slicedToArray2["default"])(_yield$pool$query11, 1);
          consumos = _yield$pool$query12[0];
          // Construir modelo de minimización
          model = {
            optimize: "costo_total",
            opType: "min",
            constraints: {},
            variables: {}
          }; // Variables de decisión: cantidad a producir de cada producto
          productos.forEach(function (producto) {
            var codigoVar = "x".concat(producto.producto_id);
            model.variables[codigoVar] = {
              costo_total: producto.costo_unitario
            };
          });

          // Restricciones de demanda mínima
          demanda.forEach(function (dem) {
            var producto = productos.find(function (p) {
              return p.producto_id === dem.producto_id;
            });
            if (producto) {
              var nombreRest = "demanda_".concat(dem.producto_id);
              model.constraints[nombreRest] = {
                min: dem.cantidad_requerida
              };
              var codigoVar = "x".concat(producto.producto_id);
              if (model.variables[codigoVar]) {
                model.variables[codigoVar][nombreRest] = 1;
              }
            }
          });

          // Restricciones de stock de materias primas
          materiasPrimas.forEach(function (materia) {
            var nombreRestriccion = "stock_".concat(materia.materia_id);
            model.constraints[nombreRestriccion] = {
              max: materia.stock_actual
            };
            productos.forEach(function (producto) {
              var codigoVar = "x".concat(producto.producto_id);
              var consumo = consumos.find(function (c) {
                return c.producto_id === producto.producto_id && c.materia_id === materia.materia_id;
              });
              if (consumo && model.variables[codigoVar]) {
                model.variables[codigoVar][nombreRestriccion] = consumo.cantidad_por_unidad;
              }
            });
          });

          // Resolver
          resultado = _javascriptLpSolver["default"].Solve(model);
          solucion = {
            estado: resultado.feasible ? "ÓPTIMO" : "NO FACTIBLE",
            costo_minimo: resultado.result || 0,
            plan_produccion: []
          };
          productos.forEach(function (producto) {
            var codigoVar = "x".concat(producto.producto_id);
            var cantidad = resultado[codigoVar] || 0;
            if (cantidad > 0) {
              solucion.plan_produccion.push({
                producto_id: producto.producto_id,
                codigo: producto.codigo,
                nombre: producto.nombre,
                cantidad: Math.round(cantidad * 100) / 100,
                costo_unitario: producto.costo_unitario,
                costo_total: Math.round(cantidad * producto.costo_unitario * 100) / 100
              });
            }
          });
          res.json(solucion);
          _context2.next = 36;
          break;
        case 32:
          _context2.prev = 32;
          _context2.t0 = _context2["catch"](4);
          console.error('Error en minimización:', _context2.t0);
          res.status(500).json({
            message: 'Error al minimizar costos',
            error: _context2.t0.message
          });
        case 36:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[4, 32]]);
  }));
  return function minimizarCostos(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/* ==================== OPTIMIZACIÓN PERSONALIZADA ==================== */
var optimizacionPersonalizada = exports.optimizacionPersonalizada = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var _req$body, tipo, funcion_objetivo, restricciones, variables, model, resultado, solucion;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _req$body = req.body, tipo = _req$body.tipo, funcion_objetivo = _req$body.funcion_objetivo, restricciones = _req$body.restricciones, variables = _req$body.variables;
          _context3.prev = 1;
          if (!(!tipo || !funcion_objetivo || !restricciones || !variables)) {
            _context3.next = 4;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Faltan parámetros: tipo, funcion_objetivo, restricciones, variables'
          }));
        case 4:
          // Construir modelo personalizado
          model = {
            optimize: "Z",
            opType: tipo === 'maximizar' ? 'max' : 'min',
            constraints: {},
            variables: {}
          }; // Agregar variables con coeficientes de función objetivo
          variables.forEach(function (variable) {
            model.variables[variable.nombre] = {
              Z: variable.coeficiente
            };
          });

          // Agregar restricciones
          restricciones.forEach(function (rest, index) {
            var nombreRest = rest.nombre || "restriccion_".concat(index + 1);
            model.constraints[nombreRest] = {};

            // Tipo de restricción
            if (rest.tipo === '<=') {
              model.constraints[nombreRest].max = rest.valor;
            } else if (rest.tipo === '>=') {
              model.constraints[nombreRest].min = rest.valor;
            } else if (rest.tipo === '=') {
              model.constraints[nombreRest].equal = rest.valor;
            }

            // Coeficientes de variables en la restricción
            rest.coeficientes.forEach(function (coef) {
              if (model.variables[coef.variable]) {
                model.variables[coef.variable][nombreRest] = coef.valor;
              }
            });
          });

          // Resolver
          resultado = _javascriptLpSolver["default"].Solve(model);
          solucion = {
            tipo_problema: tipo,
            estado: resultado.feasible ? "ÓPTIMO" : "NO FACTIBLE",
            valor_optimo: resultado.result || 0,
            valores_variables: {}
          };
          variables.forEach(function (variable) {
            solucion.valores_variables[variable.nombre] = resultado[variable.nombre] || 0;
          });
          res.json(solucion);
          _context3.next = 17;
          break;
        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](1);
          console.error('Error en optimización personalizada:', _context3.t0);
          res.status(500).json({
            message: 'Error al resolver problema',
            error: _context3.t0.message
          });
        case 17:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[1, 13]]);
  }));
  return function optimizacionPersonalizada(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();