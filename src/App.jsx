import React from "react";
import Usuarios from "./Usuarios.jsx"; 
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-5">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">
              Usuarios
          </a>
        </div>
      </nav>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <Usuarios />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;