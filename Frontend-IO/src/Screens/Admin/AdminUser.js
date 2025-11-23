import { IoLogOut } from "react-icons/io5";
import { logoutButtonStyle } from "../../Navegacion-Componets/NavStyles";
import { FaCircleUser } from "react-icons/fa6";

function AdminUser ({ user, onLogout }) {
    return (
        <div style={{color: "#ffff"}}>
            <h1>Pantalla en donde va a ver el admin sus datos</h1>
            {user && (
                      <li class="open_submenu">
                        <button
                            onClick={(e) => {
                                      e.preventDefault();
                                      const subMenu = document.querySelector('.submenu');
                                      const openSubmenu = document.querySelector('.open_submenu')
                                      subMenu.classList.toggle('show');
                                      document.addEventListener('click', function(e) {
                                        if (subMenu.classList.contains('show')
                                        && !subMenu.contains(e.target)
                                        && !openSubmenu.contains(e.target)){
                      
                                            subMenu.classList.remove('show');
                                        }
                                    });
                                      
                                    }}
                                  >
                                    <FaCircleUser style={{ fontSize: '40px' }}/>
                                  </button>
                                  <i class="fa-solid fa-chevron-down"></i>
                                  <div class="submenu">
                                    <ul>
                                      <li>
                                        <span style={{ color: '#fff', marginRight: '1rem' }}>
                                          Bienvenido, {user.user_name || user.nombres}
                                        </span>
                                      </li>
                                      <li>
                                        <button style={logoutButtonStyle} onClick={onLogout}>
                                          <IoLogOut />
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                      </li>
            )}
        </div>
    );
}

export default AdminUser;