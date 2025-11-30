import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navegacion from "./Navegacion";
import Recursos from "./Recursos";

// Importar componentes principales
import Dashboard from "./Screens/Dashboard";

// Ventas
import Ventas from "./Screens/Ventas/Ventas";
import NuevaVenta from "./Screens/Ventas/NuevaVenta";

// Productos
import Productos from "./Screens/Productos/Productos";

// Clientes
import Clientes from "./Screens/Clientes/Clientes";

// Compras
import Compras from "./Screens/Compras/Compras";

// Inventario
import MateriasPrimas from "./Screens/MateriasPrimas/MateriasPrimas";
import MovimientosInventario from "./Screens/MovimientosInventario/MovimientosInventario";

// Producción
import ProduccionDiaria from "./Screens/ProduccionDiaria/ProduccionDiaria";
import Recetas from "./Screens/Recestas/Recetas";

// Proveedores
import Proveedores from "./Screens/Proveedores/Proveedores";

// Promociones
import Promociones from "./Screens/Promociones/Promociones";

import OptimizacionPanel from "./Screens/Obtimizacion";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navegacion />
      <Routes>
        
        <Route path="/" element={<Dashboard />} />
        
        {/* Ventas */}
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/recursos" element={<Recursos />} />
        <Route path="/ventas/nueva" element={<NuevaVenta />} />
        
        {/* Productos */}
        <Route path="/productos" element={<Productos />} />
        
        {/* Clientes */}
        <Route path="/clientes" element={<Clientes />} />
        
        {/* Compras */}
        <Route path="/compras" element={<Compras />} />
        
        {/* Inventario */}
        <Route path="/inventario/materias-primas" element={<MateriasPrimas />} />
        <Route path="/inventario/movimientos" element={<MovimientosInventario />} />
        
        {/* Producción */}
        <Route path="/produccion/diaria" element={<ProduccionDiaria />} />
        <Route path="/produccion/recetas" element={<Recetas />} />
        
        {/* Proveedores */}
        <Route path="/proveedores" element={<Proveedores />} />
        
        {/* Promociones */}
        <Route path="/promociones" element={<Promociones />} />
        <Route path="/optimizaciones" element={<OptimizacionPanel />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);