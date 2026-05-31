import React, { useEffect, useState } from "react";
import axios from "axios";

const API_CARGA = "http://localhost:8081/api/usuarios/carga_trabajo";
const API_PROYECTOS = "http://localhost:8081/api/proyectos"; 

export default function CargaTrabajo({ usuarioId, nombreUsuario, estadoUsuario, alCerrar }) {
  const [cargas, setCargas] = useState([]);
  const [tareasReales, setTareasReales] = useState([]); 
  const [totalHoras, setTotalHoras] = useState(0);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idTareaSeleccionada, setIdTareaSeleccionada] = useState("");

  const [form, setForm] = useState({
    nombreTarea: "", 
    horas_asignadas: 0,
    idTarea: null,
    usuario: { id_usuario: usuarioId }
  });

  const cargarDatos = async () => {
    try {
      const resCarga = await axios.get(`${API_CARGA}/usuario/${usuarioId}`);
      setCargas(resCarga.data);
      setTotalHoras(resCarga.data.reduce((acc, curr) => acc + curr.horas_asignadas, 0));
      const resTareas = await axios.get(`${API_PROYECTOS}/tareas`);
      setTareasReales(resTareas.data);
    } catch (e) { 
      console.error("Error cargando datos integrados:", e); 
    }
  };

  useEffect(() => { cargarDatos(); }, [usuarioId]);

  const manejarSeleccion = (e) => {
    const id = e.target.value;
    setIdTareaSeleccionada(id);
    const tarea = tareasReales.find(t => t.idTarea === parseInt(id));
    if (tarea) {
      setForm({ 
        ...form, 
        nombreTarea: `[${tarea.proyecto.nombre}] ${tarea.nombre}`, 
        horas_asignadas: tarea.horasAproximadas || 0,
        idTarea: tarea.idTarea
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const estadoLimpio = estadoUsuario ? estadoUsuario.toString().trim().toLowerCase() : "";

    if (estadoLimpio === "inactivo") {
      alert(`El profesional ${nombreUsuario} está INACTIVO y no puede recibir tareas.`);
      return; 
    }
    setLoading(true);

    const horasPrevias = editandoId ? cargas.find(c => c.id_carga === editandoId).horas_asignadas : 0;
    if ((totalHoras - horasPrevias) + parseInt(form.horas_asignadas) > 40) {
      alert("Esta asignación supera el límite de 40 horas semanales.");
      setLoading(false);
      return;
    }

    try {
      if (editandoId) {
        await axios.put(`${API_CARGA}/${editandoId}`, form);
      } else {
        await axios.post(API_CARGA, form);
        if (idTareaSeleccionada) {
          const dataAsignacion = {
            tarea: { idTarea: parseInt(idTareaSeleccionada) },
            idUsuario: usuarioId, 
            fechaAsignacion: new Date().toISOString().split('T')[0], 
            horasAproximadas: parseInt(form.horas_asignadas)
          };
          await axios.post(`${API_PROYECTOS}/asignacion`, dataAsignacion);
        }
      }
      alert("Asignación exitosa.");
      cancelarEdicion();
      cargarDatos();
    } catch (e) { 
      console.error(e);
      alert("Error al procesar la asignación."); 
    } finally {
      setLoading(false);
    }
  };

  const prepararEdicion = (c) => {
    setEditandoId(c.id_carga);
    setForm({
      nombreTarea: c.nombreTarea, 
      horas_asignadas: c.horas_asignadas,
      idTarea: c.idTarea,
      usuario: { id_usuario: usuarioId }
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setIdTareaSeleccionada("");
    setForm({ nombreTarea: "", horas_asignadas: 0, idTarea: null, usuario: { id_usuario: usuarioId } });
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1070 }} onClick={alCerrar}>
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title fw-bold">📊 Gestión de Carga: {nombreUsuario}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={alCerrar}></button>
          </div>
          <div className="modal-body p-4">
            <div className="mb-4">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span>OCUPACIÓN ACTUAL</span>
                <span className={totalHoras > 40 ? 'text-danger' : ''}>{totalHoras} / 40 hrs</span>
              </div>
              <div className="progress" style={{ height: "12px" }}>
                <div className={`progress-bar progress-bar-striped progress-bar-animated ${totalHoras > 35 ? 'bg-danger' : 'bg-success'}`} 
                     style={{ width: `${Math.min((totalHoras/40)*100, 100)}%` }}></div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className={`row g-2 mb-4 p-3 rounded-3 border ${editandoId ? 'bg-warning-subtle border-warning' : 'bg-light'}`}>
              <div className="col-md-7">
                <label className="small fw-bold text-muted text-uppercase">Tarea del Sistema de Proyectos</label>
                {editandoId ? (
                  <input type="text" className="form-control shadow-sm bg-white" value={form.nombreTarea} readOnly />
                ) : (
                  <select className="form-select shadow-sm" onChange={manejarSeleccion} value={idTareaSeleccionada} required>
                    <option value="">-- Vincular Tarea de Proyecto --</option>
                    {tareasReales.map(t => (
                      <option key={t.idTarea} value={t.idTarea}>
                        {t.proyecto.nombre} - {t.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="col-md-2 text-center">
                <label className="small fw-bold text-muted text-uppercase">Hrs</label>
                <input type="number" className="form-control shadow-sm text-center" 
                       value={form.horas_asignadas} 
                       onChange={e => setForm({...form, horas_asignadas: e.target.value})} 
                       required min="1" />
              </div>
              <div className="col-md-3 d-flex align-items-end gap-2">
                <button type="submit" disabled={loading} className={`btn ${editandoId ? 'btn-warning' : 'btn-success'} fw-bold w-100`}>
                  {loading ? "..." : (editandoId ? 'Actualizar' : 'Asignar')}
                </button>
                {editandoId && <button type="button" className="btn btn-outline-secondary" onClick={cancelarEdicion}>X</button>}
              </div>
            </form>
            <div className="table-responsive">
              <table className="table table-hover align-middle border">
                <thead className="table-dark small">
                  <tr>
                    <th>PROYECTO / TAREA ASIGNADA</th>
                    <th className="text-center">HORAS</th>
                    <th className="text-end pe-3">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {cargas.length > 0 ? cargas.map(c => (
                    <tr key={c.id_carga}>
                      <td className="fw-bold text-dark">{c.nombreTarea}</td> 
                      <td className="text-center"><span className="badge bg-primary px-3">{c.horas_asignadas}h</span></td>
                      <td className="text-end pe-3">
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => prepararEdicion(c)}>✎</button>
                        <button className="btn btn-sm btn-outline-danger" 
                                onClick={() => {
                                  if(window.confirm("¿Deseas eliminar esta carga de trabajo?")) {
                                    axios.delete(`${API_CARGA}/${c.id_carga}`).then(cargarDatos);
                                  }
                                }}>🗑️</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="text-center text-muted py-3">Sin tareas asignadas esta semana</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}