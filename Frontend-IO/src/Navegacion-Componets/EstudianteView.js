import BaseNav from "./Config/BaseNav";
import { estudianteMenuItems, getLastMenuItem } from "./Config/menuConfig";

function EstudianteNavView({ user, onLogout }) {
  const lastMenuItem = getLastMenuItem(true, "estudiante", user);

  return (
    <BaseNav 
      menuItems={estudianteMenuItems}
      lastMenuItem={lastMenuItem}
      user={user}
      onLogout={onLogout}
    />
  );
}

export default EstudianteNavView;