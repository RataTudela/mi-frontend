import React, { useEffect, useState } from "react";
import axios from "axios"; // Importación limpia y estándar de Axios

// Configuración de URLs a través del Gateway (puerto 8081)
const API_ANALISIS = "http://localhost:8081/api/analisis";
const API_PROYECTOS = "http://localhost:8081/api/proyectos/proyecto";

export default function DashboardAnalitica() {
  // 1. Estado inicial consolidado
  const [datos, setDatos] = useState({ kpis: [], metricas: [], reportes_recientes: [] });
  const [cargando, setCargando] = useState(true);

  // Función para obtener la data consolidada desde el microservicio de Analítica
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

  /**
   * Función de sincronización: 
   * 1. Obtiene datos reales desde el MS de Proyectos (Java)
   * 2. Aplica Traductor de Seguridad para normalizar diferencias de nombrado (camelCase vs snake_case)
   * 3. Envía esos datos normalizados al MS de Analítica (Python) para procesar de forma segura
   */
  const ejecutarSincronizacion = async () => {
    try {
      setCargando(true);
      
      // PASO 1: Obtener los datos reales desde el MS de Proyectos (Java)
      const resProyectos = await axios.get(`${API_PROYECTOS}/resumen-tareas`);
      const datosOriginales = resProyectos.data; 

      // 🔍 RASTREADOR DE DIAGNÓSTICO
      console.log("--- DATOS CRUDOS DE JAVA (PROYECTOS) ---");
      console.log(datosOriginales);

      if (!datosOriginales || datosOriginales.length === 0) {
        alert("No hay proyectos con tareas para sincronizar.");
        setCargando(false);
        return;
      }

      // TRADUCTOR DE SEGURIDAD AUTOMÁTICO (Sin valores harcodeados)
      const datosNormalizados = datosOriginales.map(p => ({
        id_proyecto: p.id_proyecto || p.idProyecto,
        // Si Java envía el dato lo toma, si viene undefined o null asegura un 0
        tareas_completadas: Number(p.tareas_completadas ?? p.tareasCompletadas ?? 0),
        tareas_totales: Number(p.tareas_totales ?? p.tareasTotales ?? 0)
      }));

      // PASO 2: Enviar los datos ya normalizados y limpios a tu microservicio de Analítica (Python)
      await axios.post(`${API_ANALISIS}/reportes/periodico`, datosNormalizados);
      
      alert(`Sincronización Exitosa: Se procesaron ${datosNormalizados.length} proyectos con datos reales.`);
      
      // PASO 3: Recargar el dashboard para visualizar las métricas actualizadas
      await cargarDashboard();
    } catch (error) {
      console.error("Error al sincronizar:", error);
      alert("Error en la comunicación entre microservicios. Verifica que el Gateway y los servicios estén activos.");
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
      <span className="ms-2">Sincronizando Analítica de InnovaTech...</span>
    </div>
  );

  return (
    <div className="container py-4">
      {/* Cabecera del Módulo */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h3 className="fw-bold text-dark m-0">Panel de Monitoreo</h3>
          <p className="text-muted small">Visualización de KPIs y rendimiento real de proyectos</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-success shadow-sm fw-bold" onClick={ejecutarSincronizacion}>
            🔄 Sincronizar Datos Reales
          </button>
        </div>
      </div>

      {/* Sección 1: KPIs Principales */}
      <div className="row g-3 mb-4">
        {datos.kpis.length > 0 ? datos.kpis.map((kpi) => (
          <div className="col-md-4" key={kpi.id_kpi}>
            <div className="card border-0 shadow-sm rounded-3 h-100 border-start border-4 border-info">
              <div className="card-body">
                <h6 className="text-muted text-uppercase small fw-bold">{kpi.nombre}</h6>
                <h2 className="fw-bold text-dark">{kpi.valor}%</h2>
                <p className="small text-muted mb-0">{kpi.descripcion}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-12">
            <div className="alert alert-light border shadow-sm small text-muted">
              Haz clic en "Sincronizar" para generar los indicadores de rendimiento.
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Sección 2: Rendimiento por Proyecto */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">Rendimiento por Proyecto</h5>
            </div>
            <div className="card-body">
              {datos.metricas.length > 0 ? datos.metricas.map((m) => (
                <div key={m.id_metrica} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">ID Proyecto: {m.id_proyecto}</span>
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
                    <div className="small text-muted">Tareas: {m.tareas_completadas} / {m.tareas_totales}</div>
                    <small className="text-muted">
                      Cálculo: {m.fecha_calculo ? new Date(m.fecha_calculo).toLocaleDateString() : 'Reciente'}
                    </small>
                  </div>
                </div>
              )) : <p className="text-center text-muted py-4">No hay métricas calculadas. Presiona sincronizar.</p>}
            </div>
          </div>
        </div>

        {/* Sección 3: Últimos Reportes */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white">
            <div className="card-header border-secondary py-3">
              <h5 className="fw-bold mb-0">Últimos Reportes</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {datos.reportes_recientes && datos.reportes_recientes.length > 0 ? (
                  datos.reportes_recientes.slice(0, 5).map((rep) => (
                    <div key={rep.id_reporte} className="list-group-item bg-dark text-white border-secondary p-3">
                      <div className="d-flex justify-content-between">
                        <small className="text-info fw-bold">
                          {new Date(rep.fecha_generacion).toLocaleDateString()}
                        </small>
                        <span className={`badge ${rep.estado_general === 'Estable' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {rep.estado_general}
                        </span>
                      </div>
                      <p className="small mt-2 mb-0">{rep.resumen}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted small">Sin historial de sincronización.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}