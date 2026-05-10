import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Usuarios from "./Usuarios.jsx"; 
import InicioSesion from "./InicioSesion.jsx"; 
import DashboardAnalitica from "./DashboardAnalitica.jsx"; // Integrado de felix/sandbox
import VistaUsuario from "./VistaUsuario.jsx"; 
import VerEquipo from "./VerEquipo.jsx"; 
import 'bootstrap/dist/css/bootstrap.min.css';

// Componente de Protección de Rutas (Estándar del equipo)
const ProtectedRoute = ({ children, allowedRole }) => {
    const user = JSON.parse(localStorage.getItem("usuarioActual")); 
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRole && user.rol !== allowedRole) {
        return <Navigate to={user.rol === "ADMIN" ? "/usuarios" : "/mi-perfil"} replace />;
    }
    return children;
};

function App() {
  // Función centralizada para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("usuarioActual");
    window.location.href = '/login';
  };

  return (
    <Router>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Login público */}
        <Route path="/login" element={<InicioSesion />} />

        {/* Vista de Gestión (Solo ADMIN) */}
        <Route path="/usuarios" element={
          <ProtectedRoute allowedRole="ADMIN">
            <div className="min-vh-100">
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                  <a className="navbar-brand fw-bold" href="#">
                    InnovaTech <span className="text-primary">|</span> Gestión
                  </a>
                  <div className="d-flex gap-2">
                    {/* Integración felix/sandbox: Botón para navegar a tu microservicio */}
                    <Link to="/analitica" className="btn btn-primary btn-sm">Ver Analítica</Link>
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Cerrar Sesión</button>
                  </div>
                </div>
              </nav>
              <div className="container-fluid p-0">
                  <Usuarios />
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* TU MÓDULO: Monitoreo y Analítica (Protegido para ADMIN) - Integrado de felix/sandbox */}
        <Route path="/analitica" element={
          <ProtectedRoute allowedRole="ADMIN">
            <div className="min-vh-100">
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                  <a className="navbar-brand fw-bold" href="#">
                    InnovaTech <span className="text-info">|</span> Analítica
                  </a>
                  <div className="d-flex gap-2">
                    <Link to="/usuarios" className="btn btn-outline-light btn-sm">Volver a Gestión</Link>
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Cerrar Sesión</button>
                  </div>
                </div>
              </nav>
              <div className="container-fluid p-0">
                 <DashboardAnalitica />
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Vista de Perfil de Usuario (Cualquier rol logueado) - Base de origin/main */}
        <Route path="/mi-perfil" element={
          <ProtectedRoute>
            <div className="min-vh-100">
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                  <a className="navbar-brand fw-bold" href="#">InnovaTech <span className="text-primary">|</span> Mi Perfil</a>
                  <div className="d-flex gap-2">
                    <Link to="/equipo" className="btn btn-outline-primary btn-sm">Ver Equipo</Link>
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Cerrar Sesión</button>
                  </div>
                </div>
              </nav>
              <VistaUsuario />
            </div>
          </ProtectedRoute>
        } />

        {/* Vista de Equipo (Cualquier rol logueado) - Base de origin/main */}
        <Route path="/equipo" element={
          <ProtectedRoute>
            <div className="min-vh-100">
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                  <a className="navbar-brand fw-bold" href="#">InnovaTech <span className="text-primary">|</span> Equipo</a>
                  <div className="d-flex gap-2">
                    <Link to="/mi-perfil" className="btn btn-outline-primary btn-sm">Mi Perfil</Link>
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Cerrar Sesión</button>
                  </div>
                </div>
              </nav>
              <VerEquipo />
            </div>
          </ProtectedRoute>
        } />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;