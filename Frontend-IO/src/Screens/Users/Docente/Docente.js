import React, { useState, useEffect, useCallback } from "react";
import { getProyectoDocente } from "../../../API/Admin/Proyecto.js";
import { getAllModulos } from "../../../API/Admin/Modulo.js";
import { getAllAvances } from "../../../API/Admin/Avance_Estudiante.js";
import { getAllObservaciones, createObservacion } from "../../../API/Admin/Observacion.js";
import { getEstudiantes } from "../../../API/Admin/Estudiante_admin.js";

function Docente() {
  // Estados principales
  const [activeTab, setActiveTab] = useState('dashboard');
  const [docenteId] = useState(1);
  
  // Estados para datos
  const [proyectos, setProyectos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [avances, setAvances] = useState([]);
  const [observaciones, setObservaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  
  // Estados de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewObservationForm, setShowNewObservationForm] = useState(false);
  
  // Estados para formularios
  const [nuevaObservacion, setNuevaObservacion] = useState({
    id_estudiante: '',
    contenido: '',
    autor: 'Docente',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [proyectosData, modulosData, avancesData, observacionesData, estudiantesData] = await Promise.all([
        getProyectoDocente(docenteId),
        getAllModulos(),
        getAllAvances(),
        getAllObservaciones(),
        getEstudiantes()
      ]);
      
      setProyectos(proyectosData);
      setModulos(modulosData.filter(m => m.id_docente === docenteId));
      setAvances(avancesData);
      setObservaciones(observacionesData);
      setEstudiantes(estudiantesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [docenteId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleObservacionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createObservacion(nuevaObservacion);
      setNuevaObservacion({
        id_estudiante: '',
        contenido: '',
        autor: 'Docente',
        fecha: new Date().toISOString().split('T')[0]
      });
      setShowNewObservationForm(false);
      fetchAllData();
      alert('Observación creada exitosamente');
    } catch (err) {
      alert('Error al crear observación: ' + err.message);
    }
  };

  const avancesDeEstudiantes = avances.filter(avance => 
    modulos.some(modulo => modulo.id === avance.id_modulo)
  ).filter(avance => 
    !searchTerm || 
    `${avance.estudiante_nombres} ${avance.estudiante_apellidopat}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    avance.modulo_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const proyectosFiltrados = proyectos.filter(proyecto =>
    !searchTerm ||
    proyecto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${proyecto.estudiante_nombres} ${proyecto.estudiante_apellidopat}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modulosFiltrados = modulos.filter(modulo =>
    !searchTerm ||
    modulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modulo.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const observacionesFiltradas = observaciones.filter(obs =>
    !searchTerm ||
    `${obs.estudiante_nombres} ${obs.estudiante_apellidopat}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obs.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDashboard = () => {
    const stats = [
      {
        title: "Proyectos Asignados",
        value: proyectos.length,
        subtitle: "Como guía o revisor",
        color: "from-blue-500 to-blue-600",
        icon: "📚"
      },
      {
        title: "Módulos Activos",
        value: modulos.length,
        subtitle: "Módulos a tu cargo",
        color: "from-green-500 to-green-600",
        icon: "🎓"
      },
      {
        title: "Estudiantes",
        value: avancesDeEstudiantes.length,
        subtitle: "Con avances registrados",
        color: "from-purple-500 to-purple-600",
        icon: "👥"
      },
      {
        title: "Observaciones",
        value: observaciones.length,
        subtitle: "Total registradas",
        color: "from-orange-500 to-orange-600",
        icon: "📝"
      }
    ];

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl shadow-lg text-white`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold opacity-90">{stat.title}</h3>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-80">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold mb-4 text-white">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveTab('seguimiento')}
              className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-white transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Ver Avances</div>
            </button>
            <button 
              onClick={() => { setActiveTab('seguimiento'); setShowNewObservationForm(true); }}
              className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-white transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-medium">Nueva Observación</div>
            </button>
            <button 
              onClick={() => setActiveTab('proyectos')}
              className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg text-white transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">Revisar Proyectos</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4 text-white">Actividad Reciente</h3>
            <div className="space-y-3">
              {avancesDeEstudiantes.slice(0, 5).map((avance) => (
                <div key={avance.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{avance.estudiante_nombres} {avance.estudiante_apellidopat}</p>
                    <p className="text-gray-300 text-sm">{avance.modulo_nombre}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    avance.estado === 'completado' ? 'bg-green-500/20 text-green-300' :
                    avance.estado === 'en progreso' ? 'bg-yellow-500/20 text-yellow-300' : 
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {avance.estado}
                  </span>
                </div>
              ))}
              {avancesDeEstudiantes.length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay actividad reciente</p>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4 text-white">Próximas Defensas</h3>
            <div className="space-y-3">
              {proyectos.filter(p => p.fecha_defensa && new Date(p.fecha_defensa) > new Date()).slice(0, 5).map((proyecto) => (
                <div key={proyecto.id} className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">{proyecto.titulo}</p>
                  <p className="text-gray-300 text-sm">{proyecto.estudiante_nombres}</p>
                  <p className="text-blue-300 text-xs mt-1">{proyecto.fecha_defensa}</p>
                </div>
              ))}
              {proyectos.filter(p => p.fecha_defensa && new Date(p.fecha_defensa) > new Date()).length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay defensas programadas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProyectos = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-2xl font-bold text-white">Proyectos Asignados</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none w-full md:w-64"
          />
          <div className="text-sm text-gray-300">
            Total: {proyectosFiltrados.length}
          </div>
        </div>
      </div>
      
      {proyectosFiltrados.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-white mb-2">No hay proyectos asignados</h3>
          <p className="text-gray-400">Los proyectos aparecerán aquí cuando sean asignados</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {proyectosFiltrados.map((proyecto) => (
            <div key={proyecto.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-xl font-bold text-white pr-4">{proyecto.titulo}</h4>
                <div className="flex flex-col items-end space-y-2">
                  {proyecto.calificacion && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      proyecto.calificacion >= 80 ? 'bg-green-500/20 text-green-300' :
                      proyecto.calificacion >= 70 ? 'bg-yellow-500/20 text-yellow-300' : 
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {proyecto.calificacion}/100
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    proyecto.id_docente_guia === docenteId ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {proyecto.id_docente_guia === docenteId ? 'Docente Guía' : 'Docente Revisor'}
                  </span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">👤</span>
                    <span className="text-white">{proyecto.estudiante_nombres} {proyecto.estudiante_apellidopat}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">🎯</span>
                    <span className="text-gray-300">{proyecto.area_conocimiento}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">🔬</span>
                    <span className="text-gray-300">{proyecto.linea_investigacion}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-300">Entrega: {proyecto.fecha_entrega || 'No definida'}</span>
                  </div>
                  {proyecto.fecha_defensa && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">🎤</span>
                      <span className="text-gray-300">Defensa: {proyecto.fecha_defensa}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {proyecto.resumen && (
                <div className="mb-4">
                  <h5 className="font-semibold text-white mb-3">Resumen del Proyecto</h5>
                  <p className="text-gray-300 bg-white/5 p-4 rounded-lg leading-relaxed">{proyecto.resumen}</p>
                </div>
              )}
              
              {proyecto.observacion && (
                <div className="border-l-4 border-orange-500 bg-orange-500/10 p-4 rounded-r-lg">
                  <h5 className="font-semibold text-orange-300 mb-2">Observaciones</h5>
                  <p className="text-gray-300">{proyecto.observacion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModulos = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-2xl font-bold text-white">Módulos a Cargo</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar módulos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none w-full md:w-64"
          />
          <div className="text-sm text-gray-300">
            Total: {modulosFiltrados.length}
          </div>
        </div>
      </div>
      
      {modulosFiltrados.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold text-white mb-2">No hay módulos asignados</h3>
          <p className="text-gray-400">Los módulos aparecerán aquí cuando sean asignados</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulosFiltrados.map((modulo) => (
            <div key={modulo.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white">{modulo.nombre}</h4>
                  <p className="text-gray-400 font-mono text-sm">{modulo.codigo}</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                  {modulo.duracion}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">📚</span>
                  <span className="text-gray-300">{modulo.metodologia_nombre}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">📅</span>
                  <span className="text-gray-300">{modulo.fecha_inicio} - {modulo.fecha_finalizacion}</span>
                </div>
              </div>
              
              {modulo.descripcion && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm leading-relaxed">{modulo.descripcion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSeguimiento = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-2xl font-bold text-white">Seguimiento de Estudiantes</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar estudiantes o avances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none w-full md:w-64"
          />
          <button
            onClick={() => setShowNewObservationForm(!showNewObservationForm)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showNewObservationForm 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {showNewObservationForm ? '✕ Cancelar' : '➕ Nueva Observación'}
          </button>
        </div>
      </div>

      {/* Formulario Nueva Observación */}
      {showNewObservationForm && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h4 className="text-xl font-semibold text-white mb-4">Agregar Nueva Observación</h4>
          <form onSubmit={handleObservacionSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Estudiante</label>
                <select
                  value={nuevaObservacion.id_estudiante}
                  onChange={(e) => setNuevaObservacion({...nuevaObservacion, id_estudiante: e.target.value})}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {estudiantes.map((estudiante) => (
                    <option key={estudiante.id} value={estudiante.id} className="bg-gray-800">
                      {estudiante.nombres} {estudiante.apellidopat} {estudiante.apellidomat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Fecha</label>
                <input
                  type="date"
                  value={nuevaObservacion.fecha}
                  onChange={(e) => setNuevaObservacion({...nuevaObservacion, fecha: e.target.value})}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Observación</label>
              <textarea
                value={nuevaObservacion.contenido}
                onChange={(e) => setNuevaObservacion({...nuevaObservacion, contenido: e.target.value})}
                className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                rows="4"
                placeholder="Escriba su observación aquí..."
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Guardar Observación
              </button>
              <button
                type="button"
                onClick={() => setShowNewObservationForm(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Avances de estudiantes */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h4 className="text-xl font-semibold text-white mb-4">Avances de Estudiantes</h4>
        {avancesDeEstudiantes.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay avances registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white font-medium">Estudiante</th>
                  <th className="text-left py-3 px-4 text-white font-medium">Módulo</th>
                  <th className="text-left py-3 px-4 text-white font-medium">Estado</th>
                  <th className="text-left py-3 px-4 text-white font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {avancesDeEstudiantes.map((avance) => (
                  <tr key={avance.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-gray-300">
                      {avance.estudiante_nombres} {avance.estudiante_apellidopat}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{avance.modulo_nombre}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        avance.estado === 'completado' ? 'bg-green-500/20 text-green-300' :
                        avance.estado === 'en progreso' ? 'bg-yellow-500/20 text-yellow-300' : 
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {avance.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{avance.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Observaciones existentes */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h4 className="text-xl font-semibold text-white mb-4">Observaciones Recientes</h4>
        {observacionesFiltradas.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay observaciones registradas</p>
        ) : (
          <div className="space-y-4">
            {observacionesFiltradas.slice(0, 10).map((obs) => (
              <div key={obs.id} className="bg-white/5 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-semibold text-white">
                    {obs.estudiante_nombres} {obs.estudiante_apellidopat}
                  </h5>
                  <span className="text-sm text-gray-400">{obs.fecha}</span>
                </div>
                <p className="text-gray-300 mb-2">{obs.contenido}</p>
                <p className="text-xs text-gray-500">Por: {obs.autor}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-white/20 border-t-white mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <p className="text-white text-xl font-medium">Cargando panel del docente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error al cargar datos</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button 
            onClick={fetchAllData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex" style={{ color: 'white' }}>
		<div className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 p-6 flex flex-col gap-4">
			<div className="mb-8" style={{ textAlign: 'center' }}>
				<h1 className="text-2xl font-bold text-white" >Panel Docente</h1>
				<p className="text-sm text-gray-300">Bienvenido, Docente</p>
			</div>
			
			{[
			{ id: 'dashboard', label: 'Dashboard', icon: '📊' },
			{ id: 'proyectos', label: 'Proyectos', icon: '📋' },
			{ id: 'modulos', label: 'Módulos', icon: '🎓' },
			{ id: 'seguimiento', label: 'Seguimiento', icon: '👥' }
			].map((tab) => (
			<button
				key={tab.id}
				onClick={() => {
				setActiveTab(tab.id);
				setSearchTerm('');
				setShowNewObservationForm(false);
				}}
				className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-left ${
				activeTab === tab.id
					? 'bg-white text-gray-900 shadow-lg'
					: 'text-gray-300 hover:text-white hover:bg-white/10'
				}`}
			>
				<span className="text-lg">{tab.icon}</span>
				<span>{tab.label}</span>
			</button>
			))}

			<div className="mt-auto pt-8 border-t border-white/20">
				<button 
					onClick={fetchAllData}
					className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
				>
					<span>🔄</span>
					<span>Actualizar Datos</span>
				</button>
			</div>
		</div>

		<div className="flex-1 p-8 overflow-y-auto">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-white">
							{activeTab === 'dashboard' ? 'Dashboard' :
							activeTab === 'proyectos' ? 'Proyectos Asignados' :
							activeTab === 'modulos' ? 'Módulos a Cargo' :
							'Seguimiento de Estudiantes'}
						</h1>
						<p className="text-gray-300">Gestiona tus proyectos, módulos y seguimiento de estudiantes</p>
					</div>
					<button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200">
						Cerrar Sesión
					</button>
				</div>
			<div className="transition-all duration-300">
				{activeTab === 'dashboard' && renderDashboard()}
				{activeTab === 'proyectos' && renderProyectos()}
				{activeTab === 'modulos' && renderModulos()}
				{activeTab === 'seguimiento' && renderSeguimiento()}
			</div>
			</div>
		</div>
    </div>
  );
}

export default Docente;