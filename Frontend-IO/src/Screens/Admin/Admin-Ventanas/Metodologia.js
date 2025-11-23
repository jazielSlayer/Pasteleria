import React, { useEffect, useState } from "react";
import { TallerStyles } from "../../Components screens/Styles.js";
import { styles } from "../../Components screens/Styles";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { buildPDFAdmin } from "../../../API/Admin/PDFs.js";
import {
  getAllMetodologias,
  getMetodologia,
  createMetodologia,
  updateMetodologia,
  deleteMetodologia,
} from "../../../API/Admin/Metodologia.js"; // Ruta exacta que tú usas

function Metodologias() {
  const [metodologias, setMetodologias] = useState([]);
  const [editingMetodologia, setEditingMetodologia] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    objetivos: "",
    numero_modulos: "",
    fecha_inicio: "",
    fecha_finalizacion: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    fetchMetodologias();
  }, []);

  const fetchMetodologias = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMetodologias();
      const array = Array.isArray(data) ? data : data?.data || [];
      setMetodologias(array);
    } catch (err) {
      setError(err.message || "Error al cargar las metodologías");
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
      nombre: "",
      descripcion: "",
      objetivos: "",
      numero_modulos: "",
      fecha_inicio: "",
      fecha_finalizacion: "",
    });
    setShowCreate(true);
  };

  const openEdit = async (id) => {
    try {
      const met = await getMetodologia(id);
      setFormData({
        nombre: met.nombre || "",
        descripcion: met.descripcion || "",
        objetivos: met.objetivos || "",
        numero_modulos: met.numero_modulos?.toString() || "",
        fecha_inicio: met.fecha_inicio?.split("T")[0] || "",
        fecha_finalizacion: met.fecha_finalizacion?.split("T")[0] || "",
      });
      setEditingMetodologia(met);
      setShowEdit(true);
    } catch (err) {
      alert(err.message || "Error al cargar la metodología");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      await createMetodologia({
        ...formData,
        numero_modulos: parseInt(formData.numero_modulos) || 0,
      });
      setShowCreate(false);
      await fetchMetodologias();
      alert("Metodología creada exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al crear la metodología");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      await updateMetodologia(editingMetodologia.id, {
        ...formData,
        numero_modulos: parseInt(formData.numero_modulos) || 0,
      });
      setShowEdit(false);
      setEditingMetodologia(null);
      await fetchMetodologias();
      alert("Metodología actualizada exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al actualizar la metodología");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar la metodología "${nombre}"?`)) {
      setOperationLoading(true);
      try {
        await deleteMetodologia(id);
        await fetchMetodologias();
        alert("Metodología eliminada exitosamente");
      } catch (err) {
        alert(err.message || "Error al eliminar");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // Filtro de búsqueda
  const filtered = metodologias.filter((m) => {
    const search = searchTerm.toLowerCase();
    return (
      (m.nombre || "").toLowerCase().includes(search) ||
      (m.descripcion || "").toLowerCase().includes(search)
    );
  });

  const totalModulos = metodologias.reduce((acc, m) => acc + (parseInt(m.numero_modulos) || 0), 0);
  const promedioModulos = metodologias.length > 0 ? (totalModulos / metodologias.length).toFixed(1) : 0;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h2 style={TallerStyles.title}>Gestión de Metodologías</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-search" onClick={buildPDFAdmin} style={{ marginRight: "10px" }}>
            Generar PDF
          </button>
          <button className="btn-create" onClick={openCreate}>
            + Nueva Metodología
          </button>
        </div>
      </header>

      {loading && <p className="loading">Cargando metodologías...</p>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* BUSCADOR */}
          <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="InputProyecto"
              style={{ width: "100%", maxWidth: "500px", padding: "12px 16px", fontSize: "14px" }}
            />
          </div>

          {/* ESTADÍSTICAS */}
          <div className="stats-container">
            <div className="stat-card stat-total">
              <h4>Total Metodologías</h4>
              <p>{metodologias.length}</p>
            </div>
            <div className="stat-card stat-completed">
              <h4>Total Módulos</h4>
              <p>{totalModulos}</p>
            </div>
            <div className="stat-card stat-pending">
              <h4>Promedio Módulos</h4>
              <p>{promedioModulos}</p>
            </div>
            <div className="stat-card stat-overdue">
              <h4>Con Objetivos</h4>
              <p>{metodologias.filter((m) => m.objetivos).length}</p>
            </div>
          </div>

          {/* TABLA */}
          <div style={TallerStyles.rolesTableContainer}>
            <table style={TallerStyles.table}>
              <thead style={TallerStyles.tableHead}>
                <tr>
                  <th style={TallerStyles.tableHeader}>Nombre</th>
                  <th style={TallerStyles.tableHeader}>Descripción</th>
                  <th style={TallerStyles.tableHeader}>Módulos</th>
                  <th style={TallerStyles.tableHeader}>Fecha Inicio</th>
                  <th style={TallerStyles.tableHeader}>Fecha Fin</th>
                  <th style={TallerStyles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((met, index) => (
                    <tr
                      key={met.id}
                      style={{
                        ...TallerStyles.tableRow,
                        ...(index % 2 === 0 ? TallerStyles.tableRowAlternate : {}),
                      }}
                    >
                      <td style={TallerStyles.tableCellBold}>{met.nombre}</td>
                      <td style={TallerStyles.tableCell}>
                        {met.descripcion?.length > 50 ? met.descripcion.substring(0, 50) + "..." : met.descripcion || "-"}
                      </td>
                      <td style={TallerStyles.tableCell}>{met.numero_modulos || "0"}</td>
                      <td style={TallerStyles.tableCell}>
                        {met.fecha_inicio ? new Date(met.fecha_inicio).toLocaleDateString("es-ES") : "-"}
                      </td>
                      <td style={TallerStyles.tableCell}>
                        {met.fecha_finalizacion ? new Date(met.fecha_finalizacion).toLocaleDateString("es-ES") : "-"}
                      </td>
                      <td style={TallerStyles.tableCellCenter}>
                        <button
                          onClick={() => openEdit(met.id)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.editButtonDisabled : styles.editButton}
                        >
                          <AiFillEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(met.id, met.nombre)}
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
                      {searchTerm ? "No se encontraron resultados" : "No hay metodologías registradas"}
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
            <h2>Crear Nueva Metodología</h2>
            <form onSubmit={handleCreate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={TallerStyles.formLabel}>Nombre:</label>
                  <input className="InputProyecto" type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={TallerStyles.formLabel}>Descripción:</label>
                  <textarea
                    className="InputProyecto"
                    name="descripcion"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    style={{ resize: "vertical" }}
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={TallerStyles.formLabel}>Objetivos:</label>
                  <textarea
                    className="InputProyecto"
                    name="objetivos"
                    rows="4"
                    value={formData.objetivos}
                    onChange={handleInputChange}
                    style={{ resize: "vertical" }}
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Número de Módulos:</label>
                  <input className="InputProyecto" type="number" name="numero_modulos" value={formData.numero_modulos} onChange={handleInputChange} min="1" disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Fecha Inicio:</label>
                  <input className="InputProyecto" type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Fecha Finalización:</label>
                  <input className="InputProyecto" type="date" name="fecha_finalizacion" value={formData.fecha_finalizacion} onChange={handleInputChange} disabled={operationLoading} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={operationLoading} className="btn-create">
                  {operationLoading ? "Procesando..." : "Crear Metodología"}
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
            <h2>Editar Metodología</h2>
            <form onSubmit={handleUpdate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={TallerStyles.formLabel}>Nombre:</label>
                  <input className="InputProyecto" type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={TallerStyles.formLabel}>Descripción:</label>
                  <textarea className="InputProyecto" name="descripcion" rows="3" value={formData.descripcion} onChange={handleInputChange} style={{ resize: "vertical" }} disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={TallerStyles.formLabel}>Objetivos:</label>
                  <textarea className="InputProyecto" name="objetivos" rows="4" value={formData.objetivos} onChange={handleInputChange} style={{ resize: "vertical" }} disabled={operationLoading} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Número de Módulos:</label>
                  <input className="InputProyecto" type="number" name="numero_modulos" value={formData.numero_modulos} onChange={handleInputChange} min="1" disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Fecha Inicio:</label>
                  <input className="InputProyecto" type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleInputChange} disabled={operationLoading} />
                </div>
                <div>
                  <label style={TallerStyles.formLabel}>Fecha Finalización:</label>
                  <input className="InputProyecto" type="date" name="fecha_finalizacion" value={formData.fecha_finalizacion} onChange={handleInputChange} disabled={operationLoading} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={operationLoading} className="btn-edit">
                  {operationLoading ? "Procesando..." : "Actualizar Metodología"}
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

export default Metodologias;