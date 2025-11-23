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