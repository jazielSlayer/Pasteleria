import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEye } from "react-icons/ai";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { getProduccionDiaria, createProduccion, anularProduccion } from "../../API/Admin/ProduccionDiaria";

function ProduccionDiaria() {
  const [producciones, setProducciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduccion, setSelectedProduccion] = useState(null);
  const [formData, setFormData] = useState({
    producto_id: "",
    cantidad_producida: 1,
    observacion: "",
    usuario: "Admin"
  });

  // Para mostrar mensajes de stock insuficiente
  const [stockError, setStockError] = useState(null);

  useEffect(() => {
    fetchProducciones();
  }, []);

  const fetchProducciones = async () => {
    try {
      setLoading(true);
      const data = await getProduccionDiaria();
      setProducciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setFormData({
      producto_id: "",
      cantidad_producida: 1,
      observacion: "",
      usuario: "Admin"
    });
    setStockError(null);
    setShowCreate(true);
  };

  const openDetail = (produccion) => {
    setSelectedProduccion(produccion);
    setShowDetail(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setStockError(null);
    
    try {
      const response = await createProduccion({
        ...formData,
        producto_id: parseInt(formData.producto_id),
        cantidad_producida: parseFloat(formData.cantidad_producida)
      });
      
      setShowCreate(false);
      fetchProducciones();
      alert(`✅ ${response.message}\n\nProducto: ${response.producto}\nCantidad: ${response.cantidad_producida}\nInsumos descontados: ${response.insumos_descontados}`);
    } catch (err) {
      // Intentar parsear el error del backend
      try {
        const errorData = JSON.parse(err.message);
        if (errorData.faltantes) {
          setStockError(errorData);
        } else {
          alert(`Error: ${errorData.message || err.message}`);
        }
      } catch {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleAnular = async (id, producto, cantidad) => {
    const hoy = new Date().toISOString().split('T')[0];
    const fechaProduccion = new Date(selectedProduccion?.fecha || new Date()).toISOString().split('T')[0];
    
    if (fechaProduccion !== hoy) {
      alert("⚠️ Solo se pueden anular producciones del día actual");
      return;
    }

    if (window.confirm(`¿Anular producción de "${producto}"?\n\nCantidad: ${cantidad}\n\n⚠️ Esta acción revertirá el stock de insumos usados.`)) {
      try {
        const response = await anularProduccion(id);
        setShowDetail(false);
        fetchProducciones();
        alert(`✅ ${response.message}\n\nProducto: ${response.producto}\nCantidad anulada: ${response.cantidad_anulada}`);
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const filteredProducciones = producciones.filter(p => 
    p.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular estadísticas
  const hoy = new Date().toISOString().split('T')[0];
  const produccionHoy = producciones.filter(p => 
    new Date(p.fecha).toISOString().split('T')[0] === hoy
  );
  const costoTotalHoy = produccionHoy.reduce((sum, p) => sum + parseFloat(p.costo_total_produccion || 0), 0);
  const cantidadTotalHoy = produccionHoy.reduce((sum, p) => sum + parseFloat(p.cantidad_producida || 0), 0);

  if (loading) return <div className="loading">Cargando producción diaria...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Gestión de Producción Diaria</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>+ Registrar Producción</button>
        </div>
      </header>

      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por producto, código o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px" }}
        />
      </div>

      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Total Registros</h4>
          <p>{producciones.length}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Producción Hoy</h4>
          <p>{produccionHoy.length} registros</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Cantidad Hoy</h4>
          <p>{cantidadTotalHoy.toFixed(2)} unidades</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Costo Total Hoy</h4>
          <p>Bs. {costoTotalHoy.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ padding: "0 15px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
          <thead style={{ background: "#333" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Fecha</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Código</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Producto</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Categoría</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Cantidad</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Costo Unit.</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Costo Total</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducciones.map((prod, index) => {
              const esHoy = new Date(prod.fecha).toISOString().split('T')[0] === hoy;
              return (
                <tr key={prod.produccion_id} style={{ 
                  borderBottom: "1px solid #555",
                  background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent"
                }}>
                  <td style={{ padding: "12px", color: "#fff" }}>
                    {new Date(prod.fecha).toLocaleDateString('es-BO')}
                    {esHoy && (
                      <span style={{ 
                        marginLeft: "8px", 
                        padding: "2px 6px", 
                        background: "#4CAF50", 
                        borderRadius: "3px", 
                        fontSize: "10px" 
                      }}>
                        HOY
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px", color: "#fff", fontWeight: "bold" }}>{prod.codigo}</td>
                  <td style={{ padding: "12px", color: "#fff" }}>{prod.producto_nombre}</td>
                  <td style={{ padding: "12px", color: "#fff" }}>
                    {prod.categoria ? (
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        background: "#607D8B",
                        color: "white",
                        fontSize: "12px"
                      }}>
                        {prod.categoria}
                      </span>
                    ) : "-"}
                  </td>
                  <td style={{ padding: "12px", color: "#4CAF50", fontWeight: "bold" }}>
                    {parseFloat(prod.cantidad_producida).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", color: "#fff" }}>
                    Bs. {parseFloat(prod.costo_unitario_bs || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", color: "#FFC107", fontWeight: "bold" }}>
                    Bs. {parseFloat(prod.costo_total_produccion || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => openDetail(prod)}
                      style={{ 
                        padding: "6px 12px", 
                        background: "#2196F3", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer", 
                        marginRight: "8px" 
                      }}
                    >
                      <AiFillEye />
                    </button>
                    {esHoy && (
                      <button
                        onClick={() => handleAnular(prod.produccion_id, prod.producto_nombre, prod.cantidad_producida)}
                        style={{ 
                          padding: "6px 12px", 
                          background: "#F44336", 
                          color: "#fff", 
                          border: "none", 
                          borderRadius: "4px", 
                          cursor: "pointer" 
                        }}
                      >
                        <AiFillDelete />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR PRODUCCIÓN */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <h2>Registrar Nueva Producción</h2>
            
            {stockError && (
              <div style={{ 
                background: "rgba(244, 67, 54, 0.2)", 
                border: "1px solid #F44336", 
                borderRadius: "8px", 
                padding: "15px", 
                marginBottom: "20px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <FaExclamationTriangle style={{ color: "#F44336", marginRight: "10px", fontSize: "20px" }} />
                  <strong style={{ color: "#F44336" }}>{stockError.message}</strong>
                </div>
                <div style={{ marginLeft: "30px" }}>
                  {stockError.faltantes.map((f, i) => (
                    <div key={i} style={{ color: "#fff", fontSize: "14px", marginTop: "5px" }}>
                      • <strong>{f.materia}</strong>: Disponible <span style={{ color: "#F44336" }}>{f.disponible}</span> {f.unidad}, 
                      Requerido <span style={{ color: "#FFC107" }}>{f.requerido}</span> {f.unidad}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div onSubmit={handleCreate}>
              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>ID Producto: *</label>
                  <input 
                    className="InputProyecto" 
                    type="number"
                    name="producto_id" 
                    value={formData.producto_id} 
                    onChange={handleChange} 
                    placeholder="Ej: 1"
                    required 
                  />
                  <small style={{ color: "#999", fontSize: "12px" }}>
                    Debe tener receta registrada y stock suficiente
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Cantidad Producida: *</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.001"
                    name="cantidad_producida" 
                    value={formData.cantidad_producida} 
                    onChange={handleChange} 
                    min="0.001"
                    required 
                  />
                </div>
                <div>
                  <label>Usuario:</label>
                  <input 
                    className="InputProyecto" 
                    name="usuario" 
                    value={formData.usuario} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>Observación:</label>
                  <textarea 
                    className="InputProyecto" 
                    name="observacion" 
                    value={formData.observacion} 
                    onChange={handleChange}
                    rows="3"
                    placeholder="Notas adicionales..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              <div style={{ 
                background: "rgba(33, 150, 243, 0.1)", 
                border: "1px solid #2196F3", 
                borderRadius: "8px", 
                padding: "12px", 
                marginTop: "15px" 
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FaCheckCircle style={{ color: "#2196F3", marginRight: "10px" }} />
                  <div style={{ color: "#fff", fontSize: "13px" }}>
                    <strong>Nota:</strong> Al registrar la producción, se descontarán automáticamente 
                    los insumos de la receta según la cantidad producida.
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCreate} className="btn-create">
                  Registrar Producción
                </button>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {showDetail && selectedProduccion && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <h2>Detalle de Producción #{selectedProduccion.produccion_id}</h2>
            
            <div style={{ 
              background: "rgba(255,255,255,0.05)", 
              borderRadius: "8px", 
              padding: "20px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Fecha:</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0" }}>
                    {new Date(selectedProduccion.fecha).toLocaleString('es-BO')}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Código Producto:</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0" }}>
                    {selectedProduccion.codigo}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Producto:</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0" }}>
                    {selectedProduccion.producto_nombre}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Categoría:</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0" }}>
                    {selectedProduccion.categoria || "-"}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Cantidad Producida:</label>
                  <p style={{ color: "#4CAF50", fontWeight: "bold", fontSize: "18px", margin: "5px 0" }}>
                    {parseFloat(selectedProduccion.cantidad_producida).toFixed(3)} unidades
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Porciones (Receta):</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0" }}>
                    {selectedProduccion.porciones_salida || "-"}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Costo Unitario:</label>
                  <p style={{ color: "#FFC107", fontWeight: "bold", margin: "5px 0" }}>
                    Bs. {parseFloat(selectedProduccion.costo_unitario_bs || 0).toFixed(4)}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Costo Total Producción:</label>
                  <p style={{ color: "#FFC107", fontWeight: "bold", fontSize: "18px", margin: "5px 0" }}>
                    Bs. {parseFloat(selectedProduccion.costo_total_produccion || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedProduccion.observacion && (
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #555" }}>
                  <label style={{ color: "#999", fontSize: "12px" }}>Observación:</label>
                  <p style={{ color: "#fff", margin: "5px 0" }}>
                    {selectedProduccion.observacion}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {new Date(selectedProduccion.fecha).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && (
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => handleAnular(
                    selectedProduccion.produccion_id, 
                    selectedProduccion.producto_nombre, 
                    selectedProduccion.cantidad_producida
                  )}
                  style={{ background: "#F44336" }}
                >
                  <AiFillDelete style={{ marginRight: "5px" }} />
                  Anular Producción
                </button>
              )}
              <button type="button" className="btn-close" onClick={() => setShowDetail(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProduccionDiaria;