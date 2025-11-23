import React, { useEffect, useState } from "react";
import { TallerStyles } from "../../Components screens/Styles.js";
import { styles } from "../../Components screens/Styles";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { buildPDFAdmin } from "../../../API/Admin/PDFs.js";
import { getAllPersonas, getPersona, createPersona, updatePersona, deletePersona } from "../../../API/Admin/Persona.js";

function Personas() {
  const [personas, setPersonas] = useState([]);
  const [editingPersona, setEditingPersona] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nombres: "",
    apellidopat: "",
    apellidomat: "",
    carnet: "",
    direccion: "",
    telefono: "",
    correo: "",
    fecha_nacimiento: "",
    estado: "1", // 1 = activo por defecto
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPersonas();
      const personasArray = Array.isArray(data) ? data : data?.data || [];
      setPersonas(personasArray);
    } catch (err) {
      setError(err.message || "Error al cargar las personas");
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
      nombres: "",
      apellidopat: "",
      apellidomat: "",
      carnet: "",
      direccion: "",
      telefono: "",
      correo: "",
      fecha_nacimiento: "",
      estado: "1",
    });
    setShowCreate(true);
  };

  const openEdit = async (id) => {
    try {
      const persona = await getPersona(id);
      setFormData({
        nombres: persona.nombres || "",
        apellidopat: persona.apellidopat || "",
        apellidomat: persona.apellidomat || "",
        carnet: persona.carnet || "",
        direccion: persona.direccion || "",
        telefono: persona.telefono || "",
        correo: persona.correo || "",
        fecha_nacimiento: persona.fecha_nacimiento?.split("T")[0] || "",
        estado: persona.estado?.toString() || "1",
      });
      setEditingPersona(persona);
      setShowEdit(true);
    } catch (err) {
      alert(err.message || "Error al cargar la persona");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      await createPersona({ ...formData, estado: parseInt(formData.estado) });
      setShowCreate(false);
      await fetchPersonas();
      alert("Persona creada exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al crear la persona");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      await updatePersona(editingPersona.id, { ...formData, estado: parseInt(formData.estado) });
      setShowEdit(false);
      setEditingPersona(null);
      await fetchPersonas();
      alert("Persona actualizada exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al actualizar la persona");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id, nombreCompleto) => {
    if (window.confirm(`¿Estás seguro de eliminar a "${nombreCompleto}"? Esta acción no se puede deshacer.`)) {
      setOperationLoading(true);
      try {
        await deletePersona(id);
        await fetchPersonas();
        alert("Persona eliminada exitosamente");
      } catch (err) {
        alert(err.message || "Error al eliminar la persona");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // Filtro de búsqueda
  const filteredPersonas = personas.filter((p) => {
    const search = searchTerm.toLowerCase();
    const nombreCompleto = `${p.nombres} ${p.apellidopat} ${p.apellidomat}`.toLowerCase();
    return (
      nombreCompleto.includes(search) ||
      (p.carnet || "").toLowerCase().includes(search) ||
      (p.correo || "").toLowerCase().includes(search)
    );
  });

  const activos = personas.filter((p) => p.estado === 1 || p.estado === "1").length;
  const inactivos = personas.filter((p) => p.estado === 0 || p.estado === "0").length;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h2 style={TallerStyles.title}>Gestión de Personas</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-search" onClick={buildPDFAdmin} style={{ marginRight: "10px" }}>
            Generar PDF
          </button>
          <button className="btn-create" onClick={openCreate}>
            + Nueva Persona
          </button>
        </div>
      </header>

      {loading && <p className="loading">Cargando personas...</p>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* BUSCADOR */}
          <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre, carnet o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="InputProyecto"
              style={{ width: "100%", maxWidth: "500px", padding: "12px 16px", fontSize: "14px" }}
            />
          </div>

          {/* ESTADÍSTICAS */}
          <div className="stats-container">
            <div className="stat-card stat-total">
              <h4>Total Personas</h4>
              <p>{personas.length}</p>
            </div>
            <div className="stat-card stat-completed">
              <h4>Activas</h4>
              <p>{activos}</p>
            </div>
            <div className="stat-card stat-pending">
              <h4>Inactivas</h4>
              <p>{inactivos}</p>
            </div>
            <div className="stat-card stat-overdue">
              <h4>Con Correo</h4>
              <p>{personas.filter((p) => p.correo).length}</p>
            </div>
          </div>

          {/* TABLA */}
          <div style={TallerStyles.rolesTableContainer}>
            <table style={TallerStyles.table}>
              <thead style={TallerStyles.tableHead}>
                <tr>
                  <th style={TallerStyles.tableHeader}>Nombre Completo</th>
                  <th style={TallerStyles.tableHeader}>Carnet</th>
                  <th style={TallerStyles.tableHeader}>Correo</th>
                  <th style={TallerStyles.tableHeader}>Teléfono</th>
                  <th style={TallerStyles.tableHeader}>Estado</th>
                  <th style={TallerStyles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonas.length > 0 ? (
                  filteredPersonas.map((persona, index) => (
                    <tr
                      key={persona.id}
                      style={{
                        ...TallerStyles.tableRow,
                        ...(index % 2 === 0 ? TallerStyles.tableRowAlternate : {}),
                      }}
                    >
                      <td style={TallerStyles.tableCellBold}>
                        {persona.nombres} {persona.apellidopat} {persona.apellidomat}
                      </td>
                      <td style={TallerStyles.tableCell}>{persona.carnet || "-"}</td>
                      <td style={TallerStyles.tableCell}>{persona.correo || "-"}</td>
                      <td style={TallerStyles.tableCell}>{persona.telefono || "-"}</td>
                      <td style={TallerStyles.tableCell}>
                        <span
                          style={{
                            ...TallerStyles.statusBadge,
                            backgroundColor:
                              persona.estado === 1 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                            color: persona.estado === 1 ? "#34d399" : "#f56565",
                          }}
                        >
                          {persona.estado === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={TallerStyles.tableCellCenter}>
                        <button
                          onClick={() => openEdit(persona.id)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.editButtonDisabled : styles.editButton}
                        >
                          <AiFillEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(persona.id, `${persona.nombres} ${persona.apellidopat}`)}
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
                    <td style={TallerStyles.noDataText} colSpan="6">
                      {searchTerm ? "No se encontraron resultados" : "No hay personas registradas"}
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
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Nueva Persona</h2>
            <form onSubmit={handleCreate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row-3">
                <div>
                  <label style={TallerStyles.formLabel}>Nombres:</label>
                  <input className="InputProyecto" type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Apellido Paterno:</label>
                  <input className="InputProyecto" type="text" name="apellidopat" value={formData.apellidopat} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Apellido Materno:</label>
                  <input className="InputProyecto" type="text" name="apellidomat" value={formData.apellidomat} onChange={handleInputChange} disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Carnet:</label>
                  <input className="InputProyecto" type="text" name="carnet" value={formData.carnet} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Correo:</label>
                  <input className="InputProyecto" type="email" name="correo" value={formData.correo} onChange={handleInputChange} disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Teléfono:</label>
                  <input className="InputProyecto" type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Dirección:</label>
                  <input className="InputProyecto" type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Fecha de Nacimiento:</label>
                  <input className="InputProyecto" type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Estado:</label>
                  <select className="InputProyecto" name="estado" value={formData.estado} onChange={handleInputChange} disabled={operationLoading}>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={operationLoading} className="btn-create">
                  {operationLoading ? "Procesando..." : "Crear Persona"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} disabled={operationLoading} className="btn-close">
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
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Persona</h2>
            <form onSubmit={handleUpdate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row-3">
                <div>
                  <label style={TallerStyles.formLabel}>Nombres:</label>
                  <input className="InputProyecto" type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Apellido Paterno:</label>
                  <input className="InputProyecto" type="text" name="apellidopat" value={formData.apellidopat} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Apellido Materno:</label>
                  <input className="InputProyecto" type="text" name="apellidomat" value={formData.apellidomat} onChange={handleInputChange} disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Carnet:</label>
                  <input className="InputProyecto" type="text" name="carnet" value={formData.carnet} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Correo:</label>
                  <input className="InputProyecto" type="email" name="correo" value={formData.correo} onChange={handleInputChange} disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Teléfono:</label>
                  <input className="InputProyecto" type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Dirección:</label>
                  <input className="InputProyecto" type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Fecha de Nacimiento:</label>
                  <input className="InputProyecto" type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Estado:</label>
                  <select className="InputProyecto" name="estado" value={formData.estado} onChange={handleInputChange} disabled={operationLoading}>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={operationLoading} className="btn-edit">
                  {operationLoading ? "Procesando..." : "Actualizar Persona"}
                </button>
                <button type="button" onClick={() => setShowEdit(false)} disabled={operationLoading} className="btn-close">
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

export default Personas;