import { useState, useEffect } from "react";
import { getAllModulos, createModulo, updateModulo, deleteModulo } from "../../../API/Admin/Modulo";
import { getDocentes } from "../../../API/Admin/Docente_admin";
import { getAllMetodologias } from "../../../API/Admin/Metodologia";
import { styles } from "../../Components screens/Styles";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";


export default function Modulos() {
  const [modulos, setModulos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [metodologias, setMetodologias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modo, setModo] = useState("crear"); 
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    id_docente: "",
    id_metodologia: "",
    duracion: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_finalizacion: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarModulos();
  }, []);

  const cargarModulos = async () => {
    try {
      setLoading(true);
      const [modulosData, docentesData, metodologiasData] = await Promise.all([
        getAllModulos(),
        getDocentes(),
        getAllMetodologias()
      ]);
      setModulos(modulosData || []);
      setDocentes(docentesData || []);
      setMetodologias(metodologiasData || []);
      setError(null);
    } catch (err) {
      setError("Error al cargar los módulos / docentes / metodologías");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (modo = "crear", modulo = null) => {
    setModo(modo);
    setModuloSeleccionado(modulo);

    if (modo === "crear") {
      setFormData({
        codigo: "",
        nombre: "",
        id_docente: "",
        id_metodologia: "",
        duracion: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_finalizacion: "",
      });
    } else {
      setFormData({
        codigo: modulo.codigo || "",
        nombre: modulo.nombre || "",
        id_docente: modulo.id_docente ?? "" ,
        id_metodologia: modulo.id_metodologia ?? "" ,
        duracion: modulo.duracion || "",
        descripcion: modulo.descripcion || "",
        fecha_inicio: modulo.fecha_inicio ? modulo.fecha_inicio.split("T")[0] : "",
        fecha_finalizacion: modulo.fecha_finalizacion
          ? modulo.fecha_finalizacion.split("T")[0]
          : "",
      });
    }
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setModuloSeleccionado(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modo === "crear") {
        await createModulo(formData);
        alert("Módulo creado exitosamente");
      } else {
        await updateModulo(moduloSeleccionado.id, formData);
        alert("Módulo actualizado exitosamente");
      }
      cargarModulos();
      cerrarModal();
    } catch (err) {
      alert("Ocurrió un error al guardar el módulo");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este módulo?")) return;

    try {
      await deleteModulo(id);
      alert("Módulo eliminado");
      cargarModulos();
    } catch (err) {
      alert("Error al eliminar el módulo");
    }
  };

  const filteredModulos = modulos.filter((m) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const docente = `${m.nombres || ""} ${m.apellidopat || ""} ${m.apellidomat || ""}`.toLowerCase();
    const metodologia = (m.metodologia_nombre || "").toLowerCase();
    return (
      (m.codigo || "").toString().toLowerCase().includes(q) ||
      (m.nombre || "").toLowerCase().includes(q) ||
      docente.includes(q) ||
      metodologia.includes(q)
    );
  });

  const totalModulos = modulos.length;
  const uniqueMetodologias = new Set(modulos.map(m => m.metodologia_nombre).filter(Boolean)).size;
  const uniqueDocentes = new Set(modulos.map(m => {
    const d = `${m.nombres || ""} ${m.apellidopat || ""} ${m.apellidomat || ""}`.trim();
    return d || null;
  }).filter(Boolean)).size;
  const withDescription = modulos.filter(m => m.descripcion && m.descripcion.trim().length > 0).length;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h2 style={styles.title}>Módulos</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={() => abrirModal("crear")}>
            + Nuevo Módulo
          </button>
        </div>
      </header>

      {loading ? (
        <p style={styles.loadingText}>Cargando módulos...</p>
      ) : error ? (
        <div style={styles.errorMessage}>{error}</div>
      ) : (
        <>
          {/* Buscador (como en Tallerres) */}
          <div style={{ marginBottom: 16, padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por código, nombre, docente o metodología..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="InputProyecto"
              style={{ width: "100%", maxWidth: 600, padding: "10px 14px", fontSize: 14 }}
            />
          </div>

          {/* Estadísticas (similar a Tallerres) */}
          <div className="stats-container">
            <div className="stat-card stat-total">
              <h4>Total Módulos</h4>
              <p>{totalModulos}</p>
            </div>

            <div className="stat-card stat-completed">
              <h4 >Metodologías</h4>
              <p>{uniqueMetodologias}</p>
            </div>

            <div className="stat-card stat-pending">
              <h4>Docentes</h4>
              <p>{uniqueDocentes}</p>
            </div>

            <div className="stat-card stat-overdue">
              <h4>Con descripción</h4>
              <p>{withDescription}</p>
            </div>
          </div>

          {/* Tabla */}
          <div style={styles.rolesTableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableHeader}>Código</th>
                  <th style={styles.tableHeader}>Nombre</th>
                  <th style={styles.tableHeader}>Docente</th>
                  <th style={styles.tableHeader}>Metodología</th>
                  <th style={styles.tableHeader}>Duración</th>
                  <th style={styles.tableHeader}>Fecha Inicio</th>
                  <th style={styles.tableHeader}>Fecha Fin</th>
                  <th style={styles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredModulos.length > 0 ? (
                  filteredModulos.map((modulo, index) => (
                    <tr
                      key={modulo.id}
                      style={{
                        ...styles.tableRow,
                        ...(index % 2 === 0 ? styles.tableRowAlternate : {}),
                      }}
                    >
                      <td style={styles.tableCell}>{modulo.codigo}</td>
                      <td style={styles.tableCellBold}>{modulo.nombre}</td>
                      <td style={styles.tableCell}>
                        {modulo.nombres} {modulo.apellidopat} {modulo.apellidomat}
                      </td>
                      <td style={styles.tableCell}>{modulo.metodologia_nombre}</td>
                      <td style={styles.tableCell}>{modulo.duracion}</td>
                      <td style={styles.tableCell}>
                        <code style={styles.code}>{modulo.fecha_inicio}</code>
                      </td>
                      <td style={styles.tableCell}>
                        <code style={styles.code}>{modulo.fecha_finalizacion}</code>
                      </td>
                      <td style={styles.tableCellCenter}>
                        <button
                          className="btn-edit"
                          onClick={() => abrirModal("editar", modulo)}
                          title="Editar"
                          style={styles.editButton}
                        >
                          <AiFillEdit/>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(modulo.id)}
                          title="Eliminar"
                          style={styles.deleteButton}
                        >
                          <AiFillDelete/>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={styles.noDataText} colSpan="8">
                      {searchTerm ? "No se encontraron resultados" : "No hay módulos registrados aún."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {modo === "crear"
                ? "Nuevo Módulo"
                : modo === "editar"
                ? "Editar Módulo"
                : "Detalle del Módulo"}
            </h2>

            {modo === "ver" ? (
              <div className="view-mode">
                <p><strong>Código:</strong> {moduloSeleccionado.codigo}</p>
                <p><strong>Nombre:</strong> {moduloSeleccionado.nombre}</p>
                <p><strong>Docente:</strong> {moduloSeleccionado.nombres} {moduloSeleccionado.apellidopat}</p>
                <p><strong>Metodología:</strong> {moduloSeleccionado.metodologia_nombre}</p>
                <p><strong>Duración:</strong> {moduloSeleccionado.duracion}</p>
                <p><strong>Descripción:</strong> {moduloSeleccionado.descripcion || "Sin descripción"}</p>
                <p><strong>Inicio:</strong> {moduloSeleccionado.fecha_inicio}</p>
                <p><strong>Fin:</strong> {moduloSeleccionado.fecha_finalizacion}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row" style={{ gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Código</label>
                    <input
                      className="InputProyecto"
                      type="text"
                      placeholder="Código"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={styles.formLabel}>Nombre del módulo</label>
                    <input
                      className="InputProyecto"
                      type="text"
                      placeholder="Nombre del módulo"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row" style={{ gap: 12, marginTop: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Docente</label>
                    <select
                      className="InputProyecto"
                      value={formData.id_docente}
                      onChange={(e) => setFormData({ ...formData, id_docente: e.target.value })}
                      required
                    >
                      <option value="">Seleccione un docente</option>
                      {docentes.map(d => (
                        <option key={d.id ?? d.ID ?? d.ID_DOCENTE} value={d.id ?? d.ID ?? d.ID_DOCENTE}>
                          {`${d.nombres || ""} ${d.apellidopat || ""} ${d.apellidomat || ""}`.trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Metodología</label>
                    <select
                      className="InputProyecto"
                      value={formData.id_metodologia}
                      onChange={(e) => setFormData({ ...formData, id_metodologia: e.target.value })}
                      required
                    >
                      <option value="">Seleccione una metodología</option>
                      {metodologias.map(m => (
                        <option key={m.id ?? m.ID} value={m.id ?? m.ID}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Duración</label>
                    <input
                      className="InputProyecto"
                      type="text"
                      placeholder="Duración (ej: 8 semanas)"
                      value={formData.duracion}
                      onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row" style={{ gap: 12, marginTop: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Inicio</label>
                    <input
                      className="InputProyecto"
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Fin</label>
                    <input
                      className="InputProyecto"
                      type="date"
                      value={formData.fecha_finalizacion}
                      onChange={(e) => setFormData({ ...formData, fecha_finalizacion: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-full" style={{ marginTop: 12 }}>
                  <label style={styles.formLabel}>Descripción</label>
                  <textarea
                    className="InputProyecto"
                    placeholder="Descripción (opcional)"
                    rows="3"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-close" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-edit">
                    {modo === "crear" ? "Crear" : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            )}

            {modo === "ver" && (
              <div className="modal-actions">
                <button className="btn-close" onClick={cerrarModal}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
