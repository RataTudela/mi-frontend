import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/CssVistaUsuario.css";

export default function VistaUsuario() {
  const [cargas, setCargas] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // Estado para controlar qué checkbox está cargando
  
  const usuarioLocal = JSON.parse(localStorage.getItem("usuarioActual"));

  const confirmarTarea = async (idTarea, idCarga) => {
  try {
    setUpdatingId(idCarga);
    await axios.patch(`http://localhost:8081/api/usuarios/carga_trabajo/finalizar-tarea/${idTarea}/carga/${idCarga}`);
    
    console.log(`Solicitud de finalización enviada para la tarea ID: ${idTarea}`);

    setCargas(prevCargas => prevCargas.filter(item => item.id_carga !== idCarga));

  } catch (error) {
    console.error("Error al intentar finalizar la tarea:", error);
    alert("No se pudo completar la tarea. Inténtalo de nuevo.");
  } finally {
    setUpdatingId(null);
  }
};

  useEffect(() => {
    if (usuarioLocal && usuarioLocal.id_usuario) {
      fetchDatos(usuarioLocal.id_usuario);
    }
  }, []);

  const fetchDatos = async (id) => {
    try {
      const resCarga = await axios.get(`http://localhost:8081/api/usuarios/carga_trabajo/usuario/${id}`);
      setCargas(resCarga.data);
      const resDispo = await axios.get(`http://localhost:8081/api/usuarios/disponibilidad/${id}`);
      setDisponibilidad(resDispo.data);
    } catch (error) {
      console.error("Error al traer datos del servidor:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalHoras = cargas.reduce((acc, curr) => acc + curr.horas_asignadas, 0);
  const porcentajeCarga = Math.min((totalHoras / 40) * 100, 100);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-vista-usuario">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12">
            <div className="card-perfil p-4 shadow-sm border-0">
              <h2 className="fw-bold">Panel de {usuarioLocal?.nombre}</h2>
              <p className="text-muted m-0">
                <span className="badge bg-dark me-2">{usuarioLocal?.rol}</span> 
                ID Empleado: #{usuarioLocal?.id_usuario}
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card-stats p-4 shadow-sm text-center h-100">
              <h5 className="text-secondary fw-bold">Carga Semanal</h5>
              <div className="display-4 fw-bold text-primary">{totalHoras}h</div>
              <p className="small text-muted">Límite: 40h semanales</p>
              <div className="progress mt-2" style={{ height: "12px" }}>
                <div 
                  className={`progress-bar ${porcentajeCarga > 90 ? 'bg-danger' : 'bg-primary'}`} 
                  style={{ width: `${porcentajeCarga}%` }}
                ></div>
              </div>
              <p className="mt-2 fw-bold">{porcentajeCarga.toFixed(0)}% de ocupación</p>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card-tareas p-4 shadow-sm h-100">
              <h5 className="fw-bold mb-3 text-dark">Mis Tareas Asignadas</h5>
              {cargas.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Nombre de la Tarea</th>
                        <th className="text-center">Confirmación</th>                      
                        <th className="text-center">Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargas.map((item) => (
                        <tr key={item.id_carga}> 
                          <td>{item.nombreTarea}</td>
                          <td className="text-center">
                            <div className="form-check d-flex justify-content-center align-items-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`checkDefault-${item.id_carga}`}
                                disabled={updatingId === item.id_carga}
                                onChange={() => confirmarTarea(item.idTarea, item.id_carga)}
                              />
                              <label className="form-check-label ms-2" htmlFor={`checkDefault-${item.id_carga}`}>
                                {updatingId === item.id_carga ? 'Procesando...' : 'Confirmar'}
                              </label>
                            </div>
                          </td>
                          <td className="text-center font-monospace fw-bold">{item.horas_asignadas}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No tienes tareas registradas.</p>
                </div>
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="card-dispo p-4 shadow-sm border-start border-4 border-success bg-white">
              <h5 className="fw-bold mb-3">Historial de Disponibilidad / Ausencias</h5>
              {disponibilidad.length > 0 ? (
                <div className="row">
                  {disponibilidad.map((dispo) => (
                    <div key={dispo.id_disponibilidad} className="col-md-6 mb-2"> 
                      <div className="p-3 border rounded-3 bg-light">
                        <div className="d-flex justify-content-between">
                          <strong>Motivo: {dispo.motivo}</strong>
                        </div>
                        <hr className="my-2" />
                        <small className="text-muted d-block">
                          Inicio: {dispo.fechaInicio}
                        </small>
                        <small className="text-muted d-block">
                          Fin: {dispo.fechaFin}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted m-0">No hay registros de disponibilidad.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}