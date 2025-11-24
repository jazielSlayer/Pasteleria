import React, { useState } from 'react';
import { 
  maximizarProduccion, 
  minimizarCostos, 
  optimizacionPersonalizada,
  resolverEjemploTortas,
  validarProblema
} from '../API/Admin/Optimizacion';

export default function OptimizacionPanel() {
  const [activeTab, setActiveTab] = useState('maximizar');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado para maximizar
  const [restriccionesMax, setRestriccionesMax] = useState([
    { producto_id: '', cantidad_maxima: '' }
  ]);

  // Estado para minimizar
  const [demandaMin, setDemandaMin] = useState([
    { producto_id: '', cantidad_requerida: '' }
  ]);

  // Estado para personalizado
  const [problemaPersonalizado, setProblemaPersonalizado] = useState({
    tipo: 'maximizar',
    funcion_objetivo: '',
    variables: [{ nombre: 'x1', coeficiente: 0, descripcion: '' }],
    restricciones: [
      {
        nombre: '',
        tipo: '<=',
        valor: 0,
        descripcion: '',
        coeficientes: [{ variable: 'x1', valor: 0 }]
      }
    ]
  });

  const handleMaximizar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const restriccionesValidas = restriccionesMax.filter(
        r => r.producto_id && r.cantidad_maxima
      );

      const data = restriccionesValidas.length > 0 
        ? { restriccionesDemanda: restriccionesValidas }
        : {};

      const res = await maximizarProduccion(data);
      setResultado(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarRestriccionMax = () => {
    setRestriccionesMax([...restriccionesMax, { producto_id: '', cantidad_maxima: '' }]);
  };

  const actualizarRestriccionMax = (index, field, value) => {
    const nuevas = [...restriccionesMax];
    nuevas[index][field] = value;
    setRestriccionesMax(nuevas);
  };

  const eliminarRestriccionMax = (index) => {
    setRestriccionesMax(restriccionesMax.filter((_, i) => i !== index));
  };

  /* ==================== MINIMIZAR COSTOS ==================== */
  const handleMinimizar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const demandasValidas = demandaMin
        .filter(d => d.producto_id && d.cantidad_requerida)
        .map(d => ({
          producto_id: parseInt(d.producto_id),
          cantidad_requerida: parseFloat(d.cantidad_requerida)
        }));

      if (demandasValidas.length === 0) {
        setError('Debe especificar al menos una demanda');
        setLoading(false);
        return;
      }

      const res = await minimizarCostos(demandasValidas);
      setResultado(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarDemandaMin = () => {
    setDemandaMin([...demandaMin, { producto_id: '', cantidad_requerida: '' }]);
  };

  const actualizarDemandaMin = (index, field, value) => {
    const nuevas = [...demandaMin];
    nuevas[index][field] = value;
    setDemandaMin(nuevas);
  };

  const eliminarDemandaMin = (index) => {
    setDemandaMin(demandaMin.filter((_, i) => i !== index));
  };

  const handlePersonalizada = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const validacion = validarProblema(problemaPersonalizado);
      if (!validacion.valido) {
        setError(validacion.errores.join(', '));
        setLoading(false);
        return;
      }

      const res = await optimizacionPersonalizada(problemaPersonalizado);
      setResultado(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEjemploTortas = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await resolverEjemploTortas();
      setResultado(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==================== RENDERIZADO ==================== */
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Optimización de Producción</h1>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabWrapper}>
          <button 
            style={{
              ...styles.tabButton,
              ...(activeTab === 'maximizar' ? styles.tabButtonActive : styles.tabButtonInactive)
            }}
            onClick={() => {
              setActiveTab('maximizar');
              setResultado(null);
              setError(null);
            }}
          >
            Maximizar
          </button>
          <button 
            style={{
              ...styles.tabButton,
              ...(activeTab === 'minimizar' ? styles.tabButtonActive : styles.tabButtonInactive)
            }}
            onClick={() => {
              setActiveTab('minimizar');
              setResultado(null);
              setError(null);
            }}
          >
            Minimizar 
          </button>
          <button 
            style={{
              ...styles.tabButton,
              ...(activeTab === 'personalizada' ? styles.tabButtonActive : styles.tabButtonInactive)
            }}
            onClick={() => {
              setActiveTab('personalizada');
              setResultado(null);
              setError(null);
            }}
          >
            Personalizada
          </button>
        </div>
      </div>

      {/* Contenido según tab activo */}
      <div style={styles.tabContent}>
        {activeTab === 'maximizar' && (
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Maximizar Utilidad de Producción</h2>
            <p style={styles.description}>Calcula la producción óptima para maximizar utilidades según stock disponible</p>
            
            <h3 style={styles.sectionTitle}>Restricciones de Demanda (Opcional)</h3>
            {restriccionesMax.map((rest, index) => (
              <div key={index} style={styles.inputGroup}>
                <input
                  type="number"
                  placeholder="ID Producto"
                  value={rest.producto_id}
                  onChange={(e) => actualizarRestriccionMax(index, 'producto_id', e.target.value)}
                  style={styles.formInput}
                />
                <input
                  type="number"
                  placeholder="Cantidad Máxima"
                  value={rest.cantidad_maxima}
                  onChange={(e) => actualizarRestriccionMax(index, 'cantidad_maxima', e.target.value)}
                  style={styles.formInput}
                />
                <button 
                  onClick={() => eliminarRestriccionMax(index)}
                  style={styles.deleteButton}
                  disabled={restriccionesMax.length === 1}
                >
                  ❌
                </button>
              </div>
            ))}
            <div style={styles.buttonGroup}>
              <button onClick={agregarRestriccionMax} style={styles.addButton}>
                + Agregar Restricción
              </button>
              <button 
                onClick={handleMaximizar} 
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...styles.submitButtonCreate,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Calculando...' : ' Maximizar'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'minimizar' && (
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Minimizar Costos de Producción</h2>
            <p style={styles.description}>Calcula el plan de producción de menor costo que cumpla con la demanda</p>
            
            <h3 style={styles.sectionTitle}>Demanda Requerida</h3>
            {demandaMin.map((dem, index) => (
              <div key={index} style={styles.inputGroup}>
                <input
                  type="number"
                  placeholder="ID Producto"
                  value={dem.producto_id}
                  onChange={(e) => actualizarDemandaMin(index, 'producto_id', e.target.value)}
                  style={styles.formInput}
                />
                <input
                  type="number"
                  placeholder="Cantidad Requerida"
                  value={dem.cantidad_requerida}
                  onChange={(e) => actualizarDemandaMin(index, 'cantidad_requerida', e.target.value)}
                  style={styles.formInput}
                />
                <button 
                  onClick={() => eliminarDemandaMin(index)}
                  style={styles.deleteButton}
                  disabled={demandaMin.length === 1}
                >
                  ❌
                </button>
              </div>
            ))}
            <div style={styles.buttonGroup}>
              <button onClick={agregarDemandaMin} style={styles.addButton}>
                + Agregar Demanda
              </button>
              <button 
                onClick={handleMinimizar} 
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...styles.submitButtonUpdate,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Calculando...' : 'Minimizar'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'personalizada' && (
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Optimización Personalizada</h2>
            <p style={styles.description}>Define tu propio problema de programación lineal</p>
            
            <button 
              onClick={handleEjemploTortas} 
              disabled={loading}
              style={{
                ...styles.exampleButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cargar Ejemplo: Tortas, Cupcakes y Galletas
            </button>
            
            <div style={styles.formGrid}>
              <div>
                <label style={styles.formLabel}>Tipo:</label>
                <select 
                  value={problemaPersonalizado.tipo}
                  onChange={(e) => setProblemaPersonalizado({
                    ...problemaPersonalizado, 
                    tipo: e.target.value
                  })}
                  style={styles.formInput}
                >
                  <option value="maximizar">Maximizar</option>
                  <option value="minimizar">Minimizar</option>
                </select>
              </div>

              <div>
                <label style={styles.formLabel}>Función Objetivo:</label>
                <input
                  type="text"
                  placeholder="Ej: Maximizar utilidad total"
                  value={problemaPersonalizado.funcion_objetivo}
                  onChange={(e) => setProblemaPersonalizado({
                    ...problemaPersonalizado,
                    funcion_objetivo: e.target.value
                  })}
                  style={styles.formInput}
                />
              </div>
            </div>

            <button 
              onClick={handlePersonalizada} 
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...styles.submitButtonCreate,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '20px'
              }}
            >
              {loading ? '⏳ Calculando...' : 'Resolver'}
            </button>
          </div>
        )}
      </div>

      {/* Mensajes de Error */}
      {error && (
        <div style={styles.errorMessage}>
          ❌ Error: {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingText}>
          ⏳ Procesando optimización...
        </div>
      )}

            {/* Resultados */}
      {resultado && !loading && (
        <div style={styles.resultadoContainer}>
          <h2 style={styles.resultadoTitle}>Resultado de Optimización</h2>
          <div style={styles.resultadoCard}>
            <div style={styles.statsContainer}>
              <div style={{...styles.statCard, ...styles.statCardTotal}}>
                <h3 style={{...styles.statTitle, ...styles.statTitleTotal}}>Estado</h3>
                <p style={styles.statValue}>
                  {resultado.estado || 'Desconocido'}
                </p>
              </div>

              {/* Utilidad Máxima - para maximizar */}
              {(resultado.utilidad_maxima !== undefined && resultado.utilidad_maxima !== null) && (
                <div style={{...styles.statCard, backgroundColor: 'rgba(76, 175, 80, 0.2)'}}>
                  <h3 style={{...styles.statTitle, color: '#4CAF50'}}>Utilidad Máxima</h3>
                  <p style={styles.statValue}>
                    {typeof resultado.utilidad_maxima === 'number' 
                      ? resultado.utilidad_maxima.toFixed(2) 
                      : resultado.utilidad_maxima} BOB
                  </p>
                </div>
              )}

              {/* Costo Mínimo - para minimizar */}
              {(resultado.costo_minimo !== undefined && resultado.costo_minimo !== null) && (
                <div style={{...styles.statCard, backgroundColor: 'rgba(255, 152, 0, 0.2)'}}>
                  <h3 style={{...styles.statTitle, color: '#FF9800'}}>Costo Mínimo</h3>
                  <p style={styles.statValue}>
                    {typeof resultado.costo_minimo === 'number' 
                      ? resultado.costo_minimo.toFixed(2) 
                      : resultado.costo_minimo} BOB
                  </p>
                </div>
              )}

              {/* Valor Óptimo Genérico (personalizada) */}
              {(resultado.valor_optimo !== undefined && resultado.valor_optimo !== null) && (
                <div style={{...styles.statCard, backgroundColor: 'rgba(33, 150, 243, 0.2)'}}>
                  <h3 style={{...styles.statTitle, color: '#2196F3'}}>Valor Óptimo (Z*)</h3>
                  <p style={styles.statValue}>
                    {typeof resultado.valor_optimo === 'number' 
                      ? Number(resultado.valor_optimo).toFixed(2)
                      : resultado.valor_optimo}
                  </p>
                </div>
              )}
            </div>

            {/* TABLA UNIFICADA: funciona para maximizar y minimizar */}
            {(resultado.produccion || resultado.plan_produccion) && (
              <div style={styles.tableSection}>
                <h3 style={styles.sectionTitle}>Plan de Producción Óptima</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHead}>
                      <tr>
                        <th style={styles.tableHeader}>Producto</th>
                        <th style={styles.tableHeader}>Cantidad</th>
                        {resultado.produccion ? (
                          <>
                            <th style={styles.tableHeader}>Utilidad Unitaria</th>
                            <th style={styles.tableHeader}>Utilidad Total</th>
                          </>
                        ) : (
                          <>
                            <th style={styles.tableHeader}>Costo Unitario</th>
                            <th style={styles.tableHeader}>Costo Total</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(resultado.produccion || resultado.plan_produccion).map((prod, i) => (
                        <tr key={i} style={i % 2 === 0 ? styles.tableRow : {...styles.tableRow, ...styles.tableRowAlternate}}>
                          <td style={styles.tableCellBold}>{prod.nombre || 'Sin nombre'}</td>
                          <td style={styles.tableCell}>{prod.cantidad ?? 0}</td>
                          {resultado.produccion ? (
                            <>
                              <td style={styles.tableCell}>{prod.utilidad_unitaria ?? 0} BOB</td>
                              <td style={styles.tableCell}>{prod.utilidad_total ?? 0} BOB</td>
                            </>
                          ) : (
                            <>
                              <td style={styles.tableCell}>{prod.costo_unitario ?? 0} BOB</td>
                              <td style={styles.tableCell}>{prod.costo_total ?? 0} BOB</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Variables personalizadas */}
            {resultado.valores_variables && Object.keys(resultado.valores_variables).length > 0 && (
              <div style={styles.variablesSection}>
                <h3 style={styles.sectionTitle}>Valores de Variables</h3>
                <div style={styles.variablesGrid}>
                  {Object.entries(resultado.valores_variables).map(([variable, valor]) => (
                    <div key={variable} style={styles.variableCard}>
                      <span style={styles.variableName}>{variable}:</span>
                      <span style={styles.variableValue}>{valor ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    color: '#fff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: '1400px',
    margin: '0 auto'
  },
  title: {
    marginBottom: '30px',
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  tabContainer: {
    marginBottom: '30px'
  },
  tabWrapper: {
    display: 'flex',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    padding: '4px',
    gap: '4px'
  },
  tabButton: {
    flex: 1,
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  tabButtonActive: {
    backgroundColor: '#2196F3'
  },
  tabButtonInactive: {
    backgroundColor: 'transparent'
  },
  tabContent: {
    marginTop: '20px'
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '25px',
    borderRadius: '8px',
    border: '1px solid #444'
  },
  formTitle: {
    marginBottom: '10px',
    fontSize: '22px',
    fontWeight: '700'
  },
  description: {
    color: '#bdc3c7',
    marginBottom: '25px',
    fontSize: '14px'
  },
  sectionTitle: {
    fontSize: '18px',
    marginBottom: '15px',
    marginTop: '20px',
    color: '#ecf0f1',
    fontWeight: '600'
  },
  inputGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: '10px',
    marginBottom: '10px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
    marginTop: '20px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#ecf0f1'
  },
  formInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #555',
    backgroundColor: '#222',
    color: '#fff',
    boxSizing: 'border-box',
    fontSize: '14px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#2980b9',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  submitButton: {
    padding: '12px 24px',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  submitButtonCreate: {
    backgroundColor: '#4CAF50'
  },
  submitButtonUpdate: {
    backgroundColor: '#FF9800'
  },
  exampleButton: {
    padding: '12px 24px',
    backgroundColor: '#08116098',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
    width: '100%'
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '18px',
    padding: '20px',
    color: '#2196F3'
  },
  errorMessage: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    border: '1px solid #f44336',
    color: '#f44336',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px',
    textAlign: 'center'
  },
  resultadoContainer: {
    marginTop: '30px'
  },
  resultadoTitle: {
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '700'
  },
  resultadoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #444'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  statCardTotal: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)'
  },
  statTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: '600'
  },
  statTitleTotal: {
    color: '#2196F3'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0'
  },
  tableSection: {
    marginTop: '30px'
  },
  tableContainer: {
    overflowX: 'auto',
    marginTop: '15px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  tableHead: {
    backgroundColor: '#333'
  },
  tableHeader: {
    padding: '15px',
    borderBottom: '2px solid #555',
    textAlign: 'left',
    fontWeight: '600'
  },
  tableRow: {
    borderBottom: '1px solid #555'
  },
  tableRowAlternate: {
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  tableCell: {
    padding: '12px'
  },
  tableCellBold: {
    padding: '12px',
    fontWeight: 'bold'
  },
  variablesSection: {
    marginTop: '30px'
  },
  variablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginTop: '15px'
  },
  variableCard: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    border: '1px solid #2196F3'
  },
  variableName: {
    fontSize: '14px',
    color: '#bdc3c7',
    fontWeight: '600'
  },
  variableValue: {
    fontSize: '20px',
    color: '#fff',
    fontWeight: 'bold'
  }
};