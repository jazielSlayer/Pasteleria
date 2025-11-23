
import { MdHomeFilled } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";
import { GiScrollUnfurled } from "react-icons/gi";


export const docenteMenuItems = [
  {
    path: "/docente",
    icon: MdHomeFilled,
    label: "Proyectos",
    key: "proyectos"
  },
  {
    path: "/docente/modulos",
    icon: FaUserTie,
    label: "Módulos",
    key: "modulos"
  },
  {
    path: "/docente/seguimiento",
    icon: PiStudentFill,
    label: "Seguimiento",
    key: "seguimiento"
  }
];

// Configuración del menú de Estudiante
export const estudianteMenuItems = [
  {
    path: "/estudiante",
    icon: MdHomeFilled,
    label: "Inicio",
    key: "inicio"
  },
  {
    path: "/estudiante/documentacion",
    icon: FaUserTie,
    label: "Documentación",
    key: "documentacion"
  },
  {
    path: "/estudiante/proyectos",
    icon: PiStudentFill,
    label: "Estado de Proyectos",
    key: "estado-proyectos"
  },
  {
    path: "/estudiante/pagos",
    icon: GiScrollUnfurled,
    label: "Pagos QR",
    key: "pagos-qr"
  },
  {
    path: "/estudiante/taller-1",
    icon: GiScrollUnfurled,
    label: "Taller 1",
    key: "Taller-1"
  },
  {
    path: "/estudiante/taller-2",
    icon: GiScrollUnfurled,
    label: "Taller 2",
    key: "Taller-2"
  },
  {
    path: "/estudiante/taller-3",
    icon: GiScrollUnfurled,
    label: "Taller 3",
    key: "Taller-3"
  },
];

export const getLastMenuItem = (isAdminView, userRoute, user) => {
  if (isAdminView) {
    return {
      path: "/admin",
      label: "Admin",
      key: "admin-return"
    };
  }
  
  return {
    path: userRoute === "docente" ? "/DocenteUser" : `/${userRoute}`,
    label: userRoute === "docente" ? "Perfil" : `Perfil ${user?.user_name || user?.nombres || ""}`,
    key: "perfil"
  };
};