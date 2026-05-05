import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/CssInicioSesion.css";

export default function InicioSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    setEmailError('');
    setPasswordError('');

    if (!email) { setEmailError("Ingresa tu correo"); return; }
    if (!password) { setPasswordError("Ingresa tu contraseña"); return; }

    try {
      const response = await fetch(
        `http://localhost:8081/api/usuarios/login?email=${email}&contrasena=${password}`
      );

      if (!response.ok) {
        setPasswordError("Credenciales inválidas. Inténtalo de nuevo.");
        return;
      }

      const user = await response.json();
      
      localStorage.setItem("usuarioActual", JSON.stringify(user));

      navigate("/usuarios");

    } catch (error) {
      console.error("Error en login:", error);
      setPasswordError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="img-fondo-login">
      <div className="login-box shadow-lg">
        <div className="text-center mb-4">
          <img src="/assets/Logo InnovaTech.png" alt="Logo GameCloud" className="logo-login" />
          <h2 className="fw-bold text-dark">InnovaTech</h2>
          <p className="text-muted small">Ingresa a tu cuenta</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">CORREO ELECTRÓNICO</label>
            <input
              type="email"
              className="form-control form-control-lg fs-6"
              placeholder="admin@gamecloud.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <div className="text-danger small mt-1">{emailError}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">CONTRASEÑA</label>
            <input
              type="password"
              className="form-control form-control-lg fs-6"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && <div className="text-danger small mt-1">{passwordError}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mb-3 shadow-sm">
            Iniciar Sesión
          </button>

          <div className="text-center">
            <span className="text-muted small">¿No tienes acceso? </span>
            <a 
              onClick={() => navigate('/Registro')} 
              className="text-primary small fw-bold" 
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              Contacta a Soporte
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}