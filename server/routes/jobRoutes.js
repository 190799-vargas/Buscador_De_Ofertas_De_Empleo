const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Rutas de Empleos
 */
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Busca empleos por palabra clave y país.
 *     tags: [Empleos]
 *     description: Retorna una lista de empleos basándose en los criterios de búsqueda. Si el usuario es 'guest', la URL de origen no se incluirá. Si no hay resultados en la DB, dispara el scraping.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Palabra clave para buscar empleos (ej. "Desarrollador React").
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: true
 *         description: Código del país para filtrar la búsqueda (ej. "co", "us", "es", "br", "uk", "cn").
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para la paginación.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Búsqueda de empleos exitosa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Búsqueda de empleos exitosa."
 *                 totalResults:
 *                   type: integer
 *                   example: 50
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       400:
 *         description: Parámetros de búsqueda faltantes o inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Se requiere una palabra clave y un país para la búsqueda."
 */
router.get('/', jobController.searchJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Obtiene los detalles de un empleo específico por ID.
 *     tags: [Empleos]
 *     description: Retorna los detalles completos de un empleo. Si el usuario es 'guest', la URL de origen no se incluirá.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID único (UUID) del empleo.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalles del empleo obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Detalles del empleo obtenidos exitosamente."
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Empleo no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empleo no encontrado."
 */
router.get('/:id', authMiddleware, jobController.getJobDetails);

module.exports = router;