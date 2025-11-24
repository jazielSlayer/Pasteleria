
import { connect } from '../database';
import solver from 'javascript-lp-solver';

export const maximizarProduccion = async (req, res) => {
    const pool = await connect();
    
    try {
        const [productos] = await pool.query(`
            SELECT 
                p.producto_id,
                p.codigo,
                p.nombre,
                p.precio_venta,
                COALESCE(c.costo_unitario, 0) as costo_unitario,
                COALESCE(c.margen_unitario, 0) as margen_unitario
            FROM productos p
            LEFT JOIN vw_costo_productos c ON p.producto_id = c.producto_id
            WHERE p.activo = 1
        `);

        if (productos.length === 0) {
            return res.status(404).json({ message: 'No hay productos activos' });
        }

        // Obtener restricciones de materias primas
        const [materiasPrimas] = await pool.query(`
            SELECT 
                mp.materia_id,
                mp.nombre,
                mp.stock_actual,
                mp.unidad
            FROM materiasprimas mp
            WHERE mp.stock_actual > 0
        `);

        // Obtener consumo de materias primas por producto
        const [consumos] = await pool.query(`
            SELECT 
                r.producto_id,
                rd.materia_id,
                rd.cantidad / r.porciones_salida as cantidad_por_unidad
            FROM recetas r
            INNER JOIN recetadetalle rd ON r.receta_id = rd.receta_id
        `);

        // Construir el modelo de programación lineal
        const model = {
            optimize: "utilidad",
            opType: "max",
            constraints: {},
            variables: {}
        };

        // Agregar variables de decisión (productos)
        productos.forEach(producto => {
            const codigoVar = `x${producto.producto_id}`;
            model.variables[codigoVar] = {
                utilidad: producto.margen_unitario || producto.precio_venta * 0.3, // 30% si no hay costo
                [producto.nombre]: 1
            };
        });

        // Agregar restricciones de materias primas
        materiasPrimas.forEach(materia => {
            const nombreRestriccion = `stock_${materia.materia_id}`;
            model.constraints[nombreRestriccion] = { max: materia.stock_actual };

            // Agregar consumo de cada producto para esta materia prima
            productos.forEach(producto => {
                const codigoVar = `x${producto.producto_id}`;
                const consumo = consumos.find(
                    c => c.producto_id === producto.producto_id && 
                         c.materia_id === materia.materia_id
                );
                
                if (consumo && !model.variables[codigoVar][nombreRestriccion]) {
                    model.variables[codigoVar][nombreRestriccion] = consumo.cantidad_por_unidad;
                }
            });
        });

        // Agregar restricciones de demanda (opcional, desde req.body)
        const { restriccionesDemanda } = req.body;
        if (restriccionesDemanda) {
            restriccionesDemanda.forEach(rest => {
                const producto = productos.find(p => p.producto_id === rest.producto_id);
                if (producto) {
                    const codigoVar = `x${producto.producto_id}`;
                    const nombreRest = `demanda_${producto.producto_id}`;
                    model.constraints[nombreRest] = { max: rest.cantidad_maxima };
                    if (model.variables[codigoVar]) {
                        model.variables[codigoVar][nombreRest] = 1;
                    }
                }
            });
        }

        // Resolver el modelo
        const resultado = solver.Solve(model);

        // Formatear resultado
        const solucion = {
            estado: resultado.feasible ? "ÓPTIMO" : "NO FACTIBLE",
            utilidad_maxima: resultado.result || 0,
            produccion: []
        };

        productos.forEach(producto => {
            const codigoVar = `x${producto.producto_id}`;
            const cantidad = resultado[codigoVar] || 0;
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

    } catch (error) {
        console.error('Error en maximización:', error);
        res.status(500).json({ message: 'Error al optimizar producción', error: error.message });
    }
};

/* ==================== MINIMIZAR COSTOS DE PRODUCCIÓN ==================== */
export const minimizarCostos = async (req, res) => {
    const pool = await connect();
    const { demanda } = req.body; // Array de {producto_id, cantidad_requerida}

    try {
        if (!demanda || demanda.length === 0) {
            return res.status(400).json({ message: 'Debe especificar la demanda de productos' });
        }

        // Obtener productos con sus costos
        const [productos] = await pool.query(`
            SELECT 
                p.producto_id,
                p.codigo,
                p.nombre,
                COALESCE(c.costo_unitario, p.precio_venta * 0.5) as costo_unitario
            FROM productos p
            LEFT JOIN vw_costo_productos c ON p.producto_id = c.producto_id
            WHERE p.activo = 1
        `);

        // Obtener materias primas disponibles
        const [materiasPrimas] = await pool.query(`
            SELECT 
                mp.materia_id,
                mp.nombre,
                mp.stock_actual,
                mp.costo_promedio,
                mp.unidad
            FROM materiasprimas mp
        `);

        // Obtener recetas
        const [consumos] = await pool.query(`
            SELECT 
                r.producto_id,
                rd.materia_id,
                rd.cantidad / r.porciones_salida as cantidad_por_unidad
            FROM recetas r
            INNER JOIN recetadetalle rd ON r.receta_id = rd.receta_id
        `);

        // Construir modelo de minimización
        const model = {
            optimize: "costo_total",
            opType: "min",
            constraints: {},
            variables: {}
        };

        // Variables de decisión: cantidad a producir de cada producto
        productos.forEach(producto => {
            const codigoVar = `x${producto.producto_id}`;
            model.variables[codigoVar] = {
                costo_total: producto.costo_unitario
            };
        });

        // Restricciones de demanda mínima
        demanda.forEach(dem => {
            const producto = productos.find(p => p.producto_id === dem.producto_id);
            if (producto) {
                const nombreRest = `demanda_${dem.producto_id}`;
                model.constraints[nombreRest] = { min: dem.cantidad_requerida };
                const codigoVar = `x${producto.producto_id}`;
                if (model.variables[codigoVar]) {
                    model.variables[codigoVar][nombreRest] = 1;
                }
            }
        });

        // Restricciones de stock de materias primas
        materiasPrimas.forEach(materia => {
            const nombreRestriccion = `stock_${materia.materia_id}`;
            model.constraints[nombreRestriccion] = { max: materia.stock_actual };

            productos.forEach(producto => {
                const codigoVar = `x${producto.producto_id}`;
                const consumo = consumos.find(
                    c => c.producto_id === producto.producto_id && 
                         c.materia_id === materia.materia_id
                );
                
                if (consumo && model.variables[codigoVar]) {
                    model.variables[codigoVar][nombreRestriccion] = consumo.cantidad_por_unidad;
                }
            });
        });

        // Resolver
        const resultado = solver.Solve(model);

        const solucion = {
            estado: resultado.feasible ? "ÓPTIMO" : "NO FACTIBLE",
            costo_minimo: resultado.result || 0,
            plan_produccion: []
        };

        productos.forEach(producto => {
            const codigoVar = `x${producto.producto_id}`;
            const cantidad = resultado[codigoVar] || 0;
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

    } catch (error) {
        console.error('Error en minimización:', error);
        res.status(500).json({ message: 'Error al minimizar costos', error: error.message });
    }
};

/* ==================== OPTIMIZACIÓN PERSONALIZADA ==================== */
export const optimizacionPersonalizada = async (req, res) => {
    const { tipo, funcion_objetivo, restricciones, variables } = req.body;

    try {
        // Validar entrada
        if (!tipo || !funcion_objetivo || !restricciones || !variables) {
            return res.status(400).json({ 
                message: 'Faltan parámetros: tipo, funcion_objetivo, restricciones, variables' 
            });
        }

        // Construir modelo personalizado
        const model = {
            optimize: "Z",
            opType: tipo === 'maximizar' ? 'max' : 'min',
            constraints: {},
            variables: {}
        };

        // Agregar variables con coeficientes de función objetivo
        variables.forEach(variable => {
            model.variables[variable.nombre] = {
                Z: variable.coeficiente
            };
        });

        // Agregar restricciones
        restricciones.forEach((rest, index) => {
            const nombreRest = rest.nombre || `restriccion_${index + 1}`;
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
            rest.coeficientes.forEach(coef => {
                if (model.variables[coef.variable]) {
                    model.variables[coef.variable][nombreRest] = coef.valor;
                }
            });
        });

        // Resolver
        const resultado = solver.Solve(model);

        const solucion = {
            tipo_problema: tipo,
            estado: resultado.feasible ? "ÓPTIMO" : "NO FACTIBLE",
            valor_optimo: resultado.result || 0,
            valores_variables: {}
        };

        variables.forEach(variable => {
            solucion.valores_variables[variable.nombre] = resultado[variable.nombre] || 0;
        });

        res.json(solucion);

    } catch (error) {
        console.error('Error en optimización personalizada:', error);
        res.status(500).json({ message: 'Error al resolver problema', error: error.message });
    }
};