import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPersona } from "../../../API/Admin/Persona";
import { sendAuthCode } from "../../../API/Verficacion/Verificacion"; // Ajusta la ruta según tu estructura

function RegisterPersona() {
  const [personaData, setPersonaData] = useState({
    nombres: '',
    apellidopat: '',
    apellidomat: '',
    carnet: '',
    direccion: '',
    telefono: '',
    correo: '',
    fecha_nacimiento: '',
    estado: true
  });
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
  const { name, value } = e.target;
  let errorMessage = '';

  if (name === 'nombres' || name === 'apellidopat' || name === 'apellidomat') {
    if (!/^[A-Za-z\s]*$/.test(value)) {
      errorMessage = 'Solo se permiten letras y espacios';
    }
  } else if (name === 'telefono' || name === 'carnet') {
    if (!/^\d*$/.test(value)) {
      errorMessage = 'Solo se permiten números';
    }
  }

  if (errorMessage) {
    setError(errorMessage);
    return;
  }

  setPersonaData({ ...personaData, [e.target.name]: e.target.value });
  setError('');
  
};

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateEmail(personaData.correo)) {
      setError('Por favor, ingresa un correo electrónico válido');
      setLoading(false);
      return;
    }

    try {
      const createdPersona = await createPersona(personaData);
      console.log('Persona creada:', createdPersona);

      setEmailLoading(true);
      try {
        await sendAuthCode(personaData.correo);
        setSuccess(`Código de autenticación enviado a ${personaData.correo}`);
        
        navigate('/register-step2', { 
          state: { 
            personaId: createdPersona.id,
            correo: personaData.correo,
            nombres: personaData.nombres 
          } 
        });
      } catch (emailErr) {
        setError('Error al enviar el código de autenticación: ' + emailErr.message);
      } finally {
        setEmailLoading(false);
      }
    } catch (err) {
      setError('Error al registrar datos personales: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Registro - Paso 1</h2>
        <p style={styles.subtitle}>Información personal</p>
        
        {error && (
          <div style={styles.error}>{error}</div>
        )}
        {success && (
          <div style={styles.success}>{success}</div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputRow}>
            <input
              type="text"
              name="nombres"
              placeholder="Nombres"
              value={personaData.nombres}
              onChange={handleChange}
              style={{...styles.input, width: '48%'}}
              required
            />

            <input
              type="text"
              name="apellidopat"
              placeholder="Apellido Paterno"
              value={personaData.apellidopat}
              onChange={handleChange}
              style={{...styles.input, width: '48%'}}
              required
            />
            </div>
            <input
              type="text"
              name="apellidomat"
              placeholder="Apellido Materno"
              value={personaData.apellidomat}
              onChange={handleChange}
              style={styles.input}
              required
            />
          
          <input
            type="text"
            name="carnet"
            placeholder="Número de Carnet"
            value={personaData.carnet}
            onChange={handleChange}
            style={styles.input}
            required
          />
          
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={personaData.correo}
            onChange={handleChange}
            style={styles.input}
            required
          />
          
           <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={personaData.telefono}
            onChange={handleChange}
            style={styles.input}
          />
          
          <input
            type="date"
            name="fecha_nacimiento"
            placeholder="Fecha de nacimiento"
            value={personaData.fecha_nacimiento}
            onChange={handleChange}
            style={styles.input}
            required
          />
          
          <textarea
            name="direccion"
            placeholder="Dirección"
            value={personaData.direccion}
            onChange={handleChange}
            style={{...styles.input, height: '80px', resize: 'vertical'}}
            required
          />
          
          <button 
            type="submit" 
            style={(loading || emailLoading) ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            disabled={loading || emailLoading}
          >
            {loading ? 'Guardando...' : emailLoading ? 'Enviando código...' : 'Continuar'}
          </button>
        </form>
        
        <p style={styles.registerText}>
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" style={styles.registerLink}>
            Iniciar sesión
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
  inputRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap"
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
  },
  success: {
    backgroundColor: "rgba(46, 125, 50, 0.1)",
    border: "1px solid #2e7d32",
    color: "#2e7d32",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
    width: "100%"
  }
};

export default RegisterPersona;