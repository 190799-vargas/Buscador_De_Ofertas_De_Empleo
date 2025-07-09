// server/routes/authRoutes.js
// Rutas para autenticación (registro, login) y perfil de usuario
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Middleware para manejar la subida de fotos de perfil

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Rutas de Autenticación Tradicional y Social (OAuth)
 *   - name: Perfil de Usuario
 *     description: Rutas para gestionar el perfil y la foto de perfil del usuario
 *   - name: Configuración de Usuario
 *     description: Rutas para gestionar las preferencias y configuraciones del usuario
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario con credenciales de nombre de usuario y contraseña.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente. Retorna un token JWT y la información del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "¡Registro exitoso! Bienvenido."
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1Ni..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en la solicitud (ej. nombre de usuario o email ya en uso, datos incompletos).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El nombre de usuario ya está en uso. Por favor, elige otro."
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión con credenciales de nombre de usuario y contraseña.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna un token JWT y la información del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "¡Inicio de sesión exitoso!"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1Ni..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Credenciales inválidas (nombre de usuario o contraseña incorrectos).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Credenciales inválidas. Usuario no encontrado."
 */
router.post('/login', authController.login);

// --- Rutas de Autenticación con Google OAuth ---

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Inicia el proceso de autenticación con Google.
 *     tags: [Autenticación]
 *     description: Redirige al usuario a la página de consentimiento de Google para la autenticación.
 *     responses:
 *       302:
 *         description: Redirección a Google para autenticación.
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback para la autenticación de Google.
 *     tags: [Autenticación]
 *     description: Endpoint al que Google redirige después de la autenticación del usuario.
 *     responses:
 *       302:
 *         description: Redirección al frontend tras la autenticación exitosa o fallida.
 *       401:
 *         description: Autenticación de Google fallida.
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: process.env.FRONTEND_URL + '/login?error=google_auth_failed',
        session: true
    }),
    (req, res) => {
        const token = authController.generateToken(req.user);
        res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}&role=${req.user.role}`);
    }
);

// --- Rutas de Autenticación con GitHub OAuth ---

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Inicia el proceso de autenticación con GitHub.
 *     tags: [Autenticación]
 *     description: Redirige al usuario a la página de consentimiento de GitHub para la autenticación.
 *     responses:
 *       302:
 *         description: Redirección a GitHub para autenticación.
 */
router.get(
    '/github',
    passport.authenticate('github', {
        scope: ['user:email'],
    })
);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: Callback para la autenticación de GitHub.
 *     tags: [Autenticación]
 *     description: Endpoint al que GitHub redirige después de la autenticación del usuario.
 *     responses:
 *       302:
 *         description: Redirección al frontend tras la autenticación exitosa o fallida.
 *       401:
 *         description: Autenticación de GitHub fallida.
 */
router.get(
    '/github/callback',
    passport.authenticate('github', {
        failureRedirect: process.env.FRONTEND_URL + '/login?error=github_auth_failed',
        session: true
    }),
    (req, res) => {
        const token = authController.generateToken(req.user);
        res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}&role=${req.user.role}`);
    }
);

/**
 * @swagger
 * /auth/current-user:
 *   get:
 *     summary: Obtiene la información del usuario actualmente autenticado.
 *     tags: [Autenticación]
 *     description: Retorna si el usuario está autenticado y, si lo está, su información.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/current-user', authMiddleware, (req, res) => {
    if (req.user) {
        res.status(200).json({
            isAuthenticated: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
                profilePicture: req.user.profilePicture || null,
                settings: req.user.settings || null,
            },
        });
    } else {
        // En teoría, si el authMiddleware no pasa, esto no debería ejecutarse o debería
        // haberse enviado un 401. Sin embargo, para mayor robustez o si se accede
        // a esta ruta sin token (ej. para verificar si hay una sesión activa de otra forma),
        // mantenemos la respuesta de "no autenticado".
        res.status(200).json({
            isAuthenticated: false,
            message: "Usuario no autenticado.",
            user: null
        });
    }
});

/**
 * @swagger
 * /auth/{userId}/profile:
 *   get:
 *     summary: Obtiene el perfil de un usuario específico.
 *     tags: [Perfil de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del usuario cuyo perfil se desea obtener.
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 role:
 *                   type: string
 *                   example: "user"
 *                 profilePictureUrl:
 *                   type: string
 *                   nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Perfil de usuario no encontrado.
 */
router.get('/:userId/profile', authMiddleware, authController.getUserProfile);

/**
 * @swagger
 * /auth/{userId}/profile:
 *   put:
 *     summary: Actualiza el perfil de un usuario.
 *     tags: [Perfil de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del usuario cuyo perfil se desea actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "nuevo_usuario"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo.email@example.com"
 *               currentPassword:
 *                 type: string
 *                 description: Requerido si se cambia la contraseña
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña
 *               profilePhotoUrl:
 *                 type: string
 *                 nullable: true
 *                 example: "http://example.com/new_photo.jpg"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil actualizado exitosamente."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Perfil de usuario no encontrado.
 */
router.put('/:userId/profile', authMiddleware, authController.updateUserProfile);

/**
 * @swagger
 * /auth/{userId}/profile/photo:
 *   post:
 *     summary: Sube una foto de perfil para un usuario.
 *     tags: [Perfil de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del usuario cuya foto de perfil se desea actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profilePhoto
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen para la foto de perfil.
 *     responses:
 *       200:
 *         description: Foto de perfil actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Foto de perfil actualizada correctamente."
 *                 profilePhotoUrl:
 *                   type: string
 *                   nullable: true
 *                   example: "/uploads/profilePhoto-1678912345678.jpg"
 *       400:
 *         description: No se proporcionó ningún archivo o tipo de archivo inválido.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Usuario no encontrado.
 */
router.post('/:userId/profile/photo', authMiddleware, upload, authController.uploadProfilePhoto);

/**
 * @swagger
 * /auth/{userId}/profile/photo:
 *   delete:
 *     summary: Elimina la foto de perfil de un usuario.
 *     tags: [Perfil de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del usuario cuya foto de perfil se desea eliminar.
 *     responses:
 *       200:
 *         description: Foto de perfil eliminada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Foto de perfil eliminada correctamente."
 *                 profilePhotoUrl:
 *                   type: string
 *                   nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Usuario no encontrado.
 */
router.delete('/:userId/profile/photo', authMiddleware, authController.deleteProfilePhoto);

/**
 * @swagger
 * /auth/{userId}/settings:
 *   get:
 *     summary: Obtiene las configuraciones de un usuario específico.
 *     tags: [Configuración de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del usuario cuyas configuraciones se desean obtener.
 *     responses:
 *       200:
 *         description: Configuraciones del usuario obtenidas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Objeto JSON con las configuraciones del usuario.
 *               properties:
 *                 emailNotifications:
 *                   type: boolean
 *                 pushNotifications:
 *                   type: boolean
 *                 profileVisibility:
 *                   type: string
 *                   enum: [public, private]
 *                 language:
 *                   type: string
 *               example:
 *                 emailNotifications: true
 *                 pushNotifications: false
 *                 profileVisibility: public
 *                 language: es
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Usuario no encontrado.
 */
router.get('/:userId/settings', authMiddleware, authController.getUserSettings);

/**
 * @swagger
 * /auth/{userId}/settings:
 *   put:
 *     summary: Actualiza las configuraciones de un usuario específico.
 *     tags: [Configuración de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del usuario cuyas configuraciones se desean actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Objeto JSON con las nuevas configuraciones. Las propiedades no incluidas conservarán su valor actual.
 *             properties:
 *               emailNotifications:
 *                 type: boolean
 *               pushNotifications:
 *                 type: boolean
 *               profileVisibility:
 *                 type: string
 *                 enum: [public, private]
 *               language:
 *                 type: string
 *             example:
 *               emailNotifications: false
 *               language: en
 *     responses:
 *       200:
 *         description: Configuraciones del usuario actualizadas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Configuración de usuario actualizada con éxito."
 *                 settings:
 *                   type: object
 *                   properties:
 *                     emailNotifications:
 *                       type: boolean
 *                     pushNotifications:
 *                       type: boolean
 *                     profileVisibility:
 *                       type: string
 *                       enum: [public, private]
 *                     language:
 *                       type: string
 *                   example:
 *                     emailNotifications: false
 *                     pushNotifications: false
 *                     profileVisibility: public
 *                     language: en
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Usuario no encontrado.
 */
router.put('/:userId/settings', authMiddleware, authController.updateUserSettings);

/**
 * @swagger
 * /auth/applications:
 *   post:
 *     summary: Registra una nueva postulación a una oferta de trabajo
 *     description: |
 *       Crea un registro de postulación asociando al usuario autenticado con una oferta de trabajo.
 *       - Valida que el jobId exista en el cuerpo de la solicitud.
 *       - Evita duplicados (retorna HTTP 200 si ya existe la postulación).
 *       - Requiere autenticación JWT.
 *     tags:
 *       - Postulaciones
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
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *                 description: ID de la oferta de trabajo a postularse.
 *     responses:
 *       201:
 *         description: Postulación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       200:
 *         description: Postulación ya existente (evita duplicados)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       400:
 *         description: Datos inválidos (ej. jobId faltante)
 *       401:
 *         description: No autorizado (token inválido o no proporcionado)
 *       500:
 *         description: Error interno del servidor
 */
router.post('/applications', authMiddleware, authController.createApplication);

/**
 * @swagger
 * /auth/applications:
 *   get:
 *     summary: Obtiene el historial de postulaciones del usuario autenticado
 *     description: |
 *       Retorna un listado detallado de todas las ofertas de trabajo a las que
 *       el usuario ha aplicado, incluyendo los datos completos de cada oferta.
 *       Requiere autenticación mediante JWT.
 *     tags:
 *       - Postulaciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de postulaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lista de postulaciones obtenida exitosamente."
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobApplicationWithDetails'
 *       401:
 *         description: No autorizado (token inválido o no proporcionado)
 *       500:
 *         description: Error interno del servidor
 *
 * components:
 *   schemas:
 *     JobApplicationWithDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         userId:
 *           type: string
 *           format: uuid
 *         jobId:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [pending, reviewed, rejected, accepted]
 *           example: "pending"
 *         applicationDate:
 *           type: string
 *           format: date-time
 *         Job:
 *           $ref: '#/components/schemas/Job'
 */
router.get('/applications', authMiddleware, authController.getAppliedJobs);
/**
 * @swagger
 * /auth/password:
 *   put:
 *     summary: Actualiza la contraseña del usuario
 *     tags: [Perfil de Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Contraseña actual incorrecta o datos inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/password', authMiddleware, authController.updateUserPassword);

module.exports = router;