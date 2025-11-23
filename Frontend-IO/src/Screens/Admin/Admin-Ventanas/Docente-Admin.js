import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { getDocentes, createDocente, updateDocente, deleteDocente } from "../../../API/Admin/Docente_admin";
import { getAllPersonas } from "../../../API/Admin/Persona";
import { DocenteStyles } from "../../Components screens/Styles";
import { styles } from "../../Components screens/Styles";

function DocenteAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modales
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  // Datos
  const [editingDocente, setEditingDocente] = useState(null);
  const [formData, setFormData] = useState({
    per_id: "",
    numero_item: "",
    especialidad: "",
    tipo_contrato: "permanente",
    estado: 1,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docentesData, personasData] = await Promise.all([
        getDocentes(),
        getAllPersonas(),
      ]);
      setDocentes(docentesData);
      setPersonas(personasData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.per_id) {
      errors.per_id = "La persona es obligatoria";
    }
    if (!data.numero_item.trim()) {
      errors.numero_item = "El número de item es obligatorio";
    }
    if (!data.especialidad.trim()) {
      errors.especialidad = "La especialidad es obligatoria";
    }
    if (!data.tipo_contrato) {
      errors.tipo_contrato = "El tipo de contrato es obligatorio";
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
      numero_item: "",
      especialidad: "",
      tipo_contrato: "permanente",
      estado: 1,
    });
    setFormErrors({});
    setShowCreate(true);
  };

  const openEdit = (docente) => {
    setEditingDocente(docente);
    setFormData({
      per_id: docente.per_id,
      numero_item: docente.numero_item,
      especialidad: docente.especialidad,
      tipo_contrato: docente.tipo_contrato,
      estado: docente.estado ? 1 : 0,
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
      await createDocente(formData);
      setShowCreate(false);
      setFormData({
        per_id: "",
        numero_item: "",
        especialidad: "",
        tipo_contrato: "permanente",
        estado: 1,
      });
      await fetchData();
      alert("Docente creado exitosamente");
    } catch (err) {
      setError(err.message || "Error al crear el docente");
      alert(err.message || "Error al crear el docente");
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
      await updateDocente(editingDocente.id, formData);
      setShowEdit(false);
      setEditingDocente(null);
      setFormData({
        per_id: "",
        numero_item: "",
        especialidad: "",
        tipo_contrato: "permanente",
        estado: 1,
      });
      await fetchData();
      alert("Docente actualizado exitosamente");
    } catch (err) {
      setError(err.message || "Error al actualizar el docente");
      alert(err.message || "Error al actualizar el docente");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id, docenteName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al docente "${docenteName}"? Esta acción no se puede deshacer.`)) {
      setOperationLoading(true);
      setError(null);
      try {
        await deleteDocente(id);
        await fetchData();
        alert("Docente eliminado exitosamente");
      } catch (err) {
        setError(err.message || "Error al eliminar el docente");
        alert(err.message || "Error al eliminar el docente");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const getPersonaName = (per_id) => {
    const persona = personas.find((p) => p.id === per_id);
    return persona ? `${persona.nombres} ${persona.apellidopat} ${persona.apellidomat}` : "N/A";
  };

  const getAvailablePersonas = () => {
    const docentePersonIds = docentes
      .filter((d) => (editingDocente ? d.id !== editingDocente.id : true))
      .map((d) => d.per_id);
    return personas.filter((p) => !docentePersonIds.includes(p.id));
  };

  // Función para filtrar docentes por nombre y número de item
  const filteredDocentes = docentes.filter((docente) => {
    const searchLower = searchTerm.toLowerCase();
    const nombreCompleto = getPersonaName(docente.per_id).toLowerCase();
    const numeroItem = (docente.numero_item || "").toLowerCase();
    
    return nombreCompleto.includes(searchLower) || numeroItem.includes(searchLower);
  });

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h2 style={DocenteStyles.title}>Administración de Docentes</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>+ Nuevo Docente</button>
        </div>
      </header>

      {loading && <p style={DocenteStyles.loadingText}>Cargando docentes...</p>}
      {error && <div style={DocenteStyles.errorMessage}>Error: {error}</div>}

      {!loading && !error && (
        <div>
          <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre o número de item..."
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
            <div style={{ ...DocenteStyles.statCard, ...DocenteStyles.statCardTotal }}>
              <h4 style={{ ...DocenteStyles.statTitle, ...DocenteStyles.statTitleTotal }}>
                Total Docentes
              </h4>
              <p style={DocenteStyles.statValue}>{docentes.length}</p>
            </div>

            <div style={{ ...DocenteStyles.statCard, ...DocenteStyles.statCardActive }}>
              <h4 style={{ ...DocenteStyles.statTitle, ...DocenteStyles.statTitleActive }}>
                Docentes Activos
              </h4>
              <p style={DocenteStyles.statValue}>
                {docentes.filter((d) => d.estado).length}
              </p>
            </div>

            <div style={{ ...DocenteStyles.statCard, ...DocenteStyles.statCardPermanente }}>
              <h4 style={{ ...DocenteStyles.statTitle, ...DocenteStyles.statTitlePermanente }}>
                Permanentes
              </h4>
              <p style={DocenteStyles.statValue}>
                {docentes.filter((d) => d.tipo_contrato === "permanente").length}
              </p>
            </div>

            <div style={{ ...DocenteStyles.statCard, ...DocenteStyles.statCardPermanente }}>
              <h4 style={{ ...DocenteStyles.statTitle, ...DocenteStyles.statTitlePermanente }}>
                Temporales
              </h4>
              <p style={DocenteStyles.statValue}>
                {docentes.filter((d) => d.tipo_contrato === "temporal").length}
              </p>
            </div>
          </div>

          

          <div style={DocenteStyles.tableContainer}>
            <table style={DocenteStyles.table}>
              <thead style={DocenteStyles.tableHead}>
                <tr>
                  <th style={DocenteStyles.tableHeader}>Nombre Completo</th>
                  <th style={DocenteStyles.tableHeader}>Número Item</th>
                  <th style={DocenteStyles.tableHeader}>Especialidad</th>
                  <th style={DocenteStyles.tableHeader}>Tipo Contrato</th>
                  <th style={DocenteStyles.tableHeader}>Estado</th>
                  <th style={DocenteStyles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocentes.length > 0 ? (
                  filteredDocentes.map((docente, index) => (
                    <tr
                      key={docente.id}
                      style={{
                        ...DocenteStyles.tableRow,
                        ...(index % 2 === 0 ? DocenteStyles.tableRowAlternate : {}),
                      }}
                    >
                      <td style={DocenteStyles.tableCellBold}>
                        {getPersonaName(docente.per_id)}
                      </td>
                      <td style={DocenteStyles.tableCell}>{docente.numero_item}</td>
                      <td style={DocenteStyles.tableCell}>{docente.especialidad}</td>
                      <td style={DocenteStyles.tableCell}>
                        <span
                          style={{
                            ...DocenteStyles.statusBadge,
                            ...(docente.tipo_contrato === "permanente" 
                              ? DocenteStyles.statusPermanente 
                              : DocenteStyles.statusTemporal),
                          }}
                        >
                          {docente.tipo_contrato}
                        </span>
                      </td>
                      <td style={DocenteStyles.tableCell}>
                        <span
                          style={{
                            ...DocenteStyles.statusBadge,
                            ...(docente.estado 
                              ? DocenteStyles.statusActive 
                              : DocenteStyles.statusInactive),
                          }}
                        >
                          {docente.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={DocenteStyles.tableCellCenter}>
                        <button
                          onClick={() => openEdit(docente)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.editButtonDisabled : styles.editButton}
                        >
                          <AiFillEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(docente.id, getPersonaName(docente.per_id))}
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
                    <td style={DocenteStyles.noDataText} colSpan="6">
                      {searchTerm ? "No se encontraron resultados" : "No hay docentes registrados"}
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
                <h2>Agregar Nuevo Docente</h2>
                <form onSubmit={handleCreate}>
                  {error && <div style={DocenteStyles.errorMessage}>Error: {error}</div>}
                  
                  <div className="form-row">
                    <div>
                      <label style={DocenteStyles.formLabel}>Persona:</label>
                      <select
                        className="InputProyecto"
                        name="per_id"
                        value={formData.per_id}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      >
                        <option value="">Seleccionar Persona</option>
                        {getAvailablePersonas().map((persona) => (
                          <option key={persona.id} value={persona.id}>
                            {persona.nombres} {persona.apellidopat} {persona.apellidomat}
                          </option>
                        ))}
                      </select>
                      {formErrors.per_id && <p style={DocenteStyles.formErrorText}>{formErrors.per_id}</p>}
                    </div>

                    <div>
                      <label style={DocenteStyles.formLabel}>Número de Item:</label>
                      <input
                        className="InputProyecto"
                        type="text"
                        name="numero_item"
                        placeholder="Ej: DOC001"
                        value={formData.numero_item}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.numero_item && (
                        <p style={DocenteStyles.formErrorText}>{formErrors.numero_item}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div>
                      <label style={DocenteStyles.formLabel}>Especialidad:</label>
                      <input
                        className="InputProyecto"
                        type="text"
                        name="especialidad"
                        placeholder="Ej: Matemáticas, Física, etc."
                        value={formData.especialidad}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.especialidad && (
                        <p style={DocenteStyles.formErrorText}>{formErrors.especialidad}</p>
                      )}
                    </div>

                    <div>
                      <label style={DocenteStyles.formLabel}>Tipo de Contrato:</label>
                      <select
                        className="InputProyecto"
                        name="tipo_contrato"
                        value={formData.tipo_contrato}
                        onChange={handleChange}
                        disabled={operationLoading}
                      >
                        <option value="permanente">Permanente</option>
                        <option value="temporal">Temporal</option>
                        <option value="interino">Interino</option>
                      </select>
                      {formErrors.tipo_contrato && (
                        <p style={DocenteStyles.formErrorText}>{formErrors.tipo_contrato}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-full">
                    <label style={DocenteStyles.formLabel}>Estado:</label>
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
                      {operationLoading ? "Procesando..." : "Crear Docente"}
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
                <h2>Editar Docente</h2>
                <form onSubmit={handleUpdate}>
                  {error && <div style={DocenteStyles.errorMessage}>Error: {error}</div>}
                  
                  <div className="form-row">
                    <div>
                      <label style={DocenteStyles.formLabel}>Persona:</label>
                      <select
                        className="InputProyecto"
                        name="per_id"
                        value={formData.per_id}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      >
                        <option value="">Seleccionar Persona</option>
                        {editingDocente && (
                          <option value={editingDocente.per_id}>
                            {getPersonaName(editingDocente.per_id)} (Actual)
                          </option>
                        )}
                        {getAvailablePersonas().map((persona) => (
                          <option key={persona.id} value={persona.id}>
                            {persona.nombres} {persona.apellidopat} {persona.apellidomat}
                          </option>
                        ))}
                      </select>
                      {formErrors.per_id && <p style={DocenteStyles.formErrorText}>{formErrors.per_id}</p>}
                    </div>

                    <div>
                      <label style={DocenteStyles.formLabel}>Número de Item:</label>
                      <input
                        className="InputProyecto"
                        type="text"
                        name="numero_item"
                        placeholder="Ej: DOC001"
                        value={formData.numero_item}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.numero_item && (
                        <p style={DocenteStyles.formErrorText}>{formErrors.numero_item}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div>
                      <label style={DocenteStyles.formLabel}>Especialidad:</label>
                      <input
                        className="InputProyecto"
                        type="text"
                        name="especialidad"
                        placeholder="Ej: Matemáticas, Física, etc."
                        value={formData.especialidad}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                      {formErrors.especialidad && (
                        <p style={DocenteStyles.formErrorText}>{formErrors.especialidad}</p>
                      )}
                    </div>

                    <div>
                      <label style={DocenteStyles.formLabel}>Tipo de Contrato:</label>
                      <select
                        className="InputProyecto"
                        name="tipo_contrato"
                        value={formData.tipo_contrato}
                        onChange={handleChange}
                        disabled={operationLoading}
                      >
                        <option value="permanente">Permanente</option>
                        <option value="temporal">Temporal</option>
                        <option value="interino">Interino</option>
                      </select>
                      {formErrors.tipo_contrato && (
                        <p style={DocenteStyles.formErrorText}>{formErrors.tipo_contrato}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-full">
                    <label style={DocenteStyles.formLabel}>Estado:</label>
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
                      {operationLoading ? "Procesando..." : "Actualizar Docente"}
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

export default DocenteAdmin;