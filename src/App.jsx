import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Usuarios from "./Usuarios.jsx"; 
import InicioSesion from "./InicioSesion.jsx"; 
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<InicioSesion />} />

        <Route path="/usuarios" element={
          <div className="min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
              <div className="container">
                <a className="navbar-brand fw-bold" href="#">
                  GameCloud <span className="text-primary">|</span> Gestión
                </a>
                <button className="btn btn-outline-light btn-sm" onClick={() => window.location.href='/login'}>
                  Cerrar Sesión
                </button>
              </div>
            </nav>
            <div className="container-fluid p-0">
               <Usuarios />
            </div>
          </div>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;