import React, { useState, useEffect } from 'react';
import {
  getAllObservaciones,
  createObservacion,
  updateObservacion,
  deleteObservacion
} from '../../../API/Admin/Observacion.js';
import { getEstudiantes } from '../../../API/Admin/Estudiante_admin.js';

const ObservacionesView = () => {
  const [observaciones, setObservaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedObs, setSelectedObs] = useState(null);
  const [formData, setFormData] = useState({
    id_estudiante: "",
    contenido: "",
    autor: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  // Búsqueda en select de estudiantes
  const [estSearch, setEstSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [obsData, estData] = await Promise.all([
          getAllObservaciones(),
          getEstudiantes()
        ]);
        setObservaciones(obsData || []);
        setEstudiantes(estData || []);
      } catch (err) {
        setError('Error al cargar observaciones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredEstudiantes = estudiantes.filter(e =>
    `${e.nombres} ${e.apellidopat} ${e.apellidomat} ${e.numero_matricula || ''}`
      .toLowerCase()
      .includes(estSearch.toLowerCase())
  );

  const filteredObservaciones = observaciones.filter(obs => {
    const search = searchTerm.toLowerCase();
    const estudiante = estudiantes.find(e => e.id === obs.id_estudiante);
    const nombreEst = estudiante ? `${estudiante.nombres} ${estudiante.apellidopat}`.toLowerCase() : '';
    const contenido = (obs.contenido || "").toLowerCase();
    const autor = (obs.autor || "").toLowerCase();

    return nombreEst.includes(search) || contenido.includes(search) || autor.includes(search);
  });

  const stats = {
    total: observaciones.length,
    hoy: observaciones.filter(o => o.fecha === new Date().toISOString().split('T')[0]).length,
    estaSemana: observaciones.filter(o => {
      const fecha = new Date(o.fecha);
      const hoy = new Date();
      const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
      return fecha >= inicioSemana;
    }).length
  };

  const loadObservaciones = async () => {
    try {
      const data = await getAllObservaciones();
      setObservaciones(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openDetails = (obs) => {
    setSelectedObs(obs);
    setShowDetails(true);
  };

  const openEdit = () => {
    setFormData({
      id_estudiante: selectedObs.id_estudiante,
      contenido: selectedObs.contenido || "",
      autor: selectedObs.autor || "",
      fecha: selectedObs.fecha?.split('T')[0] || ""
    });
    setShowEdit(true);
    setShowDetails(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createObservacion(formData);
      setShowCreate(false);
      setFormData({ id_estudiante: "", contenido: "", autor: "", fecha: new Date().toISOString().split('T')[0] });
      setEstSearch("");
      loadObservaciones();
      alert("Observación creada exitosamente");
    } catch (err) {
      alert(err.message || "Error al crear observación");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateObservacion(selectedObs.id, formData);
      setShowEdit(false);
      loadObservaciones();
      alert("Observación actualizada");
    } catch (err) {
      alert(err.message || "Error al actualizar");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar esta observación permanentemente?")) return;
    try {
      await deleteObservacion(selectedObs.id);
      setShowDetails(false);
      loadObservaciones();
      alert("Observación eliminada");
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const getEstudianteNombre = (id_estudiante) => {
    const est = estudiantes.find(e => e.id === id_estudiante);
    return est ? `${est.nombres} ${est.apellidopat} ${est.apellidomat || ''}` : "Estudiante no encontrado";
  };

  if (loading) return <div className="loading">Cargando observaciones...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Observaciones de Estudiantes</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={() => setShowCreate(true)}>
            + Nueva Observación
          </button>
        </div>
      </header>

      {/* BUSCADOR */}
      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por estudiante, contenido o autor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px", fontSize: "14px" }}
        />
      </div>

      {/* ESTADÍSTICAS */}
      <div className="stats-container">
        <div className="stat-card stat-total"><h4>Total</h4><p>{stats.total}</p></div>
        <div className="stat-card stat-completed"><h4>Hoy</h4><p>{stats.hoy}</p></div>
        <div className="stat-card stat-pending"><h4>Esta Semana</h4><p>{stats.estaSemana}</p></div>
        <div className="stat-card stat-overdue"><h4>Estudiantes con Obs</h4><p>{new Set(observaciones.map(o => o.id_estudiante)).size}</p></div>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="proyectos-grid">
        {filteredObservaciones.length === 0 ? (
          <div className="no-data full-width">
            {searchTerm === "" ? "No hay observaciones registradas" : `No se encontraron observaciones para "${searchTerm}"`}
          </div>
        ) : (
          filteredObservaciones.map((obs) => (
            <div key={obs.id} className="proyecto-card" onClick={() => openDetails(obs)}>
              <div className="card-header">
                <h3>{getEstudianteNombre(obs.id_estudiante)}</h3>
                <span className="status pending">
                  {new Date(obs.fecha).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="card-body">
                <p><strong>Autor:</strong> {obs.autor || "Anónimo"}</p>
                <p><strong>Contenido:</strong> {obs.contenido?.substring(0, 100)}{obs.contenido?.length > 100 ? "..." : ""}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DETALLES */}
      {showDetails && selectedObs && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Observación - {getEstudianteNombre(selectedObs.id_estudiante)}</h2>
            <div className="modal-grid">
              <div>
                <p><strong>Fecha:</strong> {new Date(selectedObs.fecha).toLocaleDateString('es-ES')}</p>
                <p><strong>Autor:</strong> {selectedObs.autor || "No especificado"}</p>
              </div>
            </div>
            <div className="resumen">
              <p><strong>Contenido:</strong></p>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{selectedObs.contenido}</p>
            </div>
            <div className="modal-actions">
              <button className="btn-edit" onClick={openEdit}>Editar</button>
              <button className="btn-delete" onClick={handleDelete}>Eliminar</button>
              <button className="btn-close" onClick={() => setShowDetails(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Nueva Observación</h2>
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
                <select
                  className="InputProyecto"
                  value={formData.id_estudiante}
                  onChange={(e) => setFormData({...formData, id_estudiante: e.target.value})}
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {filteredEstudiantes.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.nombres} {est.apellidopat} {est.apellidomat || ''} - {est.numero_matricula}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-full">
                <input
                  className="InputProyecto"
                  placeholder="Autor (ej: Dr. Pérez)"
                  value={formData.autor}
                  onChange={(e) => setFormData({...formData, autor: e.target.value})}
                  required
                />
              </div>

              <div className="form-full">
                <input
                  className="InputProyecto"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>

              <div className="form-full">
                <textarea
                  className="InputProyecto"
                  rows="8"
                  placeholder="Contenido de la observación..."
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-create">Crear Observación</button>
                <button type="button" className="btn-close" onClick={() => {
                  setShowCreate(false);
                  setEstSearch("");
                  setFormData({ id_estudiante: "", contenido: "", autor: "", fecha: new Date().toISOString().split('T')[0] });
                }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Observación</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-full">
                <select className="InputProyecto" value={formData.id_estudiante} onChange={(e) => setFormData({...formData, id_estudiante: e.target.value})} required>
                  <option value="">Seleccionar estudiante</option>
                  {estudiantes.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.nombres} {est.apellidopat} {est.apellidomat || ''} - {est.numero_matricula}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-full">
                <input className="InputProyecto" value={formData.autor} onChange={(e) => setFormData({...formData, autor: e.target.value})} required />
              </div>

              <div className="form-full">
                <input className="InputProyecto" type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} required />
              </div>

              <div className="form-full">
                <textarea
                  className="InputProyecto"
                  rows="8"
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  required
                />
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

export default ObservacionesView;