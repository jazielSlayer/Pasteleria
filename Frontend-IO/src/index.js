import React, { createContext, useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Navegacion from "./Navegacion";
import ProtectedRoute from "./ProtectedRout";


import Admin from "./Screens/Admin/Admin";
import AdminEstudiantes from "./Screens/Admin/Admin-Ventanas/Estudiante-Admin";
import DocenteAdmin from "./Screens/Admin/Admin-Ventanas/Docente-Admin";
import Estudiante from "./Screens/Users/Estudiante/Estudiante";
import Docente from "./Screens/Users/Docente/Docente";
import Login from "./Screens/Login/Login";
import RegisterPersona from "./Screens/Login/Register/RegisterPersona";
import RegisterUsuario from "./Screens/Login/Register/RegisterUsuario";
import RolesAdmin from "./Screens/Admin/Admin-Ventanas/AdminRoles";
import Talleres from "./Screens/Admin/Admin-Ventanas/Tallerres";
import AutenticacionUser from "./Screens/Login/Register/AutenticacionUser";
import Usuarios from "./Screens/Admin/Admin-Ventanas/Usuarios";
import AutenticacionLogin from "./Screens/Login/LoginAuth";
import AdminUser from "./Screens/Admin/AdminUser";
import ProyectosAdmin from "./Screens/Admin/Admin-Ventanas/AdminProyects";
import Taller1 from "./Screens/Users/Estudiante/Taller1";
import Taller2 from "./Screens/Users/Estudiante/Taller2";
import Taller3 from "./Screens/Users/Estudiante/Taller3";
import Modulos from "./Screens/Admin/Admin-Ventanas/Modulos";
import Persona from "./Screens/Admin/Admin-Ventanas/Persona";
import Metodologia from "./Screens/Admin/Admin-Ventanas/Metodologia";
import ProgramaAcademico from "./Screens/Admin/Admin-Ventanas/Programa_academico";
import AvanceEstudiante from "./Screens/Admin/Admin-Ventanas/Avance_estudiante";
import Observacion from "./Screens/Admin/Admin-Ventanas/Observacion";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Navegacion />
        <Routes>
          <Route path="/" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/AdminUser" 
                element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUser />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/Estudiante-Admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminEstudiantes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docenteadmin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DocenteAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docente"
              element={
                <ProtectedRoute requiredRole="docente">
                  <Docente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estudiante"
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <Estudiante />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/persona"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Persona />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/metodologia"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Metodologia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/estudiante/observacion"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Observacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/estudiante/avance"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AvanceEstudiante />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/programa/academico"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProgramaAcademico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/metodologia"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Metodologia />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPersona />} />
            <Route path="/autenticacion-login" element={<AutenticacionLogin />} />
            <Route path="/register-step2" element={<AutenticacionUser />} />
            <Route path="/register-step3" element={<RegisterUsuario />} />
            <Route
              path="/roles-admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <RolesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/talleres"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Talleres />
                </ProtectedRoute>
              }
            />

            {/**Vista para el admin de la perspectiva del estudiante */}
            <Route
              path="/estudiante-view"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Estudiante />
                </ProtectedRoute>
              }
            />
            {/**Vista para el admin de la perspectiva del estudiante */}
            <Route
              path="/docente-view"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Docente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proyectos/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProyectosAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estudiante/taller-1"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Taller1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estudiante/taller-2"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Taller2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estudiante/taller-3"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Taller3 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/modulo"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Modulos />
                </ProtectedRoute>
              }
            />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);