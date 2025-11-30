import React, { useState, useEffect } from "react";
import {
  optimizarProduccion,
  analizarSensibilidad,
  planificarProduccionPeriodo,
  getCuellosBotella,
  getRecursosSubutilizados,
  getProduccionDiaria,
  createProduccion,
  anularProduccion,
  getRecursosProducto,
  asignarRecursoAProducto,
  deleteRecursoProducto,
} from "../API/Admin/Optimizacion";

/**
 * Pantalla de Optimización de Producción
 * Usa las mismas className que la vista de Ventas para mantener estilos.
 */
export default function Obtimizacion() {
  const [activeTab, setActiveTab] = useState("optimizar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  // Sensibilidad
  const [recursoSensibilidad, setRecursoSensibilidad] = useState("");
  const [incrementoSensibilidad, setIncrementoSensibilidad] = useState(0);

  // Planificación
  const [diasPeriodo, setDiasPeriodo] = useState(30);

  // Historial / producciones
  const [produccionesDiarias, setProduccionesDiarias] = useState([]);
  const [nuevaProduccion, setNuevaProduccion] = useState({
    fecha: new Date().toISOString().split("T")[0],
    producto_id: "",
    cantidad: "",
  });

  // Asignaciones producto-recursos
  const [productoIdSeleccionado, setProductoIdSeleccionado] = useState("");
  const [productoRecursos, setProductoRecursos] = useState([]);
  const [nuevaAsignacion, setNuevaAsignacion] = useState({
    producto_id: "",
    recurso_nombre: "",
    cantidad_requerida: "",
  });

  useEffect(() => {
    // cargar historial cuando se abra la pestaña historial
    if (activeTab === "historial") cargarProduccionesDiarias();
    // cargar recursos producto al cambiar id seleccionado
    if (activeTab === "asignaciones" && productoIdSeleccionado) {
      cargarRecursosProducto(productoIdSeleccionado);
    }
    // limpiar mensajes al cambiar tab
    setError(null);
    setResultado(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, productoIdSeleccionado]);

  async function cargarProduccionesDiarias() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProduccionDiaria();
      setProduccionesDiarias(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error cargando producciones");
    } finally {
      setLoading(false);
    }
  }

  async function handleOptimizar() {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await optimizarProduccion();
      setResultado(res);
    } catch (err) {
      setError(err.message || "Error al optimizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleSensibilidad() {
    if (!recursoSensibilidad.trim()) {
      setError("Debe indicar el recurso a analizar");
      return;
    }
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await analizarSensibilidad(
        recursoSensibilidad,
        parseFloat(incrementoSensibilidad)
      );
      setResultado(res);
    } catch (err) {
      setError(err.message || "Error en análisis de sensibilidad");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanificar() {
    const dias = parseInt(diasPeriodo, 10);
    if (isNaN(dias) || dias < 1) {
      setError("Días inválidos");
      return;
    }
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await planificarProduccionPeriodo(dias);
      setResultado(res);
    } catch (err) {
      setError(err.message || "Error al planificar período");
    } finally {
      setLoading(false);
    }
  }

  async function handleCuellosBotella() {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const cuellos = await getCuellosBotella();
      setResultado({
        success: true,
        tipo: "cuellos_botella",
        cuellos_botella: cuellos,
      });
    } catch (err) {
      setError(err.message || "Error al obtener cuellos de botella");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecursosSubutilizados() {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const recursos = await getRecursosSubutilizados(50);
      setResultado({
        success: true,
        tipo: "recursos_subutilizados",
        recursos_subutilizados: recursos,
      });
    } catch (err) {
      setError(err.message || "Error al obtener recursos subutilizados");
    } finally {
      setLoading(false);
    }
  }

  async function handleCrearProduccion() {
    if (!nuevaProduccion.producto_id || !nuevaProduccion.cantidad) {
      setError("Complete todos los campos de la producción");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createProduccion({
        ...nuevaProduccion,
        producto_id: parseInt(nuevaProduccion.producto_id, 10),
        cantidad: parseFloat(nuevaProduccion.cantidad),
      });
      setNuevaProduccion({
        fecha: new Date().toISOString().split("T")[0],
        producto_id: "",
        cantidad: "",
      });
      await cargarProduccionesDiarias();
    } catch (err) {
      setError(err.message || "Error al crear producción");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnularProduccion(id) {
    const confirmado = window.confirm(
      "¿Está seguro que desea anular esta producción?"
    );
    if (!confirmado) return;
    setLoading(true);
    setError(null);
    try {
      await anularProduccion(id);
      await cargarProduccionesDiarias();
    } catch (err) {
      setError(err.message || "Error al anular producción");
    } finally {
      setLoading(false);
    }
  }

  async function cargarRecursosProducto(productoId) {
    if (!productoId) return setProductoRecursos([]);
    setLoading(true);
    setError(null);
    try {
      const data = await getRecursosProducto(parseInt(productoId, 10));
      setProductoRecursos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar recursos del producto");
    } finally {
      setLoading(false);
    }
  }

  async function handleAsignarRecurso() {
    if (
      !nuevaAsignacion.producto_id ||
      !nuevaAsignacion.recurso_nombre ||
      !nuevaAsignacion.cantidad_requerida
    ) {
      setError("Complete todos los campos de asignación");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await asignarRecursoAProducto({
        producto_id: parseInt(nuevaAsignacion.producto_id, 10),
        recurso_nombre: nuevaAsignacion.recurso_nombre,
        cantidad_requerida: parseFloat(nuevaAsignacion.cantidad_requerida),
      });
      setNuevaAsignacion({ producto_id: "", recurso_nombre: "", cantidad_requerida: "" });
      // si la asignación fue para el producto actualmente seleccionado, recargar
      if (String(productoIdSeleccionado) === String(nuevaAsignacion.producto_id)) {
        await cargarRecursosProducto(productoIdSeleccionado);
      }
    } catch (err) {
      setError(err.message || "Error al asignar recurso");
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminarAsignacion(id) {
    const confirmado = window.confirm("Eliminar asignación?");
    if (!confirmado) return;
    setLoading(true);
    setError(null);
    try {
      await deleteRecursoProducto(id);
      await cargarRecursosProducto(productoIdSeleccionado);
    } catch (err) {
      setError(err.message || "Error al eliminar asignación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 className="admin-title">🎯 Optimización de Producción</h1>
        <div className="header-actions">
          <button
            className="btn-create"
            onClick={() => {
              setActiveTab("optimizar");
              setResultado(null);
              setError(null);
            }}
          >
            🚀 Ejecutar Optimización
          </button>
        </div>
      </header>

      <div className="tabContainer">
        <div className="tabWrapper">
          {["optimizar", "sensibilidad", "planificar", "analisis", "asignaciones", "historial"].map((tab) => (
            <button
              key={tab}
              className={`tabButton ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setResultado(null);
                setError(null);
              }}
            >
              {tab === "optimizar" && "🎯 Optimizar"}
              {tab === "sensibilidad" && "📊 Sensibilidad"}
              {tab === "planificar" && "📅 Planificar"}
              {tab === "analisis" && "🔍 Análisis"}
              {tab === "asignaciones" && "⚙️ Asignaciones"}
              {tab === "historial" && "📜 Historial"}
            </button>
          ))}
        </div>
      </div>

      <div className="tabContent">
        {activeTab === "optimizar" && (
          <div className="formContainer">
            <h2 className="formTitle">Optimizar Producción</h2>
            <p className="description">
              Calcula el plan óptimo según recursos, costos y márgenes.
            </p>
            <div className="infoBox">
              <h4 className="infoTitle">ℹ️ ¿Qué hace?</h4>
              <ul className="infoList">
                <li>Maximiza utilidad total</li>
                <li>Identifica recursos críticos</li>
                <li>Genera recomendaciones</li>
              </ul>
            </div>
            <button
              onClick={handleOptimizar}
              disabled={loading}
              className="submitButton submitButtonCreate btn-create"
            >
              {loading ? "⏳ Optimizando..." : "🚀 Optimizar Ahora"}
            </button>
          </div>
        )}

        {activeTab === "sensibilidad" && (
          <div className="formContainer">
            <h2 className="formTitle">📊 Análisis de Sensibilidad</h2>
            <div className="formGrid">
              <div>
                <label className="formLabel">Recurso</label>
                <input
                  className="InputProyecto formInput"
                  value={recursoSensibilidad}
                  onChange={(e) => setRecursoSensibilidad(e.target.value)}
                />
              </div>
              <div>
                <label className="formLabel">Incremento (+/-)</label>
                <input
                  className="InputProyecto formInput"
                  type="number"
                  value={incrementoSensibilidad}
                  onChange={(e) => setIncrementoSensibilidad(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleSensibilidad}
              disabled={loading}
              className="submitButton submitButtonUpdate btn-create"
            >
              {loading ? "⏳ Analizando..." : "📊 Analizar Sensibilidad"}
            </button>
          </div>
        )}

        {activeTab === "planificar" && (
          <div className="formContainer">
            <h2 className="formTitle">📅 Planificar Período</h2>
            <div className="formGrid">
              <div>
                <label className="formLabel">Días</label>
                <input
                  className="InputProyecto formInput"
                  type="number"
                  min="1"
                  value={diasPeriodo}
                  onChange={(e) => setDiasPeriodo(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handlePlanificar}
              disabled={loading}
              className="submitButton btn-create"
            >
              {loading ? "⏳ Planificando..." : "📅 Planificar Período"}
            </button>
          </div>
        )}

        {activeTab === "analisis" && (
          <div className="formContainer">
            <h2 className="formTitle">🔍 Análisis Avanzado</h2>
            <div className="analysisGrid">
              <div className="analysisCard">
                <h3 className="analysisCardTitle">🚨 Cuellos de Botella</h3>
                <p className="analysisCardDesc">
                  Identifica recursos saturados que limitan la producción.
                </p>
                <button
                  onClick={handleCuellosBotella}
                  className="analysisButton btn-create"
                >
                  🔍 Analizar
                </button>
              </div>
              <div className="analysisCard">
                <h3 className="analysisCardTitle">💤 Recursos Subutilizados</h3>
                <p className="analysisCardDesc">
                  Encuentra recursos con baja utilización.
                </p>
                <button
                  onClick={handleRecursosSubutilizados}
                  className="analysisButton btn-create"
                >
                  🔍 Analizar
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "asignaciones" && (
          <div className="formContainer">
            <h2 className="formTitle">⚙️ Asignaciones Producto - Recursos</h2>
            <div className="formGrid">
              <div>
                <label className="formLabel">ID Producto (ver asignaciones):</label>
                <input
                  className="InputProyecto formInput"
                  type="number"
                  value={productoIdSeleccionado}
                  onChange={(e) => setProductoIdSeleccionado(e.target.value)}
                />
              </div>
              <div>
                <label className="formLabel">Recurso (nombre):</label>
                <input
                  className="InputProyecto formInput"
                  value={nuevaAsignacion.recurso_nombre}
                  onChange={(e) =>
                    setNuevaAsignacion({
                      ...nuevaAsignacion,
                      recurso_nombre: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="formLabel">Cantidad por unidad:</label>
                <input
                  className="InputProyecto formInput"
                  type="number"
                  value={nuevaAsignacion.cantidad_requerida}
                  onChange={(e) =>
                    setNuevaAsignacion({
                      ...nuevaAsignacion,
                      cantidad_requerida: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="formLabel">Producto ID para asignar:</label>
                <input
                  className="InputProyecto formInput"
                  type="number"
                  value={nuevaAsignacion.producto_id}
                  onChange={(e) =>
                    setNuevaAsignacion({
                      ...nuevaAsignacion,
                      producto_id: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                onClick={handleAsignarRecurso}
                className="submitButton submitButtonCreate btn-create"
              >
                ➕ Asignar Recurso
              </button>
            </div>

            <div className="historialList" style={{ marginTop: 24 }}>
              <h3 className="sectionTitle">🔎 Recursos asignados</h3>
              {productoRecursos.length === 0 ? (
                <p className="noDataText">No hay recursos para el producto seleccionado</p>
              ) : (
                <div className="tableContainer">
                  <table className="table">
                    <thead className="tableHead">
                      <tr>
                        <th className="tableHeader">ID</th>
                        <th className="tableHeader">Recurso</th>
                        <th className="tableHeader">Cantidad</th>
                        <th className="tableHeader">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productoRecursos.map((asig, i) => (
                        <tr
                          key={asig.id || i}
                          className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}
                        >
                          <td className="tableCell">{asig.id}</td>
                          <td className="tableCell">{asig.recurso_nombre}</td>
                          <td className="tableCell">{asig.cantidad_requerida}</td>
                          <td className="tableCell actionContainer">
                            <button
                              onClick={() => handleEliminarAsignacion(asig.id)}
                              className="deleteButton btn-delete"
                            >
                              🗑️ Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "historial" && (
          <div className="formContainer">
            <h2 className="formTitle">📜 Historial de Producción</h2>
            <div className="createSection">
              <h3 className="sectionTitle">➕ Nueva Producción</h3>
              <div className="formGrid">
                <div>
                  <label className="formLabel">Fecha:</label>
                  <input
                    className="InputProyecto formInput"
                    type="date"
                    value={nuevaProduccion.fecha}
                    onChange={(e) =>
                      setNuevaProduccion({ ...nuevaProduccion, fecha: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="formLabel">ID Producto:</label>
                  <input
                    className="InputProyecto formInput"
                    type="number"
                    value={nuevaProduccion.producto_id}
                    onChange={(e) =>
                      setNuevaProduccion({ ...nuevaProduccion, producto_id: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="formLabel">Cantidad:</label>
                  <input
                    className="InputProyecto formInput"
                    type="number"
                    value={nuevaProduccion.cantidad}
                    onChange={(e) =>
                      setNuevaProduccion({ ...nuevaProduccion, cantidad: e.target.value })
                    }
                  />
                </div>
              </div>
              <button
                onClick={handleCrearProduccion}
                className="submitButton submitButtonCreate btn-create"
              >
                💾 Guardar Producción
              </button>
            </div>

            <div className="historialList" style={{ marginTop: 20 }}>
              <h3 className="sectionTitle">📋 Producciones Registradas</h3>
              {produccionesDiarias.length === 0 ? (
                <p className="noDataText">No hay producciones registradas</p>
              ) : (
                <div className="tableContainer">
                  <table className="table">
                    <thead className="tableHead">
                      <tr>
                        <th className="tableHeader">ID</th>
                        <th className="tableHeader">Fecha</th>
                        <th className="tableHeader">Producto</th>
                        <th className="tableHeader">Cantidad</th>
                        <th className="tableHeader">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produccionesDiarias.map((prod, i) => (
                        <tr
                          key={prod.id}
                          className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}
                        >
                          <td className="tableCell">{prod.id}</td>
                          <td className="tableCell">{prod.fecha || "N/A"}</td>
                          <td className="tableCell">{prod.producto_id}</td>
                          <td className="tableCell">{prod.cantidad}</td>
                          <td className="tableCell actionContainer">
                            <button
                              onClick={() => handleAnularProduccion(prod.id)}
                              className="deleteButton btn-delete"
                            >
                              ❌ Anular
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="admin-error" role="alert">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="admin-loading">
          ⏳ Procesando...
        </div>
      )}

      {/* RESULTADOS: renderizado estilizado según tipo de respuesta (optimizar / sensibilidad / planificar) */}
      {resultado && !loading && (
        <div className="resultadoContainer" style={{ marginTop: 20 }}>
          <h2 className="formTitle">
            {resultado.success ? "✅ Resultado" : "❌ Resultado"}
          </h2>

          {!resultado.success ? (
            <div className="admin-error">{resultado.message || "Error"}</div>
          ) : (
            <>
              {/* 1) Análisis de sensibilidad (estructura ejemplo proporcionada) */}
              {resultado.recurso && (resultado.produccion_nueva || resultado.produccion_original) && (
                <div className="formContainer">
                  <h3 className="sectionTitle">📊 Resultado - Análisis de Sensibilidad</h3>

                  <div className="stats-container" style={{ marginTop: 8 }}>
                    <div className="stat-card">
                      <h4 className="statTitle">🔧 Recurso</h4>
                      <p className="statValue">{resultado.recurso}</p>
                    </div>
                    <div className="stat-card">
                      <h4 className="statTitle">📈 Valor (antes → ahora)</h4>
                      <p className="statValue">{resultado.valor_original} → {resultado.valor_nuevo}</p>
                    </div>
                    <div className="stat-card">
                      <h4 className="statTitle">💸 Diferencia Utilidad</h4>
                      <p className="statValue">{Number(resultado.diferencia_utilidad || 0).toFixed(2)} Bs</p>
                    </div>
                    <div className="stat-card">
                      <h4 className="statTitle">📊 ROI / unidad</h4>
                      <p className="statValue">{Number(resultado.roi_por_unidad || 0).toFixed(2)} Bs</p>
                    </div>
                  </div>

                  <div className="recomendacionCard" style={{ marginTop: 12 }}>
                    <p className="recomendacionMensaje">{resultado.recomendacion}</p>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <h4 className="sectionTitle">🔎 Producción - Original</h4>
                        {Array.isArray(resultado.produccion_original) && resultado.produccion_original.length > 0 ? (
                          <div className="tableContainer">
                            <table className="table">
                              <thead className="tableHead">
                                <tr>
                                  <th className="tableHeader">Producto</th>
                                  <th className="tableHeader">Cantidad</th>
                                  <th className="tableHeader">Margen</th>
                                  <th className="tableHeader">Utilidad</th>
                                </tr>
                              </thead>
                              <tbody>
                                {resultado.produccion_original.map((p, i) => (
                                  <tr key={i} className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}>
                                    <td className="tableCellBold">{p.nombre}</td>
                                    <td className="tableCell">{p.cantidad_producir}</td>
                                    <td className="tableCell">{p.margen_unitario} Bs</td>
                                    <td className="tableCell">{p.utilidad_total} Bs</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <p className="noDataText">Sin datos originales</p>}
                      </div>

                      <div style={{ flex: 1, minWidth: 280 }}>
                        <h4 className="sectionTitle">✨ Producción - Nuevo</h4>
                        {Array.isArray(resultado.produccion_nueva) && resultado.produccion_nueva.length > 0 ? (
                          <div className="tableContainer">
                            <table className="table">
                              <thead className="tableHead">
                                <tr>
                                  <th className="tableHeader">Producto</th>
                                  <th className="tableHeader">Cantidad</th>
                                  <th className="tableHeader">Margen</th>
                                  <th className="tableHeader">Utilidad</th>
                                </tr>
                              </thead>
                              <tbody>
                                {resultado.produccion_nueva.map((p, i) => (
                                  <tr key={i} className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}>
                                    <td className="tableCellBold">{p.nombre}</td>
                                    <td className="tableCell">{Number(p.cantidad_producir).toFixed(2)}</td>
                                    <td className="tableCell">{p.margen_unitario} Bs</td>
                                    <td className="tableCell">{Number(p.utilidad_total).toFixed(2)} Bs</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <p className="noDataText">Sin datos nuevos</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2) Optimización (estructura optimizar) */}
              {resultado.utilidad_maxima !== undefined && (
                <div className="formContainer" style={{ marginTop: 12 }}>
                  <h3 className="sectionTitle">🎯 Resultado - Optimización</h3>

                  <div className="stats-container" style={{ marginTop: 8 }}>
                    <div className="stat-card">
                      <h4 className="statTitle">💰 Utilidad Máxima</h4>
                      <p className="statValue">{Number(resultado.utilidad_maxima).toFixed(2)} Bs</p>
                    </div>
                    <div className="stat-card">
                      <h4 className="statTitle">📦 Productos a Producir</h4>
                      <p className="statValue">{resultado.produccion?.length || 0}</p>
                    </div>
                    <div className="stat-card">
                      <h4 className="statTitle">🚨 Recursos Saturados</h4>
                      <p className="statValue">{resultado.resumen?.recursos_saturados || 0}</p>
                    </div>
                    <div className="stat-card">
                      <h4 className="statTitle">📊 Total Productos</h4>
                      <p className="statValue">{resultado.resumen?.total_productos || 0}</p>
                    </div>
                  </div>

                  {/* tabla producción */}
                  {Array.isArray(resultado.produccion) && resultado.produccion.length > 0 && (
                    <div className="tableContainer" style={{ marginTop: 12 }}>
                      <h4 className="sectionTitle">📊 Plan de Producción Óptima</h4>
                      <table className="table">
                        <thead className="tableHead">
                          <tr>
                            <th className="tableHeader">Producto</th>
                            <th className="tableHeader">Cantidad</th>
                            <th className="tableHeader">Margen</th>
                            <th className="tableHeader">Utilidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.produccion.map((p, i) => (
                            <tr key={i} className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}>
                              <td className="tableCellBold">{p.nombre}</td>
                              <td className="tableCell">{p.cantidad_producir}</td>
                              <td className="tableCell">{p.margen_unitario} Bs</td>
                              <td className="tableCell">{p.utilidad_total} Bs</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* tabla recursos */}
                  {Array.isArray(resultado.recursos) && resultado.recursos.length > 0 && (
                    <div className="tableContainer" style={{ marginTop: 12 }}>
                      <h4 className="sectionTitle">🔧 Estado de Recursos</h4>
                      <table className="table">
                        <thead className="tableHead">
                          <tr>
                            <th className="tableHeader">Recurso</th>
                            <th className="tableHeader">Disponible</th>
                            <th className="tableHeader">Usado</th>
                            <th className="tableHeader">% Uso</th>
                            <th className="tableHeader">Precio Sombra</th>
                            <th className="tableHeader">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.recursos.map((r, i) => (
                            <tr key={i} className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}>
                              <td className="tableCellBold">{r.recurso}</td>
                              <td className="tableCell">{r.disponible}</td>
                              <td className="tableCell">{r.usado}</td>
                              <td className="tableCell">{r.porcentaje_uso}%</td>
                              <td className="tableCell">{r.precio_sombra} Bs</td>
                              <td className="tableCell">
                                <span className={`statusBadge ${r.estado === 'Saturado' ? 'statusInactive' : 'statusActive'}`}>
                                  {r.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* recomendaciones */}
                  {Array.isArray(resultado.recomendaciones) && resultado.recomendaciones.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <h4 className="sectionTitle">💡 Recomendaciones</h4>
                      {resultado.recomendaciones.map((rec, i) => (
                        <div key={i} className="recomendacionCard" style={{ borderLeft: `4px solid ${rec.prioridad === 'ALTA' ? '#f44336' : rec.prioridad === 'MEDIA' ? '#FF9800' : '#4CAF50'}`, marginBottom: 8 }}>
                          <div className="recomendacionHeader">
                            <span className="recomendacionTipo">{rec.tipo || rec.recurso || 'RECOMENDACIÓN'}</span>
                            <span className="recomendacionPrioridad">{rec.prioridad}</span>
                          </div>
                          <p className="recomendacionMensaje">{rec.mensaje}</p>
                          {rec.accion && <p className="recomendacionAccion"><strong>Acción:</strong> {rec.accion}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3) Planificación por período */}
              {resultado.periodo_dias !== undefined && (
                <div className="formContainer" style={{ marginTop: 12 }}>
                  <h3 className="sectionTitle">📅 Resultado - Planificación por Período</h3>

                  <div className="stats-container" style={{ marginTop: 8 }}>
                    <div className="stat-card">
                      <h4 className="statTitle">🗓️ Días</h4>
                      <p className="statValue">{resultado.periodo_dias}</p>
                    </div>
                    <div className="stat-card">
                      <h4 className="statTitle">💰 Utilidad Total</h4>
                      <p className="statValue">{Number(resultado.utilidad_total_periodo || 0).toFixed(2)} Bs</p>
                    </div>
                    <div className="stat-card">
                      <h4 className="statTitle">📈 Utilidad Diaria</h4>
                      <p className="statValue">{Number(resultado.resumen?.utilidad_diaria || 0).toFixed(2)} Bs</p>
                    </div>
                  </div>

                  {Array.isArray(resultado.produccion_total_periodo) && resultado.produccion_total_periodo.length > 0 && (
                    <div className="tableContainer" style={{ marginTop: 12 }}>
                      <h4 className="sectionTitle">📦 Producción Total del Período</h4>
                      <table className="table">
                        <thead className="tableHead">
                          <tr>
                            <th className="tableHeader">Producto</th>
                            <th className="tableHeader">Cantidad Total</th>
                            <th className="tableHeader">Utilidad Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.produccion_total_periodo.map((p, i) => (
                            <tr key={i} className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}>
                              <td className="tableCellBold">{p.nombre}</td>
                              <td className="tableCell">{p.cantidad_total_periodo}</td>
                              <td className="tableCell">{p.utilidad_total_periodo} Bs</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {Array.isArray(resultado.recursos_necesarios_periodo) && resultado.recursos_necesarios_periodo.length > 0 && (
                    <div className="tableContainer" style={{ marginTop: 12 }}>
                      <h4 className="sectionTitle">🔧 Recursos Necesarios (Periodo)</h4>
                      <table className="table">
                        <thead className="tableHead">
                          <tr>
                            <th className="tableHeader">Recurso</th>
                            <th className="tableHeader">Por día</th>
                            <th className="tableHeader">Total requerido</th>
                            <th className="tableHeader">Disponible total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.recursos_necesarios_periodo.map((r, i) => (
                            <tr key={i} className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}>
                              <td className="tableCellBold">{r.recurso}</td>
                              <td className="tableCell">{r.necesario_por_dia}</td>
                              <td className="tableCell">{r.necesario_total}</td>
                              <td className="tableCell">{r.disponible_total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}