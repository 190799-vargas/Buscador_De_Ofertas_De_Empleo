// client/src/main.jsx
// El lanzador: inicia tu aplicación React.
import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/custom.css";
import "./styles/footer.css";
import "./styles/main.css";

// Selecciona el elemento raíz de tu HTML donde se montará la aplicación React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza la aplicación React
root.render(
  // React.StrictMode es una herramienta para destacar problemas potenciales en una aplicación.
    // No renderiza ninguna UI visible, solo activa advertencias y comprobaciones adicionales.
  <React.StrictMode>
    <ErrorBoundary>
    {/*
          Envuelve todo el componente <App /> con el <AuthProvider>.
          Esto asegura que todos los componentes dentro de <App /> (y sus hijos)
          tengan acceso al estado y las funciones de autenticación
          proporcionadas por AuthContext a través del hook useAuth.
        */}
        <AuthProvider>
            <App />
        </AuthProvider>
      </ErrorBoundary>
  </React.StrictMode>
)