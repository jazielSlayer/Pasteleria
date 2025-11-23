import BaseNav from "./Config/BaseNav";
import { docenteMenuItems, getLastMenuItem } from "./Config/menuConfig";

function DocenteNav({ user, onLogout }) {
  const lastMenuItem = getLastMenuItem(false, "docente", user);

  return (
    <BaseNav 
      menuItems={docenteMenuItems}
      lastMenuItem={lastMenuItem}
      user={user}
      onLogout={onLogout}
    />
  );
}

export default DocenteNav;