// client/src/utils/authUtils.js
//  Utilidades para manejar tokens de autenticación, etc.
const TOKEN_KEY = 'jwtToken'; // Clave para almacenar el token JWT en localStorage
const USER_KEY = 'currentUser'; // Clave para almacenar el objeto del usuario actual en localStorage

/**
 * @description Almacena el token JWT en localStorage.
 * @param {string} token Eltoken JWT a almacenar.
 */
export const setAuthToken = (token) => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error("Error al almacenar el token de autenticación en localStorage:", error);
    }
};

/**
 * @description Recupera el token JWT de localStorage.
 * @returns {string | null} El token JWT si se encuentra, de lo contrario null.
 */
export const getAuthToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error("Error al recuperar el token de autenticación de localStorage:", error);
        return null;
    }
};

/**
 * @description Almacena los datos del usuario actual (ej. ID, nombre de usuario, rol) en localStorage.
 * Esto es útil para mostrar contenido específico del usuario sin necesidad de recuperarlo cada vez.
 * @param {object} user - El objeto de usuario a almacenar.
 */
export const setCurrentUser = (user) => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("Error al almacenar los datos del usuario en localStorage:", error);
    }
};

/**
 * @description Recupera los datos del usuario actual de localStorage.
 * @returns {object | null} El objeto de usuario si se encuentra, de lo contrario null.
 */
export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error al recuperar los datos del usuario de localStorage:", error);
        return null;
    }
};

/**
 * @description Limpia todos los datos relacionados con la autenticación (token e información del usuario) de localStorage.
 * Esto se llama típicamente al cerrar la sesión o cuando un token caduca/se vuelve inválido.
 */
export const clearAuthData = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        console.log("Datos de autenticación limpiados de localStorage.");
    } catch (error) {
        console.error("Error al limpiar los datos de autenticación de localStorage:", error);
    }
};

/**
 * @description Comprueba si el usuario está actualmente autenticado verificando la presencia de un token.
 * Esta es una comprobación básica y no valida la caducidad/validez del token más allá de su presencia.
 * Para una validación completa, se necesita el backend o una comprobación más robusta del lado del cliente.
 * @returns {boolean} True si existe un token, false en caso contrario.
 */
export const isAuthenticated = () => {
    return !!getAuthToken();
};

/**
 * @description Comprueba si el usuario actual tiene un rol específico.
 * @param {string} role - El rol a verificar (ej. 'guest', 'user').
 * @returns {boolean} True si el usuario tiene el rol especificado, false en caso contrario.
 */
export const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
};