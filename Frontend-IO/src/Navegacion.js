import { Link  } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaBars } from "react-icons/fa6";
import { GrResources, GrOptimize } from "react-icons/gr";
import { IoBookSharp } from "react-icons/io5";

import { 
  MdHomeFilled, 
  MdShoppingCart, 
  MdInventory, 
  MdPeople 
} from "react-icons/md";
import { 
  GiCakeSlice, 
  GiFactory 
} from "react-icons/gi";
import { FaTruck, FaPercentage } from "react-icons/fa";
import logo from "./Navegacion-Componets/Config/LogoMichellin.png";

function Navegacion() {
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
        <li>
          <Link className="nav-link" to="/" onClick={onNavLinkClick}>
            <MdHomeFilled className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/ventas" onClick={onNavLinkClick}>
            <MdShoppingCart className="nav-icon" />
            <span className="nav-text">Ventas</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/productos" onClick={onNavLinkClick}>
            <GiCakeSlice className="nav-icon" />
            <span className="nav-text">Productos</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/produccion/recetas" onClick={onNavLinkClick}>
            <IoBookSharp className="nav-icon" />
            <span className="nav-text">Recetas</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/clientes" onClick={onNavLinkClick}>
            <MdPeople className="nav-icon" />
            <span className="nav-text">Clientes</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/compras" onClick={onNavLinkClick}>
            <MdShoppingCart className="nav-icon" />
            <span className="nav-text">Compras</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/inventario/materias-primas" onClick={onNavLinkClick}>
            <MdInventory className="nav-icon" />
            <span className="nav-text">Materias Primas</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/produccion/diaria" onClick={onNavLinkClick}>
            <GiFactory className="nav-icon" />
            <span className="nav-text">Producción</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/proveedores" onClick={onNavLinkClick}>
            <FaTruck className="nav-icon" />
            <span className="nav-text">Proveedores</span>
          </Link>
        </li>

        <li>
          <Link className="nav-link" to="/promociones" onClick={onNavLinkClick}>
            <FaPercentage className="nav-icon" />
            <span className="nav-text">Promociones</span>
          </Link>
        </li>
        <li>
          <Link className="nav-link" to="/optimizaciones" onClick={onNavLinkClick}>
            <GrOptimize className="nav-icon" />
            <span className="nav-text">Obtimizacion</span>
          </Link>
        </li>
        <li>
          <Link className="nav-link" to="/recursos" onClick={onNavLinkClick}>
            <GrResources className="nav-icon" />
            <span className="nav-text">Recursos</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navegacion;