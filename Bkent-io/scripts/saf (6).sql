-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-11-2025 a las 16:19:57
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pasteleria_michellin`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `capacidades_diarias`
--

CREATE TABLE `capacidades_diarias` (
  `id` int(11) NOT NULL,
  `recurso` varchar(50) NOT NULL,
  `horas_disponibles` decimal(8,2) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `capacidades_diarias`
--

INSERT INTO `capacidades_diarias` (`id`, `recurso`, `horas_disponibles`, `descripcion`) VALUES
(1, 'HORNO', 10.00, 'Horas de horno disponibles por d?a'),
(2, 'MANO_OBRA', 16.00, 'Horas totales de personal de producci?n'),
(3, 'EMPACADO', 8.00, 'Horas de empaque y decoraci?n');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `cliente_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `nit_ci` varchar(20) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `tipo` enum('MOSTRADOR','MAYORISTA','EVENTO') DEFAULT 'MOSTRADOR',
  `descuento_porcentaje` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`cliente_id`, `nombre`, `nit_ci`, `telefono`, `tipo`, `descuento_porcentaje`) VALUES
(1, 'Venta Mostrador', NULL, NULL, 'MOSTRADOR', 0.00),
(2, 'Pasteleria Dulce Vida', '55667788', '70771234', 'MAYORISTA', 15.00),
(3, 'Eventos Sofia', '99887766', '70779876', 'EVENTO', 12.00),
(4, 'Maria Gonzales', '12345678', '70772345', 'MOSTRADOR', 0.00),
(5, 'Distribuidora La Dulce', '44556677', '42891234', 'MAYORISTA', 20.00),
(6, 'Jaziel', '191972172', '18010129', 'MOSTRADOR', 50.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compradetalle`
--

CREATE TABLE `compradetalle` (
  `detalle_id` int(11) NOT NULL,
  `compra_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `cantidad` decimal(10,3) NOT NULL,
  `precio_unitario` decimal(10,4) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `compradetalle`
--

INSERT INTO `compradetalle` (`detalle_id`, `compra_id`, `materia_id`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 1, 100.000, 8.5000),
(2, 1, 2, 200.000, 6.2000),
(3, 2, 4, 50.000, 42.0000),
(4, 2, 5, 100.000, 5.8000),
(5, 2, 7, 60.000, 22.5000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

CREATE TABLE `compras` (
  `compra_id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `fecha_compra` date DEFAULT curdate(),
  `numero_factura` varchar(30) DEFAULT NULL,
  `total_bs` decimal(12,2) DEFAULT NULL,
  `estado` enum('PENDIENTE','RECIBIDA','CANCELADA') DEFAULT 'PENDIENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`compra_id`, `proveedor_id`, `fecha_compra`, `numero_factura`, `total_bs`, `estado`) VALUES
(1, 3, '2025-11-10', 'F-001234', 2550.00, 'RECIBIDA'),
(2, 2, '2025-11-15', 'F-005678', 3200.00, 'RECIBIDA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `demandas_maximas`
--

CREATE TABLE `demandas_maximas` (
  `producto_id` int(11) NOT NULL,
  `cantidad_maxima` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materiasprimas`
--

CREATE TABLE `materiasprimas` (
  `materia_id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `stock_minimo` decimal(10,3) DEFAULT 0.000,
  `stock_actual` decimal(10,3) DEFAULT 0.000,
  `costo_promedio` decimal(10,4) DEFAULT 0.0000,
  `proveedor_preferido_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `materiasprimas`
--

INSERT INTO `materiasprimas` (`materia_id`, `codigo`, `nombre`, `unidad`, `stock_minimo`, `stock_actual`, `costo_promedio`, `proveedor_preferido_id`) VALUES
(1, 'MP001', 'Harina 000', 'kg', 50.000, 120.500, 8.5000, 3),
(2, 'MP002', 'Azucar blanca', 'kg', 40.000, 0.000, 8.0000, 1),
(3, 'MP003', 'Huevos', 'unidad', 1000.000, 2500.000, 0.4500, 5),
(4, 'MP004', 'Mantequilla', 'kg', 20.000, 45.800, 42.0000, 2),
(5, 'MP005', 'Leche entera', 'litro', 30.000, 80.000, 5.8000, 2),
(6, 'MP006', 'Chocolate cobertura 55%', 'kg', 10.000, 28.500, 85.0000, 4),
(7, 'MP007', 'Crema de leche', 'litro', 15.000, 35.000, 22.5000, 2),
(8, 'MP008', 'Esencia de vainilla', 'litro', 2.000, 5.600, 120.0000, 4),
(9, 'MP009', 'Polvo de hornear', 'kg', 5.000, 12.000, 28.0000, 1),
(10, 'MP010', 'Cacao en polvo', 'kg', 8.000, 5.000, 65.0000, 4),
(11, 'HAR-MA-002', 'Harina de maiz', 'caja', 5.000, 6.000, 38.0000, NULL),
(12, 'MAIZ', 'Maíz en grano', 'docena', 24.000, 12.000, 12.0000, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientosinventario`
--

CREATE TABLE `movimientosinventario` (
  `movimiento_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `tipo` enum('COMPRA','PRODUCCION','MERMA','AJUSTE','DEVOLUCION') NOT NULL,
  `cantidad` decimal(10,3) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `usuario` varchar(50) DEFAULT NULL,
  `referencia_id` int(11) DEFAULT NULL,
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `movimientosinventario`
--

INSERT INTO `movimientosinventario` (`movimiento_id`, `materia_id`, `tipo`, `cantidad`, `fecha`, `usuario`, `referencia_id`, `observacion`) VALUES
(1, 1, 'COMPRA', 100.000, '2025-11-10 10:30:00', 'admin', 1, 'Compra factura F-001234'),
(2, 2, 'COMPRA', 200.000, '2025-11-10 10:30:00', 'admin', 1, 'Compra factura F-001234'),
(3, 4, 'COMPRA', 50.000, '2025-11-15 14:20:00', 'admin', 2, 'Compra factura F-005678'),
(4, 5, 'COMPRA', 100.000, '2025-11-15 14:20:00', 'admin', 2, 'Compra factura F-005678'),
(5, 7, 'COMPRA', 60.000, '2025-11-15 14:20:00', 'admin', 2, 'Compra factura F-005678');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producciondiaria`
--

CREATE TABLE `producciondiaria` (
  `produccion_id` int(11) NOT NULL,
  `fecha` date DEFAULT curdate(),
  `producto_id` int(11) NOT NULL,
  `cantidad_producida` decimal(10,3) NOT NULL,
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `producciondiaria`
--

INSERT INTO `producciondiaria` (`produccion_id`, `fecha`, `producto_id`, `cantidad_producida`, `observacion`) VALUES
(1, '2025-11-20', 1, 5.000, 'Producci?n normal'),
(2, '2025-11-21', 2, 8.000, NULL),
(3, '2025-11-22', 3, 6.000, 'Pedido especial');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `producto_id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `es_por_peso` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`producto_id`, `codigo`, `nombre`, `categoria`, `precio_venta`, `activo`, `es_por_peso`) VALUES
(1, 'P001', 'Torta Selva Negra', 'Tortas', 280.00, 1, 0),
(2, 'P002', 'Torta Tres Leches', 'Tortas', 250.00, 1, 0),
(3, 'P003', 'Torta de Chocolate Clasica', 'TORTAS', 240.00, 1, 0),
(4, 'P004', 'Alfajor de Maicena (unidad)', 'Dulces', 12.00, 1, 0),
(5, 'P005', 'Galletas de mantequilla (docena)', 'Galletas', 30.00, 1, 0),
(6, 'P006', 'Pastel de zanahoria', 'Tortas', 220.00, 1, 0),
(7, 'P007', 'Cheesecake de maracuya', 'TORTAS', 320.00, 1, 0),
(8, 'P008', 'Pan dulce (kg)', 'Panaderia', 45.00, 1, 1),
(9, 'P009', 'Torta personalizada (kg)', 'Personalizadas', 380.00, 1, 1),
(10, 'PIE-004', 'Pie de Manzana', 'TORTAS', 15.00, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_recursos`
--

CREATE TABLE `producto_recursos` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `recurso_nombre` varchar(50) NOT NULL,
  `cantidad_requerida` decimal(10,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `producto_recursos`
--

INSERT INTO `producto_recursos` (`id`, `producto_id`, `recurso_nombre`, `cantidad_requerida`) VALUES
(1, 1, 'MANO_OBRA', 2.0000),
(2, 1, 'HORNO', 1.5000),
(3, 1, 'HARINA_KG', 3.0000),
(4, 2, 'MANO_OBRA', 0.2000),
(5, 2, 'HORNO', 0.1000),
(6, 2, 'HARINA_KG', 0.2000),
(7, 3, 'MANO_OBRA', 0.1000),
(8, 3, 'HARINA_KG', 0.1000),
(9, 1, 'AZUCAR_KG', 0.0400),
(10, 1, 'MANTEQUILLA_KG', 0.0300),
(11, 2, 'AZUCAR_KG', 0.0350),
(12, 2, 'MANTEQUILLA_KG', 0.0200),
(13, 3, 'AZUCAR_KG', 0.0450),
(14, 3, 'MANTEQUILLA_KG', 0.0250),
(15, 3, 'HORNO', 0.7000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promociones`
--

CREATE TABLE `promociones` (
  `promocion_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `tipo` enum('2x1','DESCUENTO_%','PRODUCTO_GRATIS','COMBO') NOT NULL,
  `valor` decimal(5,2) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `minimo_cantidad` int(11) DEFAULT 1,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `promociones`
--

INSERT INTO `promociones` (`promocion_id`, `nombre`, `fecha_inicio`, `fecha_fin`, `tipo`, `valor`, `producto_id`, `minimo_cantidad`, `activo`) VALUES
(1, 'Dia del Hombre', '2025-11-23', '2025-11-28', 'COMBO', NULL, NULL, 4, 0),
(2, 'Dia del hombre', '2025-11-24', '2025-11-30', 'PRODUCTO_GRATIS', NULL, 3, 2, 0),
(3, 'Dia del hombre', '2025-11-24', '2025-11-30', 'PRODUCTO_GRATIS', NULL, 2, 2, 1),
(4, 'Diciembre', '2025-12-01', '2025-12-27', 'DESCUENTO_%', 50.00, 4, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `proveedor_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `nit` varchar(20) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `plazo_pago_dias` int(11) DEFAULT 30,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`proveedor_id`, `nombre`, `nit`, `telefono`, `direccion`, `contacto`, `plazo_pago_dias`, `activo`) VALUES
(1, 'Distribuidora Dulzar', '1023456789', '70784561', 'Av. Blanco Galindo Km 8', 'Juan Perez', 15, 1),
(2, 'Lácteos Bolívar', '1009876543', '42897561', 'Cochabamba', 'Mar?a Guti?rrez', 30, 1),
(3, 'Harinas El Sol', '1011122233', '77984512', 'Sacaba', 'Carlos Mendoza', 7, 0),
(4, 'Importadora Sweet', '1033344455', '60712345', 'La Paz', 'Ana Rojas', 45, 1),
(5, 'Huevos Doña Petra', NULL, '70785623', 'Quillacollo', 'Petra Mamani', 30, 1),
(6, 'Pil', '3425434234', '2134123', 'dsdnsdbcej', 'nsdjansja', 10, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recetadetalle`
--

CREATE TABLE `recetadetalle` (
  `id` int(11) NOT NULL,
  `receta_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `cantidad` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `recetadetalle`
--

INSERT INTO `recetadetalle` (`id`, `receta_id`, `materia_id`, `cantidad`) VALUES
(1, 1, 1, 1.200),
(2, 1, 2, 0.800),
(3, 1, 3, 12.000),
(4, 1, 4, 0.600),
(5, 1, 6, 0.500),
(6, 1, 7, 1.500),
(7, 2, 1, 0.900),
(8, 2, 2, 0.700),
(9, 2, 3, 10.000),
(10, 2, 4, 0.400),
(11, 2, 5, 1.200),
(12, 2, 7, 1.000),
(13, 3, 1, 1.000),
(14, 3, 2, 0.900),
(15, 3, 3, 11.000),
(16, 3, 4, 0.500),
(17, 3, 6, 0.700),
(18, 3, 10, 0.150),
(19, 5, 1, 7.000),
(20, 5, 3, 5.000),
(21, 5, 9, 9.000),
(22, 6, 11, 7.000),
(23, 6, 11, 8.000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recetas`
--

CREATE TABLE `recetas` (
  `receta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `porciones_salida` int(11) DEFAULT 1,
  `costo_mano_obra` decimal(10,2) DEFAULT 0.00,
  `costo_energia` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `recetas`
--

INSERT INTO `recetas` (`receta_id`, `producto_id`, `porciones_salida`, `costo_mano_obra`, `costo_energia`) VALUES
(1, 1, 20, 40.00, 15.00),
(2, 2, 20, 35.00, 12.00),
(3, 3, 20, 38.00, 14.00),
(4, 6, 18, 35.00, 13.00),
(5, 10, 10, 10.00, 100.02),
(6, 5, 8, 78.00, 59.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recursos_produccion`
--

CREATE TABLE `recursos_produccion` (
  `recurso_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `cantidad_disponible` decimal(10,3) NOT NULL,
  `unidad` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `recursos_produccion`
--

INSERT INTO `recursos_produccion` (`recurso_id`, `nombre`, `cantidad_disponible`, `unidad`) VALUES
(1, 'MANO_OBRA', 40.000, 'horas'),
(2, 'HORNO', 12.000, 'horas'),
(3, 'HARINA_KG', 30.000, 'kg'),
(4, 'AZUCAR_KG', 20.000, 'kg'),
(5, 'MANTEQUILLA_KG', 15.000, 'kg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventadetalle`
--

CREATE TABLE `ventadetalle` (
  `detalle_id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` decimal(10,3) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `ventadetalle`
--

INSERT INTO `ventadetalle` (`detalle_id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 1, 1.000, 280.00),
(2, 1, 2, 1.000, 250.00),
(3, 2, 1, 5.000, 280.00),
(4, 2, 3, 3.000, 240.00),
(5, 3, 1, 1.000, 280.00),
(7, 5, 4, 1.000, 12.00),
(8, 5, 1, 1.000, 280.00),
(9, 6, 5, 2.000, 30.00),
(10, 6, 1, 1.000, 280.00),
(11, 7, 4, 1.000, 12.00),
(12, 8, 8, 1.000, 45.00),
(13, 9, 8, 1.000, 45.00),
(14, 10, 6, 1.000, 220.00),
(15, 11, 9, 1.000, 380.00),
(16, 11, 3, 12.000, 240.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `venta_id` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `cliente_id` int(11) DEFAULT NULL,
  `tipo_comprobante` enum('FACTURA','RECIBO') DEFAULT 'FACTURA',
  `numero_factura` varchar(30) DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT NULL,
  `descuento` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) DEFAULT NULL,
  `metodo_pago` varchar(30) DEFAULT NULL,
  `vendedor` varchar(80) DEFAULT NULL,
  `promocion_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`venta_id`, `fecha`, `cliente_id`, `tipo_comprobante`, `numero_factura`, `subtotal`, `descuento`, `total`, `metodo_pago`, `vendedor`, `promocion_id`) VALUES
(1, '2025-11-22 09:15:00', 1, 'RECIBO', NULL, 520.00, 0.00, 520.00, 'EFECTIVO', 'Ana', NULL),
(2, '2025-11-22 11:30:00', 2, 'FACTURA', '001-789012', 2000.00, 300.00, 1700.00, 'TRANSFERENCIA', 'Luis', NULL),
(3, '2025-11-23 08:45:00', 4, 'RECIBO', NULL, 280.00, 0.00, 280.00, 'QR', 'Ana', NULL),
(5, '2025-11-23 16:02:02', 6, 'FACTURA', NULL, 292.00, 146.00, 146.00, 'EFECTIVO', 'Caja', NULL),
(6, '2025-11-23 16:16:59', NULL, 'FACTURA', NULL, 340.00, 0.00, 340.00, 'TRANSFERENCIA', 'Caja', NULL),
(7, '2025-11-23 16:17:44', 6, 'FACTURA', NULL, 12.00, 6.00, 6.00, 'EFECTIVO', 'Caja', NULL),
(8, '2025-11-23 16:19:29', 2, 'FACTURA', NULL, 45.00, 6.75, 38.25, 'TRANSFERENCIA', 'Caja', NULL),
(9, '2025-11-23 16:27:45', 3, 'FACTURA', NULL, 45.00, 5.40, 39.60, 'EFECTIVO', 'Caja', NULL),
(10, '2025-11-23 16:32:25', 4, 'FACTURA', '1241242321', 220.00, 0.00, 220.00, 'TRANSFERENCIA', 'Caja', NULL),
(11, '2025-11-23 23:51:40', 6, '', NULL, 3260.00, 1630.00, 1630.00, 'TRANSFERENCIA', 'Caja', NULL);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_costo_productos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_costo_productos` (
`producto_id` int(11)
,`nombre` varchar(150)
,`precio_venta` decimal(10,2)
,`costo_unitario` decimal(48,11)
,`margen_unitario` decimal(49,11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_mermas_mes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_mermas_mes` (
`nombre` varchar(100)
,`cantidad_perdida` decimal(32,3)
,`costo_perdido_bs` decimal(42,7)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_stock_critico`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_stock_critico` (
`codigo` varchar(20)
,`nombre` varchar(100)
,`stock_actual` decimal(10,3)
,`stock_minimo` decimal(10,3)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_top_productos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_top_productos` (
`nombre` varchar(150)
,`unidades` decimal(32,3)
,`ingresos` decimal(34,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_costo_productos`
--
DROP TABLE IF EXISTS `vw_costo_productos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`DRXENO`@`%` SQL SECURITY DEFINER VIEW `vw_costo_productos`  AS SELECT `p`.`producto_id` AS `producto_id`, `p`.`nombre` AS `nombre`, `p`.`precio_venta` AS `precio_venta`, coalesce(sum(`rd`.`cantidad` * `mp`.`costo_promedio`) / `r`.`porciones_salida`,0) + coalesce(`r`.`costo_mano_obra` / `r`.`porciones_salida`,0) + coalesce(`r`.`costo_energia` / `r`.`porciones_salida`,0) AS `costo_unitario`, `p`.`precio_venta`- (coalesce(sum(`rd`.`cantidad` * `mp`.`costo_promedio`) / `r`.`porciones_salida`,0) + coalesce(`r`.`costo_mano_obra` / `r`.`porciones_salida`,0) + coalesce(`r`.`costo_energia` / `r`.`porciones_salida`,0)) AS `margen_unitario` FROM (((`productos` `p` left join `recetas` `r` on(`p`.`producto_id` = `r`.`producto_id`)) left join `recetadetalle` `rd` on(`r`.`receta_id` = `rd`.`receta_id`)) left join `materiasprimas` `mp` on(`rd`.`materia_id` = `mp`.`materia_id`)) GROUP BY `p`.`producto_id`, `r`.`porciones_salida` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_mermas_mes`
--
DROP TABLE IF EXISTS `vw_mermas_mes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`DRXENO`@`%` SQL SECURITY DEFINER VIEW `vw_mermas_mes`  AS SELECT `mp`.`nombre` AS `nombre`, sum(`mi`.`cantidad`) AS `cantidad_perdida`, sum(`mi`.`cantidad` * `mp`.`costo_promedio`) AS `costo_perdido_bs` FROM (`movimientosinventario` `mi` join `materiasprimas` `mp` on(`mi`.`materia_id` = `mp`.`materia_id`)) WHERE `mi`.`tipo` = 'MERMA' AND month(`mi`.`fecha`) = month(curdate()) AND year(`mi`.`fecha`) = year(curdate()) GROUP BY `mp`.`materia_id` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_stock_critico`
--
DROP TABLE IF EXISTS `vw_stock_critico`;

CREATE ALGORITHM=UNDEFINED DEFINER=`DRXENO`@`%` SQL SECURITY DEFINER VIEW `vw_stock_critico`  AS SELECT `materiasprimas`.`codigo` AS `codigo`, `materiasprimas`.`nombre` AS `nombre`, `materiasprimas`.`stock_actual` AS `stock_actual`, `materiasprimas`.`stock_minimo` AS `stock_minimo` FROM `materiasprimas` WHERE `materiasprimas`.`stock_actual` <= `materiasprimas`.`stock_minimo` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_top_productos`
--
DROP TABLE IF EXISTS `vw_top_productos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`DRXENO`@`%` SQL SECURITY DEFINER VIEW `vw_top_productos`  AS SELECT `p`.`nombre` AS `nombre`, sum(`vd`.`cantidad`) AS `unidades`, sum(`vd`.`subtotal`) AS `ingresos` FROM ((`ventadetalle` `vd` join `productos` `p` on(`vd`.`producto_id` = `p`.`producto_id`)) join `ventas` `v` on(`vd`.`venta_id` = `v`.`venta_id`)) WHERE `v`.`fecha` >= curdate() - interval 30 day GROUP BY `p`.`producto_id` ORDER BY sum(`vd`.`subtotal`) DESC LIMIT 0, 10 ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `capacidades_diarias`
--
ALTER TABLE `capacidades_diarias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`cliente_id`);

--
-- Indices de la tabla `compradetalle`
--
ALTER TABLE `compradetalle`
  ADD PRIMARY KEY (`detalle_id`),
  ADD KEY `compra_id` (`compra_id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Indices de la tabla `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`compra_id`),
  ADD KEY `proveedor_id` (`proveedor_id`);

--
-- Indices de la tabla `demandas_maximas`
--
ALTER TABLE `demandas_maximas`
  ADD PRIMARY KEY (`producto_id`);

--
-- Indices de la tabla `materiasprimas`
--
ALTER TABLE `materiasprimas`
  ADD PRIMARY KEY (`materia_id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `proveedor_preferido_id` (`proveedor_preferido_id`);

--
-- Indices de la tabla `movimientosinventario`
--
ALTER TABLE `movimientosinventario`
  ADD PRIMARY KEY (`movimiento_id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Indices de la tabla `producciondiaria`
--
ALTER TABLE `producciondiaria`
  ADD PRIMARY KEY (`produccion_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`producto_id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `producto_recursos`
--
ALTER TABLE `producto_recursos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `producto_id` (`producto_id`,`recurso_nombre`),
  ADD KEY `recurso_nombre` (`recurso_nombre`);

--
-- Indices de la tabla `promociones`
--
ALTER TABLE `promociones`
  ADD PRIMARY KEY (`promocion_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`proveedor_id`);

--
-- Indices de la tabla `recetadetalle`
--
ALTER TABLE `recetadetalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receta_id` (`receta_id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Indices de la tabla `recetas`
--
ALTER TABLE `recetas`
  ADD PRIMARY KEY (`receta_id`),
  ADD UNIQUE KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `recursos_produccion`
--
ALTER TABLE `recursos_produccion`
  ADD PRIMARY KEY (`recurso_id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `ventadetalle`
--
ALTER TABLE `ventadetalle`
  ADD PRIMARY KEY (`detalle_id`),
  ADD KEY `venta_id` (`venta_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`venta_id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `promocion_id` (`promocion_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `capacidades_diarias`
--
ALTER TABLE `capacidades_diarias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `cliente_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `compradetalle`
--
ALTER TABLE `compradetalle`
  MODIFY `detalle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `compra_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `materiasprimas`
--
ALTER TABLE `materiasprimas`
  MODIFY `materia_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `movimientosinventario`
--
ALTER TABLE `movimientosinventario`
  MODIFY `movimiento_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `producciondiaria`
--
ALTER TABLE `producciondiaria`
  MODIFY `produccion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `producto_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `producto_recursos`
--
ALTER TABLE `producto_recursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `promociones`
--
ALTER TABLE `promociones`
  MODIFY `promocion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `proveedor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `recetadetalle`
--
ALTER TABLE `recetadetalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `recetas`
--
ALTER TABLE `recetas`
  MODIFY `receta_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `recursos_produccion`
--
ALTER TABLE `recursos_produccion`
  MODIFY `recurso_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ventadetalle`
--
ALTER TABLE `ventadetalle`
  MODIFY `detalle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `venta_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `compradetalle`
--
ALTER TABLE `compradetalle`
  ADD CONSTRAINT `compradetalle_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`compra_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `compradetalle_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `materiasprimas` (`materia_id`);

--
-- Filtros para la tabla `compras`
--
ALTER TABLE `compras`
  ADD CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`proveedor_id`);

--
-- Filtros para la tabla `demandas_maximas`
--
ALTER TABLE `demandas_maximas`
  ADD CONSTRAINT `demandas_maximas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`);

--
-- Filtros para la tabla `materiasprimas`
--
ALTER TABLE `materiasprimas`
  ADD CONSTRAINT `materiasprimas_ibfk_1` FOREIGN KEY (`proveedor_preferido_id`) REFERENCES `proveedores` (`proveedor_id`);

--
-- Filtros para la tabla `movimientosinventario`
--
ALTER TABLE `movimientosinventario`
  ADD CONSTRAINT `movimientosinventario_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materiasprimas` (`materia_id`);

--
-- Filtros para la tabla `producciondiaria`
--
ALTER TABLE `producciondiaria`
  ADD CONSTRAINT `producciondiaria_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`);

--
-- Filtros para la tabla `producto_recursos`
--
ALTER TABLE `producto_recursos`
  ADD CONSTRAINT `producto_recursos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_recursos_ibfk_2` FOREIGN KEY (`recurso_nombre`) REFERENCES `recursos_produccion` (`nombre`) ON DELETE CASCADE;

--
-- Filtros para la tabla `promociones`
--
ALTER TABLE `promociones`
  ADD CONSTRAINT `promociones_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`);

--
-- Filtros para la tabla `recetadetalle`
--
ALTER TABLE `recetadetalle`
  ADD CONSTRAINT `recetadetalle_ibfk_1` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`receta_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recetadetalle_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `materiasprimas` (`materia_id`);

--
-- Filtros para la tabla `recetas`
--
ALTER TABLE `recetas`
  ADD CONSTRAINT `recetas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`);

--
-- Filtros para la tabla `ventadetalle`
--
ALTER TABLE `ventadetalle`
  ADD CONSTRAINT `ventadetalle_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`venta_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ventadetalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`);

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`cliente_id`),
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`promocion_id`) REFERENCES `promociones` (`promocion_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
