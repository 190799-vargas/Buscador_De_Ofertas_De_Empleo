// client/src/hooks/useAuth.js
// Un hook fácil de usar para acceder a la información de autenticación.
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; // Importa el contexto.

/**
 * @description Hook personalizado para acceder a la información y funciones de autenticación.
 * Proporciona un acceso conveniente al contexto de autenticación.
 * @returns {object} Un objeto que contiene:
 * - user: El objeto del usuario autenticado (o null).
 * - isAuthenticated: Booleano, true si el usuario está logueado.
 * - loading: Booleano, true si el estado de autenticación inicial está cargando.
 * - login: Función para iniciar sesión.
 * - logout: Función para cerrar sesión.
 * - fetchCurrentUser: Función para obtener los datos del usuario actual del backend.
 */
const useAuth = () => {
    const context = useContext(AuthContext);
    
    // Verificación más estricta
    if (!context) {
        throw new Error(
            'useAuth debe usarse dentro de un AuthProvider. ' +
            'Asegúrate de que tu aplicación esté envuelta en <AuthProvider>'
        );
    }

    return context;
};
export default useAuth;

