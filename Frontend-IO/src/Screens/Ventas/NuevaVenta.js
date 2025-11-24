import React, { useState, useEffect } from "react";
import { createVenta } from "../../API/Admin/Ventas.js";
import { getClientes } from "../../API/Admin/Clientes.js";
import { getProductos } from "../../API/Admin/Productos.js";
import { AiFillDelete } from "react-icons/ai";

function NuevaVenta() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([{ producto_id: "", cantidad: 1 }]);
  const [clienteId, setClienteId] = useState("");
  const [tipoComprobante, setTipoComprobante] = useState("SIN_FACTURA");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [cli, prod] = await Promise.all([getClientes(), getProductos()]);
      setClientes(cli);
      setProductos(prod.filter(p => p.activo));
    } catch (err) {
      alert("Error cargando datos");
    }
  };

  const handleAddItem = () => {
    setItems([...items, { producto_id: "", cantidad: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const nuevos = [...items];
    nuevos[index][field] = field === "producto_id" ? value : parseFloat(value) || 1;
    setItems(nuevos);
  };

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calcularSubtotal = () => {
    return items.reduce((sum, item) => {
      const prod = productos.find(p => p.producto_id === parseInt(item.producto_id));
      return sum + (prod ? prod.precio_venta * item.cantidad : 0);
    }, 0);
  };

  const calcularDescuento = () => {
    if (!clienteId) return 0;
    const cliente = clientes.find(c => c.cliente_id === parseInt(clienteId));
    if (!cliente || !cliente.descuento_porcentaje) return 0;
    return calcularSubtotal() * (cliente.descuento_porcentaje / 100);
  };

  const calcularTotal = () => {
    return (calcularSubtotal() - calcularDescuento()).toFixed(2);
  };

  const handleSubmit = async () => {
    const itemsValidos = items.filter(i => i.producto_id && i.cantidad > 0);
    if (itemsValidos.length === 0) return alert("Agrega al menos un producto");

    if (tipoComprobante === "FACTURA" && !numeroFactura.trim()) {
      return alert("Ingresa el número de factura");
    }

    const venta = {
      cliente_id: clienteId ? parseInt(clienteId) : null,
      items: itemsValidos.map(i => ({
        producto_id: parseInt(i.producto_id),
        cantidad: parseFloat(i.cantidad)
      })),
      tipo_comprobante: tipoComprobante,
      numero_factura: tipoComprobante === "FACTURA" ? numeroFactura.trim() : null,
      metodo_pago: metodoPago,
      vendedor: "Caja"
    };

    try {
      const res = await createVenta(venta);
      alert(`Venta registrada con éxito!\nTotal: Bs ${res.total}\nFactura: ${res.numero_factura || "Sin factura"}`);
      window.location.href = "/ventas";
    } catch (err) {
      alert("Error: " + (err.message || "No se pudo registrar la venta"));
    }
  };

  const clienteSeleccionado = clientes.find(c => c.cliente_id === parseInt(clienteId));

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Punto de Venta - Nueva Venta</h1>
      </header>

      <div style={{ padding: "20px 15px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Cliente y Comprobante */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ color: "#fff", display: "block", marginBottom: "8px" }}>Cliente</label>
            <select
              className="InputProyecto"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">Mostrador (Sin descuento)</option>
              {clientes.map(c => (
                <option key={c.cliente_id} value={c.cliente_id}>
                  {c.nombre} {c.descuento_porcentaje > 0 && `(${c.descuento_porcentaje}% desc)`}
                </option>
              ))}
            </select>
            {clienteSeleccionado && clienteSeleccionado.descuento_porcentaje > 0 && (
              <small style={{ color: "#4CAF50", display: "block", marginTop: "5px" }}>
                Descuento aplicado: {clienteSeleccionado.descuento_porcentaje}%
              </small>
            )}
          </div>

          <div>
            <label style={{ color: "#fff", display: "block", marginBottom: "8px" }}>Tipo de Comprobante</label>
            <select
              className="InputProyecto"
              value={tipoComprobante}
              onChange={(e) => setTipoComprobante(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="SIN_FACTURA">Sin Factura</option>
              <option value="FACTURA">Factura</option>
            </select>
            {tipoComprobante === "FACTURA" && (
              <input
                type="text"
                placeholder="Número de Factura"
                className="InputProyecto"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                style={{ width: "100%", marginTop: "10px" }}
              />
            )}
          </div>
        </div>

        {/* Método de Pago */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#fff", marginRight: "15px" }}>Método de Pago:</label>
          <select
            className="InputProyecto"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            style={{ width: "300px" }}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="QR">QR / Código</option>
          </select>
        </div>

        {/* Lista de productos */}
        <h3 style={{ color: "#fff", margin: "25px 0 15px" }}>Productos</h3>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "15px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "4fr 1fr 80px", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
              <select
                className="InputProyecto"
                value={item.producto_id}
                onChange={(e) => handleItemChange(i, "producto_id", e.target.value)}
              >
                <option value="">Seleccionar producto</option>
                {productos.map(p => (
                  <option key={p.producto_id} value={p.producto_id}>
                    {p.nombre} - Bs {p.precio_venta}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0.001"
                step="0.001"
                className="InputProyecto"
                value={item.cantidad}
                onChange={(e) => handleItemChange(i, "cantidad", e.target.value)}
                style={{ textAlign: "center" }}
              />

              <button
                onClick={() => eliminarItem(i)}
                style={{
                  background: "#F44336",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "18px"
                }}
              >
                <AiFillDelete />
              </button>
            </div>
          ))}

          <button onClick={handleAddItem} className="btn-create" style={{ width: "100%", padding: "12px" }}>
            + Agregar Producto
          </button>
        </div>

        {/* Totales */}
        <div style={{ marginTop: "30px", textAlign: "right", background: "#111", padding: "20px", borderRadius: "10px" }}>
          <div style={{ fontSize: "20px", color: "#fff", marginBottom: "10px" }}>
            <span style={{ display: "inline-block", width: "140px" }}>Subtotal:</span>
            <strong>Bs {calcularSubtotal().toFixed(2)}</strong>
          </div>
          <div style={{ fontSize: "20px", color: "#ff9800", marginBottom: "10px" }}>
            <span style={{ display: "inline-block", width: "140px" }}>Descuento:</span>
            <strong>- Bs {calcularDescuento().toFixed(2)}</strong>
          </div>
          <div style={{ fontSize: "28px", color: "#4CAF50", fontWeight: "bold" }}>
            <span style={{ display: "inline-block", width: "140px" }}>TOTAL:</span>
            <strong>Bs {calcularTotal()}</strong>
          </div>
        </div>

        {/* Botones finales */}
        <div className="modal-actions" style={{ marginTop: "30px", justifyContent: "center", gap: "20px" }}>
          <button onClick={handleSubmit} className="btn-create" style={{ padding: "15px 40px", fontSize: "18px" }}>
            COBRAR Y GUARDAR
          </button>
          <button className="btn-close" onClick={() => window.history.back()} style={{ padding: "15px 30px", fontSize: "16px" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default NuevaVenta;