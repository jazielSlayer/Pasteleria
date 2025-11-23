-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-11-2025 a las 14:54:52
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
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `cliente_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `compradetalle`
--
ALTER TABLE `compradetalle`
  MODIFY `detalle_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `compra_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `materiasprimas`
--
ALTER TABLE `materiasprimas`
  MODIFY `materia_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientosinventario`
--
ALTER TABLE `movimientosinventario`
  MODIFY `movimiento_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producciondiaria`
--
ALTER TABLE `producciondiaria`
  MODIFY `produccion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `producto_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `promociones`
--
ALTER TABLE `promociones`
  MODIFY `promocion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `proveedor_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `recetadetalle`
--
ALTER TABLE `recetadetalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `recetas`
--
ALTER TABLE `recetas`
  MODIFY `receta_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ventadetalle`
--
ALTER TABLE `ventadetalle`
  MODIFY `detalle_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `venta_id` int(11) NOT NULL AUTO_INCREMENT;

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
