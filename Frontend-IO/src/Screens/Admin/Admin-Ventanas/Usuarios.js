import React, { useEffect, useState } from "react";
import { getUser, saveUser, updateUser, deleteUser } from "../../../API/Admin/Users_Admin";
import { getUsersWithRoles, getAllRoles, assignRoleToUser } from "../../../API/Admin/Roles.js";
import { TallerStyles } from "../../Components screens/Styles.js";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { MdManageAccounts } from "react-icons/md";
import { buildPDFAdmin } from "../../../API/Admin/PDFs.js";
import { styles } from "../../Components screens/Styles";

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showUserRolesModal, setShowUserRolesModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    nombres: "",
    apellidopat: "",
    apellidomat: "",
    carnet: "",
    id_roles: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsersWithRoles(),
        getAllRoles(),
      ]);
      console.log("Users Data:", usersData);
      console.log("Roles Data:", rolesData);

      const usersArray = Array.isArray(usersData) ? usersData : (usersData?.data || []);
      const rolesArray = Array.isArray(rolesData) ? rolesData : (rolesData?.data || []);

      setUsers(usersArray);
      setRoles(rolesArray);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setFormData({
      user_name: "",
      email: "",
      nombres: "",
      apellidopat: "",
      apellidomat: "",
      carnet: "",
      id_roles: "",
    });
    setShowCreate(true);
  };

  const openEdit = async (id) => {
    try {
      const userData = await getUser(id);
      setFormData({
        user_name: userData.user_name || "",
        email: userData.email || "",
        nombres: userData.nombres || "",
        apellidopat: userData.apellidopat || "",
        apellidomat: userData.apellidomat || "",
        carnet: userData.carnet || "",
        id_roles: userData.id_roles || "",
      });
      setEditingUser(userData);
      setShowEdit(true);
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al cargar el usuario");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      const dataToSend = {
        user_name: formData.user_name,
        email: formData.email,
        nombres: formData.nombres,
        apellidopat: formData.apellidopat || null,
        apellidomat: formData.apellidomat || null,
        carnet: formData.carnet || null,
        id_roles: parseInt(formData.id_roles) || null,
      };

      await saveUser(dataToSend);
      setShowCreate(false);
      setFormData({
        user_name: "",
        email: "",
        nombres: "",
        apellidopat: "",
        apellidomat: "",
        carnet: "",
        id_roles: "",
      });
      await fetchData();
      alert("Usuario creado exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al crear el usuario");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError(null);
    try {
      const dataToSend = {
        user_name: formData.user_name,
        email: formData.email,
        nombres: formData.nombres,
        apellidopat: formData.apellidopat || null,
        apellidomat: formData.apellidomat || null,
        carnet: formData.carnet || null,
        id_roles: parseInt(formData.id_roles) || null,
      };

      await updateUser(editingUser.id, dataToSend);
      setShowEdit(false);
      setEditingUser(null);
      setFormData({
        user_name: "",
        email: "",
        nombres: "",
        apellidopat: "",
        apellidomat: "",
        carnet: "",
        id_roles: "",
      });
      await fetchData();
      alert("Usuario actualizado exitosamente");
    } catch (err) {
      setError(err.message);
      alert(err.message || "Error al actualizar el usuario");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id, userName) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      setOperationLoading(true);
      setError(null);
      try {
        await deleteUser(id);
        await fetchData();
        alert("Usuario eliminado exitosamente");
      } catch (err) {
        setError(err.message);
        alert(err.message || "Error al eliminar el usuario");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleUserRoleToggle = async (userId, roleId) => {
    setOperationLoading(true);
    setError(null);
    try {
      await assignRoleToUser(userId, roleId);
      await fetchData();
      setShowUserRolesModal(null);
      alert("Rol asignado exitosamente");
    } catch (err) {
      setError(err.message || "Error al asignar rol");
      alert(err.message || "Error al asignar rol");
    } finally {
      setOperationLoading(false);
    }
  };

  const isRoleAssignedToUser = (userId, roleId) => {
    const user = users.find((u) => u.id === userId);
    return user?.id_roles === roleId;
  };

  // Función para filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.nombres} ${user.apellidopat} ${user.apellidomat}`.toLowerCase();
    const carnet = (user.carnet || "").toLowerCase();
    const userName = (user.user_name || "").toLowerCase();
    
    return fullName.includes(searchLower) || 
           carnet.includes(searchLower) || 
           userName.includes(searchLower);
  });

  const uniqueRoles = [...new Set(users.map((u) => u.id_roles).filter(Boolean))];

  const renderUserRolesModal = () => {
    if (!showUserRolesModal) return null;

    const user = users.find((u) => u.id === showUserRolesModal);
    if (!user) {
      setError("Usuario no encontrado");
      setShowUserRolesModal(null);
      return null;
    }

    return (
      <div className="modal-overlay" onClick={() => setShowUserRolesModal(null)}>
        <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
          <h2>Asignar Rol a: {user.user_name}</h2>

          {error && <p style={TallerStyles.errorMessage}>Error: {error}</p>}

          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#c0c9c9ff", fontSize: "14px" }}>
              Usuario: <strong>{user.nombres} {user.apellidopat} {user.apellidomat}</strong>
            </p>
            <p style={{ color: "#c0c9c9ff", fontSize: "14px", marginTop: "8px" }}>
              Selecciona un rol para asignarlo al usuario. Solo se puede asignar un rol por usuario.
            </p>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {roles.map((role) => (
              <label
                key={role.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #030e21ff",
                  cursor: "pointer",
                  backgroundColor: isRoleAssignedToUser(showUserRolesModal, role.id) ? "#4a5568" : "#1a1a2e",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="checkbox"
                    checked={isRoleAssignedToUser(showUserRolesModal, role.id)}
                    onChange={() => handleUserRoleToggle(showUserRolesModal, role.id)}
                    disabled={operationLoading}
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                  <div>
                    <span style={{ color: "#ffffff", fontWeight: "600", fontSize: "16px" }}>
                      {role.name}
                    </span>
                    <p style={{ color: "#a0aec0", fontSize: "13px", marginTop: "4px" }}>
                      {role.descripcion || "Sin descripción"}
                    </p>
                    <p style={{ color: "#a0aec0", fontSize: "12px", marginTop: "2px" }}>
                      Ruta: <code style={{ backgroundColor: "#2d3748", padding: "2px 6px", borderRadius: "4px" }}>
                        {role.start_path}
                      </code>
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: role.is_default ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)",
                    color: role.is_default ? "#34d399" : "#a0aec0",
                  }}
                >
                  {role.is_default ? "Por defecto" : "Opcional"}
                </span>
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button
              onClick={() => setShowUserRolesModal(null)}
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
        <h2 style={TallerStyles.title}>Gestión de Usuarios</h2>
        <div className="header-actions" style={{ padding: 15 }}>
          <button className="btn-search" onClick={buildPDFAdmin} style={{ marginRight: "10px" }}>
            Generar PDF
          </button>
          <button className="btn-create" onClick={openCreate}>
            + Nuevo Usuario
          </button>
        </div>
      </header>

      {loading && <p className="loading">Cargando usuarios...</p>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
        {/* BUSCADOR */}
          <div style={{ marginBottom: "20px", padding: "0 15px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre, carnet o usuario..."
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
          {/* ESTADÍSTICAS */}
          <div className="stats-container">
            <div className="stat-card stat-total">
              <h4>Total Usuarios</h4>
              <p>{users.length}</p>
            </div>
            <div className="stat-card stat-completed">
              <h4>Roles Únicos</h4>
              <p>{uniqueRoles.length}</p>
            </div>
            <div className="stat-card stat-pending">
              <h4>Con Email</h4>
              <p>{users.filter((u) => u.email).length}</p>
            </div>
            <div className="stat-card stat-overdue">
              <h4>Con Carnet</h4>
              <p>{users.filter((u) => u.carnet).length}</p>
            </div>
          </div>

          {/* TABLA */}
          <div style={TallerStyles.rolesTableContainer}>
            <table style={TallerStyles.table}>
              <thead style={TallerStyles.tableHead}>
                <tr>
                  <th style={TallerStyles.tableHeader}>Usuario</th>
                  <th style={TallerStyles.tableHeader}>Nombre Completo</th>
                  <th style={TallerStyles.tableHeader}>Email</th>
                  <th style={TallerStyles.tableHeader}>Carnet</th>
                  <th style={TallerStyles.tableHeader}>Rol</th>
                  <th style={TallerStyles.tableHeaderCenter}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      style={{
                        ...TallerStyles.tableRow,
                        ...(index % 2 === 0 ? TallerStyles.tableRowAlternate : {}),
                      }}
                    >
                      <td style={TallerStyles.tableCellBold}>{user.user_name}</td>
                      <td style={TallerStyles.tableCell}>
                        {user.nombres} {user.apellidopat} {user.apellidomat}
                      </td>
                      <td style={TallerStyles.tableCell}>{user.email}</td>
                      <td style={TallerStyles.tableCell}>{user.carnet || "-"}</td>
                      <td style={TallerStyles.tableCell}>
                        <span
                          style={{
                            ...TallerStyles.statusBadge,
                            ...TallerStyles.statusDefault,
                          }}
                        >
                          {user.role_name || "Sin rol"}
                        </span>
                      </td>
                      <td style={TallerStyles.tableCellCenter}>
                        <button
                          onClick={() => openEdit(user.id)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.editButtonDisabled : styles.editButton}
                        >
                          <AiFillEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.user_name)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.deleteButtonDisabled : styles.deleteButton}
                        >
                          <AiFillDelete />
                        </button>
                        <button
                          onClick={() => setShowUserRolesModal(user.id)}
                          disabled={operationLoading}
                          style={operationLoading ? styles.manageButtonDisabled : styles.manageButton}
                        >
                          <MdManageAccounts />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={TallerStyles.noDataText} colSpan="6">
                      {searchTerm ? "No se encontraron resultados" : "No hay usuarios registrados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL CREAR */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Nuevo Usuario</h2>

            <form onSubmit={handleCreate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Nombre de Usuario:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="user_name"
                    placeholder="Ej: jperez"
                    value={formData.user_name}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Email:</label>
                  <input
                    className="InputProyecto"
                    type="email"
                    name="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div>
                  <label style={TallerStyles.formLabel}>Nombres:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="nombres"
                    placeholder="Nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Apellido Paterno:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="apellidopat"
                    placeholder="Apellido Paterno"
                    value={formData.apellidopat}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Apellido Materno:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="apellidomat"
                    placeholder="Apellido Materno"
                    value={formData.apellidomat}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Carnet:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="carnet"
                    placeholder="Ej: 12345678"
                    value={formData.carnet}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Rol:</label>
                  <select
                    className="InputProyecto"
                    name="id_roles"
                    value={formData.id_roles}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  >
                    <option value="">Selecciona Rol</option>
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hay roles disponibles</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="btn-create"
                >
                  {operationLoading ? "Procesando..." : "Crear Usuario"}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Usuario</h2>

            <form onSubmit={handleUpdate}>
              {error && <div style={TallerStyles.errorMessage}>Error: {error}</div>}

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Nombre de Usuario:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="user_name"
                    placeholder="Ej: jperez"
                    value={formData.user_name}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Email:</label>
                  <input
                    className="InputProyecto"
                    type="email"
                    name="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div>
                  <label style={TallerStyles.formLabel}>Nombres:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="nombres"
                    placeholder="Nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Apellido Paterno:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="apellidopat"
                    placeholder="Apellido Paterno"
                    value={formData.apellidopat}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Apellido Materno:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="apellidomat"
                    placeholder="Apellido Materno"
                    value={formData.apellidomat}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label style={TallerStyles.formLabel}>Carnet:</label>
                  <input
                    className="InputProyecto"
                    type="text"
                    name="carnet"
                    placeholder="Ej: 12345678"
                    value={formData.carnet}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </div>

                <div>
                  <label style={TallerStyles.formLabel}>Rol:</label>
                  <select
                    className="InputProyecto"
                    name="id_roles"
                    value={formData.id_roles}
                    onChange={handleInputChange}
                    required
                    disabled={operationLoading}
                  >
                    <option value="">Selecciona Rol</option>
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hay roles disponibles</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="btn-edit"
                >
                  {operationLoading ? "Procesando..." : "Actualizar Usuario"}
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

      {renderUserRolesModal()}
    </div>
  );
}

export default Usuarios;