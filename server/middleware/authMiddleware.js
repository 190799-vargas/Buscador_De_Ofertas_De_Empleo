// sever/middleware/authMiddleware.js
// Verificación y decodificación de JWT
const jwt = require('jsonwebtoken'); // Importa la librería jsonwebtoken para verificar JWTs
const { User } = require('../models'); // Importa el modelo User para buscar al usuario en la DB

/**
 * Middleware para verificar la autenticación JWT.
 * * Este middleware:
 * 1. Extrae el token JWT del encabezado de autorización (Bearer Token).
 * 2. Verifica si el token es válido y no ha expirado.
 * 3. Decodifica el token para obtener la información del usuario (id, username, role).
 * 4. Opcionalmente, busca al usuario en la base de datos para asegurar que sigue existiendo
 * y que su rol es el más reciente.
 * 5. Adjunta la información del usuario a `req.user` para que esté disponible en las rutas.
 * 6. Pasa el control al siguiente middleware o función de ruta si el token es válido.
 * 7. Si el token es inválido, está ausente o expirado, devuelve un error 401 (Unauthorized).
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware o ruta.
 */
module.exports = async (req, res, next) => {
    try {
        // 1. Obtener el encabezado de autorización
        const authHeader = req.headers.authorization;

        // Verificar si el encabezado de autorización existe y tiene el formato 'Bearer TOKEN'
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token de autenticación o formato inválido.' });
        }

        // 2. Extraer el token (eliminar 'Bearer' del inicio)
        const token = authHeader.split(' ')[1];

        // 3. Verificar y decodificar el token JWT
        // jwt.verify() lanzará un error si el token es inválido, ha expirado, etc.
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usa el secreto de tu .env

        // 4. Adjuntar la información decodificada del token al objeto `req.user`
        // Esto hace que `req.user.id`, `req.user.username`, `req.user.role` estén disponibles en los controladores
        req.user = decoded;

        // Opcional y Recomendado: Buscar el usuario en la base de datos
        // Esto asegura que el usuario aún existe y que su rol es el más actualizado.
        // También protege contra tokens de usuarios eliminados o con roles cambiados recientemente.
        const user = await User.findByPk(req.user.id);
        if (!user) {
            // Si el usuario no se encuentra en la DB, el token es válido pero el usuario ya no existe
            return res.status(401).json({ message: 'Acceso denegado. Usuario asociado al token no encontrado.' });
        }
        // Asegurarse de que el rol en `req.user` sea el más reciente de la DB
        req.user.role = user.role;

        // Si todo es exitoso, pasa el control al siguiente middleware o a la función de ruta
        next();

    } catch (error) {
        console.error('Error en authMiddleware:', error); // Loguear el error para depuración

        // Manejar errores específicos de JWT
        if (error.name === 'JsonWebTokenError') {
            // Token no válido (ej. mal formado, firma incorrecta)
            return res.status(401).json({ message: 'Token de autenticación inválido.' });
        }
        if (error.name === 'TokenExpiredError') {
            // Token expirado
            return res.status(401).json({ message: 'Token de autenticación expirado. Por favor, inicia sesión de nuevo.' });
        }

        // Si es otro tipo de error, pasarlo al manejador de errores global
        next(error);
    }
};
