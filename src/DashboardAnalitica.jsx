import React, { useEffect, useState } from "react";
import axios from "axios";

// La URL apunta al Gateway (8081) y el prefijo /api/analisis
const API_ANALISIS = "http://localhost:8081/api/analisis";

export default function DashboardAnalitica() {
  // 1. Ajuste del estado inicial (usando reportes_recientes)
  const [datos, setDatos] = useState({ kpis: [], metricas: [], reportes_recientes: [] });
  const [cargando, setCargando] = useState(true);

  // Función para obtener la data consolidada
  const cargarDashboard = async () => {
    try {
      setCargando(true);
      const res = await axios.get(`${API_ANALISIS}/dashboard`);
      setDatos(res.data);
    } catch (error) {
      console.error("Error al conectar con el microservicio de analítica:", error);
    } finally {
      setCargando(false);
    }
  };

  // 2. Modificación de la función de sincronización para enviar JSON al Backend
  const ejecutarSincronizacion = async () => {
    try {
      setCargando(true);
      
      // Datos que "vienen del frontend" (puedes reemplazarlos por una llamada al MS de Proyectos después)
      const datosProyectosParaEnviar = [
        { id_proyecto: 1, tareas_completadas: 2, tareas_totales: 10 },
        { id_proyecto: 5, tareas_completadas: 8, tareas_totales: 10 },
        { id_proyecto: 10, tareas_completadas: 3, tareas_totales: 12 }
      ];

      // Enviamos el array directamente en el cuerpo del POST
      await axios.post(`${API_ANALISIS}/reportes/periodico`, datosProyectosParaEnviar);
      
      alert("Analítica actualizada: Se han recalculado las métricas con datos del sistema.");
      
      // Recargamos el dashboard para ver los nuevos resultados
      await cargarDashboard();
    } catch (error) {
      console.error("Error al sincronizar:", error);
      alert("Error al enviar datos de origen al microservicio de analítica.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  if (cargando) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
      <span className="ms-2">Cargando Analítica de InnovaTech...</span>
    </div>
  );

  return (
    <div className="container py-4">
      {/* Cabecera del Módulo */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h3 className="fw-bold text-dark m-0">Panel de Monitoreo</h3>
          <p className="text-muted small">Visualización de KPIs y rendimiento de proyectos</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-success shadow-sm fw-bold" onClick={ejecutarSincronizacion}>
            🔄 Sincronizar Datos
          </button>
        </div>
      </div>

      {/* Sección 1: KPIs Principales */}
      <div className="row g-3 mb-4">
        {datos.kpis.map((kpi) => (
          <div className="col-md-4" key={kpi.id_kpi}>
            <div className="card border-0 shadow-sm rounded-3 h-100 border-start border-4 border-info">
              <div className="card-body">
                <h6 className="text-muted text-uppercase small fw-bold">{kpi.nombre}</h6>
                <h2 className="fw-bold text-dark">{kpi.valor}%</h2>
                <p className="small text-muted mb-0">{kpi.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Sección 2: Métricas de Avance de Proyectos */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">Rendimiento por Proyecto</h5>
            </div>
            <div className="card-body">
              {datos.metricas.length > 0 ? datos.metricas.map((m) => (
                <div key={m.id_metrica} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Proyecto #{m.id_proyecto}</span>
                    <span className={`badge ${m.porcentaje_avance < 40 ? 'bg-danger' : 'bg-primary'}`}>
                      {m.porcentaje_avance.toFixed(1)}% Completo
                    </span>
                  </div>
                  <div className="progress" style={{ height: "12px" }}>
                    <div 
                      className={`progress-bar progress-bar-striped progress-bar-animated ${m.porcentaje_avance < 40 ? 'bg-danger' : 'bg-success'}`} 
                      role="progressbar" 
                      style={{ width: `${m.porcentaje_avance}%` }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">Tareas: {m.tareas_completadas} / {m.tareas_totales}</small>
                    <small className="text-muted">Último cálculo: {new Date(m.fecha_calculo).toLocaleDateString()}</small>
                  </div>
                </div>
              )) : <p className="text-center text-muted">No hay métricas calculadas aún.</p>}
            </div>
          </div>
        </div>

        {/* Sección 3: Reportes de Estado Generales */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white">
            <div className="card-header border-secondary py-3">
              <h5 className="fw-bold mb-0">Últimos Reportes</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {/* AJUSTE AQUÍ: Mapeo de reportes_recientes */}
                {datos.reportes_recientes && datos.reportes_recientes.map((rep) => (
                  <div key={rep.id_reporte} className="list-group-item bg-dark text-white border-secondary p-3">
                    <div className="d-flex justify-content-between">
                      <small className="text-info fw-bold">{new Date(rep.fecha_generacion).toLocaleDateString()}</small>
                      <span className={`badge ${rep.estado_general === 'Estable' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {rep.estado_general}
                      </span>
                    </div>
                    <p className="small mt-2 mb-0">{rep.resumen}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}