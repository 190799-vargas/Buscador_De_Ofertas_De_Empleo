// client/src/contexts/AuthContext.js
// Provee el estado de autenticación (logueado o no, info del usuario).
import { createContext, useEffect, useState } from "react";
import api from "../services/apiService";
import {
    clearAuthData,
    getAuthToken,
    getCurrentUser,
    setAuthToken,
    setCurrentUser
} from "../utils/authUtils";

// Crea el Contexto de Autenticación
export const AuthContext = createContext();

/**
 * Proveedor de Autenticación que envuelve a la aplicación y provee el estado de autenticación.
 * Maneja el inicio de sesión, cierre de sesión y la persistencia del estado del usuario.
 * @param {object} { children } - Los componentes hijos que tendrán acceso al contexto.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Estado para el usuario autenticado (null si no está logueado)
    const [loading, setLoading] = useState(true); // Estado para indicar si la autenticación inicial está cargando (útil para SplashScreen)

    // Efecto para cargar el estado de autenticación desde localStorage al iniciar la aplicación
    useEffect(() => {
        const loadAuthData = () => {
            const storedToken = getAuthToken();
            const storedUser = getCurrentUser();

            if (storedToken && storedUser) {
                // Si hay datos en localStorage, asumimos que el usuario está logueado
                // Podrías añadir una validación del token con el backend aquí para mayor seguridad
                setUser(storedUser);
            }
            setLoading(false); // La carga inicial ha terminado
        };

        loadAuthData();
    }, []); // Se ejecuta solo una vez al montar el componente


    /**
     * @description Función para manejar el inicio de sesión del usuario.
     * Almacena el token y los datos del usuario, y actualiza el estado.
     * @param {string} token - El JWT recibido del backend.
     * @param {object} userData - Los datos del usuario (id, email, role, etc.).
     */
    const login = (token, userData) => {
        setAuthToken(token);
        setCurrentUser(userData);
        setUser(userData);
        console.log("Login exitoso - Token:", token, "Usuario:", userData);

        // Verificación adicional
        console.log("Token almacenado:", getAuthToken());
        console.log("Usuario en estado:", userData);
    };

    /**
     * @description Función para actualizar los datos del usuario en el contexto y localStorage.
     * Útil después de que el usuario edite su perfil.
     * @param {object} newUserData - Los nuevos datos del usuario.
     */
    const updateUser = (newUserData) => {
        setUser(newUserData);
        setCurrentUser(newUserData); // También actualiza en localStorage
        console.log("Datos de usuario actualizados en el contexto:", newUserData);
    };

    /**
     * @description Función para manejar el cierre de sesión del usuario.
     * Limpia los datos de autenticación y el estado.
     * - Redirige a la página de inicio de sesión despues de cerrar sesión
     */
    const logout = () => {
        clearAuthData();
        setUser(null);
        console.log("Usuario ha cerrado sesión.");
        // Redirigir al usuario a la página de inicio de sesión
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };


    /**
     * @description Función para verificar el usuario actual directamente desde el backend.
     * Útil para revalidar el token o obtener información de usuario actualizada.
     * @returns La información del usuario actualizada, traida desde el backend.
     */
    const fetchCurrentUser = async () => {
        setLoading(true); // Activa la carga inicial
        try {
            const response = await api.get("/auth/current-user");
            const userData = response.data.user;
            setCurrentUser(userData); // Actualiza en localStorage
            setUser(userData); // Actualiza en el estado del contexto
            return userData;
        } catch (error) {
            console.error("Error al obtener el usuario actual:", error);
            logout(); // Si falla, asume que el token es inválido y cierra sesión.
            return null;
        } finally {
            setLoading(false); // La carga inicial ha terminado
        }
    };

    /**
     * @description Objeto de valor que se proveerá a los componentes hijos
     */
    const authContextValue = {
        user,
        isAuthenticated: !!user, // Booleano que indica si hay un usuario logueado
        loading,
        login,
        logout,
        updateUser,
        fetchCurrentUser,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};