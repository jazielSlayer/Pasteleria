import BaseNav from "./Config/BaseNav";
import { docenteMenuItems, getLastMenuItem } from "./Config/menuConfig";

function DocenteNavView({ user, onLogout }) {
  const lastMenuItem = getLastMenuItem(true, "docente", user);

  return (
    <BaseNav 
      menuItems={docenteMenuItems}
      lastMenuItem={lastMenuItem}
      user={user}
      onLogout={onLogout}
    />
  );
}

export default DocenteNavView;