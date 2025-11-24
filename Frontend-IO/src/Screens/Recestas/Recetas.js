import React, { useState, useEffect } from "react";
import {
  AiFillDelete,
  AiFillEdit,
  AiFillEye,
  AiFillPlusCircle,
} from "react-icons/ai";
import { FaBoxOpen, FaTrash } from "react-icons/fa";
import {
  getRecetas,
  getReceta,
  createReceta,
  updateReceta,
  deleteReceta,
} from "../../API/Admin/Recestas";
import { getMateriasPrimas } from "../../API/Admin/MateriasPrimas";
import { getProductos } from "../../API/Admin/Productos";


function Recetas() {
  const [recetas, setRecetas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const [formData, setFormData] = useState({
    producto_id: "",
    porciones_salida: 1,
    costo_mano_obra: 0,
    costo_energia: 0,
    ingredientes: [{ materia_id: "", cantidad: 0 }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recetasData, productosData, materiasData] = await Promise.all([
        getRecetas(),
        getProductos(),
        getMateriasPrimas(),
      ]);
      setRecetas(recetasData);
      setProductos(productosData);
      setMateriasPrimas(materiasData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredienteChange = (index, field, value) => {
    const newIngredientes = [...formData.ingredientes];
    newIngredientes[index][field] = value;
    setFormData((prev) => ({ ...prev, ingredientes: newIngredientes }));
  };

  const addIngrediente = () => {
    setFormData((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { materia_id: "", cantidad: 0 }],
    }));
  };

  const removeIngrediente = (index) => {
    if (formData.ingredientes.length > 1) {
      const newIngredientes = formData.ingredientes.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, ingredientes: newIngredientes }));
    }
  };

  const openCreate = () => {
    setFormData({
      producto_id: "",
      porciones_salida: 1,
      costo_mano_obra: 0,
      costo_energia: 0,
      ingredientes: [{ materia_id: "", cantidad: 0 }],
    });
    setShowCreate(true);
  };

  const openEdit = async (receta) => {
    try {
      const detalle = await getReceta(receta.receta_id);
      setSelectedReceta(receta);
      setFormData({
        producto_id: receta.producto_id,
        porciones_salida: detalle.porciones_salida,
        costo_mano_obra: detalle.costo_mano_obra,
        costo_energia: detalle.costo_energia,
        ingredientes: detalle.ingredientes.map((ing) => ({
          materia_id: ing.materia_id,
          cantidad: ing.cantidad,
        })),
      });
      setShowEdit(true);
    } catch (err) {
      alert(`Error al cargar receta: ${err.message}`);
    }
  };

  const openDetail = async (receta) => {
    try {
      const detalle = await getReceta(receta.receta_id);
      setDetailData(detalle);
      setShowDetail(true);
    } catch (err) {
      alert(`Error al cargar detalle: ${err.message}`);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.producto_id) return alert("Selecciona un producto");

    const validos = formData.ingredientes.filter(
      (i) => i.materia_id && parseFloat(i.cantidad) > 0
    );
    if (validos.length === 0) return alert("Agrega al menos un ingrediente válido");

    try {
      await createReceta({
        producto_id: parseInt(formData.producto_id),
        porciones_salida: parseFloat(formData.porciones_salida),
        costo_mano_obra: parseFloat(formData.costo_mano_obra),
        costo_energia: parseFloat(formData.costo_energia),
        ingredientes: validos.map((i) => ({
          materia_id: parseInt(i.materia_id),
          cantidad: parseFloat(i.cantidad),
        })),
      });
      setShowCreate(false);
      fetchData();
      alert("Receta creada correctamente");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validos = formData.ingredientes.filter(
      (i) => i.materia_id && parseFloat(i.cantidad) > 0
    );
    if (validos.length === 0) return alert("Agrega al menos un ingrediente válido");

    try {
      await updateReceta(selectedReceta.receta_id, {
        porciones_salida: parseFloat(formData.porciones_salida),
        costo_mano_obra: parseFloat(formData.costo_mano_obra),
        costo_energia: parseFloat(formData.costo_energia),
        ingredientes: validos.map((i) => ({
          materia_id: parseInt(i.materia_id),
          cantidad: parseFloat(i.cantidad),
        })),
      });
      setShowEdit(false);
      fetchData();
      alert("Receta actualizada correctamente");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (
      window.confirm(
        `¿Eliminar receta de "${nombre}"?\n\nNo se puede eliminar si ya se usó en producción.`
      )
    ) {
      try {
        await deleteReceta(id);
        fetchData();
        alert("Receta eliminada");
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const filteredRecetas = recetas.filter(
    (r) =>
      r.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.categoria && r.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const productosSinReceta = productos.filter((p) => p.tiene_receta === 0);

  const costoPromedio = recetas.length
    ? (
        recetas.reduce(
          (sum, r) => sum + parseFloat(r.costo_total_unitario || 0),
          0
        ) / recetas.length
      ).toFixed(2)
    : 0;

  const margenPromedio = recetas.length
    ? (
        recetas.reduce((sum, r) => sum + parseFloat(r.margen_unitario || 0), 0) /
        recetas.length
      ).toFixed(2)
    : 0;

  if (loading) return <div className="loading">Cargando recetas...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      {/* Header */}
      <header className="proyectos-header">
        <h1>Gestión de Recetas</h1>
        <button className="btn-create" onClick={openCreate}>
          + Nueva Receta
        </button>
      </header>

      {/* Búsqueda */}
      <div style={{ padding: "0 15px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Buscar por producto, código o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="InputProyecto"
          style={{ width: "100%", maxWidth: "500px", padding: "12px 16px" }}
        />
      </div>

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="statCard statCardTotal">
          <h4 className="statTitle statTitleTotal">Total Recetas</h4>
          <p className="statValue">{recetas.length}</p>
        </div>
        <div className="statCard statCardTipos">
          <h4 className="statTitle statTitleTipos">Sin Receta</h4>
          <p className="statValue">{productosSinReceta.length}</p>
        </div>
        <div className="statCard statCardPermanente">
          <h4 className="statTitle" style={{ color: "#FF9800" }}>
            Costo Prom. Producción
          </h4>
          <p className="statValue">Bs. {costoPromedio}</p>
        </div>
        <div className="statCard" style={{ backgroundColor: "rgba(156,39,176,0.2)" }}>
          <h4 className="statTitle" style={{ color: "#9C27B0" }}>
            Margen Promedio
          </h4>
          <p className="statValue">Bs. {margenPromedio}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="tableContainer">
        <table className="table">
          <thead className="tableHead">
            <tr>
              <th className="tableHeader">Código</th>
              <th className="tableHeader">Producto</th>
              <th className="tableHeader">Categoría</th>
              <th className="tableHeader">Porciones</th>
              <th className="tableHeader">Costo Unit.</th>
              <th className="tableHeader">Margen Unit.</th>
              <th className="tableHeader">%</th>
              <th className="tableHeader tableHeaderCenter">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecetas.map((r, i) => {
              const costo = parseFloat(r.costo_total_unitario || 0);
              const margen = parseFloat(r.margen_unitario || 0);
              const porc = costo > 0 ? ((margen / costo) * 100).toFixed(1) : 0;

              return (
                <tr
                  key={r.receta_id}
                  className={i % 2 === 0 ? "tableRowAlternate" : "tableRow"}
                >
                  <td className="tableCell tableCellBold">{r.codigo}</td>
                  <td className="tableCell">{r.producto_nombre}</td>
                  <td className="tableCell">
                    {r.categoria ? (
                      <span className="statusBadge" style={{ background: "#607D8B" }}>
                        {r.categoria}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="tableCell" style={{ color: "#2196F3", fontWeight: "bold" }}>
                    {r.porciones_salida}
                  </td>
                  <td className="tableCell" style={{ color: "#FF9800", fontWeight: "bold" }}>
                    Bs. {costo.toFixed(2)}
                  </td>
                  <td
                    className="tableCell"
                    style={{
                      color: margen > 0 ? "#4CAF50" : "#F44336",
                      fontWeight: "bold",
                    }}
                  >
                    Bs. {margen.toFixed(2)}
                  </td>
                  <td
                    className="tableCell"
                    style={{
                      color: margen > 0 ? "#4CAF50" : "#F44336",
                    }}
                  >
                    {porc}%
                  </td>
                  <td className="tableCell tableCellCenter">
                    <div className="actionContainer">
                      <button
                        onClick={() => openDetail(r)}
                        style={{ background: "#9C27B0" }}
                        className="editButton"
                      >
                        <AiFillEye />
                      </button>
                      <button onClick={() => openEdit(r)} className="editButton">
                        <AiFillEdit />
                      </button>
                      <button onClick={() => handleDelete(r.receta_id, r.producto_nombre)} className="deleteButton">
                        <AiFillDelete />
                      </button>
                    </div>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="formTitle">Nueva Receta</h2>
            <form onSubmit={handleCreate} className="formContainer">
              <div className="formGrid">
                <div>
                  <label className="formLabel">Producto *</label>
                  <select
                    className="formInput"
                    name="producto_id"
                    value={formData.producto_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un producto</option>
                    {productosSinReceta.map((p) => (
                      <option key={p.producto_id} value={p.producto_id}>
                        {p.codigo} - {p.nombre} ({p.categoria})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="formGrid">
                <div>
                  <label className="formLabel">Porciones de Salida *</label>
                  <input
                    className="formInput"
                    type="number"
                    name="porciones_salida"
                    value={formData.porciones_salida}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="formLabel">Costo Mano de Obra (Bs.)</label>
                  <input
                    className="formInput"
                    type="number"
                    step="0.01"
                    name="costo_mano_obra"
                    value={formData.costo_mano_obra}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div>
                  <label className="formLabel">Costo Energía (Bs.)</label>
                  <input
                    className="formInput"
                    type="number"
                    step="0.01"
                    name="costo_energia"
                    value={formData.costo_energia}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ margin: "20px 0 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: "#fff" }}>Ingredientes</h3>
                <button type="button" onClick={addIngrediente} style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                  <AiFillPlusCircle /> Agregar
                </button>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto", background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "8px" }}>
                {formData.ingredientes.map((ing, i) => (
                  <div key={i} className="formGrid" style={{ alignItems: "end", marginBottom: "12px" }}>
                    <div>
                      <label className="formLabel">Materia Prima</label>
                      <select
                        className="formInput"
                        value={ing.materia_id}
                        onChange={(e) => handleIngredienteChange(i, "materia_id", e.target.value)}
                      >
                        <option value="">Seleccione...</option>
                        {materiasPrimas.map((mp) => (
                          <option key={mp.materia_id} value={mp.materia_id}>
                            {mp.codigo} - {mp.nombre} ({mp.unidad}) - Stock: {mp.stock_actual}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="formLabel">Cantidad</label>
                      <input
                        className="formInput"
                        type="number"
                        step="0.001"
                        value={ing.cantidad}
                        onChange={(e) => handleIngredienteChange(i, "cantidad", e.target.value)}
                        min="0"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeIngrediente(i)}
                        disabled={formData.ingredientes.length === 1}
                        style={{
                          background: formData.ingredientes.length === 1 ? "#555" : "#F44336",
                          padding: "10px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: formData.ingredientes.length === 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="formButtonContainer" style={{ marginTop: "20px" }}>
                <button type="submit" className="submitButton submitButtonCreate">
                  Crear Receta
                </button>
                <button type="button" className="cancelButton" onClick={() => setShowCreate(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR (igual que crear pero con datos precargados) */}
      {showEdit && selectedReceta && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="formTitle">Editar Receta - {selectedReceta.producto_nombre}</h2>
            <form onSubmit={handleUpdate} className="formContainer">
              {/* ... mismo contenido que crear, solo cambia el botón ... */}
              {/* (por brevedad, repito solo la parte distinta) */}
              <div className="formGrid">
                <div>
                  <label className="formLabel">Porciones de Salida *</label>
                  <input className="formInput" type="number" name="porciones_salida" value={formData.porciones_salida} onChange={handleChange} min="1" required />
                </div>
                <div>
                  <label className="formLabel">Costo Mano de Obra</label>
                  <input className="formInput" type="number" step="0.01" name="costo_mano_obra" value={formData.costo_mano_obra} onChange={handleChange} min="0" />
                </div>
                <div>
                  <label className="formLabel">Costo Energía</label>
                  <input className="formInput" type="number" step="0.01" name="costo_energia" value={formData.costo_energia} onChange={handleChange} min="0" />
                </div>
              </div>

              {/* Ingredientes (igual que en crear) */}
              <div style={{ margin: "20px 0 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: "#fff" }}>Ingredientes</h3>
                <button type="button" onClick={addIngrediente} style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                  <AiFillPlusCircle /> Agregar
                </button>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto", background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "8px" }}>
                {formData.ingredientes.map((ing, i) => (
                  <div key={i} className="formGrid" style={{ alignItems: "end", marginBottom: "12px" }}>
                    <div>
                      <label className="formLabel">Materia Prima</label>
                      <select className="formInput" value={ing.materia_id} onChange={(e) => handleIngredienteChange(i, "materia_id", e.target.value)}>
                        <option value="">Seleccione...</option>
                        {materiasPrimas.map((mp) => (
                          <option key={mp.materia_id} value={mp.materia_id}>
                            {mp.codigo} - {mp.nombre} ({mp.unidad})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="formLabel">Cantidad</label>
                      <input className="formInput" type="number" step="0.001" value={ing.cantidad} onChange={(e) => handleIngredienteChange(i, "cantidad", e.target.value)} min="0" />
                    </div>
                    <div>
                      <button type="button" onClick={() => removeIngrediente(i)} disabled={formData.ingredientes.length === 1}
                        style={{ background: formData.ingredientes.length === 1 ? "#555" : "#F44336", padding: "10px", border: "none", borderRadius: "4px", cursor: formData.ingredientes.length === 1 ? "not-allowed" : "pointer" }}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,152,0,0.1)", border: "1px solid #FF9800", padding: "12px", borderRadius: "8px", marginTop: "15px" }}>
                <small style={{ color: "#FF9800" }}>Al guardar se reemplazarán todos los ingredientes anteriores</small>
              </div>

              <div className="formButtonContainer" style={{ marginTop: "20px" }}>
                <button type="submit" className="submitButton submitButtonUpdate">
                  Actualizar
                </button>
                <button type="button" className="cancelButton" onClick={() => setShowEdit(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {showDetail && detailData && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "900px" }}>
            <h2 className="formTitle">Detalle de Receta - {detailData.producto.nombre}</h2>

            <div className="formContainer">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label className="formLabel">Producto</label>
                  <p style={{ color: "#fff", fontWeight: "bold", fontSize: "18px" }}>
                    {detailData.producto.codigo} - {detailData.producto.nombre}
                  </p>
                </div>
                <div>
                  <label className="formLabel">Porciones</label>
                  <p style={{ color: "#2196F3", fontWeight: "bold", fontSize: "18px" }}>{detailData.porciones_salida}</p>
                </div>
                <div>
                  <label className="formLabel">Precio Venta</label>
                  <p style={{ color: "#4CAF50", fontWeight: "bold", fontSize: "18px" }}>
                    Bs. {detailData.producto.precio_venta.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="formLabel">Costo por Porción</label>
                  <p style={{ color: "#FF9800", fontWeight: "bold", fontSize: "18px" }}>
                    Bs. {detailData.costo_por_porcion.toFixed(2)}
                  </p>
                </div>
              </div>

              <h3 style={{ margin: "25px 0 15px", color: "#fff" }}>
                <FaBoxOpen style={{ marginRight: "8px" }} /> Ingredientes
              </h3>

              <div className="tableContainer">
                <table className="table">
                  <thead className="tableHead">
                    <tr>
                      <th className="tableHeader">Código</th>
                      <th className="tableHeader">Materia Prima</th>
                      <th className="tableHeader">Cantidad</th>
                      <th className="tableHeader">Unidad</th>
                      <th className="tableHeader" style={{ textAlign: "right" }}>Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.ingredientes.map((ing) => (
                      <tr key={ing.id}>
                        <td className="tableCell tableCellBold">{ing.codigo}</td>
                        <td className="tableCell">{ing.materia_nombre}</td>
                        <td className="tableCell" style={{ color: "#2196F3", fontWeight: "bold" }}>
                          {parseFloat(ing.cantidad).toFixed(3)}
                        </td>
                        <td className="tableCell">{ing.unidad}</td>
                        <td className="tableCell" style={{ textAlign: "right", color: "#4CAF50", fontWeight: "bold" }}>
                          Bs. {parseFloat(ing.costo_ingrediente).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "rgba(255,255,255,0.1)" }}>
                      <td colSpan="4" className="tableCell" style={{ textAlign: "right", fontWeight: "bold" }}>
                        TOTAL MATERIAS PRIMAS:
                      </td>
                      <td className="tableCell" style={{ textAlign: "right", color: "#4CAF50", fontWeight: "bold", fontSize: "16px" }}>
                        Bs. {detailData.costo_materias_prima.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="formButtonContainer" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="submitButton submitButtonUpdate"
                  onClick={() => {
                    setShowDetail(false);
                    openEdit({
                      receta_id: detailData.receta_id,
                      producto_id: detailData.producto_id,
                      producto_nombre: detailData.producto.nombre,
                    });
                  }}
                >
                  Editar Receta
                </button>
                <button type="button" className="cancelButton" onClick={() => setShowDetail(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recetas;