import BaseNav from "./Config/BaseNav";
import { estudianteMenuItems, getLastMenuItem } from "./Config/menuConfig";

function EstudianteNav({ user, onLogout }) {
  const lastMenuItem = getLastMenuItem(false, "estudiante", user);

  return (
    <BaseNav 
      menuItems={estudianteMenuItems}
      lastMenuItem={lastMenuItem}
      user={user}
      onLogout={onLogout}
    />
  );
}

export default EstudianteNav;