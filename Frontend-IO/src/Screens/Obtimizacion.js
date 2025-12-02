import React, { useState, useEffect } from "react";
import {
  optimizarProduccion,
  analizarSensibilidad,
  planificarProduccionPeriodo,
  getCuellosBotella,
  getRecursosSubutilizados,
  maximizarGanancias,
  analizarCoeficientes,
} from "../API/Admin/Optimizacion";

/**
 * Pantalla de Optimización de Producción
 * Usa programación lineal para maximizar utilidad
 */
export default function Obtimizacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para modales
  const [optimizarModalOpen, setOptimizarModalOpen] = useState(false);
  const [gananciasModalOpen, setGananciasModalOpen] = useState(false);
  const [coefModalOpen, setCoefModalOpen] = useState(false);
  const [sensibilidadModalOpen, setSensibilidadModalOpen] = useState(false);
  const [planificarModalOpen, setPlanificarModalOpen] = useState(false);
  const [cuellosModalOpen, setCuellosModalOpen] = useState(false);
  const [subutilizadosModalOpen, setSubutilizadosModalOpen] = useState(false);

  // Datos para cada modal
  const [optimizarData, setOptimizarData] = useState(null);
  const [gananciasData, setGananciasData] = useState(null);
  const [coefData, setCoefData] = useState(null);
  const [sensibilidadData, setSensibilidadData] = useState(null);
  const [planificarData, setPlanificarData] = useState(null);
  const [cuellosData, setCuellosData] = useState(null);
  const [subutilizadosData, setSubutilizadosData] = useState(null);

  // Inputs
  const [recursoSensibilidad, setRecursoSensibilidad] = useState("");
  const [incrementoSensibilidad, setIncrementoSensibilidad] = useState(0);
  const [diasPeriodo, setDiasPeriodo] = useState(30);

  useEffect(() => {
    if (!optimizarModalOpen) setOptimizarData(null);
    if (!gananciasModalOpen) setGananciasData(null);
    if (!coefModalOpen) setCoefData(null);
    if (!sensibilidadModalOpen) setSensibilidadData(null);
    if (!planificarModalOpen) setPlanificarData(null);
    if (!cuellosModalOpen) setCuellosData(null);
    if (!subutilizadosModalOpen) setSubutilizadosData(null);
    setError(null);
  }, [optimizarModalOpen, gananciasModalOpen, coefModalOpen, sensibilidadModalOpen, planificarModalOpen, cuellosModalOpen, subutilizadosModalOpen]);

  async function handleOptimizar() {
    setLoading(true);
    setError(null);
    try {
      const res = await optimizarProduccion();
      setOptimizarData(res);
    } catch (err) {
      setError(err.message || "Error al optimizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleMaximizarGanancias() {
    setLoading(true);
    setError(null);
    try {
      const res = await maximizarGanancias();
      setGananciasData(res.data || res);
    } catch (err) {
      setError(err.message || "Error al maximizar ganancias");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalizarCoeficientes() {
    setLoading(true);
    setError(null);
    try {
      const res = await analizarCoeficientes();
      const payload = res?.data ?? res;
      setCoefData({
        analisis: payload?.analisis || "Análisis de coeficientes",
        base: payload?.resultado_base || null,
        interpretacion: payload?.interpretacion || null,
      });
    } catch (err) {
      setError(err.message || "Error al analizar coeficientes");
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
    try {
      const res = await analizarSensibilidad(recursoSensibilidad, parseFloat(incrementoSensibilidad));
      setSensibilidadData(res);
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
    try {
      const res = await planificarProduccionPeriodo(dias);
      setPlanificarData(res);
    } catch (err) {
      setError(err.message || "Error al planificar período");
    } finally {
      setLoading(false);
    }
  }

  async function handleCuellosBotella() {
    setLoading(true);
    setError(null);
    try {
      const cuellos = await getCuellosBotella();
      setCuellosData({ success: true, tipo: "cuellos_botella", cuellos_botella: cuellos });
    } catch (err) {
      setError(err.message || "Error al obtener cuellos de botella");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecursosSubutilizados() {
    setLoading(true);
    setError(null);
    try {
      const recursos = await getRecursosSubutilizados(50);
      setSubutilizadosData({ success: true, tipo: "recursos_subutilizados", recursos_subutilizados: recursos });
    } catch (err) {
      setError(err.message || "Error al obtener recursos subutilizados");
    } finally {
      setLoading(false);
    }
  }

  const options = [
    { title: "🎯 Optimizar Producción", desc: "Calcula el plan óptimo según recursos, costos y márgenes usando programación lineal.", onClick: () => { setOptimizarModalOpen(true); handleOptimizar(); } },
    { title: "💰 Maximizar Ganancias", desc: "Optimización con coeficientes de ganancia detallados (precio - costos).", onClick: () => { setGananciasModalOpen(true); handleMaximizarGanancias(); } },
    { title: "📊 Analizar Coeficientes", desc: "Analiza la sensibilidad de los coeficientes de ganancia.", onClick: () => { setCoefModalOpen(true); handleAnalizarCoeficientes(); } },
    { title: "📊 Análisis de Sensibilidad", desc: "Analiza el impacto de cambiar la cantidad disponible de un recurso.", onClick: () => setSensibilidadModalOpen(true) },
    { title: "📅 Planificar Período", desc: "Calcula producción y recursos necesarios para múltiples días.", onClick: () => setPlanificarModalOpen(true) },
    { title: "🚨 Cuellos de Botella", desc: "Identifica recursos saturados que limitan la producción y su precio sombra.", onClick: () => { setCuellosModalOpen(true); handleCuellosBotella(); } },
    { title: "💤 Recursos Subutilizados", desc: "Encuentra recursos con menos del 50% de utilización.", onClick: () => { setSubutilizadosModalOpen(true); handleRecursosSubutilizados(); } },
  ];

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 className="admin-title">🎯 Optimización de Producción</h1>
      </header>

      <div className="options-grid">
        {options.map((option, index) => (
          <div key={index} className="option-card" onClick={option.onClick}>
            <h3 className="option-title">{option.title}</h3>
            <p className="option-desc">{option.desc}</p>
          </div>
        ))}
      </div>

      {/* Modal Optimizar */}
      {optimizarModalOpen && (
        <Modal onClose={() => setOptimizarModalOpen(false)} title="🎯 Optimizar Producción" loading={loading} error={error}>
          <p className="description">Calcula el plan óptimo según recursos, costos y márgenes usando programación lineal.</p>
          {optimizarData && <ResultRenderer data={optimizarData} />}
        </Modal>
      )}

      {/* Modal Ganancias */}
      {gananciasModalOpen && (
        <Modal onClose={() => setGananciasModalOpen(false)} title="💰 Maximizar Ganancias" loading={loading} error={error}>
          <p className="description">Optimización con coeficientes de ganancia detallados (precio - costos).</p>
          {gananciasData && <ResultRenderer data={gananciasData} />}
        </Modal>
      )}

      {/* Modal Coeficientes */}
      {coefModalOpen && (
        <Modal onClose={() => setCoefModalOpen(false)} title="📊 Analizar Coeficientes" loading={loading} error={error}>
          <p className="description">Analiza la sensibilidad de los coeficientes de ganancia.</p>
          {coefData && <CoefRenderer data={coefData} />}
        </Modal>
      )}

      {/* Modal Sensibilidad */}
      {sensibilidadModalOpen && (
        <Modal onClose={() => setSensibilidadModalOpen(false)} title="📊 Análisis de Sensibilidad" loading={loading} error={error}>
          <p className="description">Analiza el impacto de cambiar la cantidad disponible de un recurso.</p>
          <div className="formGrid">
            <div>
              <label className="formLabel">Recurso</label>
              <input className="InputProyecto formInput" placeholder="Ej: MANO_OBRA" value={recursoSensibilidad} onChange={(e) => setRecursoSensibilidad(e.target.value)} />
            </div>
            <div>
              <label className="formLabel">Incremento (+/-)</label>
              <input className="InputProyecto formInput" type="number" value={incrementoSensibilidad} onChange={(e) => setIncrementoSensibilidad(e.target.value)} />
            </div>
          </div>
          <button onClick={handleSensibilidad} disabled={loading} className="submitButton btn-create">
            {loading ? "⏳ Analizando..." : "📊 Analizar"}
          </button>
          {sensibilidadData && <ResultRenderer data={sensibilidadData} />}
        </Modal>
      )}

      {/* Modal Planificar */}
      {planificarModalOpen && (
        <Modal onClose={() => setPlanificarModalOpen(false)} title="📅 Planificar Período" loading={loading} error={error}>
          <p className="description">Calcula producción y recursos necesarios para múltiples días.</p>
          <div className="formGrid">
            <div>
              <label className="formLabel">Número de Días (1-365)</label>
              <input className="InputProyecto formInput" type="number" min="1" max="365" value={diasPeriodo} onChange={(e) => setDiasPeriodo(e.target.value)} />
            </div>
          </div>
          <button onClick={handlePlanificar} disabled={loading} className="submitButton btn-create">
            {loading ? "⏳ Planificando..." : "📅 Planificar"}
          </button>
          {planificarData && <ResultRenderer data={planificarData} />}
        </Modal>
      )}

      {/* Modal Cuellos */}
      {cuellosModalOpen && (
        <Modal onClose={() => setCuellosModalOpen(false)} title="🚨 Cuellos de Botella" loading={loading} error={error}>
          <p className="description">Identifica recursos saturados que limitan la producción y su precio sombra.</p>
          {cuellosData && <ResultRenderer data={cuellosData} />}
        </Modal>
      )}

      {/* Modal Subutilizados */}
      {subutilizadosModalOpen && (
        <Modal onClose={() => setSubutilizadosModalOpen(false)} title="💤 Recursos Subutilizados" loading={loading} error={error}>
          <p className="description">Encuentra recursos con menos del 50% de utilización.</p>
          {subutilizadosData && <ResultRenderer data={subutilizadosData} />}
        </Modal>
      )}
    </div>
  );
}

// Componente Modal reutilizable
function Modal({ onClose, title, children, loading, error }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        {children}
        {error && <div className="admin-error">❌ {error}</div>}
        {loading && <div className="admin-loading">⏳ Procesando...</div>}
        <button className="btn-close" onClick={onClose}>Cerrar ✖</button>
      </div>
    </div>
  );
}

// Renderizador de resultados
function ResultRenderer({ data }) {
  if (!data || !data.success) {
    return <div className="admin-error">{data?.message || "Error"}</div>;
  }

  if (data.metodo && data.ecuacion) {
    // Maximizar Ganancias
    return (
      <div className="resultadoContainer">
        <h3 className="sectionTitle">💰 {data.metodo}</h3>
        <div className="infoBox">
          <h4 className="infoTitle">📐 Ecuación del Modelo</h4>
          <p><strong>Forma General:</strong> {data.ecuacion.forma_general}</p>
          <p><strong>Modelo:</strong> {data.ecuacion.modelo}</p>
          <p><strong>Solución Óptima:</strong> {data.ecuacion.solucion_optima}</p>
          <div>
            <strong>Restricciones:</strong>
            <ul>
              {data.ecuacion.restricciones?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
        <div className="stats-container">
          <div className="stat-card">
            <h4 className="statTitle">💰 Z* Óptimo</h4>
            <p className="statValue">{Number(data.valor_optimo_z).toFixed(2)} Bs</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">📈 Ingreso Total</h4>
            <p className="statValue">{Number(data.resultados_financieros?.ingreso_total || 0).toFixed(2)} Bs</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">💸 Costo Total</h4>
            <p className="statValue">{Number(data.resultados_financieros?.costo_total || 0).toFixed(2)} Bs</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">📊 Margen %</h4>
            <p className="statValue">{Number(data.resultados_financieros?.margen_porcentual || 0).toFixed(2)}%</p>
          </div>
        </div>
        {Array.isArray(data.produccion) && data.produccion.length > 0 && (
          <div className="tableContainer">
            <h4 className="sectionTitle">📦 Producción Óptima (Detallada)</h4>
            <table className="table">
              <thead className="tableHead">
                <tr>
                  <th className="tableHeader">Producto</th>
                  <th className="tableHeader">Cantidad</th>
                  <th className="tableHeader">Coef. cᵢ</th>
                  <th className="tableHeader">Precio Venta</th>
                  <th className="tableHeader">Costo Unit.</th>
                  <th className="tableHeader">Ganancia</th>
                  <th className="tableHeader">Contribución a Z</th>
                </tr>
              </thead>
              <tbody>
                {data.produccion.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}>
                    <td className="tableCellBold">{p.nombre}</td>
                    <td className="tableCell">{p.cantidad_producir}</td>
                    <td className="tableCell">{p.coeficiente_ci} Bs</td>
                    <td className="tableCell">{p.precio_venta} Bs</td>
                    <td className="tableCell">{p.costo_unitario} Bs</td>
                    <td className="tableCell">{p.ganancia_total} Bs</td>
                    <td className="tableCell">{p.contribucion_z}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {Array.isArray(data.recursos) && data.recursos.length > 0 && (
          <div className="tableContainer">
            <h4 className="sectionTitle">🔧 Estado de Recursos</h4>
            <table className="table">
              <thead className="tableHead">
                <tr>
                  <th className="tableHeader">Recurso</th>
                  <th className="tableHeader">Disponible</th>
                  <th className="tableHeader">Usado</th>
                  <th className="tableHeader">% Uso</th>
                  <th className="tableHeader">Holgura</th>
                </tr>
              </thead>
              <tbody>
                {data.recursos.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "tableRow" : "tableRow tableRowAlternate"}>
                    <td className="tableCellBold">{r.recurso}</td>
                    <td className="tableCell">{r.disponible}</td>
                    <td className="tableCell">{r.usado}</td>
                    <td className="tableCell">{r.porcentaje_uso}%</td>
                    <td className="tableCell">{r.holgura}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (data.recurso && (data.produccion_nueva || data.produccion_original)) {
    // Sensibilidad
    return (
      <div className="resultadoContainer">
        <h3 className="sectionTitle">📊 Análisis de Sensibilidad</h3>
        <div className="stats-container">
          <div className="stat-card">
            <h4 className="statTitle">🔧 Recurso</h4>
            <p className="statValue">{data.recurso}</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">📈 Cambio</h4>
            <p className="statValue">{data.valor_original} → {data.valor_nuevo}</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">💸 Δ Utilidad</h4>
            <p className="statValue">{Number(data.diferencia_utilidad || 0).toFixed(2)} Bs</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">📊 ROI/unidad</h4>
            <p className="statValue">{Number(data.roi_por_unidad || 0).toFixed(2)} Bs</p>
          </div>
        </div>
        <div className="recomendacionCard">
          <p className="recomendacionMensaje">{data.recomendacion}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h4 className="sectionTitle">🔎 Producción Original</h4>
            {data.produccion_original?.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Utilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {data.produccion_original.map((p, i) => (
                    <tr key={i}>
                      <td>{p.nombre}</td>
                      <td>{p.cantidad_producir}</td>
                      <td>{p.utilidad_total} Bs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Sin datos</p>}
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h4 className="sectionTitle">✨ Producción Nueva</h4>
            {data.produccion_nueva?.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Utilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {data.produccion_nueva.map((p, i) => (
                    <tr key={i}>
                      <td>{p.nombre}</td>
                      <td>{Number(p.cantidad_producir).toFixed(2)}</td>
                      <td>{Number(p.utilidad_total).toFixed(2)} Bs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Sin datos</p>}
          </div>
        </div>
      </div>
    );
  }

  if (data.utilidad_maxima !== undefined && !data.metodo) {
    // Optimización estándar
    return (
      <div className="resultadoContainer">
        <h3 className="sectionTitle">🎯 Optimización Estándar</h3>
        <div className="stats-container">
          <div className="stat-card">
            <h4 className="statTitle">💰 Utilidad Máxima</h4>
            <p className="statValue">{Number(data.utilidad_maxima).toFixed(2)} Bs</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">📦 Productos</h4>
            <p className="statValue">{data.produccion?.length || 0}</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">🚨 Saturados</h4>
            <p className="statValue">{data.resumen?.recursos_saturados || 0}</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">📊 Total</h4>
            <p className="statValue">{data.resumen?.total_productos || 0}</p>
          </div>
        </div>
        {data.produccion?.length > 0 && (
          <div className="tableContainer">
            <h4 className="sectionTitle">📊 Plan de Producción</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Margen</th>
                  <th>Utilidad</th>
                </tr>
              </thead>
              <tbody>
                {data.produccion.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nombre}</td>
                    <td>{p.cantidad_producir}</td>
                    <td>{p.margen_unitario} Bs</td>
                    <td>{p.utilidad_total} Bs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.recursos?.length > 0 && (
          <div className="tableContainer">
            <h4 className="sectionTitle">🔧 Estado de Recursos</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>Disponible</th>
                  <th>Usado</th>
                  <th>% Uso</th>
                  <th>Precio Sombra</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.recursos.map((r, i) => (
                  <tr key={i}>
                    <td>{r.recurso}</td>
                    <td>{r.disponible}</td>
                    <td>{r.usado}</td>
                    <td>{r.porcentaje_uso}%</td>
                    <td>{r.precio_sombra} Bs</td>
                    <td>
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
        {data.recomendaciones?.length > 0 && (
          <div>
            <h4 className="sectionTitle">💡 Recomendaciones</h4>
            {data.recomendaciones.map((rec, i) => (
              <div key={i} className="recomendacionCard" style={{ borderLeft: `4px solid ${rec.prioridad === 'ALTA' ? '#f44336' : rec.prioridad === 'MEDIA' ? '#FF9800' : '#4CAF50'}` }}>
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
    );
  }

  if (data.periodo_dias !== undefined) {
    // Planificación
    return (
      <div className="resultadoContainer">
        <h3 className="sectionTitle">📅 Planificación por Período</h3>
        <div className="stats-container">
          <div className="stat-card">
            <h4 className="statTitle">🗓️ Días</h4>
            <p className="statValue">{data.periodo_dias}</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">💰 Utilidad Total</h4>
            <p className="statValue">{Number(data.utilidad_total_periodo || 0).toFixed(2)} Bs</p>
          </div>
          <div className="stat-card">
            <h4 className="statTitle">📈 Diaria</h4>
            <p className="statValue">{Number(data.resumen?.utilidad_diaria || 0).toFixed(2)} Bs</p>
          </div>
        </div>
        {data.produccion_total_periodo?.length > 0 && (
          <div className="tableContainer">
            <h4 className="sectionTitle">📦 Producción Total del Período</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad Total</th>
                  <th>Utilidad Total</th>
                </tr>
              </thead>
              <tbody>
                {data.produccion_total_periodo.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nombre}</td>
                    <td>{p.cantidad_total_periodo}</td>
                    <td>{p.utilidad_total_periodo} Bs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.recursos_necesarios_periodo?.length > 0 && (
          <div className="tableContainer">
            <h4 className="sectionTitle">🔧 Recursos Necesarios</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>Por Día</th>
                  <th>Total</th>
                  <th>Disponible</th>
                </tr>
              </thead>
              <tbody>
                {data.recursos_necesarios_periodo.map((r, i) => (
                  <tr key={i}>
                    <td>{r.recurso}</td>
                    <td>{r.necesario_por_dia}</td>
                    <td>{r.necesario_total}</td>
                    <td>{r.disponible_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (data.tipo === "cuellos_botella") {
    return (
      <div className="resultadoContainer">
        <h3 className="sectionTitle">🚨 Cuellos de Botella</h3>
        {data.cuellos_botella?.length > 0 ? (
          <div className="tableContainer">
            <table className="table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>% Uso</th>
                  <th>Precio Sombra</th>
                  <th>Impacto</th>
                </tr>
              </thead>
              <tbody>
                {data.cuellos_botella.map((c, i) => (
                  <tr key={i}>
                    <td>{c.recurso}</td>
                    <td>{c.uso}%</td>
                    <td>{c.precio_sombra} Bs</td>
                    <td>{c.impacto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="noDataText">✅ No hay recursos saturados</p>}
      </div>
    );
  }

  if (data.tipo === "recursos_subutilizados") {
    return (
      <div className="resultadoContainer">
        <h3 className="sectionTitle">💤 Recursos Subutilizados</h3>
        {data.recursos_subutilizados?.length > 0 ? (
          <div className="tableContainer">
            <table className="table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>Disponible</th>
                  <th>Usado</th>
                  <th>% Uso</th>
                  <th>Holgura</th>
                </tr>
              </thead>
              <tbody>
                {data.recursos_subutilizados.map((r, i) => (
                  <tr key={i}>
                    <td>{r.recurso}</td>
                    <td>{r.disponible}</td>
                    <td>{r.usado}</td>
                    <td>{r.porcentaje_uso}%</td>
                    <td>{r.holgura}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="noDataText">✅ Todos los recursos están bien utilizados</p>}
      </div>
    );
  }

  return null;
}

// Renderizador para coeficientes
function CoefRenderer({ data }) {
  return (
    <div className="resultadoContainer">
      <h3 className="sectionTitle">📊 {data.analisis}</h3>
      {data.base && (
        <>
          <div className="infoBox">
            <p><strong>Z óptimo:</strong> {data.base.z_optimo}</p>
            <p><strong>Ecuación:</strong> {data.base.ecuacion}</p>
          </div>
          <div className="tableContainer">
            <h4 className="sectionTitle">📦 Productos en solución base</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Coeficiente</th>
                  <th>Cantidad</th>
                  <th>Contribución</th>
                </tr>
              </thead>
              <tbody>
                {(data.base.productos || []).map((p, i) => (
                  <tr key={i}>
                    <td>{p.nombre}</td>
                    <td>{p.coeficiente} Bs</td>
                    <td>{Number(p.cantidad).toFixed(2)}</td>
                    <td>{Number(p.contribucion).toFixed(2)} Bs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {data.interpretacion && (
        <div className="recomendacionCard">
          <h4 className="recomendacionTipo">🔎 Interpretación</h4>
          <p className="recomendacionMensaje">{data.interpretacion.valor_z}</p>
          <p className="recomendacionMensaje">{data.interpretacion.productos_optimos}</p>
          {data.interpretacion.mejor_producto && (
            <div>
              <strong>Mejor Producto:</strong> {data.interpretacion.mejor_producto.nombre} — Coef: {data.interpretacion.mejor_producto.coeficiente}
              <p>{data.interpretacion.mejor_producto.mensaje}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}