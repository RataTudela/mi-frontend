import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Usuarios from "./Usuarios.jsx"; 
import InicioSesion from "./InicioSesion.jsx"; 
import DashboardAnalitica from "./DashboardAnalitica.jsx"; // Tu nuevo componente
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<InicioSesion />} />

        {/* Mantenemos la estructura exacta de tu compañero para Usuarios */}
        <Route path="/usuarios" element={
          <div className="min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
              <div className="container">
                <a className="navbar-brand fw-bold" href="#">
                  GameCloud <span className="text-primary">|</span> Gestión
                </a>
                <div className="d-flex gap-2">
                  {/* Botón añadido para navegar a tu microservicio */}
                  <button className="btn btn-primary btn-sm" onClick={() => window.location.href='/analitica'}>
                    Ver Analítica
                  </button>
                  <button className="btn btn-outline-light btn-sm" onClick={() => window.location.href='/login'}>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </nav>
            <div className="container-fluid p-0">
               <Usuarios />
            </div>
          </div>
        } />

        {/* Nueva ruta para tu microservicio de Monitoreo y Analítica */}
        <Route path="/analitica" element={
          <div className="min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
              <div className="container">
                <a className="navbar-brand fw-bold" href="#">
                  GameCloud <span className="text-info">|</span> Analítica
                </a>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-light btn-sm" onClick={() => window.location.href='/usuarios'}>
                    Volver a Gestión
                  </button>
                  <button className="btn btn-outline-light btn-sm" onClick={() => window.location.href='/login'}>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </nav>
            <div className="container-fluid p-0">
               <DashboardAnalitica />
            </div>
          </div>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

