// client/src/components/Auth/AuthSuccess.js
// Maneja las redirecciones post-autenticación (OAuth, etc.).
// es el puente entre el backend que maneja la autenticación de terceros (Google, GitHub) y el frontend de tu aplicación.
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Hooks de React Router para acceder a la URL y navegar.
import useAuth from "../../hooks/useAuth"; // Tu hook personalizado para el contexto de autenticación.
import LoadingSpinner from "../common/LoadingSpinner"; // Para mostrar mientras procesamos.

/**
 * Componente AuthSuccess.
 * Maneja la redirección exitosa después de una autenticación OAuth (Google, GitHub).
 * - Extrae el token JWT y los datos del usuario de los parámetros de la URL.
 * - almacena token JWT y los datos del usuario en el contexto de autenticación.
 * - redirige al usuario.
 *
 * @param {object} { showAlert } - Función para mostrar alertas, pasada desde App.js.
 * @returns Si la autenticación es exitosa, redirige al usuario a la pagina proncipal(HomePage).
 */
const AuthSuccess = ({ showAlert }) => {
    const location = useLocation(); // Hook para acceder al objeto de ubicación (URL actual).
    const navigate = useNavigate();  // Hook para la navegación programática.
    const { login, isAuthenticated } = useAuth(); // Obtenemos la función login y el estado isAuthenticated del contexto.

    useEffect(() => {
        // Si ya estamos autenticados, no hay necesidad de procesar la URL de éxito de OAuth nuevamente.
        // Esto puede ocurrir si el usuario accede directamente a esta URL ya logueado.
        if (isAuthenticated) {
            console.log("Ya autenticado, redirigiendo a la página principal.");
            navigate('/home', { replace: true });
            return;
        }

        const params = new URLSearchParams(location.search); // Crea un objeto para trabajar con los parámetros de la URL.
        const token = params.get('token'); // Obtiene el token del parámetro 'token'.
        const userId = params.get('userId'); // Obtiene el userId del parámetro 'userId'.
        const email = params.get('email'); // Obtiene el email del parámetro 'email'
        const role = params.get('role'); // Obtiene el rol del parámetro 'role'
        const profilePicture = params.get('profilePicture'); // Obtiene la profilePicture.
    
        // Verifica si hemos recibido el token y los datos esenciales del usuario.
        if (token && userId && email && role) {
            // Construye el objeto de usuario a partir de los parámetros de la URL.
            const userData = {
                id: userId,
                email: email,
                role: role,
                profilePicture: profilePicture || null, // Asegura que sea null si no está presente.
            };

            // Llama a la función login del contexto para establecer el usuario y el token
            login(token, userData);
            showAlert('Inicio de sesión exitoso. ¡Bienvenido!', 'success');
            console.log("Datos de autenticación procesados. Token y usuario almacenados.");
        
            // Redirige al usuario a la página principal (o a donde desees después del login)
            // `replace: true` evita que el usuario pueda volver a esta URL de éxito con el botón de "atrás"
            navigate('/home', { replace: true });
        } else {
            // Si falta algún parámetro esencial, significa un fallo o una URL incorrecta
            showAlert('Fallo en el inicio de sesión. Parámetros de autenticación incompletos.', 'error');
            console.error("Parámetros de autenticación incompletos o incorrectos en la URL.");
            // Redirige a la página de login o a una página de error
            navigate('/login', { replace: true });
        }
    }, [location.search, navigate, login, showAlert, isAuthenticated]); // Dependencias para el useEffect.

    // Mientras se procesa la redirección, se puede mostrar un spinner
    return (
        <div className="auth-success-container">
            <LoadingSpinner message="Procesando autenticación..." />
            <p>Por favor, espera mientras te redirigimos...</p>
        </div>
    );
};

export default AuthSuccess;