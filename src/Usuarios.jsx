import React, { useEffect, useState } from "react";
import axios from "axios";
import Disponibilidades from "./Disponibilidad.jsx";
import CargaTrabajo from "./CargaTrabajo.jsx"; 

const API_URL = "http://localhost:8081/api/usuarios/usuario";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const [verDispo, setVerDispo] = useState(false);
  const [verCarga, setVerCarga] = useState(false);
  const [userActivo, setUserActivo] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    rol: "Desarrollador Fullstack",
    estado: "ACTIVO"
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => setForm({ nombre: "", email: "", contraseña: "", rol: "Desarrollador Fullstack", estado: "ACTIVO" });

  const validarAdminUnico = (nuevoRol) => {
    if (nuevoRol === "ADMIN") {
      const yaExisteAdmin = users.some(u => u.rol === "ADMIN" && u.id_usuario !== selectedId);
      if (yaExisteAdmin) {
        alert("⚠️ Error: El sistema ya cuenta con un Administrador. Solo se permite un perfil con acceso total.");
        return false;
      }
    }
    return true;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validarAdminUnico(form.rol)) return;
    try {
      await axios.post(API_URL, form);
      fetchUsers();
      setShowCreate(false);
      resetForm();
    } catch (error) { alert("Error al crear el perfil."); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validarAdminUnico(form.rol)) return;
    try {
      await axios.put(`${API_URL}/${selectedId}`, form);
      fetchUsers();
      setShowEdit(false);
      resetForm();
    } catch (error) { alert("Error al actualizar el perfil."); }
  };

  const openEdit = (user) => {
    setSelectedId(user.id_usuario);
    setForm({
      nombre: user.nombre,
      email: user.email,
      contraseña: user.contraseña,
      rol: user.rol,
      estado: user.estado
    });
    setShowEdit(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este talento del sistema?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUsers();
    } catch (error) { alert("Error al eliminar."); }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4 p-4 bg-white shadow-sm rounded-3 border-start border-4 border-primary">
        <div>
          <h2 className="text-dark fw-bold m-0">Gestión de Talentos</h2>
          <small className="text-muted text-uppercase fw-bold" style={{fontSize:'10px'}}>Sistema de Control de Recursos Humanos</small>
        </div>
        <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={() => { resetForm(); setShowCreate(true); }}>
          + Reclutar Talento
        </button>
      </div>

      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-dark text-white">
            <tr>
              <th className="ps-4 py-3">PROFESIONAL</th>
              <th>EMAIL</th>
              <th>CARGO / ROL</th>
              <th>ESTADO</th>
              <th className="text-end pe-4">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id_usuario}>
                <td className="ps-4">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width:'40px', height:'40px', fontSize:'18px'}}>
                      {u.nombre.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-bold text-dark">{u.nombre}</div>
                        <small className="text-muted">ID: #{u.id_usuario}</small>
                    </div>
                  </div>
                </td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span className={`badge rounded-pill px-3 py-2 ${u.rol === 'ADMIN' ? 'bg-danger' : 'bg-light text-dark border'}`}>
                    {u.rol}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.estado === 'ACTIVO' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} border px-2`}>
                    {u.estado}
                  </span>
                </td>
                <td className="text-end pe-4">
                  <button className="btn btn-sm btn-outline-primary me-2 shadow-sm" title="Disponibilidad"
                          onClick={() => { setUserActivo(u); setVerDispo(true); }}>
                    📅
                  </button>
                  <button className="btn btn-sm btn-outline-success me-2 shadow-sm" title="Carga de Trabajo"
                          onClick={() => { setUserActivo(u); setVerCarga(true); }}>
                    📊
                  </button>
                  <button className="btn btn-sm btn-outline-warning me-2 shadow-sm" onClick={() => openEdit(u)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => handleDelete(u.id_usuario)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showCreate || showEdit) && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <form className="modal-content border-0 shadow-lg" onSubmit={showEdit ? handleEdit : handleCreate}>
                <div className={`modal-header ${showEdit ? 'bg-warning text-dark' : 'bg-primary text-white'} border-0`}>
                  <h5 className="modal-title fw-bold">{showEdit ? 'Actualizar Perfil Técnico' : 'Registro de Nuevo Talento'}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => { setShowCreate(false); setShowEdit(false); }} />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">NOMBRE COMPLETO</label>
                    <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">CORREO CORPORATIVO</label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold">CONTRASEÑA</label>
                    <input type="password" title="password" className="form-control" value={form.contraseña} onChange={(e) => setForm({ ...form, contraseña: e.target.value })} required />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-7">
                      <label className="form-label small fw-bold">CARGO</label>
                      <select className="form-select" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                        <option value="Desarrollador Fullstack">Desarrollador Fullstack</option>
                        <option value="Analista Programador">Analista Programador</option>
                        <option value="Experto BDD">Experto BDD</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-bold">ESTADO</label>
                      <select className="form-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowCreate(false); setShowEdit(false); }}>Cancelar</button>
                  <button type="submit" className={`btn ${showEdit ? 'btn-warning' : 'btn-primary'} px-4 fw-bold`}>
                    {showEdit ? 'Guardar Cambios' : 'Confirmar Registro'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {verDispo && (
        <Disponibilidades 
          usuarioId={userActivo.id_usuario} 
          nombreUsuario={userActivo.nombre} 
          alCerrar={() => setVerDispo(false)} 
        />
      )}

      {verCarga && (
        <CargaTrabajo 
          usuarioId={userActivo.id_usuario} 
          nombreUsuario={userActivo.nombre} 
          alCerrar={() => setVerCarga(false)} 
        />
      )}
    </div>
  );
}