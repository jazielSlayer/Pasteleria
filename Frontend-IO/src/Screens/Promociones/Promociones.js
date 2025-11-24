// src/Screens/Promociones/Promociones.js
import React, { useState, useEffect } from "react";
import { AiFillEye, AiFillEdit, AiFillDelete, AiOutlinePlus } from "react-icons/ai";
import { getPromociones, getPromocion, createPromocion, updatePromocion, deletePromocion } from "../../API/Admin/Promociones";


function Promociones() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [promocionSeleccionada, setPromocionSeleccionada] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "2x1",
    valor: "",
    producto_id: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    minimo_cantidad: 2,
    activo: 1
  });

  useEffect(() => {
    fetchPromociones();
  }, []);

  const fetchPromociones = async () => {
    try {
      setLoading(true);
      const data = await getPromociones();
      setPromociones(data || []);
    } catch (err) {
      alert("Error cargando promociones");
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalle = async (id) => {
    setModalOpen(true);
    setModoEdicion(false);
    try {
      const data = await getPromocion(id);
      setPromocionSeleccionada(data);
    } catch {
      alert("Error al cargar promoción");
      setModalOpen(false);
    }
  };

  const abrirCrear = () => {
    setModoEdicion(true);
    setModalOpen(true);
    setPromocionSeleccionada(null);
    setFormData({
      nombre: "",
      tipo: "2x1",
      valor: "",
      producto_id: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin: "",
      minimo_cantidad: 2,
      activo: 1
    });
  };

  const abrirEditar = (promo) => {
    setModoEdicion(true);
    setModalOpen(true);
    setPromocionSeleccionada(promo);
    setFormData({
      nombre: promo.nombre || "",
      tipo: promo.tipo || "2x1",
      valor: promo.valor || "",
      producto_id: promo.producto_id || "",
      fecha_inicio: promo.fecha_inicio || "",
      fecha_fin: promo.fecha_fin || "",
      minimo_cantidad: promo.minimo_cantidad || 2,
      activo: promo.activo || 0
    });
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setModoEdicion(false);
    setPromocionSeleccionada(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (promocionSeleccionada) {
        await updatePromocion(promocionSeleccionada.promocion_id, formData);
        alert("Promoción actualizada");
      } else {
        await createPromocion(formData);
        alert("Promoción creada");
      }
      fetchPromociones();
      cerrarModal();
    } catch (err) {
      alert("Error al guardar promoción");
    }
  };

  const handleDesactivar = async (id) => {
    if (window.confirm("¿Desactivar esta promoción?")) {
      await deletePromocion(id);
      fetchPromociones();
    }
  };

  const filteredPromociones = promociones.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Cargando promociones...</div>;

  return (
    <div className="proyectos-container">
      {/* HEADER */}
      <div className="proyectos-header">
        <h1>Gestión de Promociones</h1>
        <div className="header-actions">
          <button className="btn-create" onClick={abrirCrear}>
            <AiOutlinePlus /> Nueva Promoción
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div style={{ marginBottom: "1.5rem", padding: "0 0.5rem" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px" }}
        />
      </div>

      {/* ESTADÍSTICAS */}
      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Total</h4>
          <p>{promociones.length}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Vigentes Hoy</h4>
          <p>{promociones.filter(p => p.vigente_hoy === 1).length}</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Activas</h4>
          <p>{promociones.filter(p => p.activo === 1).length}</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Inactivas</h4>
          <p>{promociones.filter(p => p.activo === 0).length}</p>
        </div>
      </div>

      {/* TABLA */}
      <div style={{ overflowX: "auto", borderRadius: "12px", background: "#2d2d2d60", padding: "1rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a1a2e", color: "#fff" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Tipo</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Producto</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Vigencia</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Estado</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromociones.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No hay promociones registradas
                </td>
              </tr>
            ) : (
              filteredPromociones.map((p, i) => (
                <tr key={p.promocion_id} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent", borderBottom: "1px solid #444" }}>
                  <td style={{ padding: "1rem", fontWeight: "600" }}>{p.nombre}</td>
                  <td style={{ padding: "1rem" }}>
                    <span className="status" style={{
                      background: p.tipo === "2x1" ? "rgba(255,152,0,0.4)" :
                                 p.tipo === "DESCUENTO_%" ? "rgba(76,175,80,0.4)" :
                                 p.tipo === "PRODUCTO_GRATIS" ? "rgba(156,39,176,0.4)" : "rgba(33,150,243,0.4)",
                      color: p.tipo === "2x1" ? "#FF9800" :
                             p.tipo === "DESCUENTO_%" ? "#4CAF50" :
                             p.tipo === "PRODUCTO_GRATIS" ? "#9C27B0" : "#2196F3"
                    }}>
                      {p.tipo}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>{p.producto_nombre || "Todos los productos"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.95rem" }}>
                    {p.fecha_inicio} → {p.fecha_fin || "∞"}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span className="status" style={{
                      background: p.vigente_hoy === 1 ? "rgba(46,204,113,0.4)" : 
                                 p.activo === 1 ? "rgba(243,156,18,0.4)" : "rgba(231,76,60,0.4)",
                      color: p.vigente_hoy === 1 ? "#2ecc71" : p.activo === 1 ? "#f39c12" : "#e74c3c"
                    }}>
                      {p.vigente_hoy === 1 ? "VIGENTE" : p.activo === 1 ? "FUTURA" : "INACTIVA"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button onClick={() => abrirDetalle(p.promocion_id)} className="btn-search" style={{ padding: "0.6rem 1rem", margin: "0 0.4rem" }}>
                      <AiFillEye />
                    </button>
                    <button onClick={() => abrirEditar(p)} className="btn-edit" style={{ padding: "0.6rem 1rem", margin: "0 0.4rem" }}>
                      <AiFillEdit />
                    </button>
                    <button onClick={() => handleDesactivar(p.promocion_id)} className="btn-delete" style={{ padding: "0.6rem 1rem", margin: "0 0.4rem" }}>
                      <AiFillDelete />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {modoEdicion 
                ? (promocionSeleccionada ? "Editar Promoción" : "Nueva Promoción")
                : "Detalle de Promoción"
              }
            </h2>

            {modoEdicion ? (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div>
                    <label>Nombre *</label>
                    <input type="text" className="InputProyecto" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div>
                    <label>Tipo *</label>
                    <select className="InputProyecto" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                      <option value="2x1">2x1</option>
                      <option value="DESCUENTO_%">Descuento %</option>
                      <option value="PRODUCTO_GRATIS">Producto Gratis</option>
                      <option value="COMBO">Combo</option>
                    </select>
                  </div>
                </div>

                {formData.tipo === "DESCUENTO_%" && (
                  <div className="form-row">
                    <div>
                      <label>Porcentaje (1-100) *</label>
                      <input type="number" min="1" max="100" className="InputProyecto" required value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div>
                    <label>Producto ID (opcional)</label>
                    <input type="number" className="InputProyecto" value={formData.producto_id} onChange={e => setFormData({...formData, producto_id: e.target.value})} />
                  </div>
                  <div>
                    <label>Mínimo cantidad</label>
                    <input type="number" min="1" className="InputProyecto" value={formData.minimo_cantidad} onChange={e => setFormData({...formData, minimo_cantidad: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Fecha inicio *</label>
                    <input type="date" className="InputProyecto" required value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} />
                  </div>
                  <div>
                    <label>Fecha fin (opcional)</label>
                    <input type="date" className="InputProyecto" value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-close" onClick={cerrarModal}>Cancelar</button>
                  <button type="submit" className="btn-create">
                    {promocionSeleccionada ? "Actualizar" : "Crear"} Promoción
                  </button>
                </div>
              </form>
            ) : (
              <div className="modal-grid">
                <p><strong>Nombre:</strong> {promocionSeleccionada?.nombre}</p>
                <p><strong>Tipo:</strong> {promocionSeleccionada?.tipo}</p>
                <p><strong>Valor:</strong> {promocionSeleccionada?.valor ? (promocionSeleccionada.tipo === "DESCUENTO_%" ? promocionSeleccionada.valor + "%" : promocionSeleccionada.valor) : "-"}</p>
                <p><strong>Producto:</strong> {promocionSeleccionada?.producto_nombre || "Todos"}</p>
                <p><strong>Vigencia:</strong> {promocionSeleccionada?.fecha_inicio} → {promocionSeleccionada?.fecha_fin || "Permanente"}</p>
                <p><strong>Mínimo cantidad:</strong> {promocionSeleccionada?.minimo_cantidad}</p>
                <p><strong>Estado:</strong> 
                  <span style={{ color: promocionSeleccionada?.vigente_hoy === 1 ? "#2ecc71" : "#e74c3c", fontWeight: "bold" }}>
                    {promocionSeleccionada?.vigente_hoy === 1 ? "VIGENTE HOY" : (promocionSeleccionada?.activo === 1 ? "FUTURA" : "INACTIVA")}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Promociones;