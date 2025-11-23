import React, { useState, useEffect } from 'react';
import {
  getAllAvances,
  createAvance,
  updateAvance,
  deleteAvance
} from '../../../API/Admin/Avance_Estudiante.js';
import { getEstudiantes } from '../../../API/Admin/Estudiante_admin.js';

const AvancesEstudiantesView = () => {
  const [avances, setAvances] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedAvance, setSelectedAvance] = useState(null);
  const [formData, setFormData] = useState({
    id_estudiante: "",
    id_modulo: "",
    responsable: "",
    fecha: new Date().toISOString().split('T')[0],
    estado: "pendiente"  // ← valor válido para el backend
    });

  // Búsqueda en select
  const [estSearch, setEstSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [avancesData, estudiantesData] = await Promise.all([
          getAllAvances(),
          getEstudiantes()
        ]);
        setAvances(avancesData || []);
        setEstudiantes(estudiantesData || []);
      } catch (err) {
        setError('Error al cargar avances');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  const filteredAvances = avances.filter(av => {
    const search = searchTerm.toLowerCase();
    const estudiante = estudiantes.find(e => e.id === av.id_estudiante);
    const nombre = estudiante ? `${estudiante.nombres} ${estudiante.apellidopat}`.toLowerCase() : '';
    const modulo = (av.id_modulo || "").toString();
    const responsable = (av.responsable || "").toLowerCase();
    const estado = (av.estado || "").toLowerCase();

    return nombre.includes(search) || modulo.includes(search) || responsable.includes(search) || estado.includes(search);
  });

  // Estadísticas
  const stats = {
    total: avances.length,
    completados: avances.filter(a => a.estado?.toLowerCase() === "completado").length,
    enCurso: avances.filter(a => a.estado?.toLowerCase() === "en curso").length,
    estudiantesConAvance: new Set(avances.map(a => a.id_estudiante)).size
  };

  const loadAvances = async () => {
    try {
      const data = await getAllAvances();
      setAvances(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openDetails = (avance) => {
    setSelectedAvance(avance);
    setShowDetails(true);
  };

  const openEdit = () => {
  setFormData({
    id_estudiante: selectedAvance.id_estudiante || "",
    id_modulo: selectedAvance.id_modulo || "",
    responsable: selectedAvance.responsable || "",
    fecha: selectedAvance.fecha?.split('T')[0] || new Date().toISOString().split('T')[0],
    estado: selectedAvance.estado?.toLowerCase() || "pendiente"  // ← aquí estaba el problema
  });
  setShowEdit(true);
  setShowDetails(false);
};

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAvance(formData);
      setShowCreate(false);
      // En el reset del formulario después de crear:
        setFormData({ 
        id_estudiante: "", 
        id_modulo: "", 
        responsable: "", 
        fecha: new Date().toISOString().split('T')[0], 
        estado: "pendiente"  // ← no "En curso"
        });
      setEstSearch("");
      loadAvances();
      alert("Avance registrado exitosamente");
    } catch (err) {
      alert(err.message || "Error al crear avance");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateAvance(selectedAvance.id, formData);
      setShowEdit(false);
      loadAvances();
      alert("Avance actualizado");
    } catch (err) {
      alert(err.message || "Error al actualizar");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este avance permanentemente?")) return;
    try {
      await deleteAvance(selectedAvance.id);
      setShowDetails(false);
      loadAvances();
      alert("Avance eliminado");
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const getEstudianteNombre = (id_estudiante) => {
    const est = estudiantes.find(e => e.id === id_estudiante);
    return est ? `${est.nombres} ${est.apellidopat} ${est.apellidomat || ''}` : "Estudiante desconocido";
  };

  const getEstadoColor = (estado) => {
    const e = estado?.toLowerCase();
    if (e === "completado") return "#34d399";
    if (e === "en curso") return "#fbbf24";
    if (e === "pendiente") return "#ef4444";
    return "#94a3b8";
  };

  if (loading) return <div className="loading">Cargando avances...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Avances de Estudiantes</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={() => setShowCreate(true)}>
            + Registrar Avance
          </button>
        </div>
      </header>

      {/* BUSCADOR */}
      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por estudiante, módulo, responsable o estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px", fontSize: "14px" }}
        />
      </div>

      {/* ESTADÍSTICAS */}
      <div className="stats-container">
        <div className="stat-card stat-total"><h4>Total Avances</h4><p>{stats.total}</p></div>
        <div className="stat-card stat-completed"><h4>Completados</h4><p>{stats.completados}</p></div>
        <div className="stat-card stat-pending"><h4>En Curso</h4><p>{stats.enCurso}</p></div>
        <div className="stat-card stat-overdue"><h4>Estudiantes con Avance</h4><p>{stats.estudiantesConAvance}</p></div>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="proyectos-grid">
        {filteredAvances.length === 0 ? (
          <div className="no-data full-width">
            {searchTerm === "" ? "No hay avances registrados" : `No se encontraron avances para "${searchTerm}"`}
          </div>
        ) : (
          filteredAvances.map((avance) => (
            <div key={avance.id} className="proyecto-card" onClick={() => openDetails(avance)}>
              <div className="card-header">
                <h3>{getEstudianteNombre(avance.id_estudiante)}</h3>
                <span className="status" style={{ backgroundColor: getEstadoColor(avance.estado) + "30", color: getEstadoColor(avance.estado) }}>
                  {avance.estado || "Sin estado"}
                </span>
              </div>
              <div className="card-body">
                <p><strong>Módulo:</strong> {avance.id_modulo || "No especificado"}</p>
                <p><strong>Responsable:</strong> {avance.responsable || "No asignado"}</p>
                <p><strong>Fecha:</strong> {new Date(avance.fecha).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DETALLES */}
      {showDetails && selectedAvance && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Avance - {getEstudianteNombre(selectedAvance.id_estudiante)}</h2>
            <div className="modal-grid">
              <div>
                <p><strong>Módulo:</strong> {selectedAvance.id_modulo || "—"}</p>
                <p><strong>Estado:</strong> <span style={{ color: getEstadoColor(selectedAvance.estado), fontWeight: "bold" }}>{selectedAvance.estado}</span></p>
              </div>
              <div>
                <p><strong>Responsable:</strong> {selectedAvance.responsable || "No asignado"}</p>
                <p><strong>Fecha:</strong> {new Date(selectedAvance.fecha).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-edit" onClick={openEdit}>Editar</button>
              <button className="btn-delete" onClick={handleDelete}>Eliminar</button>
              <button className="btn-close" onClick={() => setShowDetails(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR - CORREGIDO */}
{showCreate && (
  <div className="modal-overlay" onClick={() => setShowCreate(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h2>Registrar Nuevo Avance</h2>
      <form onSubmit={handleCreate}>
        <div className="form-full">
          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={estSearch}
            onChange={(e) => setEstSearch(e.target.value)}
            className="InputProyecto"
            style={{ marginBottom: "10px" }}
          />
          {/* SELECT DE ESTUDIANTE (ESTO FALTABA!) */}
          <select 
            className="InputProyecto" 
            value={formData.id_estudiante} 
            onChange={(e) => setFormData({...formData, id_estudiante: e.target.value})}
            required
          >
            <option value="">Seleccionar estudiante</option>
            {estudiantes
              .filter(e => `${e.nombres} ${e.apellidopat} ${e.apellidomat} ${e.numero_matricula || ''}`
                .toLowerCase()
                .includes(estSearch.toLowerCase()))
              .map(est => (
                <option key={est.id} value={est.id}>
                  {est.nombres} {est.apellidopat} {est.apellidomat || ''} - {est.numero_matricula}
                </option>
              ))}
          </select>
        </div>

        <div className="form-row">
          <input 
            className="InputProyecto" 
            placeholder="ID Módulo (ej: 3)" 
            value={formData.id_modulo} 
            onChange={(e) => setFormData({...formData, id_modulo: e.target.value})} 
            required 
          />
          <input 
            className="InputProyecto" 
            placeholder="Responsable" 
            value={formData.responsable} 
            onChange={(e) => setFormData({...formData, responsable: e.target.value})} 
          />
        </div>

        <div className="form-row">
          <input 
            className="InputProyecto" 
            type="date" 
            value={formData.fecha} 
            onChange={(e) => setFormData({...formData, fecha: e.target.value})} 
            required 
          />
          <select 
            className="InputProyecto" 
            value={formData.estado} 
            onChange={(e) => setFormData({...formData, estado: e.target.value})}
            required
          >
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En progreso</option>
            <option value="completado">Completado</option>
          </select>
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn-create">Registrar Avance</button>
          <button type="button" class46="btn-close" onClick={() => {
            setShowCreate(false);
            setEstSearch("");
            setFormData({ 
              id_estudiante: "", 
              id_modulo: "", 
              responsable: "", 
              fecha: new Date().toISOString().split('T')[0], 
              estado: "pendiente"
            });
          }}>Cancelar</button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* MODAL EDITAR */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Avance</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-full">
                <select 
                    className="InputProyecto" 
                    value={formData.estado} 
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    required
                    >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="completado">Completado</option>
                </select>
              </div>

              <div className="form-row">
                <input className="InputProyecto" value={formData.id_modulo} onChange={(e) => setFormData({...formData, id_modulo: e.target.value})} required />
                <input className="InputProyecto" value={formData.responsable} onChange={(e) => setFormData({...formData, responsable: e.target.value})} required />
              </div>

              <div className="form-row">
                <input className="InputProyecto" type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} required />
                <select className="InputProyecto" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} required>
                  <option value="pendiente">Pendiente</option>
                  <option value="en progreso">En curso</option>
                  <option value="completado">Completado</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-edit">Guardar Cambios</button>
                <button type="button" className="btn-close" onClick={() => setShowEdit(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvancesEstudiantesView;