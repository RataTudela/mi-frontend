import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/CssInicioSesion.css";
import logoInnova from "./assets/Logo.png";

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

  try {
    const response = await fetch("http://localhost:8081/api/usuarios/usuario/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        contraseña: password 
      }),
    });
    if (!response.ok) {
      setPasswordError("Correo o contraseña incorrectos");
      return;
    }
    const user = await response.json();
    localStorage.setItem("usuarioActual", JSON.stringify(user));
    if (user.rol === "ADMIN") {
        navigate("/usuarios");
    } else {
        navigate("/mi-perfil");
    }
  } catch (error) {
    console.error("Error en login:", error);
    setPasswordError("Error al conectar con el servidor");
  }
};
  return (
    <div className="img-fondo-login">
      <div className="login-box shadow-lg">
        <div className="text-center mb-4">
          <img src={logoInnova} alt="Logo InnovaTech" className="logo-login"/>
          <h2 className="fw-bold text-dark">Ingresa a tu cuenta</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">CORREO ELECTRÓNICO</label>
            <input
              type="email"
              className="form-control form-control-lg fs-6"
              placeholder="admin@InnovaTech.com"
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
        </form>
      </div>
    </div>
  );
}