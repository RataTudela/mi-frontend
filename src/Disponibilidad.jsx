import React, { useEffect, useState } from "react";
import axios from "axios";

const API_DISPO = "http://localhost:8081/api/usuarios/disponibilidad";

export default function Disponibilidades({ usuarioId, nombreUsuario, alCerrar }) {
  const [fechas, setFechas] = useState([]);
  const [editandoId, setEditandoId] = useState(null); 
  
  const [form, setForm] = useState({ 
    fechaInicio: "", 
    fechaFin: "", 
    motivo: "", 
    usuario: { id_usuario: usuarioId } 
  });

  const [inicioInput, setInicioInput] = useState("");
  const [finInput, setFinInput] = useState("");

  const cargarDispo = async () => {
    try {
      const res = await axios.get(`${API_DISPO}/${usuarioId}`);
      setFechas(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarDispo(); }, [usuarioId]);

  const aFormatoISO = (str) => {
    const [d, m, y] = str.split("/");
    return `${y}-${m}-${d}`;
  };

  const aFormatoChile = (str) => {
    if (!str) return "";
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  };

  const manejarMascara = (valor, setter, campoForm) => {
    let v = valor.replace(/\D/g, "").slice(0, 8);
    if (v.length >= 5) v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    else if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    setter(v);
    if (v.length === 10) setForm(prev => ({ ...prev, [campoForm]: aFormatoISO(v) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inicioInput.length < 10 || finInput.length < 10) return alert("Fecha incompleta");
    if (new Date(form.fechaFin) < new Date(form.fechaInicio)) return alert("❌ Error en fechas");

    try {
      if (editandoId) {
        await axios.put(`${API_DISPO}/${editandoId}`, form);
      } else {
        await axios.post(API_DISPO, form);
      }
      cancelarEdicion();
      cargarDispo();
    } catch (e) { alert("Error al procesar"); }
  };

  const prepararEdicion = (f) => {
    setEditandoId(f.id_disponibilidad);
    setInicioInput(aFormatoChile(f.fechaInicio));
    setFinInput(aFormatoChile(f.fechaFin));
    setForm({
      fechaInicio: f.fechaInicio,
      fechaFin: f.fechaFin,
      motivo: f.motivo,
      usuario: { id_usuario: usuarioId }
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setInicioInput("");
    setFinInput("");
    setForm({ fechaInicio: "", fechaFin: "", motivo: "", usuario: { id_usuario: usuarioId } });
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }} onClick={alCerrar}>
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-dark text-white border-0">
            <h5 className="modal-title">📅 Disponibilidad: <span className="text-info">{nombreUsuario}</span></h5>
            <button type="button" className="btn-close btn-close-white" onClick={alCerrar}></button>
          </div>
          
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit} className={`row g-3 mb-4 p-3 rounded-3 border ${editandoId ? 'bg-warning-subtle border-warning' : 'bg-light'}`}>
              <div className="col-md-4">
                <label className="small fw-bold text-muted">FECHA INICIO</label>
                <input type="text" className="form-control" placeholder="DD/MM/AAAA" value={inicioInput} onChange={(e) => manejarMascara(e.target.value, setInicioInput, "fechaInicio")} required />
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted">FECHA TÉRMINO</label>
                <input type="text" className="form-control" placeholder="DD/MM/AAAA" value={finInput} onChange={(e) => manejarMascara(e.target.value, setFinInput, "fechaFin")} required />
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted">MOTIVO</label>
                <input type="text" className="form-control" placeholder="Motivo" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} required />
              </div>
              <div className="col-12 text-end">
                {editandoId && <button type="button" className="btn btn-link text-muted me-2" onClick={cancelarEdicion}>Cancelar</button>}
                <button type="submit" className={`btn ${editandoId ? 'btn-warning' : 'btn-primary'} px-4 fw-bold shadow-sm`}>
                  {editandoId ? 'Actualizar Registro' : 'Registrar Periodo'}
                </button>
              </div>
            </form>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light text-muted small">
                  <tr>
                    <th>INICIO</th>
                    <th>FIN</th>
                    <th>MOTIVO</th>
                    <th className="text-end">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {fechas.map(f => (
                    <tr key={f.id_disponibilidad} style={{ cursor: 'pointer' }}>
                      <td className="fw-bold">{aFormatoChile(f.fechaInicio)}</td>
                      <td className="fw-bold">{aFormatoChile(f.fechaFin)}</td>
                      <td><span className="badge bg-primary-subtle text-primary border">{f.motivo}</span></td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => prepararEdicion(f)}>✎</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => {
                          if(window.confirm("¿Borrar?")) axios.delete(`${API_DISPO}/${f.id_disponibilidad}`).then(cargarDispo);
                        }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}