// client/src/components/Common/PrivateRoute.js
// La clave para proteger rutas, asegurando que solo usuarios autenticados pasen.
import { Navigate, useLocation } from "react-router-dom"; // Importa Navigate para redirigir.
import useAuth from "../../hooks/useAuth"; // Importa el hook personalizado de autenticación.
import LoadingSpinner from "./LoadingSpinner"; // Para mostrar mientras se carga la autenticación.

/**
 * @description Componente PrivateRoute.
 * Este componente se encarga de proteger las rutas que requieren autenticación.
 * Si el usuario no está autenticado, lo redirige a la página de inicio de sesión.
 * Muestra un spinner de carga mientras se verifica el estado de autenticación.
 *
 * - Si la autenticación aún está en proceso de carga, mostramos un spinner.
 * - Si la carga ha terminado y el usuario NO está autenticado, lo redirigimos(Navigate) a la página de login.
 *
 *  @param {Object} { children } - Los componentes hijos que se renderizarán si el usuario está autenticado.
 * @returns  Si la carga ha terminado y el usuario SÍ está autenticado, renderizamos los componentes hijos
 */
const PrivateRoute = ({ children }) => {
    // Obtenemos el estado de autenticación (Loading, isAuthenticated) del hook useAuth
    const { loading, isAuthenticated } = useAuth();

    // 1. Si la autenticación aún está en proceso de carga, mostramos un spinner.
    // Esto es crucial para evitar que la página "parpadee" o redirija antes de saber si el usuario está logueado.
    if (loading) {
        return <LoadingSpinner />;
    }

    // 2. Si la carga ha terminado y el usuario NO está autenticado,
    // lo redirigimos a la página de login.
    // `replace` en Navigate asegura que la URL actual (la ruta protegida) no se guarde en el historial,
    // así el usuario no puede simplemente volver con el botón "atrás" del navegador.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si la carga ha terminado y el usuario SÍ está autenticado,
    // renderizamos los componentes hijos (la ruta a la que intentaba acceder).
    return children;
};

export default PrivateRoute;