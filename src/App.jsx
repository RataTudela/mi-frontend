import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Usuarios from "./Usuarios.jsx"; 
import InicioSesion from "./InicioSesion.jsx"; 
import VistaUsuario from "./VistaUsuario.jsx"; 
import 'bootstrap/dist/css/bootstrap.min.css';

const ProtectedRoute = ({ children, allowedRole }) => {
    const user = JSON.parse(localStorage.getItem("usuarioActual")); 
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRole && user.rol !== allowedRole) {
        return <Navigate to={user.rol === "ADMIN" ? "/usuarios" : "/mi-perfil"} replace />;
    }
    return children;
};
function App() {
  const handleLogout = () => {
    localStorage.removeItem("usuarioActual");
    window.location.href = '/login';
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<InicioSesion />} />
        <Route path="/usuarios" element={
          <ProtectedRoute allowedRole="ADMIN">
            <div className="min-vh-100">
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                  <a className="navbar-brand fw-bold" href="#">
                    InnovaTech <span className="text-primary">|</span> Gestión</a>
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Cerrar Sesión</button>
                </div>
              </nav>
              <div className="container-fluid p-0">
                 <Usuarios />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/mi-perfil" element={
          <ProtectedRoute>
            <div className="min-vh-100">
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                  <a className="navbar-brand fw-bold" href="#">InnovaTech <span className="text-primary">|</span> Mi Perfil</a>
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </div>
              </nav>
              <VistaUsuario />
            </div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
export default App;