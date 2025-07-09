// sever/middleware/roleMiddleware.js
// Verificación de roles (invitado, usuario)

/**
 * Middleware para verificar si el usuario autenticado tiene uno de los roles requeridos.
 * Este middleware se utiliza después de `authMiddleware` porque depende de `req.user`
 * que es adjuntado por el middleware de autenticación.
 *
 * @param {Array<string>} roles - Un array de strings con los roles permitidos (ej. ['admin', 'user']).
 * @returns {Function} - Una función middleware de Express que realiza la verificación del rol.
 */
module.exports = (roles) => {
    return (req, res, next) => {
        // 1. Verificar si `req.user` existe. Si no, significa que `authMiddleware` no se ejecutó
        // o el usuario no está autenticado, lo que debería ser manejado por authMiddleware antes.
        // Sin embargo, como precaución, verificamos.
        if (!req.user) {
            // Esto rara vez debería ocurrir si este middleware se usa después de authMiddleware,
            // pero es una buena práctica defensive.
            return res.status(401).json({ message: 'Acceso denegado. No autenticado.' });
        }

        // 2. Verificar si el rol del usuario (adjuntado por `authMiddleware`) está incluido en los roles permitidos.
        // `req.user.role` contendrá el rol actual del usuario (ej. 'guest' o 'user').
        if (!roles.includes(req.user.role)) {
            // Si el rol del usuario no está en la lista de roles permitidos, devuelve un error 403 (Forbidden).
            return res.status(403).json({ message: 'Acceso denegado. No tienes los permisos necesarios para realizar esta acción.' });
        }

        // 3. Si el usuario tiene el rol permitido, pasa el control al siguiente middleware o a la función de ruta.
        next();
    };
};