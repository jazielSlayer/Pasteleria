import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEdit, AiOutlineLineChart, AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { 
  obtenerRecursos, 
  crearRecurso, 
  actualizarRecurso, 
  eliminarRecurso,
  obtenerEstadisticasRecursos,
  incrementarRecurso,
  decrementarRecurso,
  buscarRecursos
} from "./API/Admin/Recursos";

function RecursosProduccion() {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedRecurso, setSelectedRecurso] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad_disponible: 0,
    unidad: "horas"
  });

  useEffect(() => {
    fetchRecursos();
  }, []);

  const fetchRecursos = async () => {
    try {
      setLoading(true);
      const result = await obtenerRecursos();
      if (result.success) {
        setRecursos(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const result = await obtenerEstadisticasRecursos();
      if (result.success) {
        setEstadisticas(result);
        setShowStats(true);
      }
    } catch (err) {
      alert("Error al obtener estadísticas: " + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setFormData({
      nombre: "",
      cantidad_disponible: 0,
      unidad: "horas"
    });
    setShowCreate(true);
  };

  const openEdit = (recurso) => {
    setSelectedRecurso(recurso);
    setFormData({
      nombre: recurso.nombre,
      cantidad_disponible: recurso.cantidad_disponible,
      unidad: recurso.unidad
    });
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const result = await crearRecurso(formData);
      if (result.success) {
        setShowCreate(false);
        fetchRecursos();
        alert("Recurso creado exitosamente");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await actualizarRecurso(selectedRecurso.recurso_id, formData);
      if (result.success) {
        setShowEdit(false);
        fetchRecursos();
        alert("Recurso actualizado exitosamente");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Eliminar recurso "${nombre}"?\n\nNota: No se puede eliminar si está siendo usado por productos.`)) {
      try {
        const result = await eliminarRecurso(id);
        if (result.success) {
          fetchRecursos();
          alert("Recurso eliminado");
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleIncrement = async (id, nombre) => {
    const cantidad = prompt(`¿Cuánto deseas incrementar el recurso "${nombre}"?`, "1");
    if (cantidad && !isNaN(cantidad) && parseFloat(cantidad) > 0) {
      try {
        const result = await incrementarRecurso(id, parseFloat(cantidad));
        if (result.success) {
          fetchRecursos();
          alert(`Recurso incrementado en ${cantidad} unidades`);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDecrement = async (id, nombre) => {
    const cantidad = prompt(`¿Cuánto deseas decrementar el recurso "${nombre}"?`, "1");
    if (cantidad && !isNaN(cantidad) && parseFloat(cantidad) > 0) {
      try {
        const result = await decrementarRecurso(id, parseFloat(cantidad));
        if (result.success) {
          fetchRecursos();
          alert(`Recurso decrementado en ${cantidad} unidades`);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      fetchRecursos();
      return;
    }
    
    try {
      const result = await buscarRecursos(searchTerm);
      setRecursos(result);
    } catch (err) {
      alert("Error en búsqueda: " + err.message);
    }
  };

  const filteredRecursos = recursos.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.unidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recursosBajos = recursos.filter(r => parseFloat(r.cantidad_disponible) < 10);
  const recursosAltos = recursos.filter(r => parseFloat(r.cantidad_disponible) >= 50);
  const totalCapacidad = recursos.reduce((sum, r) => sum + parseFloat(r.cantidad_disponible), 0);

  if (loading) return <div className="loading">Cargando recursos de producción...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Gestión de Recursos de Producción</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button 
            className="btn-create" 
            onClick={fetchEstadisticas}
            style={{ marginRight: "10px", background: "#FF9800" }}
          >
            <AiOutlineLineChart /> Estadísticas
          </button>
          <button className="btn-create" onClick={openCreate}>+ Nuevo Recurso</button>
        </div>
      </header>

      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o unidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px" }}
        />
      </div>

      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Total Recursos</h4>
          <p>{recursos.length}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Alta Disponibilidad</h4>
          <p>{recursosAltos.length}</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Baja Disponibilidad</h4>
          <p>{recursosBajos.length}</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Capacidad Total</h4>
          <p>{totalCapacidad.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ padding: "0 15px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
          <thead style={{ background: "#333" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>ID</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Nombre</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Cantidad Disponible</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Unidad</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Ajustes</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecursos.map((recurso, index) => {
              const cantidad = parseFloat(recurso.cantidad_disponible);
              const isBajo = cantidad < 10;
              const isAlto = cantidad >= 50;
              
              return (
                <tr key={recurso.recurso_id} style={{ 
                  borderBottom: "1px solid #555",
                  background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent"
                }}>
                  <td style={{ padding: "12px", color: "#999", fontWeight: "bold" }}>
                    #{recurso.recurso_id}
                  </td>
                  <td style={{ padding: "12px", color: "#fff", fontWeight: "bold", fontSize: "15px" }}>
                    {recurso.nombre}
                  </td>
                  <td style={{ 
                    padding: "12px", 
                    color: isBajo ? "#F44336" : isAlto ? "#4CAF50" : "#FFC107",
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}>
                    {cantidad.toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", color: "#fff" }}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      background: "#607D8B",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {recurso.unidad.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleIncrement(recurso.recurso_id, recurso.nombre)}
                      style={{ 
                        padding: "6px 10px", 
                        background: "#4CAF50", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer", 
                        marginRight: "8px",
                        fontSize: "16px"
                      }}
                      title="Incrementar"
                    >
                      <AiOutlinePlus />
                    </button>
                    <button
                      onClick={() => handleDecrement(recurso.recurso_id, recurso.nombre)}
                      style={{ 
                        padding: "6px 10px", 
                        background: "#FF9800", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                      title="Decrementar"
                    >
                      <AiOutlineMinus />
                    </button>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => openEdit(recurso)}
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
                      <AiFillEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(recurso.recurso_id, recurso.nombre)}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Nuevo Recurso de Producción</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>Nombre del Recurso: *</label>
                  <input 
                    className="InputProyecto" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    placeholder="Ej: HORNO, MANO_OBRA, EMPACADO"
                    required 
                    maxLength={50}
                  />
                  <small style={{ color: "#999", fontSize: "12px" }}>
                    Se convertirá automáticamente a mayúsculas
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Cantidad Disponible: *</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.001" 
                    name="cantidad_disponible" 
                    value={formData.cantidad_disponible} 
                    onChange={handleChange} 
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label>Unidad de Medida: *</label>
                  <select 
                    className="InputProyecto" 
                    name="unidad" 
                    value={formData.unidad} 
                    onChange={handleChange}
                    required
                  >
                    <option value="horas">Horas</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="litros">Litros</option>
                    <option value="unidades">Unidades</option>
                    <option value="metros">Metros</option>
                    <option value="personal">Personal</option>
                    <option value="maquinas">Máquinas</option>
                  </select>
                </div>
              </div>

              <div style={{ 
                background: "rgba(33, 150, 243, 0.1)", 
                padding: "15px", 
                borderRadius: "8px",
                border: "1px solid #2196F3",
                marginTop: "15px"
              }}>
                <h4 style={{ color: "#2196F3", marginBottom: "10px" }}>💡 Información</h4>
                <ul style={{ color: "#ccc", fontSize: "13px", paddingLeft: "20px" }}>
                  <li>Los recursos representan capacidades productivas limitadas</li>
                  <li>Se usan en la optimización de producción (programación lineal)</li>
                  <li>Ejemplos: HORNO (10 horas), MANO_OBRA (40 horas), EMPACADO (8 horas)</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-create">Crear Recurso</button>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Recurso de Producción</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>Nombre del Recurso: *</label>
                  <input 
                    className="InputProyecto" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                    maxLength={50}
                  />
                  <small style={{ color: "#999", fontSize: "12px" }}>
                    Cambiar el nombre puede afectar las asignaciones de productos
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Cantidad Disponible: *</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.001" 
                    name="cantidad_disponible" 
                    value={formData.cantidad_disponible} 
                    onChange={handleChange} 
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label>Unidad de Medida: *</label>
                  <select 
                    className="InputProyecto" 
                    name="unidad" 
                    value={formData.unidad} 
                    onChange={handleChange}
                    required
                  >
                    <option value="horas">Horas</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="litros">Litros</option>
                    <option value="unidades">Unidades</option>
                    <option value="metros">Metros</option>
                    <option value="personal">Personal</option>
                    <option value="maquinas">Máquinas</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-edit">Actualizar Recurso</button>
                <button type="button" className="btn-close" onClick={() => setShowEdit(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ESTADÍSTICAS */}
      {showStats && estadisticas && (
        <div className="modal-overlay" onClick={() => setShowStats(false)}>
          <div className="modal-content" style={{ maxWidth: "800px" }} onClick={e => e.stopPropagation()}>
            <h2>📊 Estadísticas de Recursos</h2>
            
            <div className="stats-container" style={{ marginBottom: "20px" }}>
              <div className="stat-card stat-total">
                <h4>Total Recursos</h4>
                <p>{estadisticas.resumen.total_recursos}</p>
              </div>
              <div className="stat-card stat-completed">
                <h4>En Uso</h4>
                <p>{estadisticas.resumen.recursos_en_uso}</p>
              </div>
              <div className="stat-card stat-pending">
                <h4>Sin Usar</h4>
                <p>{estadisticas.resumen.recursos_sin_usar}</p>
              </div>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#333", position: "sticky", top: 0 }}>
                  <tr>
                    <th style={{ padding: "12px", textAlign: "left", color: "#fff" }}>Recurso</th>
                    <th style={{ padding: "12px", textAlign: "left", color: "#fff" }}>Disponible</th>
                    <th style={{ padding: "12px", textAlign: "left", color: "#fff" }}>Productos Usando</th>
                    <th style={{ padding: "12px", textAlign: "left", color: "#fff" }}>Consumo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticas.data.map((stat, index) => (
                    <tr key={stat.recurso_id} style={{ 
                      borderBottom: "1px solid #555",
                      background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent"
                    }}>
                      <td style={{ padding: "12px", color: "#fff", fontWeight: "bold" }}>
                        {stat.nombre}
                      </td>
                      <td style={{ padding: "12px", color: "#4CAF50" }}>
                        {parseFloat(stat.cantidad_disponible).toFixed(2)} {stat.unidad}
                      </td>
                      <td style={{ padding: "12px", color: "#2196F3", textAlign: "center" }}>
                        <span style={{
                          padding: "4px 12px",
                          background: stat.productos_usando > 0 ? "#2196F3" : "#666",
                          borderRadius: "12px",
                          fontWeight: "bold"
                        }}>
                          {stat.productos_usando}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#FFC107" }}>
                        {parseFloat(stat.consumo_total_productos).toFixed(2)} {stat.unidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-close" onClick={() => setShowStats(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecursosProduccion;