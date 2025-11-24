import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillCheckCircle } from "react-icons/ai";
import { FaShoppingCart, FaTruck } from "react-icons/fa";
import { getCompras, createCompra, recibirCompra, cancelarCompra } from "../../API/Admin/Compras";
import { getMateriasPrimas } from "../../API/Admin/MateriasPrimas";
import { getProveedores } from "../../API/Admin/Provedores";

function Compras() {
  const [compras, setCompras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modales
  const [showCreate, setShowCreate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);
  
  // Carrito de compra
  const [carrito, setCarrito] = useState([]);
  const [formData, setFormData] = useState({
    proveedor_id: "",
    numero_factura: "",
    fecha_compra: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [comprasData, materiasData, proveedoresData] = await Promise.all([
        getCompras(),
        getMateriasPrimas(),
        getProveedores()
      ]);
      setCompras(comprasData);
      setMaterias(materiasData);
      setProveedores(proveedoresData.filter(p => p.activo));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setFormData({
      proveedor_id: "",
      numero_factura: "",
      fecha_compra: new Date().toISOString().split('T')[0]
    });
    setCarrito([]);
    setShowCreate(true);
  };

  const openDetails = (compra) => {
    setSelectedCompra(compra);
    setShowDetails(true);
  };

  // Gestión del carrito
  const agregarMateria = () => {
    setCarrito([...carrito, {
      materia_id: "",
      cantidad: 0,
      precio_unitario: 0
    }]);
  };

  const actualizarItemCarrito = (index, field, value) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index][field] = value;
    
    // Si se selecciona una materia, autocompletar el precio
    if (field === 'materia_id' && value) {
      const materia = materias.find(m => m.materia_id === parseInt(value));
      if (materia) {
        nuevoCarrito[index].precio_unitario = materia.costo_promedio;
      }
    }
    
    setCarrito(nuevoCarrito);
  };

  const eliminarItemCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => {
      return sum + (parseFloat(item.cantidad || 0) * parseFloat(item.precio_unitario || 0));
    }, 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.proveedor_id) {
      alert("Debe seleccionar un proveedor");
      return;
    }

    if (carrito.length === 0) {
      alert("Debe agregar al menos una materia prima");
      return;
    }

    const compraCompleta = carrito.every(item => 
      item.materia_id && item.cantidad > 0 && item.precio_unitario > 0
    );

    if (!compraCompleta) {
      alert("Complete todos los campos de las materias primas");
      return;
    }

    const compraData = {
      proveedor_id: parseInt(formData.proveedor_id),
      numero_factura: formData.numero_factura || null,
      fecha_compra: formData.fecha_compra,
      total_bs: calcularTotal(),
      detalles: carrito.map(item => ({
        materia_id: parseInt(item.materia_id),
        cantidad: parseFloat(item.cantidad),
        precio_unitario: parseFloat(item.precio_unitario)
      }))
    };

    try {
      await createCompra(compraData);
      setShowCreate(false);
      fetchData();
      alert("Compra registrada exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecibir = async (id) => {
    if (window.confirm("¿Confirmar recepción de esta compra? Esto actualizará el inventario.")) {
      try {
        await recibirCompra(id);
        fetchData();
        setShowDetails(false);
        alert("Compra recibida. Inventario actualizado.");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm("¿Está seguro de cancelar esta compra?")) {
      try {
        await cancelarCompra(id);
        fetchData();
        setShowDetails(false);
        alert("Compra cancelada");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredCompras = compras.filter(c => 
    (c.numero_factura && c.numero_factura.includes(searchTerm)) ||
    (c.proveedor_nombre && c.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'RECIBIDA': return '#4CAF50';
      case 'PENDIENTE': return '#FF9800';
      case 'CANCELADA': return '#F44336';
      default: return '#999';
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'RECIBIDA': return <AiFillCheckCircle />;
      case 'PENDIENTE': return <FaTruck />;
      case 'CANCELADA': return <AiFillDelete />;
      default: return <FaShoppingCart />;
    }
  };

  const stats = {
    total: compras.length,
    pendientes: compras.filter(c => c.estado === 'PENDIENTE').length,
    recibidas: compras.filter(c => c.estado === 'RECIBIDA').length,
    canceladas: compras.filter(c => c.estado === 'CANCELADA').length,
    totalInvertido: compras
      .filter(c => c.estado === 'RECIBIDA')
      .reduce((sum, c) => sum + parseFloat(c.total_bs || 0), 0)
  };

  if (loading) return <div className="loading">Cargando compras...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Gestión de Compras</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>
            + Nueva Compra
          </button>
        </div>
      </header>

      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por número de factura o proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px" }}
        />
      </div>

      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Total Compras</h4>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Pendientes</h4>
          <p>{stats.pendientes}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Recibidas</h4>
          <p>{stats.recibidas}</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Total Invertido</h4>
          <p>{stats.totalInvertido.toFixed(2)} Bs</p>
        </div>
      </div>

      <div className="proyectos-grid">
        {filteredCompras.map(compra => (
          <div 
            key={compra.compra_id} 
            className="proyecto-card" 
            onClick={() => openDetails(compra)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-header">
              <h3>
                {getEstadoIcon(compra.estado)} {compra.numero_factura || `Compra #${compra.compra_id}`}
              </h3>
              <span 
                className="status" 
                style={{ 
                  backgroundColor: getEstadoColor(compra.estado) + '40',
                  color: getEstadoColor(compra.estado)
                }}
              >
                {compra.estado}
              </span>
            </div>
            <div className="card-body">
              <p><strong>Proveedor:</strong> {compra.proveedor_nombre || 'N/A'}</p>
              <p><strong>Fecha:</strong> {new Date(compra.fecha_compra).toLocaleDateString('es-ES')}</p>
              <p><strong>Total:</strong> {parseFloat(compra.total_bs || 0).toFixed(2)} Bs</p>
              {compra.total_items && (
                <p><strong>Items:</strong> {compra.total_items} materias primas</p>
              )}
            </div>
          </div>
        ))}

        {filteredCompras.length === 0 && (
          <div className="no-data" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#aaa' }}>
            {searchTerm ? `No se encontraron compras para "${searchTerm}"` : "No hay compras registradas"}
          </div>
        )}
      </div>

      {/* MODAL CREAR COMPRA */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content modal-content-large" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <h2>Registrar Nueva Compra</h2>
            <form onSubmit={handleCreate}>
              {/* Datos de la compra */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>Información de Compra</h3>
                
                <div className="form-row">
                  <div>
                    <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>Proveedor: *</label>
                    <select 
                      className="InputProyecto" 
                      name="proveedor_id" 
                      value={formData.proveedor_id} 
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione un proveedor</option>
                      {proveedores.map(p => (
                        <option key={p.proveedor_id} value={p.proveedor_id}>
                          {p.nombre} - {p.telefono || 'Sin teléfono'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>Número de Factura:</label>
                    <input 
                      className="InputProyecto" 
                      name="numero_factura" 
                      value={formData.numero_factura} 
                      onChange={handleChange}
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>Fecha de Compra:</label>
                    <input 
                      className="InputProyecto" 
                      type="date"
                      name="fecha_compra" 
                      value={formData.fecha_compra} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Detalle de materias primas */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#fff', margin: 0 }}>Materias Primas</h3>
                  <button 
                    type="button" 
                    onClick={agregarMateria}
                    style={{ 
                      padding: '8px 16px', 
                      background: '#4CAF50', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    + Agregar Materia
                  </button>
                </div>

                {carrito.length === 0 ? (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>
                    No hay materias agregadas. Haga clic en "Agregar Materia" para comenzar.
                  </p>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {carrito.map((item, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '2fr 1fr 1fr auto', 
                          gap: '10px', 
                          marginBottom: '15px',
                          padding: '15px',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          alignItems: 'end'
                        }}
                      >
                        <div>
                          <label style={{ color: '#fff', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                            Materia Prima:
                          </label>
                          <select
                            className="InputProyecto"
                            value={item.materia_id}
                            onChange={(e) => actualizarItemCarrito(index, 'materia_id', e.target.value)}
                            required
                          >
                            <option value="">Seleccione...</option>
                            {materias.map(m => (
                              <option key={m.materia_id} value={m.materia_id}>
                                {m.nombre} ({m.unidad}) - Stock: {m.stock_actual}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ color: '#fff', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                            Cantidad:
                          </label>
                          <input
                            className="InputProyecto"
                            type="number"
                            step="0.001"
                            value={item.cantidad}
                            onChange={(e) => actualizarItemCarrito(index, 'cantidad', e.target.value)}
                            placeholder="0"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ color: '#fff', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
                            Precio Unit. (Bs):
                          </label>
                          <input
                            className="InputProyecto"
                            type="number"
                            step="0.01"
                            value={item.precio_unitario}
                            onChange={(e) => actualizarItemCarrito(index, 'precio_unitario', e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarItemCarrito(index)}
                          style={{ 
                            padding: '10px', 
                            background: '#F44336', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer' 
                          }}
                          title="Eliminar"
                        >
                          <AiFillDelete />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                textAlign: 'right' 
              }}>
                <h3 style={{ color: '#fff', fontSize: '24px', margin: 0 }}>
                  TOTAL: <span style={{ color: '#4CAF50' }}>{calcularTotal().toFixed(2)} Bs</span>
                </h3>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-create">
                  Registrar Compra
                </button>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DE COMPRA */}
      {showDetails && selectedCompra && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content modal-content-large" onClick={e => e.stopPropagation()}>
            <h2>
              Detalle de Compra - {selectedCompra.numero_factura || `#${selectedCompra.compra_id}`}
            </h2>

            <div style={{ 
              display: 'inline-block', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              background: getEstadoColor(selectedCompra.estado) + '30',
              color: getEstadoColor(selectedCompra.estado),
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              {getEstadoIcon(selectedCompra.estado)} {selectedCompra.estado}
            </div>

            <div className="modal-grid">
              <div>
                <p><strong>Proveedor:</strong> {selectedCompra.proveedor_nombre || 'N/A'}</p>
                <p><strong>Número Factura:</strong> {selectedCompra.numero_factura || 'Sin número'}</p>
                <p><strong>Fecha Compra:</strong> {new Date(selectedCompra.fecha_compra).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <p><strong>Total:</strong> {parseFloat(selectedCompra.total_bs || 0).toFixed(2)} Bs</p>
                <p><strong>Estado:</strong> {selectedCompra.estado}</p>
                {selectedCompra.fecha_recepcion && (
                  <p><strong>Fecha Recepción:</strong> {new Date(selectedCompra.fecha_recepcion).toLocaleDateString('es-ES')}</p>
                )}
              </div>
            </div>

            {/* Detalles de materias primas */}
            {selectedCompra.detalles && selectedCompra.detalles.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>Materias Primas Compradas</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px'
                  }}>
                    <thead style={{ background: '#333' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Materia Prima</th>
                        <th style={{ padding: '12px', textAlign: 'center', color: '#fff' }}>Cantidad</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Precio Unit.</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCompra.detalles.map((detalle, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #555' }}>
                          <td style={{ padding: '12px', color: '#fff' }}>
                            {detalle.materia_nombre || 'N/A'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#fff' }}>
                            {detalle.cantidad} {detalle.unidad || ''}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>
                            {parseFloat(detalle.precio_unitario).toFixed(4)} Bs
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#4CAF50', fontWeight: 'bold' }}>
                            {detalle.subtotal ? parseFloat(detalle.subtotal).toFixed(2) : 
                             (parseFloat(detalle.cantidad) * parseFloat(detalle.precio_unitario)).toFixed(2)} Bs
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <tr>
                        <td colSpan="3" style={{ padding: '15px', textAlign: 'right', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
                          TOTAL:
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right', color: '#4CAF50', fontWeight: 'bold', fontSize: '18px' }}>
                          {parseFloat(selectedCompra.total_bs || 0).toFixed(2)} Bs
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              {selectedCompra.estado === 'PENDIENTE' && (
                <>
                  <button 
                    className="btn-create" 
                    onClick={() => handleRecibir(selectedCompra.compra_id)}
                    style={{ background: '#4CAF50' }}
                  >
                    <AiFillCheckCircle /> Recibir Compra
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleCancelar(selectedCompra.compra_id)}
                  >
                    Cancelar Compra
                  </button>
                </>
              )}
              <button className="btn-close" onClick={() => setShowDetails(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compras;