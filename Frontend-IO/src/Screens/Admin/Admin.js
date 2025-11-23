import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Chart } from 'chart.js/auto';
import { getDocentes } from "../../API/Admin/Docente_admin";
import { getEstudiantes } from "../../API/Admin/Estudiante_admin";
import { getAllTalleres } from "../../API/Admin/Taller.js";
import { getUserCount } from "../../API/Admin/Users_Admin.js";
import { getAllMetodologias } from "../../API/Admin/Metodologia.js";
import { getAllModulos } from "../../API/Admin/Modulo.js";

function Admin() {
  const [docentes, setDocentes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [metodologias, setMetodologias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [docentesData, estudiantesData, modulosData, talleresData, usersCount, metodologiasData] = await Promise.all([
        getDocentes(),
        getEstudiantes(),
        getAllModulos(),
        getAllTalleres(),
        getUserCount(),
        getAllMetodologias()
      ]);

      setDocentes(docentesData);
      setEstudiantes(estudiantesData);
      setModulos(modulosData);
      setTalleres(talleresData.data || []);
      setUserCount(usersCount);
      setMetodologias(metodologiasData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const initializeCharts = useCallback(() => {
    if (loading) return;

    ['userDistribution', 'talleresChart', 'metodologiasChart'].forEach(id => {
      const chart = Chart.getChart(id);
      if (chart) {
        chart.destroy();
      }
    });

    const talleresArray = Array.isArray(talleres) ? talleres : [];

    const userCtx = document.getElementById('userDistribution');
    if (userCtx) {
      new Chart(userCtx, {
        type: 'doughnut',
        data: {
          labels: ['Estudiantes', 'Docentes'],
          datasets: [{
            data: [estudiantes.length, docentes.length],
            backgroundColor: ['#4CAF50', '#2196F3']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { 
                color: '#fff',
                padding: 10
              }
            }
          }
        }
      });
    }

    const talleresCtx = document.getElementById('talleresChart');
    if (talleresCtx) {
      const tipos = ['Teórico', 'Práctico', 'Mixto'];
      const data = tipos.map(tipo => talleresArray.filter(t => t.tipo_taller === tipo).length);

      new Chart(talleresCtx, {
        type: 'bar',
        data: {
          labels: tipos,
          datasets: [{
            label: 'Número de Talleres',
            data: data,
            backgroundColor: ['#FFA726', '#66BB6A', '#42A5F5'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#fff' }
            },
            tooltip: {
              callbacks: {
                afterBody: function(tooltipItems) {
                  const idx = tooltipItems[0].dataIndex;
                  const tipo = tipos[idx];
                  const filtered = talleresArray.filter(t => t.tipo_taller === tipo);
                  return filtered.map(t => 
                    `\n- Título: ${t.titulo || t.nombre || '-'} \n  ID Metodología: ${t.id_metodologia || '-'} \n  Evaluación: ${t.evaluacion_final || '-'} \n  Duración: ${t.duracion || '-'} \n  Resultado: ${t.resultado || '-'} \n  Fecha: ${t.fecha_realizacion ? new Date(t.fecha_realizacion).toLocaleDateString() : '-'}` 
                  ).join('\n');
                }
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              ticks: { color: '#fff' }
            },
            x: { 
              ticks: { color: '#fff' }
            }
          }
        }
      });
    }

    const metodologiasCtx = document.getElementById('metodologiasChart');
    if (metodologiasCtx) {
      new Chart(metodologiasCtx, {
        type: 'bar',
        data: {
          labels: metodologias.map(m => m.nombre),
          datasets: [{
            label: 'Número de Metodologías',
            data: metodologias.map(m => m.numero_modulos),
            backgroundColor: '#7d0f0fff',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#fff' }
            },
            tooltip: {
              callbacks: {
                afterBody: function(tooltipItems) {
                  const idx = tooltipItems[0].dataIndex;
                  const metodologia = metodologias[idx];
                  return [
                    `Descripción: ${metodologia.descripcion}`,
                    `Objetivos: ${metodologia.objetivos}`,
                    `Inicio: ${new Date(metodologia.fecha_inicio).toLocaleDateString()}`,
                    `Fin: ${new Date(metodologia.fecha_finalizacion).toLocaleDateString()}`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#fff' }
            },
            x: {
              ticks: { color: '#fff' }
            }
          }
        }
      });
    }
  }, [loading, estudiantes.length, docentes.length, talleres, metodologias]);

  useEffect(() => {
    if (!loading) {
      initializeCharts();
    }
    return () => {
      ['userDistribution', 'talleresChart', 'metodologiasChart'].forEach(id => {
        const chart = Chart.getChart(id);
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, [initializeCharts, loading]);

  const StatWidget = useMemo(() => ({ title, value, description, bgColor }) => (
    <div className="stat-widget" style={{ background: bgColor }}>
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
      <p className="stat-desc">{description}</p>
    </div>
  ), []);

  const ChartWidget = useMemo(() => ({ title, id, bgColor, customHeight, customWidth }) => (
    <div className="chart-widget" style={{ background: bgColor, width: customWidth || undefined, height: customHeight || undefined }}>
      <h3 className="chart-title">{title}</h3>
      <div className="chart-canvas-wrapper">
        <canvas id={id} className="chart-canvas" />
      </div>
    </div>
  ), []);

  const renderGrid = useMemo(() => (
    <div className="admin-grid">
      <StatWidget
        title="Usuarios"
        value={userCount}
        description="Total de usuarios registrados"
        bgColor="rgba(4, 22, 70, 0.55)"
      />
      <StatWidget
        title="Estudiantes"
        value={estudiantes.length}
        description="Estudiantes activos"
        bgColor="rgba(4, 22, 70, 0.55)"
      />
      <StatWidget
        title="Docentes"
        value={docentes.length}
        description="Docentes registrados"
        bgColor="rgba(4, 22, 70, 0.55)"
      />
      <StatWidget
        title="Módulos"
        value={modulos.length}
        description="Módulos activos"
        bgColor="rgba(4, 22, 70, 0.55)"
      />

      <div className="span-2">
        <ChartWidget
          title="Distribución de Usuarios"
          id="userDistribution"
          bgColor="rgba(41, 98, 255, 0.2)"
        />
      </div>
      <div className="span-2">
        <ChartWidget
          title="Distribución de Talleres por Tipo"
          id="talleresChart"
          bgColor="rgba(255, 152, 0, 0.2)"
        />
      </div>
      <div className="span-4 large-chart">
        <ChartWidget
          title="Metodologías"
          id="metodologiasChart"
          bgColor="rgba(153, 0, 8, 0.36)"
          customHeight="450px"
          customWidth="96%"
        />
      </div>
    </div>
  ), [userCount, estudiantes.length, docentes.length, modulos.length]);

  return (
    <div className="admin-page bg-gray-900 min-h-screen p-4">
      <h1 className="admin-title">
        Panel de Administración
      </h1>

      {error && (
        <div className="admin-error">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          Cargando...
        </div>
      ) : renderGrid}
    </div>
  );
}

export default React.memo(Admin);
