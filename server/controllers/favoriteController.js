// sever/controllers/favoriteController.js
// Lógica para agregar/eliminar/listar favoritos
const { FavoriteJob, Job, User } = require('../models') // Importa los modelos necesarios
const { Op } = require('sequelize');

/**
 * @route POST /api/favorites
 * @async
 * @desc Agrega un empleo a la lista de favoritos del usuario autenticado.
 * @access Private (solo usuarios autenticados con rol 'user')
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * @returns {Object} - Respuesta con un mensaje de exito o error si el para el empleo que se agregó a favoritos
 */
exports.addFavoriteJob = async (req, res, next) => {
    try {
        const userId = req.user.id; // El ID del usuario se obtiene del token JWT (middleware de autenticación)
        const { jobId } = req.body; // El ID del empleo a agregar a favoritos

        // 1. Verificar si el empleo existe
        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).json({ message: 'El empleo que intentas agregar a favoritos no existe.' });
        }

        // 2. Intentar crear una nueva entrada en FavoriteJob
        // El índice único compuesto en FavoriteJobModel evita duplicados
        const [favorite, created] = await FavoriteJob.findOrCreate({
            where: { userId, jobId },
            defaults: { userId, jobId } // Datos para crear si no existe
        });

        if (!created) {
            // Si `created` es false, significa que ya existía una entrada para este user-job
            return res.status(409).json({ message: 'Este empleo ya está en tus favoritos.' });
        }

        res.status(201).json({
            message: 'Empleo agregado a favoritos exitosamente.',
            favorite,
        });
    } catch (error) {
        console.error('Error al agregar empleo a favoritos:', error);
        next(error);
    }
};

/**
 * @route GET /api/favorites
 * @async
 * @desc Obtiene la lista de empleos favoritos del usuario autenticado.
 * @access Private (solo usuarios autenticados con rol 'user')
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * @returns {Object} - Respuesta con un mensaje de exito o error si el para la lista de empleos del usuario que tiene en favoritos
 */
exports.getFavoriteJobs = async (req, res, next) => {
    try {
        const userId = req.user.id; // El ID del usuario autenticado

        // Buscar todos los empleos favoritos para este usuario
        const favorites = await FavoriteJob.findAll({
            where: { userId },
            include: [{ // Incluir la información completa del empleo asociado
                model: Job,
                attributes: {
                exclude: ['createdAt', 'updatedAt'] // Excluye estos campos si no son necesarios
                }
            }],
            order: [['createdAt', 'DESC']] // Ordenar por la fecha en que se agregó a favoritos
        });

        // Mapear los resultados para obtener solo la información del Job
        const favoriteJobs = favorites.map(fav => fav.Job);

        res.status(200).json({
            message: 'Lista de empleos favoritos obtenida exitosamente.',
            favorites: favoriteJobs,
        });
    } catch (error) {
        console.error('Error al obtener empleos favoritos:', error);
        next(error);
    }
};

/**
 * @route DELETE /api/favorites/:jobId
 * @desc Elimina un empleo de la lista de favoritos del usuario autenticado.
 * @access Private (solo usuarios autenticados con rol 'user')
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * @returns {Object} - Respuesta con un mensaje de exito o error si el para eliminar un empleo de la lista de empleos del usuario que tiene en favoritos
 */
exports.removeFavoriteJob = async (req, res, next) => {
    try {
         const userId = req.user.id; // El ID del usuario autenticado
        const { jobId } = req.params; // El ID del empleo a eliminar de favoritos (desde los parámetros de la URL)

        // 1. Buscar y eliminar la entrada de favorito
        const deletedRows = await FavoriteJob.destroy({
            where: { userId, jobId },
        });

        if (deletedRows === 0) {
            // Si no se eliminó ninguna fila, significa que el empleo no estaba en favoritos o no existía esa relación
            return res.status(404).json({ message: 'El empleo no se encontró en tus favoritos o ya fue eliminado.' });
        }

        res.status(200).json({
            message: 'Empleo eliminado de favoritos exitosamente.',
        });
    } catch (error) {
        console.error('Error al eliminar empleo de favoritos:', error);
        next(error);
    }
};
