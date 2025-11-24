import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { getMateriasPrimas, createMateriaPrima, updateMateriaPrima, deleteMateriaPrima } from "../../API/Admin/MateriasPrimas";

function MateriasPrimas() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    unidad: "kg",
    stock_minimo: 0,
    stock_actual: 0,
    costo_promedio: 0,
    proveedor_preferido_id: null
  });

  useEffect(() => {
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    try {
      setLoading(true);
      const data = await getMateriasPrimas();
      setMaterias(data);
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
      codigo: "",
      nombre: "",
      unidad: "kg",
      stock_minimo: 0,
      stock_actual: 0,
      costo_promedio: 0,
      proveedor_preferido_id: null
    });
    setShowCreate(true);
  };

  const openEdit = (materia) => {
    setSelectedMateria(materia);
    setFormData({
      codigo: materia.codigo,
      nombre: materia.nombre,
      unidad: materia.unidad,
      stock_minimo: materia.stock_minimo,
      stock_actual: materia.stock_actual,
      costo_promedio: materia.costo_promedio,
      proveedor_preferido_id: materia.proveedor_preferido_id
    });
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createMateriaPrima(formData);
      setShowCreate(false);
      fetchMaterias();
      alert("Materia prima creada exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateMateriaPrima(selectedMateria.materia_id, formData);
      setShowEdit(false);
      fetchMaterias();
      alert("Materia prima actualizada exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Eliminar materia prima "${nombre}"?\n\nNota: No se puede eliminar si tiene movimientos, compras o está en recetas.`)) {
      try {
        await deleteMateriaPrima(id);
        fetchMaterias();
        alert("Materia prima eliminada");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredMaterias = materias.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stockCritico = materias.filter(m => m.stock_actual <= m.stock_minimo);
  const stockNormal = materias.filter(m => m.stock_actual > m.stock_minimo);

  if (loading) return <div className="loading">Cargando materias primas...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Gestión de Materias Primas</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>+ Nueva Materia Prima</button>
        </div>
      </header>

      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px" }}
        />
      </div>

      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Total Materias</h4>
          <p>{materias.length}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Stock Normal</h4>
          <p>{stockNormal.length}</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Stock Crítico</h4>
          <p>{stockCritico.length}</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Costo Total</h4>
          <p>Bs. {materias.reduce((sum, m) => sum + (m.stock_actual * m.costo_promedio), 0).toFixed(2)}</p>
        </div>
      </div>

      <div style={{ padding: "0 15px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
          <thead style={{ background: "#333" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Código</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Nombre</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Unidad</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Stock Actual</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Stock Mínimo</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Costo Prom.</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Proveedor</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterias.map((materia, index) => {
              const isStockBajo = materia.stock_actual <= materia.stock_minimo;
              return (
                <tr key={materia.materia_id} style={{ 
                  borderBottom: "1px solid #555",
                  background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent"
                }}>
                  <td style={{ padding: "12px", color: "#fff", fontWeight: "bold" }}>{materia.codigo}</td>
                  <td style={{ padding: "12px", color: "#fff" }}>{materia.nombre}</td>
                  <td style={{ padding: "12px", color: "#fff" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "#607D8B",
                      color: "white",
                      fontSize: "12px"
                    }}>
                      {materia.unidad.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ 
                    padding: "12px", 
                    color: isStockBajo ? "#F44336" : "#4CAF50",
                    fontWeight: "bold"
                  }}>
                    {materia.stock_actual}
                  </td>
                  <td style={{ padding: "12px", color: "#fff" }}>{materia.stock_minimo}</td>
                  <td style={{ padding: "12px", color: "#fff" }}>Bs. {parseFloat(materia.costo_promedio).toFixed(2)}</td>
                  <td style={{ padding: "12px", color: "#fff", fontSize: "13px" }}>
                    {materia.proveedor_preferido_nombre || "-"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => openEdit(materia)}
                      style={{ padding: "6px 12px", background: "#2196F3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "8px" }}
                    >
                      <AiFillEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(materia.materia_id, materia.nombre)}
                      style={{ padding: "6px 12px", background: "#F44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
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
            <h2>Nueva Materia Prima</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div>
                  <label>Código: *</label>
                  <input 
                    className="InputProyecto" 
                    name="codigo" 
                    value={formData.codigo} 
                    onChange={handleChange} 
                    placeholder="Ej: HAR-001"
                    required 
                  />
                  <small style={{ color: "#999", fontSize: "12px" }}>Mayúsculas, números, guiones (3-20 chars)</small>
                </div>
                <div>
                  <label>Nombre: *</label>
                  <input 
                    className="InputProyecto" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    placeholder="Ej: Harina de trigo"
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Unidad: *</label>
                  <select className="InputProyecto" name="unidad" value={formData.unidad} onChange={handleChange}>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="litro">Litro</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="unidad">Unidad</option>
                    <option value="docena">Docena</option>
                    <option value="paquete">Paquete</option>
                    <option value="caja">Caja</option>
                  </select>
                </div>
                <div>
                  <label>Costo Promedio (Bs.):</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.0001" 
                    name="costo_promedio" 
                    value={formData.costo_promedio} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Stock Mínimo:</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.001" 
                    name="stock_minimo" 
                    value={formData.stock_minimo} 
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label>Stock Actual:</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.001" 
                    name="stock_actual" 
                    value={formData.stock_actual} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>ID Proveedor Preferido (opcional):</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    name="proveedor_preferido_id" 
                    value={formData.proveedor_preferido_id || ""} 
                    onChange={handleChange}
                    placeholder="Dejar vacío si no aplica"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-create">Crear</button>
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
            <h2>Editar Materia Prima</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div>
                  <label>Código: *</label>
                  <input 
                    className="InputProyecto" 
                    name="codigo" 
                    value={formData.codigo} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label>Nombre: *</label>
                  <input 
                    className="InputProyecto" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Unidad: *</label>
                  <select className="InputProyecto" name="unidad" value={formData.unidad} onChange={handleChange}>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="litro">Litro</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="unidad">Unidad</option>
                    <option value="docena">Docena</option>
                    <option value="paquete">Paquete</option>
                    <option value="caja">Caja</option>
                  </select>
                </div>
                <div>
                  <label>Costo Promedio (Bs.):</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.0001" 
                    name="costo_promedio" 
                    value={formData.costo_promedio} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Stock Mínimo:</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.001" 
                    name="stock_minimo" 
                    value={formData.stock_minimo} 
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label>Stock Actual:</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.001" 
                    name="stock_actual" 
                    value={formData.stock_actual} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>ID Proveedor Preferido (opcional):</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    name="proveedor_preferido_id" 
                    value={formData.proveedor_preferido_id || ""} 
                    onChange={handleChange}
                    placeholder="Dejar vacío si no aplica"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-edit">Actualizar</button>
                <button type="button" className="btn-close" onClick={() => setShowEdit(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MateriasPrimas;