import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { registerUser } from "../../../API/Admin/Users_Admin";
import { createEstudiante } from "../../../API/Admin/Estudiante_admin";
import { createDocente } from "../../../API/Admin/Docente_admin";
import { getAllProgramas } from "../../../API/Admin/Programa_Academico";

function RegisterUsuario() {
  const [userData, setUserData] = useState({
    user_name: '',
    password: '',
    confirmPassword: ''
  });
  
  const [role, setRole] = useState('');
  
  const [roleData, setRoleData] = useState({
    // Para estudiante
    id_programa_academico: '',
    ru: '',
    fecha_inscripcion: new Date().toISOString().split('T')[0],
    // Para docente
    numero_item: '',
    especialidad: '',
    tipo_contrato: 'permanente'
  });
  
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener datos del paso anterior
  const { personaId, correo, nombres } = location.state || {};

  useEffect(() => {
    // Verificar que tenemos los datos del paso anterior
    if (!personaId) {
      navigate('/register');
      return;
    }
    
    // Cargar programas académicos
    const loadProgramas = async () => {
      try {
        const programasData = await getAllProgramas();
        setProgramas(programasData);
      } catch (err) {
        console.error('Error loading programas:', err);
      }
    };
    
    loadProgramas();
  }, [personaId, navigate]);

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    setRoleData({ ...roleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // DEBUG: Verificar los datos antes de enviar
    console.log('Datos del formulario:', {
      per_id: personaId,
      user_name: userData.user_name,
      password: userData.password ? 'presente' : 'FALTANTE',
      confirmPassword: userData.confirmPassword ? 'presente' : 'FALTANTE',
      role: role
    });

    // Validaciones
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!role) {
      setError('Debe seleccionar un rol');
      setLoading(false);
      return;
    }

    if (userData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Capitalizar el rol para que coincida con la base de datos (asumiendo que en BD es 'Estudiante', 'Docente')
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

      // Enviar per_id y el rol seleccionado para usar persona existente y asignar el rol automáticamente
      const createdUser = await registerUser({
        per_id: personaId,
        nombres: nombres,
        apellidopat: '', 
        apellidomat: '',
        carnet: '', 
        email: correo,
        user_name: userData.user_name,
        password: userData.password,
        role: capitalizedRole // Enviar el rol para que el backend lo procese
      });

      console.log('Usuario creado exitosamente:', createdUser);

      // Crear registro específico según el rol
      if (role === 'estudiante') {
        if (!roleData.id_programa_academico || !roleData.ru) {
          setError('Complete todos los campos requeridos para estudiante');
          setLoading(false);
          return;
        }
        
        await createEstudiante({
          per_id: personaId,
          id_programa_academico: parseInt(roleData.id_programa_academico),
          ru: roleData.ru,
          fecha_inscripcion: roleData.fecha_inscripcion,
          estado: true
        });
        
        // Guardar datos del usuario
        localStorage.setItem('user', JSON.stringify({
          ...createdUser,
          role: capitalizedRole // Usar el rol capitalizado para consistencia
        }));
        
        navigate('/estudiante');
        
      } else if (role === 'docente') {
        if (!roleData.numero_item || !roleData.especialidad) {
          setError('Complete todos los campos requeridos para docente');
          setLoading(false);
          return;
        }
        
        await createDocente({
          per_id: personaId,
          numero_item: roleData.numero_item,
          especialidad: roleData.especialidad,
          tipo_contrato: roleData.tipo_contrato,
          estado: true
        });
        
        // Guardar datos del usuario
        localStorage.setItem('user', JSON.stringify({
          ...createdUser,
          role: capitalizedRole // Usar el rol capitalizado para consistencia
        }));
        
        navigate('/docente');
      }

    } catch (err) {
      console.error('Error completo al registrar:', err);
      setError('Error al completar el registro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Registro - Paso 2</h2>
        <p style={styles.subtitle}>Datos de usuario y rol para {nombres}</p>
        
        {error && (
          <div style={styles.error}>{error}</div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="user_name"
            placeholder="Nombre de usuario"
            value={userData.user_name}
            onChange={handleUserChange}
            style={styles.input}
            required
            minLength="3"
          />
          
          <input
            type="password"
            name="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={userData.password}
            onChange={handleUserChange}
            style={styles.input}
            required
            minLength="6"
          />
          
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={userData.confirmPassword}
            onChange={handleUserChange}
            style={styles.input}
            required
          />
          
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
            required
          >
            <option style={styles.SelectContainer} value="">Seleccionar rol</option>
            <option style={styles.SelectContainer} value="estudiante">Estudiante</option>
            <option style={styles.SelectContainer} value="docente">Docente</option>
          </select>

          {role === 'estudiante' && (
            <div style={styles.roleSection}>
              <h4 style={styles.roleSectionTitle}>Datos de Estudiante</h4>
              
              <select
                name="id_programa_academico"
                value={roleData.id_programa_academico}
                onChange={handleRoleChange}
                style={styles.input}
                required
              >
                <option style={styles.SelectContainer} value="">Seleccionar programa académico</option>
                {programas.map((programa) => (
                  <option style={styles.SelectContainer} key={programa.id} value={programa.id}>
                    {programa.nombre_programa} - {programa.modalidad}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                name="ru"
                placeholder="Número de matrícula"
                value={roleData.ru}
                onChange={handleRoleChange}
                style={styles.input}
                required
              />
              
              <input
                type="date"
                name="fecha_inscripcion"
                value={roleData.fecha_inscripcion}
                onChange={handleRoleChange}
                style={styles.input}
                required
              />
            </div>
          )}

          {role === 'docente' && (
            <div style={styles.roleSection}>
              <h4 style={styles.roleSectionTitle}>Datos de Docente</h4>
              
              <input
                type="text"
                name="numero_item"
                placeholder="Número de ítem (ej: DOC001)"
                value={roleData.numero_item}
                onChange={handleRoleChange}
                style={styles.input}
                required
              />
              
              <input
                type="text"
                name="especialidad"
                placeholder="Especialidad (ej: Matemáticas, Física)"
                value={roleData.especialidad}
                onChange={handleRoleChange}
                style={styles.input}
                required
              />
              
              <select
                name="tipo_contrato"
                value={roleData.tipo_contrato}
                onChange={handleRoleChange}
                style={styles.input}
              >
                <option style={styles.SelectContainer} value="permanente">Permanente</option>
                <option style={styles.SelectContainer} value="temporal">Temporal</option>
                <option style={styles.SelectContainer} value="interino">Interino</option>
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Completar Registro'}
          </button>
        </form>
        
        <p style={styles.registerText}>
          <Link to="/register" style={styles.registerLink}>
            ← Volver al paso anterior
          </Link>
          {" | "}
          <Link to="/login" style={styles.registerLink}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  SelectContainer: {
    backgroundColor: "#040a2cc1", 
    color: "#fff6f6ff"
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px"
  },
  formWrapper: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "500px",
    maxWidth: "90vw",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  title: {
    color: "#fff",
    marginBottom: "10px",
    fontSize: "28px",
    fontWeight: "bold"
  },
  subtitle: {
    color: "#f0f0f0",
    marginBottom: "25px",
    textAlign: "center",
    fontSize: "16px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "15px"
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    outline: "none",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "16px",
    transition: "all 0.3s ease"
  },
  roleSection: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  roleSectionTitle: {
    color: "#ffffffff",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
    textAlign: "center"
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#950707ff",
    color: "#ffffffff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "16px",
    marginTop: "10px"
  },
  buttonDisabled: {
    backgroundColor: "#666",
    cursor: "not-allowed"
  },
  registerText: {
    color: "#fff",
    marginTop: "20px",
    fontSize: "14px",
    textAlign: "center"
  },
  registerLink: {
    color: "#6c63ff",
    textDecoration: "underline",
    fontWeight: "bold"
  },
  error: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    border: "1px solid #f44336",
    color: "#f44336",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
    width: "100%"
  }
};

export default RegisterUsuario;