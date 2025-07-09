// client/src/App.js
// El cerebro: aquí se definen todas las rutas y la estructura principal.
import { useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import useAuth from "./hooks/useAuth"; // Hook para acceder al contexto de autenticación

// Componentes Comunes
import AlertMessage from "./components/common/AlertMessage";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Navbar from "./components/common/Navbar";
import PrivateRoute from "./components/common/PrivateRoute"; // Componente para proteger rutas

// Páginas Públicas
import AuthSuccess from "./components/Auth/AuthSuccess"; // Para manejo de OAuth
import Login from "./components/Auth/Login"; // Página de login directo
import Register from "./components/Auth/Register"; // Página de registro/inicio
import AboutPage from "./pages/Public/AboutPage";
import NotFoundPage from "./pages/Public/NotFoundPage";

// Páginas Autenticadas
import AppliedJobsPage from "./pages/Authenticated/AppliedJobsPage"; // Empleos aplicados
import FavoritesPage from "./pages/Authenticated/FavoritesPage"; // Empleos favoritos
import HomePage from "./pages/Authenticated/HomePage"; // Página principal de búsqueda de empleos
import JobDetailPage from "./pages/Authenticated/JobDetailPage"; // Detalles de un empleo
import ProfileEditPage from "./pages/Authenticated/ProfileEditPage"; // Edición de perfil
import UserProfilePage from "./pages/Authenticated/UserProfilePage"; // Perfil del usuario
import UserSettingsPage from "./pages/Authenticated/UserSettingsPage"; // Configuración del usuario

/**
 * @description Este código de App.js utiliza react-router-dom para manejar la navegación
 * y useAuth para acceder al estado de autenticación.
 * También incluye componentes comunes como Navbar, Footer, LoadingSpinner y AlertMessage.
 * @returns Rutas con su path y la estructura, para acceder a todas las páginas y flujo de la aplicación.
 */
function App() {
  // Obtenemos el estado de autenticación y las funciones del hook useAuth
  const { isAuthenticated, loading, user, logout } = useAuth();

  // Estado para manejar mensajes de alerta globales
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error' | 'info', message: '...' }

  /**
   * @description Función para mostrar un mensaje de alerta
   * @param {string} message Mensaje de alerta dependiendo el estado
   * @param {string} type Tipo de mensaje que de alerta que se manejó segun el estado
   */
  const showAlert = (message, type = 'info', duration = 5000) => {
    setAlert({ message, type, duration });
  };

  /**
   * Función para cerrar la alerta, llamada por AlertMessage
   */
    const handleCloseAlert = () => {
        setAlert(null);
    };

  // Si el estado de autenticación inicial está cargando, mostramos un spinner global
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
        {/* Navbar se muestra siempre, la lógica interna controlará qué enlaces mostrar */}
        <Navbar isAuthenticated={isAuthenticated} user={user} logout={() => {/* Llamar a la función logout del contexto aquí */}} />
        
        {/* Muestra un mensaje de alerta si hay alguno */}
            {alert && (
                <AlertMessage
                    message={alert.message}
                    type={alert.type}
                    onClose={handleCloseAlert} // Pasamos la función para que el AlertMessage la use
                    autoHideDuration={alert.duration}
                />
            )}
      <main className="main-content"> {/* Contenedor principal para el contenido de la página */}
        <Routes>
          {/* Rutas Públicas */}
          {/* La página de registro/inicio es la ruta raíz si el usuario no está autenticado */}
          <Route path="/" element={isAuthenticated ? <HomePage showAlert={showAlert} /> : <Register showAlert={showAlert} />} />
          <Route path="/login" element={<Login showAlert={showAlert} />} />
          <Route path="/auth/success" element={<AuthSuccess showAlert={showAlert} />} /> {/* Ruta para el callback de OAuth */}
          <Route path="/about" element={<AboutPage />} />

          {/* Rutas Autenticadas (protegidas por PrivateRoute) */}
          {/* HomePage si ya está logueado, sino, la ruta "/" lo manda a register */}
          <Route path="/home" element={<PrivateRoute><HomePage showAlert={showAlert} /></PrivateRoute>} />
          <Route path="/jobs/:id" element={<PrivateRoute><JobDetailPage showAlert={showAlert} /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><FavoritesPage showAlert={showAlert} /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfilePage showAlert={showAlert} /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><ProfileEditPage showAlert={showAlert} /></PrivateRoute>} />
          <Route path="/applied-jobs" element={<PrivateRoute><AppliedJobsPage showAlert={showAlert} /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><UserSettingsPage showAlert={showAlert} /></PrivateRoute>} />
        
          {/* Ruta 404 (Siempre al final) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer /> {/* Pie de página se muestra siempre */}
    </Router>
  );
}

export default App;