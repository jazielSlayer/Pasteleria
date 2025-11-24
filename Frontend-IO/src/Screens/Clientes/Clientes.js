import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { getClientes, createCliente, updateCliente, deleteCliente } from "../../API/Admin/Clientes";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    nit_ci: "",
    telefono: "",
    tipo: "MOSTRADOR",
    descuento_porcentaje: 0
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
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
      nombre: "",
      nit_ci: "",
      telefono: "",
      tipo: "MOSTRADOR",
      descuento_porcentaje: 0
    });
    setShowCreate(true);
  };

  const openEdit = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      nit_ci: cliente.nit_ci || "",
      telefono: cliente.telefono || "",
      tipo: cliente.tipo,
      descuento_porcentaje: cliente.descuento_porcentaje
    });
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCliente(formData);
      setShowCreate(false);
      fetchClientes();
      alert("Cliente creado exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCliente(selectedCliente.cliente_id, formData);
      setShowEdit(false);
      fetchClientes();
      alert("Cliente actualizado exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Eliminar cliente "${nombre}"?`)) {
      try {
        await deleteCliente(id);
        fetchClientes();
        alert("Cliente eliminado");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.nit_ci && c.nit_ci.includes(searchTerm))
  );

  if (loading) return <div className="loading">Cargando clientes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15 }}>Gestión de Clientes</h1>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>+ Nuevo Cliente</button>
        </div>
      </header>

      <div style={{ marginBottom: "20px", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o NIT/CI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px" }}
        />
      </div>

      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Total Clientes</h4>
          <p>{clientes.length}</p>
        </div>
        <div className="stat-card stat-completed">
          <h4>Mostrador</h4>
          <p>{clientes.filter(c => c.tipo === 'MOSTRADOR').length}</p>
        </div>
        <div className="stat-card stat-pending">
          <h4>Mayoristas</h4>
          <p>{clientes.filter(c => c.tipo === 'MAYORISTA').length}</p>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Eventos</h4>
          <p>{clientes.filter(c => c.tipo === 'EVENTO').length}</p>
        </div>
      </div>

      <div style={{ padding: "0 15px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
          <thead style={{ background: "#333" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Nombre</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>NIT/CI</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Teléfono</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Tipo</th>
              <th style={{ padding: "15px", textAlign: "left", color: "#fff" }}>Descuento (%)</th>
              <th style={{ padding: "15px", textAlign: "center", color: "#fff" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map((cliente, index) => (
              <tr key={cliente.cliente_id} style={{ 
                borderBottom: "1px solid #555",
                background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent"
              }}>
                <td style={{ padding: "12px", color: "#fff", fontWeight: "bold" }}>{cliente.nombre}</td>
                <td style={{ padding: "12px", color: "#fff" }}>{cliente.nit_ci || "-"}</td>
                <td style={{ padding: "12px", color: "#fff" }}>{cliente.telefono || "-"}</td>
                <td style={{ padding: "12px", color: "#fff" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: cliente.tipo === 'MAYORISTA' ? '#4CAF50' : cliente.tipo === 'EVENTO' ? '#FF9800' : '#2196F3',
                    color: "white",
                    fontSize: "12px"
                  }}>
                    {cliente.tipo}
                  </span>
                </td>
                <td style={{ padding: "12px", color: "#fff" }}>{cliente.descuento_porcentaje}%</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => openEdit(cliente)}
                    style={{ padding: "6px 12px", background: "#2196F3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "8px" }}
                  >
                    <AiFillEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.cliente_id, cliente.nombre)}
                    style={{ padding: "6px 12px", background: "#F44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    <AiFillDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Nuevo Cliente</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>Nombre:</label>
                  <input className="InputProyecto" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>NIT/CI:</label>
                  <input className="InputProyecto" name="nit_ci" value={formData.nit_ci} onChange={handleChange} />
                </div>
                <div>
                  <label>Teléfono:</label>
                  <input className="InputProyecto" name="telefono" value={formData.telefono} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Tipo:</label>
                  <select className="InputProyecto" name="tipo" value={formData.tipo} onChange={handleChange}>
                    <option value="MOSTRADOR">Mostrador</option>
                    <option value="MAYORISTA">Mayorista</option>
                    <option value="EVENTO">Evento</option>
                  </select>
                </div>
                <div>
                  <label>Descuento (%):</label>
                  <input className="InputProyecto" type="number" step="0.01" name="descuento_porcentaje" value={formData.descuento_porcentaje} onChange={handleChange} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-create">Crear</button>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Cliente</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div style={{ width: "100%" }}>
                  <label>Nombre:</label>
                  <input className="InputProyecto" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>NIT/CI:</label>
                  <input className="InputProyecto" name="nit_ci" value={formData.nit_ci} onChange={handleChange} />
                </div>
                <div>
                  <label>Teléfono:</label>
                  <input className="InputProyecto" name="telefono" value={formData.telefono} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Tipo:</label>
                  <select className="InputProyecto" name="tipo" value={formData.tipo} onChange={handleChange}>
                    <option value="MOSTRADOR">Mostrador</option>
                    <option value="MAYORISTA">Mayorista</option>
                    <option value="EVENTO">Evento</option>
                  </select>
                </div>
                <div>
                  <label>Descuento (%):</label>
                  <input className="InputProyecto" type="number" step="0.01" name="descuento_porcentaje" value={formData.descuento_porcentaje} onChange={handleChange} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-edit">Actualizar</button>
                <button type="button" className="btn-close" onClick={() => setShowEdit(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;