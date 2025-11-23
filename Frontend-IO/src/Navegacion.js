import {  useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminNav from "./Navegacion-Componets/AdminNav";
import DocenteNav from "./Navegacion-Componets/DocenteNav";
import DocenteNavView from "./Navegacion-Componets/DocenteView";
import EstudianteNav from "./Navegacion-Componets/EstudianteNav";
import EstudianteNavView from "./Navegacion-Componets/EstudianteView";

function Navegacion() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
  const userData = localStorage.getItem("user");
  console.log("userData from localStorage:", userData);
  if (userData) {
    const parsedUser = JSON.parse(userData);
    console.log("Parsed user:", parsedUser);
    setUser(parsedUser);
  }
}, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  if (
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/register-step2" ||
    location.pathname === "/autenticacion-login"
  ) {
    return null;
  }

  const isAdminPath = [
    "/admin",
    "/Estudiante-Admin",
    "/docenteadmin",
    "/roles-admin",
    "/talleres",
    "/usuarios",
    "/AdminUser",
    "/proyectos/admin",
    "/admin/modulo",
    "/admin/metodologia",
    "/admin/persona",
    "/admin/estudiante/observacion",
    "/admin/estudiante/avance",
    "/admin/programa/academico",
    
  ].includes(location.pathname); 

  const isAdminViewDocente = [
    "/docente-view",
  ].includes(location.pathname);

  const isAdminViewEstudiante = [
    "/estudiante-view",
    "/estudiante/taller-1",
    "/estudiante/taller-2",
    "/estudiante/taller-3"
  ].includes(location.pathname);

  const isDocentePath = [
    "/docente"
  ].includes(location.pathname);

  const isEstudiantePath = 
  [ 
    "/estudiante",
    "/estudiante/taller-1",
    "/estudiante/taller-2",
    "/estudiante/taller-3", 
  ].includes(location.pathname);
 
  
  

  if (isAdminPath) {
    return <AdminNav user={user} onLogout={handleLogout} />;
  }

  if (isAdminViewDocente) {
    return <DocenteNavView user={user} onLogout={handleLogout} />;
  }
  
  if (isAdminViewEstudiante) {
    return <EstudianteNavView user={user} onLogout={handleLogout} />;
  }

  if (isDocentePath) {
    return <DocenteNav user={user} onLogout={handleLogout} />;
  }

  if (isEstudiantePath) {
    return <EstudianteNav user={user} onLogout={handleLogout} />;
  }

  
}

export default Navegacion;