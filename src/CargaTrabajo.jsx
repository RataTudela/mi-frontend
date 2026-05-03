import React, { useEffect, useState } from "react";
import axios from "axios";

const API_CARGA = "http://localhost:8081/api/usuarios/carga_trabajo";

export default function CargaTrabajo({ usuarioId, nombreUsuario, alCerrar }) {
  const [cargas, setCargas] = useState([]);
  const [totalHoras, setTotalHoras] = useState(0);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${API_CARGA}/usuario/${usuarioId}`);
      setCargas(res.data);
      const suma = res.data.reduce((acc, curr) => acc + curr.horas_asignadas, 0);
      setTotalHoras(suma);
    } catch (e) { 
      console.error("Error al sincronizar con el microservicio de proyectos", e); 
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [usuarioId]);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1070 }} onClick={alCerrar}>
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-dark text-white border-0 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <span className="me-2">📊</span> 
              Carga Actual: <span className="text-info ms-2">{nombreUsuario}</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={alCerrar}></button>
          </div>
          
          <div className="modal-body p-4">
            <div className="card border-0 bg-light mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-muted text-uppercase small">Capacidad Semanal Ocupada</span>
                  <span className={`fw-bold ${totalHoras > 40 ? 'text-danger' : 'text-primary'}`}>
                    {totalHoras} / 40 hrs
                  </span>
                </div>
                <div className="progress" style={{ height: "12px" }}>
                  <div 
                    className={`progress-bar progress-bar-striped progress-bar-animated ${totalHoras > 40 ? 'bg-danger' : 'bg-success'}`} 
                    style={{ width: `${Math.min((totalHoras / 40) * 100, 100)}%` }}
                  ></div>
                </div>
                {totalHoras > 40 && (
                  <small className="text-danger fw-bold mt-2 d-block">
                    Supera el límite legal de 40h.
                  </small>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold m-0 text-secondary text-uppercase" style={{fontSize: '0.8rem'}}>Tareas asignadas desde Proyectos</h6>
              <button className="btn btn-sm btn-outline-primary" onClick={cargarDatos} disabled={cargando}>
                {cargando ? "Sincronizando..." : "🔄 Sincronizar Ahora"}
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle border">
                <thead className="table-light">
                  <tr className="small text-muted">
                    <th>PROYECTO / PERIODO</th>
                    <th className="text-center">HORAS ASIGNADAS</th>
                    <th className="text-end pe-3">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {cargas.length > 0 ? (
                    cargas.map(c => (
                      <tr key={c.id_carga}>
                        <td className="fw-bold text-dark ps-3">{c.periodo}</td>
                        <td className="text-center font-monospace">{c.horas_asignadas} h</td>
                        <td className="text-end pe-3">
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            Vigente
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-5 text-muted">
                        <div className="mb-2" style={{fontSize: '2rem'}}>📋</div>
                        Sin tareas asignadas en este periodo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer bg-light border-0">
            <button className="btn btn-secondary px-4 fw-bold" onClick={alCerrar}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}