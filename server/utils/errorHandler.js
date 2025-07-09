// server/utils/errorHandler.js
// Funciones para manejar errores de forma centralizada

/**
 * Middleware centralizado para el manejo de errores en Express.
 * Captura errores que ocurren en las rutas o en otros middlewares y envía una respuesta estandarizada.
 *
 * @param {Error} err - El objeto de error que fue lanzado.
 * @param {Object} req - Objeto de la solicitud HTTP (Request).
 * @param {Object} res - Objeto de la respuesta HTTP (Response).
 * @param {Function} next - Función para pasar el control al siguiente middleware (si existe).
 */
module.exports = (err, req, res, next) => {
    // 1. Loguear el error completo para propósitos de depuración.
    // Es crucial en desarrollo para entender qué está fallando.
    // En producción, podrías usar un logger más avanzado (ej. Winston, Morgan)
    // que envíe los errores a un servicio de monitoreo de logs.
    console.error('ERROR CAPTURADO POR EL MANEJADOR CENTRALIZADO:', err);

    // 2. Determinar el código de estado HTTP de la respuesta.
    // Si el error tiene una propiedad `statusCode`, la usa. De lo contrario, usa 500 (Internal Server Error) por defecto.
    const statusCode = err.statusCode || 500;

    // 3. Determinar el mensaje de error.
    // Si el error tiene un mensaje, lo usa. De lo contrario, usa un mensaje genérico.
    const message = err.message || 'Error interno del servidor. Algo salió mal.';

    // 4. Enviar la respuesta de error al cliente.
    res.status(statusCode).json({
        status: 'error',   // Un campo que indica que la respuesta es un error
        message: message,  // El mensaje descriptivo del error
        // Opcional: Incluir el stack trace del error solo en entornos de desarrollo.
        // Esto ayuda a la depuración pero no debe exponerse en producción por razones de seguridad.
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};