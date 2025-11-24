import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEdit, AiFillPhone, AiFillHome } from "react-icons/ai";
import { FaTruck, FaUserTie, FaCalendarAlt } from "react-icons/fa";
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from "../../API/Admin/Provedores";

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    telefono: "",
    direccion: "",
    contacto: "",
    plazo_pago_dias: 30,
    activo: true
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const data = await getProveedores();
      setProveedores(data);
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
      nombre: "",
      nit: "",
      telefono: "",
      direccion: "",
      contacto: "",
      plazo_pago_dias: 30,
      activo: true
    });
    setShowCreate(true);
  };

  const openEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      nit: proveedor.nit || "",
      telefono: proveedor.telefono || "",
      direccion: proveedor.direccion || "",
      contacto: proveedor.contacto || "",
      plazo_pago_dias: proveedor.plazo_pago_dias || 30,
      activo: proveedor.activo
    });
    setShowEdit(true);
  };

  const openDetails = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowDetails(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProveedor(formData);
      setShowCreate(false);
      fetchProveedores();
      alert("Proveedor creado exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProveedor(selectedProveedor.proveedor_id, formData);
      setShowEdit(false);
      fetchProveedores();
      alert("Proveedor actualizado exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Eliminar proveedor "${nombre}"?\n\nAdvertencia: Esto puede afectar las compras y materias primas asociadas.`)) {
      try {
        await deleteProveedor(id);
        fetchProveedores();
        alert("Proveedor eliminado");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredProveedores = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.nit && p.nit.includes(searchTerm)) ||
    (p.contacto && p.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: proveedores.length,
    activos: proveedores.filter(p => p.activo).length,
    inactivos: proveedores.filter(p => !p.activo).length,
    conCompras: proveedores.filter(p => p.total_compras && p.total_compras > 0).length
  };

  if (loading) return <div className="loading">Cargando proveedores...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Gestión de Proveedores</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>
            + Nuevo Proveedor
          </button>
        </div>
      </header>

      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre, NIT o contacto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px" }}
        />
      </div>

      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Total Proveedores</h4>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Activos</h4>
          <p>{stats.activos}</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Inactivos</h4>
          <p>{stats.inactivos}</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Con Compras</h4>
          <p>{stats.conCompras}</p>
        </div>
      </div>

      <div className="proyectos-grid">
        {filteredProveedores.map(proveedor => (
          <div 
            key={proveedor.proveedor_id} 
            className="proyecto-card"
            onClick={() => openDetails(proveedor)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-header">
              <h3>
                <FaTruck style={{ marginRight: '8px' }} />
                {proveedor.nombre}
              </h3>
              <span className={`status ${proveedor.activo ? 'completed' : 'pending'}`}>
                {proveedor.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="card-body">
              <p>
                <strong><AiFillPhone style={{ marginRight: '5px' }} />Teléfono:</strong> 
                {proveedor.telefono || 'Sin teléfono'}
              </p>
              <p>
                <strong><FaUserTie style={{ marginRight: '5px' }} />Contacto:</strong> 
                {proveedor.contacto || 'Sin contacto'}
              </p>
              <p>
                <strong>NIT:</strong> {proveedor.nit || 'Sin NIT'}
              </p>
              <p>
                <strong><FaCalendarAlt style={{ marginRight: '5px' }} />Plazo Pago:</strong> 
                {proveedor.plazo_pago_dias} días
              </p>
              {proveedor.total_compras !== undefined && (
                <p style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: '10px' }}>
                  {proveedor.total_compras} compras realizadas
                </p>
              )}
            </div>
          </div>
        ))}

        {filteredProveedores.length === 0 && (
          <div className="no-data" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#aaa' }}>
            {searchTerm ? `No se encontraron proveedores para "${searchTerm}"` : "No hay proveedores registrados"}
          </div>
        )}
      </div>

      {/* MODAL CREAR */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content modal-content-large" onClick={e => e.stopPropagation()}>
            <h2>Nuevo Proveedor</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Nombre del Proveedor: *
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    placeholder="Ej: Distribuidora San José"
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    NIT:
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="nit" 
                    value={formData.nit} 
                    onChange={handleChange}
                    placeholder="Ej: 1234567890"
                  />
                </div>
                <div>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Teléfono:
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange}
                    placeholder="Ej: 71234567"
                  />
                </div>
                <div>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Plazo de Pago (días):
                  </label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    name="plazo_pago_dias" 
                    value={formData.plazo_pago_dias} 
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Dirección:
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange}
                    placeholder="Ej: Av. 6 de Agosto #1234"
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Persona de Contacto:
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="contacto" 
                    value={formData.contacto} 
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez - Gerente de Ventas"
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={{ 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      name="activo" 
                      checked={formData.activo} 
                      onChange={handleChange}
                      style={{ width: '20px', height: '20px' }}
                    />
                    Proveedor Activo
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-create">
                  Crear Proveedor
                </button>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)}>
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
          <div className="modal-content modal-content-large" onClick={e => e.stopPropagation()}>
            <h2>Editar Proveedor</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Nombre del Proveedor: *
                  </label>
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
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    NIT:
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="nit" 
                    value={formData.nit} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Teléfono:
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Plazo de Pago (días):
                  </label>
                  <input 
                    className="InputProyecto" 
                    type="number" 
                    name="plazo_pago_dias" 
                    value={formData.plazo_pago_dias} 
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Dirección:
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                    Persona de Contacto:
                  </label>
                  <input 
                    className="InputProyecto" 
                    name="contacto" 
                    value={formData.contacto} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={{ 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      name="activo" 
                      checked={formData.activo} 
                      onChange={handleChange}
                      style={{ width: '20px', height: '20px' }}
                    />
                    Proveedor Activo
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-edit">
                  Actualizar Proveedor
                </button>
                <button type="button" className="btn-close" onClick={() => setShowEdit(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {showDetails && selectedProveedor && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>
              <FaTruck style={{ marginRight: '10px' }} />
              {selectedProveedor.nombre}
            </h2>

            <div style={{ 
              display: 'inline-block', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              background: selectedProveedor.activo ? '#4CAF5030' : '#F4433630',
              color: selectedProveedor.activo ? '#4CAF50' : '#F44336',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              {selectedProveedor.activo ? '✓ Activo' : '✗ Inactivo'}
            </div>

            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px' 
            }}>
              <h3 style={{ color: '#fff', marginBottom: '15px', borderBottom: '2px solid #555', paddingBottom: '10px' }}>
                Información de Contacto
              </h3>
              <div className="modal-grid">
                <div>
                  <p style={{ color: '#fff', marginBottom: '10px' }}>
                    <strong><AiFillPhone style={{ marginRight: '8px', color: '#4CAF50' }} />Teléfono:</strong> 
                    <br />
                    <span style={{ fontSize: '18px', color: '#4CAF50' }}>
                      {selectedProveedor.telefono || 'Sin teléfono'}
                    </span>
                  </p>
                  <p style={{ color: '#fff', marginBottom: '10px' }}>
                    <strong><FaUserTie style={{ marginRight: '8px', color: '#2196F3' }} />Contacto:</strong> 
                    <br />
                    {selectedProveedor.contacto || 'Sin persona de contacto'}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#fff', marginBottom: '10px' }}>
                    <strong>NIT:</strong> {selectedProveedor.nit || 'Sin NIT'}
                  </p>
                  <p style={{ color: '#fff', marginBottom: '10px' }}>
                    <strong><AiFillHome style={{ marginRight: '8px', color: '#FF9800' }} />Dirección:</strong> 
                    <br />
                    {selectedProveedor.direccion || 'Sin dirección'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px' 
            }}>
              <h3 style={{ color: '#fff', marginBottom: '15px', borderBottom: '2px solid #555', paddingBottom: '10px' }}>
                Información Comercial
              </h3>
              <div className="modal-grid">
                <div>
                  <p style={{ color: '#fff', marginBottom: '10px' }}>
                    <strong><FaCalendarAlt style={{ marginRight: '8px', color: '#FF9800' }} />Plazo de Pago:</strong> 
                    <br />
                    <span style={{ fontSize: '24px', color: '#FF9800', fontWeight: 'bold' }}>
                      {selectedProveedor.plazo_pago_dias} días
                    </span>
                  </p>
                </div>
                <div>
                  {selectedProveedor.total_compras !== undefined && (
                    <p style={{ color: '#fff', marginBottom: '10px' }}>
                      <strong>Total Compras Realizadas:</strong> 
                      <br />
                      <span style={{ fontSize: '24px', color: '#4CAF50', fontWeight: 'bold' }}>
                        {selectedProveedor.total_compras}
                      </span>
                    </p>
                  )}
                  {selectedProveedor.monto_total_compras !== undefined && (
                    <p style={{ color: '#fff', marginTop: '10px' }}>
                      <strong>Monto Total:</strong> 
                      <br />
                      <span style={{ fontSize: '20px', color: '#4CAF50' }}>
                        {parseFloat(selectedProveedor.monto_total_compras || 0).toFixed(2)} Bs
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedProveedor.materias_suministradas && selectedProveedor.materias_suministradas.length > 0 && (
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px' 
              }}>
                <h3 style={{ color: '#fff', marginBottom: '15px', borderBottom: '2px solid #555', paddingBottom: '10px' }}>
                  Materias Primas Suministradas
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {selectedProveedor.materias_suministradas.map((materia, idx) => (
                    <span 
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        background: '#2196F330',
                        color: '#2196F3',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}
                    >
                      {materia.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="btn-edit" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(false);
                  openEdit(selectedProveedor);
                }}
              >
                <AiFillEdit /> Editar
              </button>
              <button 
                className="btn-delete" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(selectedProveedor.proveedor_id, selectedProveedor.nombre);
                  setShowDetails(false);
                }}
              >
                <AiFillDelete /> Eliminar
              </button>
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

export default Proveedores;