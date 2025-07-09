const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Rutas de Favoritos
 */
/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Agrega un empleo a la lista de favoritos del usuario autenticado.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 format: uuid
 *                 example: b2c3d4e5-f678-9012-3456-7890abcdef12
 *     responses:
 *       201:
 *         description: Empleo agregado a favoritos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empleo agregado a favoritos exitosamente."
 *                 favorite:
 *                   type: object
 *       401:
 *         description: No autorizado (token JWT ausente, inválido o expirado).
 *       403:
 *         description: Acceso denegado (el usuario no tiene el rol 'user').
 *       404:
 *         description: Empleo no encontrado.
 *       409:
 *         description: El empleo ya está en los favoritos del usuario.
 */
router.post('/add', authMiddleware, roleMiddleware(['user']), favoriteController.addFavoriteJob);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Obtiene la lista de empleos favoritos del usuario autenticado.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empleos favoritos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lista de empleos favoritos obtenida exitosamente."
 *                 favorites:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: No autorizado (token JWT ausente, inválido o expirado).
 *       403:
 *         description: Acceso denegado (el usuario no tiene el rol 'user').
 */
router.get('/', authMiddleware, roleMiddleware(['user']), favoriteController.getFavoriteJobs);

/**
 * @swagger
 * /api/favorites/{jobId}:
 *   delete:
 *     summary: Elimina un empleo de la lista de favoritos del usuario autenticado.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del empleo a eliminar de favoritos.
 *     responses:
 *       200:
 *         description: Empleo eliminado de favoritos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empleo eliminado de favoritos exitosamente."
 *       401:
 *         description: No autorizado (token JWT ausente, inválido o expirado).
 *       403:
 *         description: Acceso denegado (el usuario no tiene el rol 'user').
 *       404:
 *         description: El empleo no se encontró en los favoritos del usuario.
 */
router.delete('/:jobId', authMiddleware, roleMiddleware(['user']), favoriteController.removeFavoriteJob);

module.exports = router;