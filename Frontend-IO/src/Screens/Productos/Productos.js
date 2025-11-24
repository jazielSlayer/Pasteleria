import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEdit, AiFillEye } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle, FaWeight, FaReceipt } from "react-icons/fa";
import { getProductos, createProducto, updateProducto, deleteProducto } from "../../API/Admin/Productos";

const CATEGORIAS = [
  'TORTAS',
  'PASTELES', 
  'PAN DULCE',
  'GALLETAS',
  'BEBIDAS',
  'POSTRES',
  'GENERAL'
];

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TODOS");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    categoria: "GENERAL",
    precio_venta: 0,
    es_por_peso: false
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await getProductos();
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const openCreate = () => {
    setFormData({
      codigo: "",
      nombre: "",
      categoria: "GENERAL",
      precio_venta: 0,
      es_por_peso: false
    });
    setShowCreate(true);
  };

  const openEdit = (producto) => {
    setSelectedProducto(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio_venta: producto.precio_venta,
      es_por_peso: producto.es_por_peso === 1
    });
    setShowEdit(true);
  };

  const openDetail = (producto) => {
    setSelectedProducto(producto);
    setShowDetail(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await createProducto({
        ...formData,
        precio_venta: parseFloat(formData.precio_venta),
        es_por_peso: formData.es_por_peso ? 1 : 0
      });
      setShowCreate(false);
      fetchProductos();
      alert(`✅ ${response.message}\n\nCódigo: ${response.codigo}\nPrecio: Bs. ${response.precio_venta}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProducto(selectedProducto.producto_id, {
        ...formData,
        precio_venta: parseFloat(formData.precio_venta),
        es_por_peso: formData.es_por_peso ? 1 : 0
      });
      setShowEdit(false);
      fetchProductos();
      alert(`✅ ${response.message}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Eliminar o desactivar producto "${nombre}"?\n\n⚠️ Si tiene ventas o producción, solo se desactivará.\n⚠️ Si tiene receta, no se puede eliminar.`)) {
      try {
        const response = await deleteProducto(id);
        fetchProductos();
        alert(`✅ ${response.message}`);
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const filteredProductos = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "TODOS" || p.categoria === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Estadísticas
  const productosPorCategoria = {};
  CATEGORIAS.forEach(cat => {
    productosPorCategoria[cat] = productos.filter(p => p.categoria === cat).length;
  });
  const productosConReceta = productos.filter(p => p.tiene_receta === 1).length;
  const precioPromedio = productos.length > 0 
    ? (productos.reduce((sum, p) => sum + parseFloat(p.precio_venta), 0) / productos.length).toFixed(2)
    : 0;

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Gestión de Productos</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>+ Nuevo Producto</button>
        </div>
      </header>

      <div style={{ marginBottom: "20px", padding: "0 15px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ flex: "1", minWidth: "300px", padding: "12px 16px" }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="InputProyecto"
          style={{ padding: "12px 16px", minWidth: "200px" }}
        >
          <option value="TODOS">📦 Todas las categorías</option>
          {CATEGORIAS.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({productosPorCategoria[cat]})
            </option>
          ))}
        </select>
      </div>

      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Total Productos</h4>
          <p>{productos.length}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Con Receta</h4>
          <p>{productosConReceta}</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Sin Receta</h4>
          <p>{productos.length - productosConReceta}</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Precio Promedio</h4>
          <p>Bs. {precioPromedio}</p>
        </div>
      </div>

      <div style={{ padding: "0 15px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
          <thead style={{ background: "#333" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Código</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Nombre</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Categoría</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Precio Venta</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Costo Unit.</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Margen</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Tipo</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Receta</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.map((producto, index) => {
              const margen = parseFloat(producto.margen_unitario || 0);
              const porcentajeMargen = producto.costo_unitario > 0 
                ? ((margen / producto.costo_unitario) * 100).toFixed(1)
                : 0;
              
              return (
                <tr key={producto.producto_id} style={{ 
                  borderBottom: "1px solid #555",
                  background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent"
                }}>
                  <td style={{ padding: "12px", color: "#fff", fontWeight: "bold" }}>
                    {producto.codigo}
                  </td>
                  <td style={{ padding: "12px", color: "#fff" }}>{producto.nombre}</td>
                  <td style={{ padding: "12px", color: "#fff" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "#607D8B",
                      color: "white",
                      fontSize: "12px"
                    }}>
                      {producto.categoria}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#4CAF50", fontWeight: "bold" }}>
                    Bs. {parseFloat(producto.precio_venta).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", color: "#FF9800" }}>
                    Bs. {parseFloat(producto.costo_unitario || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", color: margen > 0 ? "#4CAF50" : "#F44336" }}>
                    Bs. {margen.toFixed(2)}
                    {producto.costo_unitario > 0 && (
                      <span style={{ fontSize: "11px", marginLeft: "5px", opacity: 0.8 }}>
                        ({porcentajeMargen}%)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {producto.es_por_peso === 1 ? (
                      <FaWeight style={{ color: "#FF9800", fontSize: "18px" }} title="Por peso" />
                    ) : (
                      <span style={{ color: "#999", fontSize: "12px" }}>Unidad</span>
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {producto.tiene_receta === 1 ? (
                      <FaCheckCircle style={{ color: "#4CAF50", fontSize: "18px" }} title="Tiene receta" />
                    ) : (
                      <FaTimesCircle style={{ color: "#F44336", fontSize: "18px" }} title="Sin receta" />
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => openDetail(producto)}
                      style={{ 
                        padding: "6px 12px", 
                        background: "#9C27B0", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer", 
                        marginRight: "8px" 
                      }}
                    >
                      <AiFillEye />
                    </button>
                    <button
                      onClick={() => openEdit(producto)}
                      style={{ 
                        padding: "6px 12px", 
                        background: "#2196F3", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer", 
                        marginRight: "8px" 
                      }}
                    >
                      <AiFillEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(producto.producto_id, producto.nombre)}
                      style={{ 
                        padding: "6px 12px", 
                        background: "#F44336", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer" 
                      }}
                    >
                      <AiFillDelete />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <h2>Nuevo Producto</h2>
            <div onSubmit={handleCreate}>
              <div className="form-row">
                <div>
                  <label>Código: *</label>
                  <input 
                    className="InputProyecto" 
                    name="codigo" 
                    value={formData.codigo} 
                    onChange={handleChange} 
                    placeholder="Ej: TRT-001"
                    required 
                  />
                  <small style={{ color: "#999", fontSize: "12px" }}>
                    Mayúsculas, números, guiones (3-20 chars)
                  </small>
                </div>
                <div>
                  <label>Categoría: *</label>
                  <select 
                    className="InputProyecto" 
                    name="categoria" 
                    value={formData.categoria} 
                    onChange={handleChange}
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>Nombre: *</label>
                  <input 
                    className="InputProyecto" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    placeholder="Ej: Torta de chocolate"
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Precio de Venta (Bs.): *</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.01"
                    name="precio_venta" 
                    value={formData.precio_venta} 
                    onChange={handleChange} 
                    min="0.01"
                    required 
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", paddingTop: "30px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input 
                      type="checkbox"
                      name="es_por_peso"
                      checked={formData.es_por_peso}
                      onChange={handleChange}
                      style={{ marginRight: "8px", width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <FaWeight style={{ marginRight: "8px", color: "#FF9800" }} />
                    <span style={{ color: "#fff" }}>¿Se vende por peso?</span>
                  </label>
                </div>
              </div>

              <div style={{ 
                background: "rgba(33, 150, 243, 0.1)", 
                border: "1px solid #2196F3", 
                borderRadius: "8px", 
                padding: "12px", 
                marginTop: "15px" 
              }}>
                <small style={{ color: "#fff", fontSize: "13px" }}>
                  💡 <strong>Nota:</strong> El costo unitario y margen se calcularán automáticamente 
                  cuando se registre la receta del producto.
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCreate} className="btn-create">Crear</button>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <h2>Editar Producto</h2>
            <div onSubmit={handleUpdate}>
              <div className="form-row">
                <div>
                  <label>Código: *</label>
                  <input 
                    className="InputProyecto" 
                    name="codigo" 
                    value={formData.codigo} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label>Categoría: *</label>
                  <select 
                    className="InputProyecto" 
                    name="categoria" 
                    value={formData.categoria} 
                    onChange={handleChange}
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>Nombre: *</label>
                  <input 
                    className="InputProyecto" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Precio de Venta (Bs.): *</label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    step="0.01"
                    name="precio_venta" 
                    value={formData.precio_venta} 
                    onChange={handleChange} 
                    min="0.01"
                    required 
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", paddingTop: "30px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input 
                      type="checkbox"
                      name="es_por_peso"
                      checked={formData.es_por_peso}
                      onChange={handleChange}
                      style={{ marginRight: "8px", width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <FaWeight style={{ marginRight: "8px", color: "#FF9800" }} />
                    <span style={{ color: "#fff" }}>¿Se vende por peso?</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleUpdate} className="btn-edit">Actualizar</button>
                <button type="button" className="btn-close" onClick={() => setShowEdit(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {showDetail && selectedProducto && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <h2>Detalle del Producto</h2>
            
            <div style={{ 
              background: "rgba(255,255,255,0.05)", 
              borderRadius: "8px", 
              padding: "20px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Código:</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0", fontSize: "18px" }}>
                    {selectedProducto.codigo}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Categoría:</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0" }}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      background: "#607D8B",
                      color: "white"
                    }}>
                      {selectedProducto.categoria}
                    </span>
                  </p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ color: "#999", fontSize: "12px" }}>Nombre:</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0", fontSize: "20px" }}>
                    {selectedProducto.nombre}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Precio de Venta:</label>
                  <p style={{ color: "#4CAF50", fontWeight: "bold", fontSize: "22px", margin: "5px 0" }}>
                    Bs. {parseFloat(selectedProducto.precio_venta).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Tipo de Venta:</label>
                  <p style={{ color: "#fff", fontWeight: "bold", margin: "5px 0" }}>
                    {selectedProducto.es_por_peso === 1 ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaWeight style={{ color: "#FF9800" }} />
                        Por peso
                      </span>
                    ) : (
                      <span>Por unidad</span>
                    )}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Costo Unitario:</label>
                  <p style={{ color: "#FF9800", fontWeight: "bold", fontSize: "18px", margin: "5px 0" }}>
                    Bs. {parseFloat(selectedProducto.costo_unitario || 0).toFixed(4)}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Margen de Ganancia:</label>
                  <p style={{ 
                    color: parseFloat(selectedProducto.margen_unitario) > 0 ? "#4CAF50" : "#F44336", 
                    fontWeight: "bold", 
                    fontSize: "18px", 
                    margin: "5px 0" 
                  }}>
                    Bs. {parseFloat(selectedProducto.margen_unitario || 0).toFixed(2)}
                    {selectedProducto.costo_unitario > 0 && (
                      <span style={{ fontSize: "14px", marginLeft: "8px" }}>
                        ({((parseFloat(selectedProducto.margen_unitario) / parseFloat(selectedProducto.costo_unitario)) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>¿Tiene Receta?</label>
                  <p style={{ margin: "5px 0" }}>
                    {selectedProducto.tiene_receta === 1 ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4CAF50" }}>
                        <FaCheckCircle style={{ fontSize: "20px" }} />
                        <strong>Sí tiene receta registrada</strong>
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#F44336" }}>
                        <FaTimesCircle style={{ fontSize: "20px" }} />
                        <strong>Sin receta</strong>
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: "12px" }}>Estado:</label>
                  <p style={{ margin: "5px 0" }}>
                    {selectedProducto.activo === 1 ? (
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "4px",
                        background: "#4CAF50",
                        color: "white",
                        fontWeight: "bold"
                      }}>
                        ACTIVO
                      </span>
                    ) : (
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "4px",
                        background: "#F44336",
                        color: "white",
                        fontWeight: "bold"
                      }}>
                        INACTIVO
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {selectedProducto.tiene_receta === 0 && (
                <div style={{ 
                  marginTop: "20px", 
                  padding: "12px", 
                  background: "rgba(255, 152, 0, 0.1)",
                  border: "1px solid #FF9800",
                  borderRadius: "6px"
                }}>
                  <small style={{ color: "#FF9800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaReceipt />
                    Este producto no tiene receta registrada. Los costos y márgenes no se calculan automáticamente.
                  </small>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-edit" onClick={() => {
                setShowDetail(false);
                openEdit(selectedProducto);
              }}>
                Editar Producto
              </button>
              <button type="button" className="btn-close" onClick={() => setShowDetail(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;