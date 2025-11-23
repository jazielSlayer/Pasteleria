import React, { useState, useEffect } from 'react';
import {
  getAllProyectos,
  getProyectoById,
  createProyecto,
  updateProyecto,
  deleteProyecto
} from '../../../API/Admin/Proyecto';


import { getEstudiantes } from '../../../API/Admin/Estudiante_admin';
import { getDocentes } from '../../../API/Admin/Docente_admin';

const ProyectosView = () => {
  const [proyectos, setProyectos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProyectos = proyectos.filter((proyecto) => {
    const searchLower = searchTerm.toLowerCase();
    const name = (proyecto.titulo || "").toLowerCase();
    const descripcion = (proyecto.linea_investigacion || "").toLowerCase();
    const startPath = (proyecto.area_conocimiento || "").toLowerCase();
    
    return name.includes(searchLower) || 
           descripcion.includes(searchLower) || 
           startPath.includes(searchLower);
  });

  // Modales
  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Datos
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [formData, setFormData] = useState({});

  // Búsqueda en selects
  const [estSearch, setEstSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');

  // === CARGAR DATOS INICIALES ===
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [proyectosData, estudiantesData, docentesData] = await Promise.all([
          getAllProyectos(),
          getEstudiantes(),
          getDocentes()
        ]);
        setProyectos(proyectosData);
        setEstudiantes(estudiantesData);
        setDocentes(docentesData);
      } catch (err) {
        setError('Error al cargar datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const filteredEstudiantes = estudiantes.filter(e =>
    `${e.nombres} ${e.apellidopat} ${e.apellidomat} ${e.numero_matricula || ''}`
      .toLowerCase()
      .includes(estSearch.toLowerCase())
  );

  const filteredDocentes = docentes.filter(d =>
    `${d.nombres} ${d.apellidopat} ${d.apellidomat || ''} ${d.numero_item || ''}`
      .toLowerCase()
      .includes(docSearch.toLowerCase())
  );

  
  const stats = {
    total: proyectos.length,
    calificados: proyectos.filter(p => p.calificacion).length,
    enCurso: proyectos.filter(p => !p.calificacion).length,
    retrasados: proyectos.filter(p => {
      if (!p.fecha_entrega) return false;
      const entrega = new Date(p.fecha_entrega);
      return entrega < new Date() && !p.calificacion;
    }).length
  };

  // === HANDLERS ===
  const loadProyectos = async () => {
    const data = await getAllProyectos();
    setProyectos(data);
  };

  const openDetails = async (id) => {
    try {
      const proyecto = await getProyectoById(id);
      setSelectedProyecto(proyecto);
      setShowDetails(true);
    } catch (err) {
      alert('Error al cargar detalles');
    }
  };

  const openEdit = () => {
    setFormData({
      ...selectedProyecto,
      id_estudiante: selectedProyecto.id_estudiante,
      id_docente_guia: selectedProyecto.id_docente_guia,
      id_docente_revisor: selectedProyecto.id_docente_revisor,
      fecha_entrega: selectedProyecto.fecha_entrega?.split('T')[0] || '',
      fecha_defensa: selectedProyecto.fecha_defensa?.split('T')[0] || '',
    });
    setShowEdit(true);
    setShowDetails(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProyecto(formData);
      setShowCreate(false);
      setFormData({});
      setEstSearch('');
      setDocSearch('');
      loadProyectos();
      alert('Proyecto creado');
    } catch (err) {
      alert(err.message || 'Error al crear');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProyecto(selectedProyecto.id, formData);
      setShowEdit(false);
      setFormData({});
      loadProyectos();
      alert('Proyecto actualizado');
    } catch (err) {
      alert(err.message || 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    try {
      await deleteProyecto(selectedProyecto.id);
      setShowDetails(false);
      loadProyectos();
      alert('Proyecto eliminado');
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };


  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Proyectos de Grado</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={() => setShowCreate(true)}>+ Nuevo Proyecto</button>
        </div>
      </header>
       <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre de rol, descripción o ruta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="InputProyecto"
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "12px 16px",
                fontSize: "14px",
              }}
            />
          </div>
      <div className="stats-container">
        <div className="stat-card stat-total"><h4>Total</h4><p>{stats.total}</p></div>
        <div className="stat-card stat-completed"><h4>Calificados</h4><p>{stats.calificados}</p></div>
        <div className="stat-card stat-pending"><h4>En Curso</h4><p>{stats.enCurso}</p></div>
        <div className="stat-card stat-overdue"><h4>Retrasados</h4><p>{stats.retrasados}</p></div>
      </div>
      <div className="proyectos-grid">
        {filteredProyectos.length === 0 ? (
          <div className="no-data full-width">
            {searchTerm === "" 
              ? "No hay proyectos registrados" 
              : `No se encontraron proyectos que coincidan con "${searchTerm}"`
            }
          </div>
        ) : (
          filteredProyectos.map((proyecto) => (
            <div 
              key={proyecto.id} 
              className="proyecto-card" 
              onClick={() => openDetails(proyecto.id)}
            >
              <div className="card-header">
                <h3>{proyecto.titulo}</h3>
                <span className={`status ${proyecto.calificacion ? 'completed' : 'pending'}`}>
                  {proyecto.calificacion ? `Calif: ${proyecto.calificacion}` : 'En curso'}
                </span>
              </div>
              <div className="card-body">
                <p><strong>Estudiante:</strong> {proyecto.estudiante_nombres} {proyecto.estudiante_apellidopat}</p>
                <p><strong>Área:</strong> {proyecto.area_conocimiento}</p>
                <p><strong>Entrega:</strong> {proyecto.fecha_entrega?.split('T')[0] || 'Sin fecha'}</p>
              </div>
            </div>
          ))
        )}
      </div>
      {/* MODAL DETALLES */}
      {showDetails && selectedProyecto && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedProyecto.titulo}</h2>
            <div className="modal-grid">
              <div>
                
                <p><strong>Estudiante:</strong> {selectedProyecto.estudiante_nombres} {selectedProyecto.estudiante_apellidopat} {selectedProyecto.estudiante_apellidomat}</p>
                <p><strong>Matrícula:</strong> {selectedProyecto.numero_matricula}</p>
                <p><strong>Guía:</strong> {selectedProyecto.guia_nombres} ({selectedProyecto.guia_numero_item})</p>
                <p><strong>Revisor:</strong> {selectedProyecto.revisor_nombres} ({selectedProyecto.revisor_numero_item})</p>
              </div>
              <div>
                <p><strong>Línea:</strong> {selectedProyecto.linea_investigacion}</p>
                <p><strong>Área:</strong> {selectedProyecto.area_conocimiento}</p>
                <p><strong>Calificación:</strong> {selectedProyecto.calificacion || 'Sin calificar'}</p>
                <p><strong>Calificación 2:</strong> {selectedProyecto.calificacion2 || 'Sin calificar'}</p>
                <p><strong>Calificación final:</strong> {selectedProyecto.calificacion_final || 'Sin calificar'}</p>
                <p><strong>Entrega:</strong> {selectedProyecto.fecha_entrega}</p>
                <p><strong>Defensa:</strong> {selectedProyecto.fecha_defensa || 'No programada'}</p>
              </div>
            </div>
            {selectedProyecto.resumen && <div className="resumen"><p><strong>Resumen:</strong></p><p>{selectedProyecto.resumen}</p></div>}
            {selectedProyecto.observacion && <div className="resumen"><p><strong>Observación:</strong></p><p>{selectedProyecto.observacion}</p></div>}
            <div className="modal-actions">
              <button className="btn-edit" onClick={openEdit}>Editar</button>
              <button className="btn-delete" onClick={handleDelete}>Eliminar</button>
              <button className="btn-close" onClick={() => setShowDetails(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Crear Proyecto</h2>
            <form onSubmit={handleCreate}>
              <div className="form-full">
                <input className="InputProyecto" placeholder="Título" onChange={e => setFormData({...formData, titulo: e.target.value})} required />
              </div>

              <div className="form-row">
                <input className="InputProyecto" placeholder="Línea de investigación" onChange={e => setFormData({...formData, linea_investigacion: e.target.value})} required />
                <input className="InputProyecto" placeholder="Área de conocimiento" onChange={e => setFormData({...formData, area_conocimiento: e.target.value})} required />
              </div>

              <div className="select-container">
                <select className="InputProyecto" onChange={e => setFormData({...formData, id_estudiante: e.target.value})} required>
                  <option value="">Seleccione estudiante</option>
                  {filteredEstudiantes.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.nombres} {est.apellidopat} {est.apellidomat} - {est.numero_matricula}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-container">
                <select className="InputProyecto" onChange={e => setFormData({...formData, id_docente_guia: e.target.value})} required>
                  <option value="">Seleccione docente guía</option>
                  {filteredDocentes.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombres} {doc.apellidopat} ({doc.numero_item})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-full">
                <select className="InputProyecto" onChange={e => setFormData({...formData, id_docente_revisor: e.target.value})} required>
                  <option value="">Seleccione docente revisor</option>
                  {filteredDocentes.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombres} {doc.apellidopat} ({doc.numero_item})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row form-row-3">
                <input className="InputProyecto" type="date" onChange={e => setFormData({...formData, fecha_entrega: e.target.value})} required />
                <input className="InputProyecto" type="date" onChange={e => setFormData({...formData, fecha_defensa: e.target.value})} />
                <input className="InputProyecto" type="number" min="0" max="100" placeholder="Calificación" onChange={e => setFormData({...formData, calificacion: e.target.value})} />
                <input className="InputProyecto" type="number" step="0.1" min="0" max="100" placeholder="Calificación 2" onChange={e => setFormData({...formData, calificacion2: e.target.value})} />
                <input className="InputProyecto" type="number" step="0.1" min="0" max="100" placeholder="Calificación final" onChange={e => setFormData({...formData, calificacion_final: e.target.value})} />
              </div>

              <div className="form-full">
                <textarea className="InputProyecto" placeholder="Resumen" onChange={e => setFormData({...formData, resumen: e.target.value})} />
              </div>
              <div className="form-full">
                <textarea className="InputProyecto" placeholder="Observación" onChange={e => setFormData({...formData, observacion: e.target.value})} />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-create">Crear</button>
                <button type="button" className="btn-close" onClick={() => { setShowCreate(false); setEstSearch(''); setDocSearch(''); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Proyecto</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-full">
                <input className="InputProyecto" value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} required />
              </div>

              <div className="form-row">
                <input className="InputProyecto" value={formData.linea_investigacion || ''} onChange={e => setFormData({...formData, linea_investigacion: e.target.value})} required />
                <input className="InputProyecto" value={formData.area_conocimiento || ''} onChange={e => setFormData({...formData, area_conocimiento: e.target.value})} required />
              </div>

              <div className="form-full">
                <select className="InputProyecto" value={formData.id_estudiante || ''} onChange={e => setFormData({...formData, id_estudiante: e.target.value})} required>
                  <option value="">Seleccione estudiante</option>
                  {estudiantes.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.nombres} {est.apellidopat} {est.apellidomat} - {est.numero_matricula}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-full">
                <select className="InputProyecto" value={formData.id_docente_guia || ''} onChange={e => setFormData({...formData, id_docente_guia: e.target.value})} required>
                  <option value="">Seleccione docente guía</option>
                  {docentes.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombres} {doc.apellidopat} ({doc.numero_item})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-full">
                <select className="InputProyecto" value={formData.id_docente_revisor || ''} onChange={e => setFormData({...formData, id_docente_revisor: e.target.value})} required>
                  <option value="">Seleccione docente revisor</option>
                  {docentes.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombres} {doc.apellidopat} ({doc.numero_item})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas y Calificación */}
              <div className="form-row form-row-3">
                <input className="InputProyecto" type="date" value={formData.fecha_entrega || ''} onChange={e => setFormData({...formData, fecha_entrega: e.target.value})} required />
                <input className="InputProyecto" type="date" value={formData.fecha_defensa || ''} onChange={e => setFormData({...formData, fecha_defensa: e.target.value})} />
                <input className="InputProyecto" type="number" min="0" max="100" value={formData.calificacion || ''} onChange={e => setFormData({...formData, calificacion: e.target.value})} />
                <input className="InputProyecto" type="number" min="0" max="100" value={formData.calificacion2 || ''} onChange={e => setFormData({...formData, calificacion2: e.target.value})} />
                <input className="InputProyecto" type="number" min="0" max="100" value={formData.calificacion_final || ''} onChange={e => setFormData({...formData, calificacion_final: e.target.value})} />
              </div>

              {/* Textareas */}
              <div className="form-full">
                <textarea className="InputProyecto" value={formData.resumen || ''} onChange={e => setFormData({...formData, resumen: e.target.value})} />
              </div>
              <div className="form-full">
                <textarea className="InputProyecto" value={formData.observacion || ''} onChange={e => setFormData({...formData, observacion: e.target.value})} />
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

export default ProyectosView;