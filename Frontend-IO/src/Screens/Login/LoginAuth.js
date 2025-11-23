import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { sendAuthCode, verifyAuthCode } from "../../API/Verficacion/Verificacion";

function AutenticacionLogin() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const isCodeSent = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extraemos TODOS los datos del estado
  const {  email, nombres, roles } = location.state || {};

  useEffect(() => {
    if (!email || !roles) {
      navigate("/login");
      return;
    }

    const sendInitialCode = async () => {
      if (isCodeSent.current) return;
      setLoading(true);
      try {
        await sendAuthCode(email);
        setSuccess(`Código enviado a ${email}`);
        isCodeSent.current = true;
        startResendTimer();
      } catch (err) {
        setError("Error al enviar el código: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isCodeSent.current) {
      sendInitialCode();
    }
  }, [ email, roles, navigate]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
      setError("");
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || resendLoading) return;
    setLoading(true);
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(code)) {
      setError("El código debe ser de 6 dígitos numéricos");
      setLoading(false);
      return;
    }

    try {
      await verifyAuthCode(email, code);
      setSuccess("¡Código verificado! Redirigiendo...");

      // Redirigir según el rol
      if (roles.some(role => role.name.toLowerCase() === 'admin')) {
        navigate('/admin');
      } else if (roles.some(role => role.name.toLowerCase() === 'docente')) {
        navigate('/docente');
      } else if (roles.some(role => role.name.toLowerCase() === 'estudiante')) {
        navigate('/estudiante');
      } else {
        setError('Rol no reconocido. Contacta al administrador.');
      }
    } catch (err) {
      setError("Código incorrecto o expirado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (loading || resendLoading || resendTimer > 0) return;
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendAuthCode(email);
      setSuccess(`Código de autenticación reenviado a ${email}`);
      startResendTimer();
    } catch (err) {
      setError("Error al reenviar el código: " + err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    setTimeout(() => clearInterval(timer), 30000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <img src="logousb.png" alt="Logo Univesidad Salesiana de Bolivia" style={{ width: '150px',height: 'auto'}} />
        <h2 style={styles.title}>Autenticacion de correo</h2>
        <p style={styles.subtitle}>
          Verifica tu correo electrónico para {nombres}
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="code"
            placeholder="Código de autenticación (6 dígitos)"
            value={code}
            onChange={handleChange}
            style={styles.input}
            required
            maxLength="6"
            inputMode="numeric"
            pattern="\d{6}"
          />
          <button
            type="submit"
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
            disabled={loading}
          >
            {loading ? "Verificando..." : "Verificar Código"}
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
           {" | "}
          <button
            type="button"
            onClick={handleResendCode}
            style={
              resendLoading || resendTimer > 0
                ? { ...styles.resendButton, ...styles.buttonDisabled }
                : styles.resendButton
            }
            disabled={resendLoading || resendTimer > 0}
          >
            {resendLoading
              ? "Enviando..."
              : resendTimer > 0
              ? `Reenviar en ${resendTimer}s`
              : "Reenviar Código"}
          </button>
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
    padding: "20px",
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
    maxWidth: "90vw",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  title: {
    color: "#fff",
    marginBottom: "10px",
    fontSize: "28px",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#f0f0f0",
    marginBottom: "25px",
    textAlign: "center",
    fontSize: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "15px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    outline: "none",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "16px",
    transition: "all 0.3s ease",
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
    marginTop: "10px",
  },
  resendButton: {
    background: "none",
    border: "none",
    color: "#6c63ff",
    textDecoration: "underline",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "12.5px",
    marginTop: "5px",
    padding: "0",
    textAlign: "center",
  },
  buttonDisabled: {
    color: "#666",
    textDecoration: "underline",
    cursor: "not-allowed",
  },
  registerText: {
    color: "#fff",
    marginTop: "20px",
    fontSize: "14px",
    textAlign: "center",
  },
  registerLink: {
    color: "#6c63ff",
    textDecoration: "underline",
    fontWeight: "bold",
  },
  error: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    border: "1px solid #f44336",
    color: "#f44336",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
    width: "100%",
  },
  success: {
    backgroundColor: "rgba(46, 125, 50, 0.1)",
    border: "1px solid #2e7d32",
    color: "#2e7d32",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
    width: "100%",
  },
};

export default AutenticacionLogin;