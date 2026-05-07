import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/CssVistaEquipo.css";

export default function VerEquipo() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipo();
  }, []);

  const fetchEquipo = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/usuarios/usuario");
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al traer el equipo:", error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container py-5 text-center">Cargando equipo...</div>;

  return (
    <div className="bg-vista-usuario">
      <div className="container py-5">
        <h2 className="fw-bold mb-4">Visibilidad del Equipo</h2>
        <div className="row g-4">
          {usuarios.map((user) => {
            const listaCargas = user.cargasTrabajo || []; 
            const totalH = listaCargas.reduce((acc, curr) => acc + (curr.horas_asignadas || 0), 0);
            const porcentaje = Math.min((totalH / 40) * 100, 100);

            return (
              <div className="col-md-6 col-lg-4" key={user.id_usuario}>
                <div className="card-perfil p-4 shadow-sm h-100 border-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="fw-bold mb-0">{user.nombre}</h5>
                      <span className="badge bg-dark mb-2">{user.rol}</span>
                    </div>
                    <div style={{
                      width: '15px', height: '15px', borderRadius: '50%',
                      backgroundColor: totalH >= 40 ? '#dc3545' : totalH >= 30 ? '#ffc107' : '#198754'
                    }}></div>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">Carga actual: {totalH}h / 40h</small>
                    <div className="progress mt-1" style={{ height: "8px" }}>
                      <div 
                        className={`progress-bar ${totalH >= 40 ? 'bg-danger' : 'bg-primary'}`} 
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h6 className="small fw-bold text-uppercase">Tareas actuales:</h6>
                    <ul className="list-unstyled">
                      {listaCargas.length > 0 ? listaCargas.map(c => (
                        <li key={c.id_carga} className="small border-bottom py-1">
                          📌 {c.nombreTarea} <span className="text-muted">({c.horas_asignadas}h)</span>
                        </li>
                      )) : <li className="small text-muted italic">Sin tareas asignadas</li>}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}