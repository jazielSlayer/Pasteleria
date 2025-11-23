import React, { useEffect, useState } from "react";
import { TallerStyles } from "../../Components screens/Styles.js";
import { styles } from "../../Components screens/Styles";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { buildPDFAdmin } from "../../../API/Admin/PDFs.js";
import {
  getAllProgramas,
  getPrograma,
  createPrograma,
  updatePrograma,
  deletePrograma,
} from "../../../API/Admin/Programa_Academico.js"; // Ajusta si la ruta es diferente

function ProgramasAcademicos() {
  const [programas, setProgramas] = useState([]);
  const [editingPrograma, setEditingPrograma] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    codigo: "",
    nombre_programa: "",
    modalidad: "",
    facultad: "",
    nivel: "",
    estado: "1",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    fetchProgramas();
  }, []);

  const fetchProgramas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProgramas();
      const array = Array.isArray(data) ? data : data?.data || [];
      setProgramas(array);
    } catch (err) {
      setError(err.message || "Error al cargar los programas");
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
      codigo: "",
      nombre_programa: "",
      modalidad: "",
      facultad: "",
      nivel: "",
      estado: "1",
    });
    setShowCreate(true);
  };

  const openEdit = async (id) => {
    try {
      const prog = await getPrograma(id);
      setFormData({
        codigo: prog.codigo || "",
        nombre_programa: prog.nombre_programa || "",
        modalidad: prog.modalidad || "",
        facultad: prog.facultad || "",
        nivel: prog.nivel || "",
        estado: prog.estado?.toString() || "1",
      });
      setEditingPrograma(prog);
      setShowEdit(true);
    } catch (err) {
      alert(err.message || "Error al cargar el programa");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      await createPrograma({ ...formData, estado: parseInt(formData.estado) });
      setShowCreate(false);
      await fetchProgramas();
      alert("Programa creado exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al crear el programa");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      await updatePrograma(editingPrograma.id, { ...formData, estado: parseInt(formData.estado) });
      setShowEdit(false);
      setEditingPrograma(null);
      await fetchProgramas();
      alert("Programa actualizado exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al actualizar el programa");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el programa "${nombre}"?`)) {
      setOperationLoading(true);
      try {
        await deletePrograma(id);
        await fetchProgramas();
        alert("Programa eliminado exitosamente");
      } catch (err) {
        alert(err.message || "Error al eliminar");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // Filtro de búsqueda
  const filtered = programas.filter((p) => {
    const search = searchTerm.toLowerCase();
    return (
      (p.codigo || "").toLowerCase().includes(search) ||
      (p.nombre_programa || "").toLowerCase().includes(search) ||
      (p.facultad || "").toLowerCase().includes(search)
    );
  });

  const activos = programas.filter((p) => p.estado === 1 || p.estado === "1").length;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h2 style={TallerStyles.title}>Gestión de Programas Académicos</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-search" onClick={buildPDFAdmin} style={{ marginRight: "10px" }}>
            Generar PDF
          </button>
          <button className="btn-create" onClick={openCreate}>
            + Nuevo Programa
          </button>
        </div>
      </header>

      {loading && <p className="loading">Cargando programas...</p>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* BUSCADOR */}
          <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por código, nombre o facultad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="InputProyecto"
              style={{ width: "100%", maxWidth: "500px", padding: "12px 16px", fontSize: "14px" }}
            />
          </div>

          {/* ESTADÍSTICAS */}
          <div className="stats-container">
            <div className="stat-card stat-total">
              <h4>Total Programas</h4>
              <p>{programas.length}</p>
            </div>
            <div className="stat-card stat-completed">
              <h4>Activos</h4>
              <p>{activos}</p>
            </div>
            <div className="stat-card stat-pending">
              <h4>Presencial</h4>
              <p>{programas.filter((p) => p.modalidad?.toLowerCase() === "presencial").length}</p>
            </div>
            <div className="stat-card stat-overdue">
              <h4>Virtual</h4>
              <p>{programas.filter((p) => p.modalidad?.toLowerCase() === "virtual").length}</p>
            </div>
          </div>

          {/* TABLA */}
          <div style={TallerStyles.rolesTableContainer}>
            <table style={TallerStyles.table}>
              <thead style={TallerStyles.tableHead}>
                <tr>
                  <th style={TallerStyles.tableHeader}>Código</th>
                  <th style={TallerStyles.tableHeader}>Nombre del Programa</th>
                  <th style={TallerStyles.tableHeader}>Facultad</th>
                  <th style={TallerStyles.tableHeader}>Modalidad</th>
                  <th style={TallerStyles.tableHeader}>Nivel</th>
                  <th style={TallerStyles.tableHeader}>Estado</th>
                  <th style={TallerStyles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((prog, index) => {
                    const esActivo = prog.estado === 1 || prog.estado === "1";

                    return (
                      <tr
                        key={prog.id}
                        style={{
                          ...TallerStyles.tableRow,
                          ...(index % 2 === 0 ? TallerStyles.tableRowAlternate : {}),
                        }}
                      >
                        <td style={TallerStyles.tableCellBold}>{prog.codigo}</td>
                        <td style={TallerStyles.tableCell}>{prog.nombre_programa}</td>
                        <td style={TallerStyles.tableCell}>{prog.facultad || "-"}</td>
                        <td style={TallerStyles.tableCell}>
                          <span style={{ ...TallerStyles.statusBadge, backgroundColor: "rgba(99, 102, 241, 0.2)", color: "#6366f1" }}>
                            {prog.modalidad || "-"}
                          </span>
                        </td>
                        <td style={TallerStyles.tableCell}>{prog.nivel || "-"}</td>
                        <td style={TallerStyles.tableCell}>
                          <span
                            style={{
                              ...TallerStyles.statusBadge,
                              backgroundColor: esActivo ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                              color: esActivo ? "#34d399" : "#f56565",
                            }}
                          >
                            {esActivo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td style={TallerStyles.tableCellCenter}>
                          <button
                            onClick={() => openEdit(prog.id)}
                            disabled={operationLoading}
                            style={operationLoading ? styles.editButtonDisabled : styles.editButton}
                          >
                            <AiFillEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(prog.id, prog.nombre_programa)}
                            disabled={operationLoading}
                            style={operationLoading ? styles.deleteButtonDisabled : styles.deleteButton}
                          >
                            <AiFillDelete />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td style={TallerStyles.noDataText} colSpan="7">
                      {searchTerm ? "No se encontraron resultados" : "No hay programas registrados"}
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
            <h2>Crear Nuevo Programa Académico</h2>
            <form onSubmit={handleCreate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Código:</label>
                  <input className="InputProyecto" type="text" name="codigo" value={formData.codigo} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Nombre del Programa:</label>
                  <input className="InputProyecto" type="text" name="nombre_programa" value={formData.nombre_programa} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Facultad:</label>
                  <input className="InputProyecto" type="text" name="facultad" value={formData.facultad} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Nivel:</label>
                  <select className="InputProyecto" name="nivel" value={formData.nivel} onChange={handleInputChange} required disabled={operationLoading}>
                    <option value="">Seleccionar</option>
                    <option value="Pregrado">Pregrado</option>
                    <option value="Posgrado">Posgrado</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Diplomado">Diplomado</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Modalidad:</label>
                  <select className="InputProyecto" name="modalidad" value={formData.modalidad} onChange={handleInputChange} required disabled={operationLoading}>
                    <option value="">Seleccionar</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Semipresencial">Semipresencial</option>
                  </select>
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
                  {operationLoading ? "Procesando..." : "Crear Programa"}
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
            <h2>Editar Programa Académico</h2>
            <form onSubmit={handleUpdate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Código:</label>
                  <input className="InputProyecto" type="text" name="codigo" value={formData.codigo} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Nombre del Programa:</label>
                  <input className="InputProyecto" type="text" name="nombre_programa" value={formData.nombre_programa} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Facultad:</label>
                  <input className="InputProyecto" type="text" name="facultad" value={formData.facultad} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Nivel:</label>
                  <select className="InputProyecto" name="nivel" value={formData.nivel} onChange={handleInputChange} required disabled={operationLoading}>
                    <option value="">Seleccionar</option>
                    <option value="Pregrado">Pregrado</option>
                    <option value="Posgrado">Posgrado</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Diplomado">Diplomado</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Modalidad:</label>
                  <select className="InputProyecto" name="modalidad" value={formData.modalidad} onChange={handleInputChange} required disabled={operationLoading}>
                    <option value="">Seleccionar</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Semipresencial">Semipresencial</option>
                  </select>
                </div>
                <div>
                  <div>
                    <label style={TallerStyles.formLabel}>Estado:</label>
                    <select className="InputProyecto" name="estado" value={formData.estado} onChange={handleInputChange} disabled={operationLoading}>
                      <option value="1">Activo</option>
                      <option value="0">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={operationLoading} className="btn-edit">
                  {operationLoading ? "Procesando..." : "Actualizar Programa"}
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

export default ProgramasAcademicos;