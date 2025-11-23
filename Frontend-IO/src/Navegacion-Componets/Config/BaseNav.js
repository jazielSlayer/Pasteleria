import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { logo } from "../NavStyles";
import { FaCircleUser, FaBars } from "react-icons/fa6";

function BaseNav({ menuItems, lastMenuItem, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navRef = useRef(null);

  const toggleMenu = () => {
    setCollapsed((s) => !s);
  };

  useEffect(() => {
    function handleDocumentClick(e) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target) && collapsed) {
        setCollapsed(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [collapsed]);

  // Detectar scroll para ocultar/mostrar navegación en móvil
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth <= 768;
      
      if (!isMobile) return;
      
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
        setCollapsed(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Ajustar el padding del body según el estado de la navegación
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      document.body.style.paddingTop = isVisible ? '80px' : '0';
      document.body.style.paddingLeft = '0';
    } else {
      document.body.style.paddingTop = '0';
      document.body.style.paddingLeft = '50px';
    }

    return () => {
      document.body.style.paddingTop = '0';
      document.body.style.paddingLeft = '0';
    };
  }, [collapsed, isVisible]);

  // Detectar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        document.body.style.paddingTop = isVisible ? '80px' : '0';
        document.body.style.paddingLeft = '0';
      } else {
        setIsVisible(true);
        document.body.style.paddingTop = '0';
        document.body.style.paddingLeft = '50px';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, isVisible]);

  const onNavLinkClick = () => {
    setCollapsed(false);
  };

  return (
    <nav 
      ref={navRef} 
      className={`admin-nav ${collapsed ? "nav-collapsed" : ""} ${!isVisible ? "nav-hidden" : ""}`}
    >
      <div className="nav-header">
        <div className="nav-logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="nav-controls">
          <button className="menu-toggle" onClick={(e) => { e.stopPropagation(); toggleMenu(); }}>
            <FaBars />
          </button>
        </div>
      </div>

      <ul className="nav-list" onClick={(e) => e.stopPropagation()}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.key}>
              <Link className="nav-link" to={item.path} onClick={onNavLinkClick}>
                <IconComponent className="nav-icon" />
                <span className="nav-text">{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="open_submenu user-icon-wrapper">
          <Link 
            className="nav-link user-link" 
            to={lastMenuItem.path} 
            onClick={(e) => { e.stopPropagation(); onNavLinkClick(); }}
          >
            <FaCircleUser className="nav-icon" />
            <span className="nav-text">{lastMenuItem.label}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default BaseNav;