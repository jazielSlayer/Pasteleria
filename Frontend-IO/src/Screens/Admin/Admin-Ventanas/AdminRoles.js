import React, { useState, useEffect } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { MdManageHistory } from "react-icons/md";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  getPermissionsByRole,
  assignPermissionToRole,
  removePermissionFromRole,
} from "../../../API/Admin/Roles";
import { styles } from "../../Components screens/Styles";


function RolesAdmin() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modales
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(null);
  
  // Datos
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    descripcion: "",
    start_path: "",
    is_default: false,
    guard_name: "web",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        getAllRoles(),
        getAllPermissions(),
      ]);
      setRoles(rolesData || []);
      setPermissions(permissionsData || []);

      const rolePermsMap = {};
      for (const role of rolesData || []) {
        try {
          const rolePerms = await getPermissionsByRole(role.id);
          rolePermsMap[role.id] = rolePerms;
        } catch (err) {
          console.warn(`Error al cargar permisos para el rol ${role.id}:`, err);
          rolePermsMap[role.id] = [];
        }
      }
      setRolePermissions(rolePermsMap);
    } catch (err) {
      setError(err.message || "Error al cargar datos");
      console.error("Fetch all data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name.trim()) {
      errors.name = "El nombre del rol es obligatorio";
    }
    if (!data.start_path.trim()) {
      errors.start_path = "La ruta inicial es obligatoria";
    }
    if (!data.guard_name) {
      errors.guard_name = "El guard name es obligatorio";
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const openCreate = () => {
    setFormData({
      name: "",
      descripcion: "",
      start_path: "",
      is_default: false,
      guard_name: "web",
    });
    setFormErrors({});
    setShowCreate(true);
  };

  const openEdit = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      descripcion: role.descripcion || "",
      start_path: role.start_path,
      is_default: role.is_default,
      guard_name: role.guard_name,
    });
    setFormErrors({});
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setOperationLoading(true);
    setError(null);
    try {
      await createRole(formData);
      setShowCreate(false);
      setFormData({
        name: "",
        descripcion: "",
        start_path: "",
        is_default: false,
        guard_name: "web",
      });
      await fetchAllData();
      alert("Rol creado exitosamente");
    } catch (err) {
      setError(err.message || "Error al crear el rol");
      alert(err.message || "Error al crear el rol");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setOperationLoading(true);
    setError(null);
    try {
      await updateRole(selectedRole.id, formData);
      setShowEdit(false);
      setFormData({
        name: "",
        descripcion: "",
        start_path: "",
        is_default: false,
        guard_name: "web",
      });
      await fetchAllData();
      alert("Rol actualizado exitosamente");
    } catch (err) {
      setError(err.message || "Error al actualizar el rol");
      alert(err.message || "Error al actualizar el rol");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id, roleName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el rol "${roleName}"? Esta acción no se puede deshacer.`)) {
      setOperationLoading(true);
      setError(null);
      try {
        await deleteRole(id);
        await fetchAllData();
        alert("Rol eliminado exitosamente");
      } catch (err) {
        setError(err.message || "Error al eliminar el rol");
        alert(err.message || "Error al eliminar el rol");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handlePermissionToggle = async (roleId, permissionId, isAssigned) => {
    setOperationLoading(true);
    setError(null);
    try {
      if (isAssigned) {
        await removePermissionFromRole(roleId, permissionId);
      } else {
        await assignPermissionToRole(roleId, permissionId);
      }

      const rolePerms = await getPermissionsByRole(roleId);
      setRolePermissions((prev) => ({
        ...prev,
        [roleId]: rolePerms,
      }));
    } catch (err) {
      setError(err.message || "Error al actualizar permisos");
      alert(err.message || "Error al actualizar permisos");
    } finally {
      setOperationLoading(false);
    }
  };

  const isPermissionAssigned = (roleId, permissionId) => {
    const rolePerms = rolePermissions[roleId] || [];
    return rolePerms.some((perm) => perm.id === permissionId);
  };

  const getPermissionsByCategory = () => {
    const categories = {};
    permissions.forEach((permission) => {
      const category = permission.name.split(".")[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(permission);
    });
    return categories;
  };

  // Función para filtrar roles
  const filteredRoles = roles.filter((role) => {
    const searchLower = searchTerm.toLowerCase();
    const name = (role.name || "").toLowerCase();
    const descripcion = (role.descripcion || "").toLowerCase();
    const startPath = (role.start_path || "").toLowerCase();
    
    return name.includes(searchLower) || 
           descripcion.includes(searchLower) || 
           startPath.includes(searchLower);
  });

  const renderPermissionsModal = () => {
    if (!showPermissionsModal) return null;

    const role = roles.find((r) => r.id === showPermissionsModal);
    if (!role) {
      setError("Rol no encontrado");
      setShowPermissionsModal(null);
      return null;
    }

    const permissionCategories = getPermissionsByCategory();

    return (
      <div className="modal-overlay" onClick={() => setShowPermissionsModal(null)}>
        <div className="modal-content modal-content-large" onClick={e => e.stopPropagation()}>
          <h2>Asignar Permisos a: {role.name}</h2>

          {error && <p style={styles.errorMessage}>Error: {error}</p>}

          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#c0c9c9ff", fontSize: "14px" }}>
              Selecciona los permisos para asignarlos al rol. Puedes asignar múltiples permisos.
            </p>
          </div>

          <div style={{ display: "grid", gap: "24px" }}>
            {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
              <div key={category} style={{
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #030e21ff",
                backgroundColor: "#1a1a2e",
              }}>
                <h4 style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  color: "#ffffff",
                  marginBottom: "16px",
                  textTransform: "capitalize",
                }}>
                  {category}
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "70px" }}>
                  {categoryPermissions.map((permission) => (
                    <label
                      key={permission.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: isPermissionAssigned(showPermissionsModal, permission.id) ? "#4a5568" : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isPermissionAssigned(showPermissionsModal, permission.id)}
                        onChange={() => handlePermissionToggle(showPermissionsModal, permission.id, isPermissionAssigned(showPermissionsModal, permission.id))}
                        disabled={operationLoading}
                        style={{
                          width: "20px",
                          height: "20px",
                          marginRight: "12px",
                        }}
                      />
                      <span style={{ color: "#ddddedff", fontSize: "14px" }}>
                        {permission.name.replace(category + ".", "")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button
              onClick={() => setShowPermissionsModal(null)}
              disabled={operationLoading}
              className="btn-close"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h2 style={styles.title}>Administración de Roles y Permisos</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-create" onClick={openCreate}>+ Nuevo Rol</button>
        </div>
      </header>

      {loading && <p style={styles.loadingText}>Cargando datos...</p>}
      {error && <div style={styles.errorMessage}>Error: {error}</div>}

      {!loading && !error && (
        <div>
          <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre de rol, descripción o ruta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="InputProyecto"
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "12px 16px",
                fontSize: "14px",
              }}
            />
          </div>
          <div className="stats-container">
            <div style={{ ...styles.statCard, ...styles.statCardRoles }}>
              <h4 style={{ ...styles.statTitle, ...styles.statTitleRoles }}>Total Roles</h4>
              <p style={styles.statValue}>{roles.length}</p>
            </div>
            <div style={{ ...styles.statCard, ...styles.statCardPermissions }}>
              <h4 style={{ ...styles.statTitle, ...styles.statTitlePermissions }}>
                Total Permisos
              </h4>
              <p style={styles.statValue}>{permissions.length}</p>
            </div>
            <div style={{ ...styles.statCard, ...styles.statCardDefaultRoles }}>
              <h4 style={{ ...styles.statTitle, ...styles.statTitleDefaultRoles }}>
                Roles por Defecto
              </h4>
              <p style={styles.statValue}>{roles.filter((r) => r.is_default).length}</p>
            </div>
          </div>

          <div style={styles.rolesTableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableHeader}>Nombre</th>
                  <th style={styles.tableHeader}>Descripción</th>
                  <th style={styles.tableHeader}>Ruta Inicial</th>
                  <th style={styles.tableHeader}>Guard</th>
                  <th style={styles.tableHeader}>Por Defecto</th>
                  <th style={styles.tableHeader}>Permisos</th>
                  <th style={styles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role, index) => (
                    <tr
                      key={role.id}
                      style={{
                        ...styles.tableRow,
                        ...(index % 2 === 0 ? styles.tableRowAlternate : {}),
                      }}
                    >
                      <td style={styles.tableCellBold}>{role.name}</td>
                      <td style={styles.tableCell}>{role.descripcion || "Sin descripción"}</td>
                      <td style={styles.tableCell}>
                        <code style={styles.code}>{role.start_path}</code>
                      </td>
                      <td style={styles.tableCell}>{role.guard_name}</td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(role.is_default ? styles.statusDefault : styles.statusNotDefault),
                          }}
                        >
                          {role.is_default ? "Sí" : "No"}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          onClick={() => setShowPermissionsModal(role.id)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.manageButtonDisabled : styles.manageButton}
                        >
                          <MdManageHistory /> ({(rolePermissions[role.id] || []).length})
                        </button>
                      </td>
                      <td style={styles.tableCellCenter}>
                        <button
                          onClick={() => openEdit(role)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.editButtonDisabled : styles.editButton}
                        >
                          <AiFillEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id, role.name)}
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
                    <td style={styles.noDataText} colSpan="7">
                      {searchTerm ? "No se encontraron resultados" : "No hay roles registrados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          

          {/* MODAL CREAR */}
          {showCreate && (
            <div className="modal-overlay" onClick={() => setShowCreate(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Agregar Nuevo Rol</h2>
                <form onSubmit={handleCreate}>
                  {error && <div style={styles.errorMessage}>Error: {error}</div>}
                  
                  <div className="form-row">
                    <div>
                      <label style={styles.formLabel}>Nombre del Rol:</label>
                      <input
                        className="InputProyecto"
                        type="text"
                        name="name"
                        placeholder="Ej: Administrador, Docente, Estudiante"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                    </div>
                    {formErrors.name && <p style={styles.formErrorText}>{formErrors.name}</p>}
                    <div>
                      <label style={styles.formLabel}>Ruta Inicial:</label>
                    <input
                      className="InputProyecto"
                      type="text"
                      name="start_path"
                      placeholder="Ej: /admin, /docente, /estudiante"
                      value={formData.start_path}
                      onChange={handleChange}
                      required
                      disabled={operationLoading}
                    />
                    {formErrors.start_path && (
                      <p style={styles.formErrorText}>{formErrors.start_path}</p>
                    )}
                    </div>
                  </div>

                  <div className="form-full">
                    <label style={styles.formLabel}>Guard Name:</label>
                    <select
                      className="InputProyecto"
                      name="guard_name"
                      value={formData.guard_name}
                      onChange={handleChange}
                      disabled={operationLoading}
                    >
                      <option value="web">Web</option>
                      <option value="api">API</option>
                    </select>
                    {formErrors.guard_name && (
                      <p style={styles.formErrorText}>{formErrors.guard_name}</p>
                    )}
                  </div>

                  <div className="form-full">
                    <label style={styles.formCheckboxLabel}>
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleChange}
                        disabled={operationLoading}
                        style={styles.formCheckbox}
                      />
                      Rol por defecto para nuevos usuarios
                    </label>
                  </div>

                  <div className="form-full">
                    <label style={styles.formLabel}>Descripción:</label>
                    <input
                      className="InputProyecto"
                      type="text"
                      name="descripcion"
                      placeholder="Ej: Rol con acceso completo al sistema"
                      value={formData.descripcion}
                      onChange={handleChange}
                      disabled={operationLoading}
                    />
                  </div>
                  

                  <div className="modal-actions">
                    <button
                      type="submit"
                      disabled={operationLoading}
                      className="btn-create"
                    >
                      {operationLoading ? "Procesando..." : "Crear Rol"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      disabled={operationLoading}
                      className="btn-close"
                    >
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
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Editar Rol</h2>
                <form onSubmit={handleUpdate}>
                  {error && <div style={styles.errorMessage}>Error: {error}</div>}
                  
                  <div className="form-row">
                    
                    <div>
                      <label style={styles.formLabel}>Nombre</label>
                      <input
                      className="InputProyecto"
                      type="text"
                      name="name"
                      placeholder="Ej: Administrador, Docente, Estudiante"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={operationLoading}
                    />
                    </div>
                    {formErrors.name && <p style={styles.formErrorText}>{formErrors.name}</p>}
                    <div>
                      <label style={styles.formLabel}>Ruta</label>
                      <input
                        className="InputProyecto"
                        type="text"
                        name="start_path"
                        placeholder="Ej: /admin, /docente, /estudiante"
                        value={formData.start_path}
                        onChange={handleChange}
                        required
                        disabled={operationLoading}
                      />
                    </div>
                    {formErrors.start_path && (
                      <p style={styles.formErrorText}>{formErrors.start_path}</p>
                    )}
                  </div>

    
                  <div className="form-row">
                    <div>
                      <label style={styles.formLabel}>Guard Name:</label>
                    <select
                      className="InputProyecto"
                      name="guard_name"
                      value={formData.guard_name}
                      onChange={handleChange}
                      disabled={operationLoading}
                    >
                      <option value="web">Web</option>
                      <option value="api">API</option>
                    </select>
                    {formErrors.guard_name && (
                      <p style={styles.formErrorText}>{formErrors.guard_name}</p>
                    )}
                    </div>
                    <div >
                      <label style={styles.formCheckboxLabel}>
                        Rol por defecto para nuevos usuarios
                      </label>
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleChange}
                        disabled={operationLoading}
                        style={styles.formCheckbox}
                      />
                    </div>
                  </div>

                  <div className="form-full">
                    <label style={styles.formLabel}>Descripción:</label>
                    <input
                      className="InputProyecto"
                      type="text"
                      name="descripcion"
                      placeholder="Ej: Rol con acceso completo al sistema"
                      value={formData.descripcion}
                      onChange={handleChange}
                      disabled={operationLoading}
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="submit"
                      disabled={operationLoading}
                      className="btn-edit"
                    >
                      {operationLoading ? "Procesando..." : "Actualizar Rol"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEdit(false)}
                      disabled={operationLoading}
                      className="btn-close"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {renderPermissionsModal()}
        </div>
      )}

      
    </div>
  );
}

export default RolesAdmin;