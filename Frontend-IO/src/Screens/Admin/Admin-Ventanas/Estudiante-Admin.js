import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante } from "../../../API/Admin/Estudiante_admin";
import { EstudianteStyles } from "../../Components screens/Styles";
import { styles } from "../../Components screens/Styles";

function AdminEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modales
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  // Datos
  const [editingEstudiante, setEditingEstudiante] = useState(null);
  const [formData, setFormData] = useState({
    per_id: "",
    id_programa_academico: "",
    ru: "",
    fecha_inscripcion: "",
    estado: 1,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEstudiantes();
      setEstudiantes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.per_id) {
      errors.per_id = "El ID de persona es obligatorio";
    }
    if (!data.id_programa_academico) {
      errors.id_programa_academico = "El ID de programa es obligatorio";
    }
    if (!data.ru.trim()) {
      errors.ru = "El número de matrícula es obligatorio";
    }
    if (!data.fecha_inscripcion) {
      errors.fecha_inscripcion = "La fecha de inscripción es obligatoria";
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const openCreate = () => {
    setFormData({
      per_id: "",
      id_programa_academico: "",
      ru: "",
      fecha_inscripcion: "",
      estado: 1,
    });
    setFormErrors({});
    setShowCreate(true);
  };

  const openEdit = (estudiante) => {
    setEditingEstudiante(estudiante);
    setFormData({
      per_id: estudiante.per_id,
      id_programa_academico: estudiante.id_programa_academico,
      ru: estudiante.ru,
      fecha_inscripcion: estudiante.fecha_inscripcion,
      estado: estudiante.estado,
    });
    setFormErrors({});
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setOperationLoading(true);
    setError(null);
    try {
      await createEstudiante(formData);
      setShowCreate(false);
      setFormData({
        per_id: "",
        id_programa_academico: "",
        ru: "",
        fecha_inscripcion: "",
        estado: 1,
      });
      await fetchEstudiantes();
      alert("Estudiante creado exitosamente");
    } catch (err) {
      setError(err.message || "Error al crear el estudiante");
      alert(err.message || "Error al crear el estudiante");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setOperationLoading(true);
    setError(null);
    try {
      await updateEstudiante(editingEstudiante.id, formData);
      setShowEdit(false);
      setEditingEstudiante(null);
      setFormData({
        per_id: "",
        id_programa_academico: "",
        ru: "",
        fecha_inscripcion: "",
        estado: 1,
      });
      await fetchEstudiantes();
      alert("Estudiante actualizado exitosamente");
    } catch (err) {
      setError(err.message || "Error al actualizar el estudiante");
      alert(err.message || "Error al actualizar el estudiante");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id, nombreCompleto) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al estudiante "${nombreCompleto}"? Esta acción no se puede deshacer.`)) {
      setOperationLoading(true);
      setError(null);
      try {
        await deleteEstudiante(id);
        await fetchEstudiantes();
        alert("Estudiante eliminado exitosamente");
      } catch (err) {
        setError(err.message || "Error al eliminar el estudiante");
        alert(err.message || "Error al eliminar el estudiante");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // Función para filtrar estudiantes por nombre y matrícula
  const filteredEstudiantes = estudiantes.filter((estudiante) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${estudiante.nombres} ${estudiante.apellidopat} ${estudiante.apellidomat}`.toLowerCase();
    const registro = String(estudiante.ru || "").toLowerCase();
    
    return fullName.includes(searchLower) || registro.includes(searchLower);
  });

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h2 style={EstudianteStyles.title}>Administración de Estudiantes</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>+ Nuevo Estudiante</button>
        </div>
      </header>

      {loading && <p style={EstudianteStyles.loadingText}>Cargando estudiantes...</p>}
      {error && <div style={EstudianteStyles.errorMessage}>Error: {error}</div>}

      {!loading && !error && (
        <div>
          <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre o ru..."
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
            <div style={{ ...EstudianteStyles.statCard, ...EstudianteStyles.statCardTotal }}>
              <h4 style={{ ...EstudianteStyles.statTitle, ...EstudianteStyles.statTitleTotal }}>
                Total Estudiantes
              </h4>
              <p style={EstudianteStyles.statValue}>{estudiantes.length}</p>
            </div>

            <div style={{ ...EstudianteStyles.statCard, ...EstudianteStyles.statCardActive }}>
              <h4 style={{ ...EstudianteStyles.statTitle, ...EstudianteStyles.statTitleActive }}>
                Estudiantes Activos
              </h4>
              <p style={EstudianteStyles.statValue}>
                {estudiantes.filter((e) => e.estado === 1).length}
              </p>
            </div>

            <div style={{ ...EstudianteStyles.statCard, ...EstudianteStyles.statCardInactive }}>
              <h4 style={{ ...EstudianteStyles.statTitle, ...EstudianteStyles.statTitleInactive }}>
                Inactivos
              </h4>
              <p style={EstudianteStyles.statValue}>
                {estudiantes.filter((e) => e.estado === 0).length}
              </p>
            </div>
          </div>

          

          <div style={EstudianteStyles.tableContainer}>
            <table style={EstudianteStyles.table}>
              <thead style={EstudianteStyles.tableHead}>
                <tr>
                  <th style={EstudianteStyles.tableHeader}>Nombre Completo</th>
                  <th style={EstudianteStyles.tableHeader}>Matrícula</th>
                  <th style={EstudianteStyles.tableHeader}>Programa</th>
                  <th style={EstudianteStyles.tableHeader}>Fecha Inscripción</th>
                  <th style={EstudianteStyles.tableHeader}>Estado</th>
                  <th style={EstudianteStyles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstudiantes.length > 0 ? (
                  filteredEstudiantes.map((estudiante, index) => (
                    <tr
                      key={estudiante.id}
                      style={{
                        ...EstudianteStyles.tableRow,
                        ...(index % 2 === 0 ? EstudianteStyles.tableRowAlternate : {}),
                      }}
                    >
                      <td style={EstudianteStyles.tableCellBold}>
                        {estudiante.nombres} {estudiante.apellidopat} {estudiante.apellidomat}
                      </td>
                      <td style={EstudianteStyles.tableCell}>{estudiante.ru}</td>
                      <td style={EstudianteStyles.tableCell}>{estudiante.nombre_programa}</td>
                      <td style={EstudianteStyles.tableCell}>{estudiante.fecha_inscripcion}</td>
                      <td style={EstudianteStyles.tableCell}>
                        <span
                          style={{
                            ...EstudianteStyles.statusBadge,
                            ...(estudiante.estado === 1 ? EstudianteStyles.statusActive : EstudianteStyles.statusInactive),
                          }}
                        >
                          {estudiante.estado === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={EstudianteStyles.tableCellCenter}>
                        <button
                          onClick={() => openEdit(estudiante)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.editButtonDisabled : styles.editButton}
                        >
                          <AiFillEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(estudiante.id, `${estudiante.nombres} ${estudiante.apellidopat}`)}
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
                    <td style={EstudianteStyles.noDataText} colSpan="6">
                      {searchTerm ? "No se encontraron resultados" : "No hay estudiantes registrados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MODAL CREAR */}
          {showCreate && (
            <div className="modal-overlay" onClick={() => setShowCreate(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Agregar Nuevo Estudiante</h2>
                <form onSubmit={handleCreate}>
                  {error && <div style={EstudianteStyles.errorMessage}>Error: {error}</div>}
                  
                  <div className="form-row">
                    <div>
                      <label style={EstudianteStyles.formLabel}>ID Persona:</label>
                      <input
                        className="InputProyecto"
                        type="number"
                        name="per_id"
                        placeholder="Ej: 1, 2, 3"
                        value={formData.per_id}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.per_id && <p style={EstudianteStyles.formErrorText}>{formErrors.per_id}</p>}
                    </div>

                    <div>
                      <label style={EstudianteStyles.formLabel}>ID Programa:</label>
                      <input
                        className="InputProyecto"
                        type="number"
                        name="id_programa_academico"
                        placeholder="Ej: 1, 2, 3"
                        value={formData.id_programa_academico}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.id_programa_academico && (
                        <p style={EstudianteStyles.formErrorText}>{formErrors.id_programa_academico}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div>
                      <label style={EstudianteStyles.formLabel}>Número Matrícula:</label>
                      <input
                        className="InputProyecto"
                        type="text"
                        name="ru"
                        placeholder="Ej: 2024001"
                        value={formData.ru}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.ru && (
                        <p style={EstudianteStyles.formErrorText}>{formErrors.ru}</p>
                      )}
                    </div>

                    <div>
                      <label style={EstudianteStyles.formLabel}>Fecha Inscripción:</label>
                      <input
                        className="InputProyecto"
                        type="date"
                        name="fecha_inscripcion"
                        value={formData.fecha_inscripcion}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.fecha_inscripcion && (
                        <p style={EstudianteStyles.formErrorText}>{formErrors.fecha_inscripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-full">
                    <label style={EstudianteStyles.formLabel}>Estado:</label>
                    <select
                      className="InputProyecto"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      disabled={operationLoading}
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="submit"
                      disabled={operationLoading}
                      className="btn-create"
                    >
                      {operationLoading ? "Procesando..." : "Crear Estudiante"}
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
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Editar Estudiante</h2>
                <form onSubmit={handleUpdate}>
                  {error && <div style={EstudianteStyles.errorMessage}>Error: {error}</div>}
                  
                  <div className="form-row">
                    <div>
                      <label style={EstudianteStyles.formLabel}>ID Persona:</label>
                      <input
                        className="InputProyecto"
                        type="number"
                        name="per_id"
                        placeholder="Ej: 1, 2, 3"
                        value={formData.per_id}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.per_id && <p style={EstudianteStyles.formErrorText}>{formErrors.per_id}</p>}
                    </div>

                    <div>
                      <label style={EstudianteStyles.formLabel}>ID Programa:</label>
                      <input
                        className="InputProyecto"
                        type="number"
                        name="id_programa_academico"
                        placeholder="Ej: 1, 2, 3"
                        value={formData.id_programa_academico}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.id_programa_academico && (
                        <p style={EstudianteStyles.formErrorText}>{formErrors.id_programa_academico}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div>
                      <label style={EstudianteStyles.formLabel}>Número Matrícula:</label>
                      <input
                        className="InputProyecto"
                        type="text"
                        name="ru"
                        placeholder="Ej: 2024001"
                        value={formData.ru}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.ru && (
                        <p style={EstudianteStyles.formErrorText}>{formErrors.ru}</p>
                      )}
                    </div>

                    <div>
                      <label style={EstudianteStyles.formLabel}>Fecha Inscripción:</label>
                      <input
                        className="InputProyecto"
                        type="date"
                        name="fecha_inscripcion"
                        value={formData.fecha_inscripcion}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.fecha_inscripcion && (
                        <p style={EstudianteStyles.formErrorText}>{formErrors.fecha_inscripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-full">
                    <label style={EstudianteStyles.formLabel}>Estado:</label>
                    <select
                      className="InputProyecto"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      disabled={operationLoading}
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="submit"
                      disabled={operationLoading}
                      className="btn-edit"
                    >
                      {operationLoading ? "Procesando..." : "Actualizar Estudiante"}
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
      )}
    </div>
  );
}

export default AdminEstudiantes;