import React, { useEffect, useState } from "react";
import { getAllTalleres, getTaller, createTaller, updateTaller, deleteTaller } from "../../../API/Admin/Taller";
import { getAllMetodologias } from "../../../API/Admin/Metodologia.js";
import { TallerStyles } from "../../Components screens/Styles.js";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { styles } from "../../Components screens/Styles";

function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [metodologias, setMetodologias] = useState([]);
  const [editingTaller, setEditingTaller] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    id_metodologia: "",
    tipo_taller: "",
    evaluacion_final: "",
    duracion: "",
    resultado: "",
    fecha_realizacion: "",
  });
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [talleresData, metodologiasData] = await Promise.all([
        getAllTalleres(),
        getAllMetodologias(),
      ]);
      console.log("Talleres Data:", talleresData);
      console.log("Metodologias Data:", metodologiasData);

      const talleresArray = Array.isArray(talleresData) ? talleresData : (talleresData?.data || []);
      const metodologiasArray = Array.isArray(metodologiasData) ? metodologiasData : (metodologiasData?.data || []);

      setTalleres(talleresArray);
      setMetodologias(metodologiasArray);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setFormData({
      titulo: "",
      id_metodologia: "",
      tipo_taller: "",
      evaluacion_final: "",
      duracion: "",
      resultado: "",
      fecha_realizacion: "",
    });
    setShowCreate(true);
  };

  const openEdit = async (id) => {
    try {
      const tallerData = await getTaller(id);
      setFormData(tallerData.data);
      setEditingTaller(tallerData.data);
      setShowEdit(true);
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al cargar el taller");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      const dataToSend = {
        titulo: formData.titulo,
        id_metodologia: parseInt(formData.id_metodologia),
        tipo_taller: formData.tipo_taller,
        evaluacion_final: formData.evaluacion_final || null,
        duracion: formData.duracion || null,
        resultado: formData.resultado || null,
        fecha_realizacion: formData.fecha_realizacion,
      };

      await createTaller(dataToSend);
      setShowCreate(false);
      setFormData({
        titulo: "",
        id_metodologia: "",
        tipo_taller: "",
        evaluacion_final: "",
        duracion: "",
        resultado: "",
        fecha_realizacion: "",
      });
      await fetchData();
      alert("Taller creado exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al crear el taller");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      const dataToSend = {
        titulo: formData.titulo,
        id_metodologia: parseInt(formData.id_metodologia),
        tipo_taller: formData.tipo_taller,
        evaluacion_final: formData.evaluacion_final || null,
        duracion: formData.duracion || null,
        resultado: formData.resultado || null,
        fecha_realizacion: formData.fecha_realizacion,
      };

      await updateTaller(editingTaller.id, dataToSend);
      setShowEdit(false);
      setEditingTaller(null);
      setFormData({
        titulo: "",
        id_metodologia: "",
        tipo_taller: "",
        evaluacion_final: "",
        duracion: "",
        resultado: "",
        fecha_realizacion: "",
      });
      await fetchData();
      alert("Taller actualizado exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al actualizar el taller");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id, tallerTitulo) => {
    if (window.confirm(`¿Estás seguro de eliminar el taller "${tallerTitulo}"? Esta acción no se puede deshacer.`)) {
      setOperationLoading(true);
      setError(null);
      try {
        await deleteTaller(id);
        await fetchData();
        alert("Taller eliminado exitosamente");
      } catch (err) {
        setError(err.message);
        alert(err.message || "Error al eliminar el taller");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const getMetodologiaNombre = (id) => {
    const metodologia = metodologias.find(m => m.id === id);
    return metodologia ? metodologia.nombre : id;
  };

  // Función para filtrar talleres
  const filteredTalleres = talleres.filter((taller) => {
    const searchLower = searchTerm.toLowerCase();
    const titulo = (taller.titulo || "").toLowerCase();
    const tipoTaller = (taller.tipo_taller || "").toLowerCase();
    const metodologiaNombre = getMetodologiaNombre(taller.id_metodologia).toLowerCase();
    const resultado = (taller.resultado || "").toLowerCase();
    
    return titulo.includes(searchLower) || 
           tipoTaller.includes(searchLower) || 
           metodologiaNombre.includes(searchLower) ||
           resultado.includes(searchLower);
  });

  const uniqueTipos = [...new Set(talleres.map(t => t.tipo_taller).filter(Boolean))];

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h2 style={TallerStyles.title}>Gestión de Talleres</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>
            + Nuevo Taller
          </button>
        </div>
      </header>

      {loading && <p className="loading">Cargando talleres...</p>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
        {/* BUSCADOR */}
          <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por título, tipo, metodología o resultado..."
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
          {/* ESTADÍSTICAS */}
          <div className="stats-container">
            <div className="stat-card stat-total">
              <h4>Total Talleres</h4>
              <p>{talleres.length}</p>
            </div>
            <div className="stat-card stat-completed">
              <h4>Tipos Únicos</h4>
              <p>{uniqueTipos.length}</p>
            </div>
            <div className="stat-card stat-pending">
              <h4>Metodologías</h4>
              <p>{metodologias.length}</p>
            </div>
            <div className="stat-card stat-overdue">
              <h4>Evaluados</h4>
              <p>{talleres.filter(t => t.evaluacion_final).length}</p>
            </div>
          </div>

          

          {/* TABLA */}
          <div style={TallerStyles.rolesTableContainer}>
            <table style={TallerStyles.table}>
              <thead style={TallerStyles.tableHead}>
                <tr>
                  <th style={TallerStyles.tableHeader}>Título</th>
                  <th style={TallerStyles.tableHeader}>Metodología</th>
                  <th style={TallerStyles.tableHeader}>Tipo</th>
                  <th style={TallerStyles.tableHeader}>Evaluación</th>
                  <th style={TallerStyles.tableHeader}>Duración</th>
                  <th style={TallerStyles.tableHeader}>Resultado</th>
                  <th style={TallerStyles.tableHeader}>Fecha</th>
                  <th style={TallerStyles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTalleres.length > 0 ? (
                  filteredTalleres.map((taller, index) => (
                    <tr
                      key={taller.id}
                      style={{
                        ...TallerStyles.tableRow,
                        ...(index % 2 === 0 ? TallerStyles.tableRowAlternate : {}),
                      }}
                    >
                      <td style={TallerStyles.tableCellBold}>{taller.titulo}</td>
                      <td style={TallerStyles.tableCell}>{getMetodologiaNombre(taller.id_metodologia)}</td>
                      <td style={TallerStyles.tableCell}>
                        <span
                          style={{
                            ...TallerStyles.statusBadge,
                            ...(taller.tipo_taller === "Práctico" 
                              ? TallerStyles.statusDefault 
                              : TallerStyles.statusNotDefault),
                          }}
                        >
                          {taller.tipo_taller}
                        </span>
                      </td>
                      <td style={TallerStyles.tableCell}>{taller.evaluacion_final || "-"}</td>
                      <td style={TallerStyles.tableCell}>{taller.duracion || "-"}</td>
                      <td style={TallerStyles.tableCell}>{taller.resultado || "-"}</td>
                      <td style={TallerStyles.tableCell}>{taller.fecha_realizacion}</td>
                      <td style={TallerStyles.tableCellCenter}>
                        <button
                          onClick={() => openEdit(taller.id)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.editButtonDisabled : styles.editButton}
                        >
                          <AiFillEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(taller.id, taller.titulo)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.deleteButtonDisabled : styles.deleteButton}
                        >
                          <AiFillDelete />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={TallerStyles.noDataText} colSpan="8">
                      {searchTerm ? "No se encontraron resultados" : "No hay talleres registrados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL CREAR */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Nuevo Taller</h2>
            
            <form onSubmit={handleCreate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Título:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="titulo"
                    placeholder="Ej: Taller de Programación"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Metodología:</label>
                  <select
                    className="InputProyecto"
                    name="id_metodologia"
                    value={formData.id_metodologia}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  >
                    <option value="">Selecciona Metodología</option>
                    {metodologias.length > 0 ? (
                      metodologias.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))
                    ) : (
                      <option disabled>No hay metodologías disponibles</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Tipo de Taller:</label>
                  <select
                    className="InputProyecto"
                    name="tipo_taller"
                    value={formData.tipo_taller}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  >
                    <option value="">Selecciona Tipo</option>
                    <option value="Teórico">Teórico</option>
                    <option value="Práctico">Práctico</option>
                    <option value="Mixto">Mixto</option>
                  </select>
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Fecha de Realización:</label>
                  <input
                    className="InputProyecto"
                    type="date"
                    name="fecha_realizacion"
                    value={formData.fecha_realizacion}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div>
                  <label style={TallerStyles.formLabel}>Evaluación Final:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="evaluacion_final"
                    placeholder="Ej: Aprobado, Excelente"
                    value={formData.evaluacion_final}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Duración:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="duracion"
                    placeholder="Ej: 4 horas, 2 días"
                    value={formData.duracion}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Resultado:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="resultado"
                    placeholder="Ej: Exitoso, Pendiente"
                    value={formData.resultado}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="btn-create"
                >
                  {operationLoading ? "Procesando..." : "Crear Taller"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  disabled={operationLoading}
                  className="btn-close"
                >
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Taller</h2>
            
            <form onSubmit={handleUpdate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Título:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="titulo"
                    placeholder="Ej: Taller de Programación"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Metodología:</label>
                  <select
                    className="InputProyecto"
                    name="id_metodologia"
                    value={formData.id_metodologia}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  >
                    <option value="">Selecciona Metodología</option>
                    {metodologias.length > 0 ? (
                      metodologias.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))
                    ) : (
                      <option disabled>No hay metodologías disponibles</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Tipo de Taller:</label>
                  <select
                    className="InputProyecto"
                    name="tipo_taller"
                    value={formData.tipo_taller}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  >
                    <option value="">Selecciona Tipo</option>
                    <option value="Teórico">Teórico</option>
                    <option value="Práctico">Práctico</option>
                    <option value="Mixto">Mixto</option>
                  </select>
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Fecha de Realización:</label>
                  <input
                    className="InputProyecto"
                    type="date"
                    name="fecha_realizacion"
                    value={formData.fecha_realizacion}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div>
                  <label style={TallerStyles.formLabel}>Evaluación Final:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="evaluacion_final"
                    placeholder="Ej: Aprobado, Excelente"
                    value={formData.evaluacion_final}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Duración:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="duracion"
                    placeholder="Ej: 4 horas, 2 días"
                    value={formData.duracion}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Resultado:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="resultado"
                    placeholder="Ej: Exitoso, Pendiente"
                    value={formData.resultado}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="btn-edit"
                >
                  {operationLoading ? "Procesando..." : "Actualizar Taller"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  disabled={operationLoading}
                  className="btn-close"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Talleres;