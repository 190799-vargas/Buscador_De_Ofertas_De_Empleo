// client/src/services/apiService.js
// Configuración de Axios para hacer peticiones HTTP.
import axios from "axios";
import { getAuthToken } from "../utils/authUtils"; // / Importa las funciones de utilidad para token y limpieza.

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * @description configura una instancia de Axios para interactuar con el backend.
 * Incluye un interceptor para añadir automáticamente el token JWT a las peticiones 
 * y manejar la expiración del token.
 */
const api = axios.create({
    baseURL: API_BASE_URL, // URL base de tu backend
    withCredentials: true, // Importante para enviar cookies de sesión (necesario para OAuth)
});

/**
 * Interceptor de solicitudes: Añade el token JWT a cada petición si está disponible
 */
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken(); // Obtiene el token JWT del almacenamiento local
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Añade el token al encabezado de autorización
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            console.warn('Sesión expirada - notificando al AuthContext');
            // En lugar de redirigir directamente, podrías:
            window.dispatchEvent(new CustomEvent('unauthorized'));
        }
        return Promise.reject(error);
    }

);

export default api;

