import React, { useEffect, useState } from "react";
import axios from "axios";

const API_CARGA = "http://localhost:8081/api/usuarios/carga_trabajo";

export default function CargaTrabajo({ usuarioId, nombreUsuario, alCerrar }) {
  const [cargas, setCargas] = useState([]);
  const [totalHoras, setTotalHoras] = useState(0);
  const [editandoId, setEditandoId] = useState(null);

  const tareasSistema = [
    { id: 1, nombre: "Mantenimiento BD", proyecto: "Infra", horas: 10 },
    { id: 2, nombre: "Desarrollo Frontend", proyecto: "Web V2", horas: 15 },
    { id: 3, nombre: "Reunión", proyecto: "Gestión", horas: 5 }
  ];

  const [form, setForm] = useState({
    periodo: "",
    horas_asignadas: 0,
    usuario: { id_usuario: usuarioId }
  });

  const cargarDatos = async () => {
    try {
      const res = await axios.get(`${API_CARGA}/usuario/${usuarioId}`);
      setCargas(res.data);
      setTotalHoras(res.data.reduce((acc, curr) => acc + curr.horas_asignadas, 0));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarDatos(); }, [usuarioId]);

  const manejarSeleccion = (e) => {
    const tarea = tareasSistema.find(t => t.id === parseInt(e.target.value));
    if (tarea) {
      setForm({ ...form, periodo: `[${tarea.proyecto}] ${tarea.nombre}`, horas_asignadas: tarea.horas });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        const horasPrevias = editandoId ? cargas.find(c => c.id_carga === editandoId).horas_asignadas : 0;
    if ((totalHoras - horasPrevias) + parseInt(form.horas_asignadas) > 40) {
      alert("Error: Esta asignación supera el límite de 40 horas semanales.");
      return;
    }

    try {
      if (editandoId) {
        await axios.put(`${API_CARGA}/${editandoId}`, form);
      } else {
        await axios.post(API_CARGA, form);
      }
      cancelarEdicion();
      cargarDatos();
    } catch (e) { alert("Error al procesar la carga."); }
  };

  const prepararEdicion = (c) => {
    setEditandoId(c.id_carga);
    setForm({
      periodo: c.periodo,
      horas_asignadas: c.horas_asignadas,
      usuario: { id_usuario: usuarioId }
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm({ periodo: "", horas_asignadas: 0, usuario: { id_usuario: usuarioId } });
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
                <div className={`progress-bar progress-bar-striped ${totalHoras > 35 ? 'bg-danger' : 'bg-success'}`} 
                     style={{ width: `${Math.min((totalHoras/40)*100, 100)}%` }}></div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className={`row g-2 mb-4 p-3 rounded-3 border ${editandoId ? 'bg-warning-subtle border-warning' : 'bg-light'}`}>
              <div className="col-md-7">
                <label className="small fw-bold text-muted text-uppercase">Tarea / Proyecto</label>
                {editandoId ? (
                  <input type="text" className="form-control shadow-sm" value={form.periodo} 
                         onChange={e => setForm({...form, periodo: e.target.value})} />
                ) : (
                  <select className="form-select shadow-sm" onChange={manejarSeleccion} required>
                    <option value="">-- Seleccionar Tarea --</option>
                    {tareasSistema.map(t => <option key={t.id} value={t.id}>{t.proyecto} - {t.nombre}</option>)}
                  </select>
                )}
              </div>
              <div className="col-md-2 text-center">
                <label className="small fw-bold text-muted text-uppercase">Hrs</label>
                <input type="number" className="form-control shadow-sm text-center" value={form.horas_asignadas} 
                       onChange={e => setForm({...form, horas_asignadas: e.target.value})} />
              </div>
              <div className="col-md-3 d-flex align-items-end gap-2">
                <button type="submit" className={`btn ${editandoId ? 'btn-warning' : 'btn-success'} fw-bold w-100`}>
                  {editandoId ? 'Actualizar' : 'Asignar'}
                </button>
                {editandoId && <button type="button" className="btn btn-outline-secondary" onClick={cancelarEdicion}>X</button>}
              </div>
            </form>

            <table className="table table-hover align-middle border">
              <thead className="table-dark small">
                <tr>
                  <th>PROYECTO / TAREA</th>
                  <th className="text-center">HORAS</th>
                  <th className="text-end pe-3">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {cargas.map(c => (
                  <tr key={c.id_carga}>
                    <td className="fw-bold">{c.periodo}</td>
                    <td className="text-center"><span className="badge bg-primary">{c.horas_asignadas}h</span></td>
                    <td className="text-end pe-3">
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => prepararEdicion(c)}>✎</button>
                      <button className="btn btn-sm btn-outline-danger" 
                              onClick={() => axios.delete(`${API_CARGA}/${c.id_carga}`).then(cargarDatos)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}