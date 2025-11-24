import React, { useState, useEffect } from "react";
import { AiFillEye, AiFillDelete, AiOutlineClose } from "react-icons/ai";
import { getVentas, anularVenta, getVenta } from "../../API/Admin/Ventas";

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      setLoading(true);
      const data = await getVentas();
      setVentas(data);
    } catch (err) {
      alert("Error cargando ventas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalle = async (venta_id) => {
    setLoadingDetalle(true);
    setModalOpen(true);
    try {
      const data = await getVenta(venta_id);
      setVentaSeleccionada(data);
    } catch (err) {
      alert("Error al cargar detalle");
      setModalOpen(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setVentaSeleccionada(null);
  };

  const handleAnular = async (id) => {
    if (window.confirm("¿Seguro que deseas anular esta venta?")) {
      try {
        await anularVenta(id);
        alert("Venta anulada correctamente");
        fetchVentas();
      } catch (err) {
        alert(err.message || "Error al anular");
      }
    }
  };

  const filteredVentas = ventas.filter(v =>
    (v.cliente_nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.numero_factura || "").includes(searchTerm)
  );

  if (loading) return <div className="loading">Cargando ventas...</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Gestión de Ventas</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={() => window.location.href = "/ventas/nueva"}>
            + Nueva Venta
          </button>
        </div>
      </header>

      {/* Buscador */}
      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por cliente o factura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px" }}
        />
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Ventas del Día</h4>
          <p>{ventas.length}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Ingresos Totales</h4>
          <p>Bs {ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0).toFixed(2)}</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Descuentos Aplicados</h4>
          <p>Bs {ventas.reduce((sum, v) => sum + parseFloat(v.descuento || 0), 0).toFixed(2)}</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Promedio por Venta</h4>
          <p>Bs {(ventas.length > 0 ? (ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0) / ventas.length).toFixed(2) : 0)}</p>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ padding: "0 15px", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
          <thead style={{ background: "#333" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Fecha y Hora</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Cliente</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Factura</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Método</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Total</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVentas.map((venta, index) => (
              <tr key={venta.venta_id} style={{
                borderBottom: "1px solid #555",
                background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent"
              }}>
                <td style={{ padding: "12px", color: "#fff", fontSize: "14px" }}>
                  {new Date(venta.fecha).toLocaleString('es-BO')}
                </td>
                <td style={{ padding: "12px", color: "#fff", fontWeight: "bold" }}>
                  {venta.cliente_nombre || "Mostrador"}
                </td>
                <td style={{ padding: "12px", color: "#fff" }}>
                  {venta.numero_factura || "-"}
                </td>
                <td style={{ padding: "12px", color: "#fff" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: venta.metodo_pago === "EFECTIVO" ? "#4CAF50" : "#2196F3",
                    color: "white",
                    fontSize: "11px"
                  }}>
                    {venta.metodo_pago || "EFECTIVO"}
                  </span>
                </td>
                <td style={{ padding: "12px", color: "#fff", fontWeight: "bold" }}>
                  Bs {parseFloat(venta.total || 0).toFixed(2)}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => abrirDetalle(venta.venta_id)}
                    style={{ padding: "8px 12px", background: "#2196F3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "8px" }}
                  >
                    <AiFillEye />
                  </button>
                  {new Date(venta.fecha).toDateString() === new Date().toDateString() && (
                    <button
                      onClick={() => handleAnular(venta.venta_id)}
                      style={{ padding: "8px 12px", background: "#F44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      <AiFillDelete />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DETALLE */}
      {modalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div style={{
            background: "#1a1a1a", width: "90%", maxWidth: "800px", maxHeight: "90vh", borderRadius: "12px",
            overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", position: "relative"
          }}>
            {/* Header del modal */}
            <div style={{ background: "#333", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, color: "#fff" }}>Detalle de Venta #{ventaSeleccionada?.venta_id}</h2>
              <button onClick={cerrarModal} style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer" }}>
                <AiOutlineClose />
              </button>
            </div>

            {/* Contenido */}
            <div style={{ padding: "20px", color: "#fff", maxHeight: "70vh", overflowY: "auto" }}>
              {loadingDetalle ? (
                <p>Cargando detalle...</p>
              ) : (
                <>
                  <div style={{ marginBottom: "20px", lineHeight: "1.8" }}>
                    <p><strong>Fecha:</strong> {new Date(ventaSeleccionada?.fecha).toLocaleString('es-BO')}</p>
                    <p><strong>Cliente:</strong> {ventaSeleccionada?.cliente_nombre || "Mostrador"}</p>
                    <p><strong>NIT/CI:</strong> {ventaSeleccionada?.cliente_ci || "-"}</p>
                    <p><strong>Vendedor:</strong> {ventaSeleccionada?.vendedor || "Caja"}</p>
                    <p><strong>Método de pago:</strong> {ventaSeleccionada?.metodo_pago || "EFECTIVO"}</p>
                    <p><strong>Factura:</strong> {ventaSeleccionada?.numero_factura || "Sin factura"}</p>
                  </div>

                  <h3 style={{ borderBottom: "2px solid #444", paddingBottom: "10px" }}>Productos vendidos</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#333" }}>
                        <th style={{ padding: "10px", textAlign: "left" }}>Producto</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Cant.</th>
                        <th style={{ padding: "10px", textAlign: "right" }}>Precio</th>
                        <th style={{ padding: "10px", textAlign: "right" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventaSeleccionada?.items?.map((item, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #444" }}>
                          <td style={{ padding: "10px" }}>{item.producto_nombre || "Producto"}</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>{item.cantidad}</td>
                          <td style={{ padding: "10px", textAlign: "right" }}>Bs {parseFloat(item.precio_unitario || 0).toFixed(2)}</td>
                          <td style={{ padding: "10px", textAlign: "right" }}>Bs {parseFloat(item.subtotal || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: "20px", textAlign: "right", fontSize: "18px" }}>
                    <p><strong>Subtotal:</strong> Bs {parseFloat(ventaSeleccionada?.subtotal || 0).toFixed(2)}</p>
                    <p><strong>Descuento:</strong> Bs {parseFloat(ventaSeleccionada?.descuento || 0).toFixed(2)}</p>
                    <p style={{ fontSize: "24px", color: "#4CAF50" }}>
                      <strong>TOTAL: Bs {parseFloat(ventaSeleccionada?.total || 0).toFixed(2)}</strong>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ventas;