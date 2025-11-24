import React, { useEffect, useState, useCallback, useRef } from "react";
import { Chart } from "chart.js/auto";
import {
  getDashboardDiario,
  getStockActual,
  getProductosRentables,
  getClientesFrecuentes,
  getPromocionesActivas,
  getVentasPorCategoria,
} from "../API/Admin/Dashboard";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [stock, setStock] = useState({ resumen: {}, materias: [] });
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [ventasCategoria, setVentasCategoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartRefs = useRef({});

  // CARGAR TODOS LOS DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          dashData,
          stockData,
          prodData,
          clientData,
          promoData,
          ventasData,
        ] = await Promise.all([
          getDashboardDiario(),
          getStockActual(),
          getProductosRentables(),
          getClientesFrecuentes(),
          getPromocionesActivas(),
          getVentasPorCategoria(),
        ]);

        setDashboard(dashData);
        setStock(stockData);
        setProductos(prodData);
        setClientes(clientData);
        setPromociones(promoData);
        setVentasCategoria(ventasData);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError(err.message || "Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // ← Aquí estaba el error: tenía un { extra antes

  // CREAR GRÁFICOS
  const initializeCharts = useCallback(() => {
    Object.values(chartRefs.current).forEach((chart) => chart?.destroy());
    chartRefs.current = {};

    // 1. Top productos rentables
    const prodCtx = document.getElementById("productosChart");
    if (prodCtx && productos.length > 0) {
      chartRefs.current.productosChart = new Chart(prodCtx, {
        type: "bar",
        data: {
          labels: productos
            .slice(0, 6)
            .map((p) => (p.nombre.length > 18 ? p.nombre.substring(0, 15) + "..." : p.nombre)),
          datasets: [
            {
              label: "Ingresos (Bs)",
              data: productos.slice(0, 6).map((p) => p.ingresos_generados || 0),
              backgroundColor: "#4CAF50",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: "#fff" } } },
          scales: {
            y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
            x: { ticks: { color: "#fff" } },
          },
        },
      });
    }

    // 2. Ventas por categoría
    const ventasCtx = document.getElementById("ventasChart");
    if (ventasCtx && ventasCategoria.length > 0) {
      chartRefs.current.ventasChart = new Chart(ventasCtx, {
        type: "doughnut",
        data: {
          labels: ventasCategoria.map((v) => v.categoria),
          datasets: [
            {
              data: ventasCategoria.map((v) => v.ingresos_bs),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { color: "#fff" } } },
        },
      });
    }

    // 3. Stock crítico o bajo
    const criticos = stock.materias?.filter(
      (m) => m.estado_stock === "CRITICO" || m.estado_stock === "BAJO"
    ) || [];

    const stockCtx = document.getElementById("stockChart");
    if (stockCtx && criticos.length > 0) {
      chartRefs.current.stockChart = new Chart(stockCtx, {
        type: "bar",
        data: {
          labels: criticos.slice(0, 8).map((s) =>
            s.nombre.length > 20 ? s.nombre.substring(0, 17) + "..." : s.nombre
          ),
          datasets: [
            { label: "Stock Actual", data: criticos.slice(0, 8).map((s) => s.stock_actual), backgroundColor: "#E91E63" },
            { label: "Stock Mínimo", data: criticos.slice(0, 8).map((s) => s.stock_minimo), backgroundColor: "#FF9800" },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: "#fff" } } },
          scales: {
            y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
            x: { ticks: { color: "#fff" } },
          },
        },
      });
    }
  }, [productos, ventasCategoria, stock]);

  // Dibujar gráficos cuando termine de cargar
  useEffect(() => {
    if (!loading && !error) {
      initializeCharts();
    }
    return () => {
      Object.values(chartRefs.current).forEach((chart) => chart?.destroy());
      chartRefs.current = {};
    };
  }, [loading, error, initializeCharts]);

  if (loading) return <div className="loading">Cargando dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proyectos-container">
      <header className="proyectos-header">
        <h1 style={{ padding: 15, color: "#fff" }}>Dashboard – Pastelería Michellin</h1>
      </header>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="stats-container">
        <div className="stat-card stat-total">
          <h4>Ventas del Día</h4>
          <p>{dashboard?.resumen?.ventas_total?.toLocaleString("es-BO") || 0} Bs</p>
          <small>Total facturado hoy</small>
        </div>
        <div className="stat-card stat-completed">
          <h4>Ganancia Bruta</h4>
          <p>{dashboard?.resumen?.ganancia_bruta?.toLocaleString("es-BO") || 0} Bs</p>
          <small>Margen {dashboard?.resumen?.margen_porcentual || 0}%</small>
        </div>
        <div className="stat-card stat-pending">
          <h4>Stock Crítico</h4>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#FF5722" }}>
            {stock.resumen?.en_critico || 0}
          </p>
          <small>Materias en rojo</small>
        </div>
        <div className="stat-card stat-overdue">
          <h4>Promociones Activas</h4>
          <p style={{ fontSize: "2rem" }}>{promociones.length}</p>
          <small>Vigentes</small>
        </div>
      </div>

      <div className="admin-grid">
        {/* TOP PRODUCTOS */}
        <div className="span-2">
          <div className="chart-widget" style={{ background: "rgba(76, 175, 80, 0.15)" }}>
            <h3 className="chart-title">Top 6 Productos Más Rentables</h3>
            <div className="chart-canvas-wrapper">
              <canvas id="productosChart"></canvas>
            </div>
          </div>
        </div>

        {/* VENTAS POR CATEGORÍA */}
        <div className="span-2">
          <div className="chart-widget" style={{ background: "rgba(33, 150, 243, 0.15)" }}>
            <h3 className="chart-title">Ventas por Categoría (30 días)</h3>
            <div className="chart-canvas-wrapper">
              <canvas id="ventasChart"></canvas>
            </div>
          </div>
        </div>

        {/* STOCK CRÍTICO */}
        <div className="span-4 large-chart">
          <div className="chart-widget" style={{ background: "rgba(244, 67, 54, 0.15)" }}>
            <h3 className="chart-title">Materias Primas en Stock Crítico o Bajo</h3>
            <div className="chart-canvas-wrapper">
              <canvas id="stockChart"></canvas>
              {stock.resumen?.en_critico === 0 && (
                <p style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>
                  ¡Excelente! Todo el stock está en nivel seguro
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CLIENTES FRECUENTES */}
        <div className="span-2">
          <div className="stat-widget" style={{ background: "rgba(156, 39, 176, 0.15)" }}>
            <h4>Clientes Frecuentes</h4>
            {clientes.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#fff" }}>
                {clientes.slice(0, 6).map((c, i) => (
                  <li key={i} style={{ padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <strong>{c.nombre}</strong>
                    <br />
                    <small>
                      {c.total_compras} compras • {Number(c.total_gastado_bs).toLocaleString("es-BO")} Bs
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#aaa" }}>No hay clientes registrados aún</p>
            )}
          </div>
        </div>

        {/* PROMOCIONES */}
        <div className="span-2">
          <div className="stat-widget" style={{ background: "rgba(255, 152, 0, 0.15)" }}>
            <h4>Promociones Activas</h4>
            {promociones.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#fff" }}>
                {promociones.map((p, i) => (
                  <li key={i} style={{ padding: "0.6rem 0" }}>
                    <strong>{p.nombre}</strong> ({p.tipo})
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#aaa", textAlign: "center", paddingTop: "2rem" }}>
                No hay promociones activas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;