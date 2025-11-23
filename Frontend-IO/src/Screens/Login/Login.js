import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../index";
import { loginUser } from "../../API/Login/Login";
import { sendAuthCode } from "../../API/Verficacion/Verificacion"; // Importamos

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      if (typeof login !== 'function') {
        throw new Error('Contexto de autenticación no está configurado correctamente');
      }

      // 1. Autenticación con email y contraseña
      const userData = await loginUser(credentials, login);
      console.log('userData in Login.js:', userData);

      // 2. Extraer datos necesarios
      const { personaId, email, nombres, roles } = userData;

      // 3. Enviar código de verificación al correo
      await sendAuthCode(email);

      // 4. Redirigir a AutenticacionLogin con datos necesarios
      navigate('/autenticacion-login', {
        state: { personaId, email, nombres, roles } // Pasamos roles también
      });

    } catch (err) {
      if (err.message.includes('Usuario no encontrado') || err.message.includes('404')) {
        setError('Usuario no registrado. Verifica tu correo o regístrate.');
      } else if (err.message.includes('Contraseña incorrecta') || err.message.includes('401')) {
        setError('Contraseña incorrecta. Intenta nuevamente.');
      } else {
        setError('Error al iniciar sesión: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <img src="logousb.png" alt="Logo Univesidad Salesiana de Bolivia" style={{ width: '150px',height: 'auto'}} />
        <h2 style={styles.title}>Iniciar Sesión</h2>
        <p style={styles.subtitle}>Por favor, ingresa tus credenciales.</p>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="email"
            value={credentials.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={credentials.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button 
            type="submit" 
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p style={styles.registerText}>
          ¿No tienes una cuenta?{" "}
          <Link to="/register" style={styles.registerLink}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh"
  },
  formWrapper: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "400px",
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
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#950707ff",
    color: "#fff",
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

export default Login;