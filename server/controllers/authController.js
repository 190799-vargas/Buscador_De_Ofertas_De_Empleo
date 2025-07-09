// server/controllers/authController.js
// Lógica para registro, login, logout y perfil de usuario
const bcrypt = require('bcrypt'); // bcrypt para el hashing de contraseñas
const jwt = require('jsonwebtoken'); // jsonwebtoken para manejar JWTs
const { User, JobApplication, Job } = require('../models'); // / Importa el modelo User de Sequelize
const fs = require('fs'); // Módulo de Node.js para manejar el sistema de archivos
const path = require('path'); // Módulo de Node.js para manejar rutas de archivos
const { Op } = require('sequelize'); // Importa Op para operaciones de Sequelize

/**
 * Función auxiliar para generar un JSON Web Token (JWT).
 * Utiliza la información del usuario y el secreto definido en las variables de entorno.
 * @param {Object} user - Objeto de usuario con propiedades como id, username y role.
 * @returns {string} - El token JWT generado.
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role:user.role,
            profilePicture: user.profilePicture || null,
            settings: user.settings || null // Incluye las configuraciones del usuario en el payload del token
        }, // Payload del token con todos los datos
        process.env.JWT_SECRET, // Secreto para firmar el token (desde las variables de entorno)
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Tiempo de expiración del token (desde variables de entorno o 1 hora por defecto)
    );
};

/**
 * @async
 * Controlador para el registro de nuevos usuarios.
 * Recibe username, email y password del cuerpo de la solicitud.
 * Hashea la contraseña y crea un nuevo usuario en la base de datos.
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * @returns {Promise<void>} - Respuesta HTTP con el token JWT y datos del usuario o error.
 */
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body; // Extrae los datos del cuerpo de la solicitud

        // 1. Verificar si el nombre de usuario ya existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            // si el usuario ya existe, devuelve un error 400
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
        }

        // 2. Verificar si el email ya está registrado
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            // Si el email ya está registrado, devuelve un error 400
            return res.status(400).json({ message: 'El email ya está registrado. Por favor, inicia sesión o usa otro email.' });
        }

        // 3. Hashear la contraseña antes de guardarla en la base de datos para mayor seguridad
        const hashedPassword = await bcrypt.hash(password, 10); // Genera un hash con un "salt" de 10 rondas

        // 4. Crear un nuevo usuario en la base de datos
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword, // Guarda la contraseña hasheada
            role: 'user', // Asigna el rol 'user' por defecto a los usuarios que se registran
            profilePicture: null, // Inicializa la foto de perfil como nula
        });

        // 5. Generar un token JWT para el nuevo usuario
        const token = generateToken(newUser);

        // 6. Enviar una respuesta exitosa (código 201 created) con el token y los datos del usuario
        res.status(201).json({
            message: '¡Registro exitoso! Bienvenido.',
            token, // El token JWT para futuras peticiones autenticadas
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                profilePicture: newUser.profilePicture || null,
                settings: newUser.settings || null, // Incluye las configuraciones iniciales

            },
        });
    } catch (error) {
        // Si ocurre algún error durante el proceso, se pasa al middleware de manejo de errores
        console.error('Error en el registro de usuario:', error);
        next(error);
    }
};

/**
 * @async
 * Controlador para el inicio de sesión de usuarios.
 * Recibe username y password del cuerpo de la solicitud.
 * Verifica las credenciales y genera un JWT si son válidas.
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * @returns {Promise<void>} - Respuesta HTTP con el token JWT y datos del usuario o error.
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body; // Extrae el nombre de usuario y la contraseña

         // 1. Validaciones iniciales para asegurar que se recibieron ambos campos
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
        }

        // 1. Buscar el usuario en la base de datos por su nombre de usuario o email
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            // Si el usuario no existe, devuelve un error 400
            return res.status(400).json({ message: 'Credenciales inválidas. Usuario no encontrado.' });
        }

        // 2. Comparar la contraseña proporcionada con el hash almacenado en la base de datos
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Si las contraseñas no coinciden, devuelve un error 400
            return res.status(400).json({ message: 'Credenciales inválidas. Contraseña incorrecta.' });
        }

        // 3. Si las credenciales son válidas, generar un token JWT para el usuario
        const token = generateToken(user);

        // 4. Enviar una respuesta exitosa (código 200 OK) con el token y los datos del usuario
        res.status(200).json({
            message: '¡Inicio de sesión exitoso!',
            token, // El token JWT
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture || null, // Asegúrate de incluir profilePicture
                settings: user.settings || null, // Incluye las configuraciones del usuario

            },
        });
    } catch (error) {
        // Si ocurre algún error, se pasa al middleware de manejo de errores
        console.error('Error en el inicio de sesión:', error);
        next(error);
    }
};

/**
 * @async
 * Obtiene los datos del perfil de un usuario.
 * Requiere autenticación. El ID del usuario se obtiene del token JWT.
 * @param {Object} req - Objeto de la solicitud HTTP (req.user contiene el usuario autenticado).
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 */
exports.getUserProfile = async (req, res, next) => {
    try {
        // El ID del usuario autenticado ya está disponible en req.user.id
        // No necesitamos req.params.userId ni la verificación de igualdad
        // porque el middleware de autenticación ya garantizó que req.user
        // existe y corresponde al token válido.
        const user = await User.findByPk(req.user.id);

        if (!user) {
            // Esto solo debería ocurrir si el usuario fue eliminado después de la autenticación
            // pero antes de esta llamada, lo cual es poco probable pero posible.
            return res.status(404).json({ message: 'Perfil de usuario no encontrado.' });
        }

        // Devolver solo los datos seguros del perfil
        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePictureUrl: user.profilePicture || null,
            settings: user.settings || null,
        });
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        next(error);
    }
};

// --- MODIFIED updateUserProfile ---
/**
 * @async
 * Actualiza el perfil de un usuario.
 * Permite actualizar username, email y opcionalmente la contraseña.
 * Requiere autenticación. El ID del usuario se obtiene del token JWT.
 * @param {Object} req - Objeto de la solicitud HTTP (req.user contiene el usuario autenticado).
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 */
exports.updateUserProfile = async (req, res, next) => {
    try {
        // El ID del usuario autenticado ya está disponible en req.user.id
        // No necesitamos req.params.userId ni la verificación de igualdad.
        const { username, email, currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id); // Usamos req.user.id directamente
        if (!user) {
            return res.status(404).json({ message: 'Perfil de usuario no encontrado.' });
        }

        const updates = {};
        if (username !== undefined) {
            updates.username = username;
        }
        if (email !== undefined && email !== user.email) {
            // Verificar si el nuevo email ya está en uso por otro usuario
            // Usamos Op para asegurarnos de que no sea el mismo usuario
            const existingEmail = await User.findOne({ 
                where: { 
                    email: email, 
                    id: { [Op.ne]: user.id } // Usamos user.id (o req.user.id) y el Op importado
                } 
            });
            if (existingEmail) {
                return res.status(400).json({ message: 'El nuevo correo electrónico ya está en uso.' });
            }
            updates.email = email;
        }

        // Lógica para cambiar la contraseña
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Se requiere la contraseña actual para cambiarla.' });
            }
            const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
            }
            if (newPassword.length < 8) { // Validación básica de longitud
                return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
            }
            updates.password = await bcrypt.hash(newPassword, 10); // Hashear la nueva contraseña
        }

        await user.update(updates);

        // Devolver el usuario actualizado (sin la contraseña hasheada)
        res.status(200).json({
            message: 'Perfil actualizado exitosamente.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture || null,
                settings: user.settings || null,
            },
        });
    } catch (error) {
        console.error('Error al actualizar el perfil del usuario:', error);
        next(error);
    }
};


/**
 * @async
 * Sube una foto de perfil para un usuario.
 * Requiere autenticación y que el usuario sea el propietario del perfil.
 * Utiliza Multer para manejar la carga del archivo.
 * @param {Object} req - Objeto de la solicitud HTTP (req.file contiene el archivo subido).
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 */
exports.uploadProfilePhoto = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Multer coloca la información del archivo en req.file
        if (!req.file) {
            // Si Multer no procesó un archivo, podría ser un error de archivo (tamaño, tipo)
            // o simplemente que no se envió ningún archivo.
            // Multer ya habrá manejado el error de tipo/tamaño, si llega aquí es que no se envió nada.
            return res.status(400).json({ message: 'No se ha proporcionado ningún archivo para subir.' });
        }

        // Construye la URL de acceso público a la imagen subida
        // El nombre del archivo está en req.file.filename (definido en Multer storage)
        // La URL pública será '/uploads/' + nombre del archivo (servido por express.static en app.js)
        const photoUrl = `/uploads/${req.file.filename}`;

        // Verificación de autorización: asegura que el usuario autenticado es el propietario del perfil
        if (req.user.id !== userId) {
            // Si el usuario no está autorizado, elimina el archivo que Multer ya ha guardado
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error al eliminar archivo no autorizado:', err);
                });
            }
            return res.status(403).json({ message: 'Acceso denegado: No autorizado para actualizar la foto de este perfil.' });
        }

        // Busca el usuario en la base de datos
        const user = await User.findByPk(userId);
        if (!user) {
            // Si el usuario no se encuentra, elimina el archivo subido
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error al eliminar archivo por usuario no encontrado:', err);
                });
            }
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Si el usuario ya tiene una foto de perfil y esta es una subida local previa, la eliminamos del disco
        // Esto evita que se acumulen archivos "huérfanos" en el servidor.
        // Solo eliminamos si la URL comienza con '/uploads/', para no borrar fotos de servicios externos.
        if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
            const oldPhotoPath = path.join(__dirname, '..', 'public', user.profilePicture);
            fs.unlink(oldPhotoPath, (err) => {
                // No lanzamos error si falla la eliminación del archivo antiguo, solo lo registramos
                if (err) console.error('Error al eliminar foto de perfil antigua:', err);
            });
        }

        // Actualiza la ruta de la foto de perfil en la base de datos del usuario
        await user.update({ profilePicture: photoUrl });

        // Envía una respuesta exitosa con la URL de la nueva foto
        res.status(200).json({
            message: 'Foto de perfil actualizada correctamente.',
            profilePhotoUrl: user.profilePicture, // Devuelve la URL actualizada
        });
    } catch (error) {
        // Maneja errores que puedan venir de Multer (ej. "Error: Images Only!")
        // o cualquier otro error durante el procesamiento.
        console.error('Error al subir la foto de perfil:', error);
        // Si hay un error *después* de que Multer subió el archivo, asegúrate de eliminarlo
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error al eliminar archivo tras error de procesamiento:', err);
            });
        }
        next(error); // Pasa el error al middleware de manejo de errores centralizado
    }
};

/**
 * @async
 * Elimina la foto de perfil de un usuario.
 * Esto significa establecer `profilePicture` a nulo en la base de datos.
 * Requiere autenticación y que el usuario sea el propietario del perfil.
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 */
exports.deleteProfilePhoto = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Acceso denegado: No autorizado para eliminar la foto de este perfil.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Si existe una foto de perfil y es una subida local, la eliminamos del sistema de archivos ---
        if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
            const photoPathToDelete = path.join(__dirname, '..', 'public', user.profilePicture);
            fs.unlink(photoPathToDelete, (err) => {
                if (err) console.error('Error al eliminar archivo de foto de perfil:', err);
            });
        }

        await user.update({ profilePicture: null }); // Elimina la URL de la foto

        res.status(200).json({
            message: 'Foto de perfil eliminada correctamente.',
            profilePhotoUrl: null, // Confirma que la URL ha sido eliminada
        });
    } catch (error) {
        console.error('Error al eliminar la foto de perfil:', error);
        next(error);
    }
};

/**
 * @async
 * Obtiene las configuraciones de un usuario específico.
 * Requiere autenticación y que el usuario sea el propietario de las configuraciones.
 * @param {Object} req - Objeto de la solicitud HTTP (req.user contiene el usuario autenticado).
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 */
exports.getUserSettings = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Verificar que el usuario autenticado (req.user.id)
        // coincida con el userId en los parámetros de la URL.
        if (req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para acceder a estas configuraciones' 
            });
        }

        // Encuentra al usuario por ID y selecciona solo el campo 'settings'
        const user = await User.findByPk(userId, {
            attributes: ['id','settings'], // Solo obtenemos el campo 'settings'
            raw: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Configuración por defecto si no existe
        const defaultSettings = {
            notifications: {
                email: true,
                push: true,
                news: true
            },
            privacy: {
                profileVisibility: 'public',
                searchVisibility: true
            },
            appearance: {
                theme: 'light',
                fontSize: 'medium'
            }
        };

        // Fusionar con configuración por defecto si es necesario
        const userSettings = user.settings || {};
        const mergedSettings = {
            ...defaultSettings,
            ...userSettings
        };

        // Sequelize automáticamente parsea JSONB a un objeto JS.
        // Si el campo settings fuera nulo por alguna razón (poco probable con defaultValue),
        // podrías devolver un objeto predeterminado aquí para mayor seguridad.
        res.status(200).json({
            success: true,
            settings: mergedSettings
        });
    } catch (error) {
        console.error('Error al obtener la configuración del usuario (error en getUserSettings:):', error);
        next(error); // Pasa el error al middleware de manejo de errores centralizado
    }
};

/**
 * @async
 * Actualiza las configuraciones de un usuario específico.
 * Requiere autenticación y que el usuario sea el propietario de las configuraciones.
 * @param {Object} req - Objeto de la solicitud HTTP (req.user contiene el usuario autenticado).
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 */
exports.updateUserSettings = async (req, res, next) => {
    try {
        const { userId } = req.params;
        // El body de la solicitud ya es el objeto de settings completo desde el frontend
        const newSettings = req.body;

        // Validación básica
        if (!newSettings || typeof newSettings !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Configuración no válida'
            });
        }

        // Verificación de autorización
        if (req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para actualizar estas configuraciones'
            });
        }

        // Validar estructura de settings
        const validSections = ['notifications', 'privacy', 'appearance'];
        const invalidSections = Object.keys(newSettings).filter(
            key => !validSections.includes(key)
        );

        if (invalidSections.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Secciones no válidas: ${invalidSections.join(', ')}`
            });
        }

        // Validar valores específicos
        if (newSettings.privacy?.profileVisibility) {
            const validVisibilities = ['public', 'private', 'connections'];
            if (!validVisibilities.includes(newSettings.privacy.profileVisibility)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor de visibilidad no válido'
                });
            }
        }

        if (newSettings.appearance?.theme) {
            const validThemes = ['light', 'dark', 'system'];
            if (!validThemes.includes(newSettings.appearance.theme)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tema no válido'
                });
            }
        }

        // Actualizar en base de datos
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Merge inteligente con configuración existente
        user.settings = {
            ...(user.settings || {}),
            ...newSettings
        };

        await user.save();

        // Devolver configuración actualizada
        res.status(200).json({
            success: true,
            message: 'Configuración actualizada correctamente',
            settings: user.settings
        });

    } catch (error) {
        console.error('Error en updateUserSettings:', error);
        next(error);
    }
};

/**
 * @desc Registra una nueva postulación de usuario a una oferta de trabajo.
 * @route POST /auth/applications
 * @access Private (Requiere autenticación)
 * 
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.jobId - ID de la oferta de trabajo a la que se postula.
 * @param {Object} req.user - Usuario autenticado (proveniente de authMiddleware).
 * @param {string} req.user.id - ID del usuario que realiza la postulación.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Función para pasar errores al middleware de manejo de errores.
 * 
 * @returns {Object} Respuesta JSON con:
 * - 201 Created: Postulación creada exitosamente (incluye objeto `application`).
 * - 200 OK: Postulación previamente existente (evita duplicados).
 * - 400 Bad Request: Si falta `jobId`.
 * - 500 Internal Server Error: En caso de fallo en la base de datos.
 * 
 * @throws {Error} 
 * - Errores de validación de Sequelize.
 * - Errores de conexión a la base de datos.
 * 
 * @example
 * POST /api/applications
 * Body: { "jobId": "123e4567-e89b-12d3-a456-426614174000" }
 * Response (éxito):
 * {
 *   "message": "Postulación registrada exitosamente...",
 *   "application": {
 *     "id": "567e4567-e89b-12d3-a456-426614174000",
 *     "userId": "123e4567-e89b-12d3-a456-426614174000",
 *     "jobId": "123e4567-e89b-12d3-a456-426614174000",
 *     "status": "pending",
 *     "applicationDate": "2023-12-31T00:00:00.000Z"
 *   }
 * }
 */
exports.createApplication = async (req, res, next) => {
    try {
        const { jobId } = req.body;
        const userId = req.user.id; // ID de usuario del authMiddleware

        if (!jobId) {
            return res.status(400).json({ message: 'El ID del trabajo es requerido.' });
        }

        // Verificar si el usuario ya ha registrado una postulación para este trabajo
        const existingApplication = await JobApplication.findOne({
            where: { userId, jobId }
        });

        if (existingApplication) {
            // Si ya existe un registro de postulación, simplemente devuelve un mensaje de éxito/información.
            // No queremos crear duplicados si el usuario hace clic varias veces.
            return res.status(200).json({
                message: 'Ya has registrado una postulación para este trabajo a través de nuestra plataforma.',
                application: existingApplication
            });
        }

        const newApplication = await JobApplication.create({
            userId,
            jobId,
            status: 'pending', // Estado por defecto: 'pending' (significa, registrado de tu lado, esperando acción/cambio de estado externo)
            applicationDate: new Date()
        });

        res.status(201).json({
            message: 'Postulación registrada exitosamente en nuestra plataforma.',
            application: newApplication
        });

    } catch (error) {
        console.error('Error al registrar la postulación:', error);
        next(error); // Pasa al middleware de manejo de errores
    }
};

/**
 * @desc Obtiene todas las postulaciones de trabajo del usuario autenticado, 
 *       incluyendo los detalles completos de cada oferta asociada.
 * @route GET /auth/applications
 * @access Private (Requiere autenticación)
 * 
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} req.user - Usuario autenticado (proveniente de authMiddleware).
 * @param {string} req.user.id - ID del usuario cuyas postulaciones se consultan.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Función para pasar errores al middleware de manejo de errores.
 * 
 * @returns {Object} Respuesta JSON con:
 * - 200 OK: Lista de postulaciones con detalles de ofertas.
 * - 500 Internal Server Error: En caso de fallo en la base de datos.
 * 
 * @throws {Error} 
 * - Errores de validación de Sequelize.
 * - Errores de conexión a la base de datos.
 * 
 * @example
 * GET /auth/applications
 * Headers: { Authorization: "Bearer <token>" }
 * Response (éxito):
 * {
 *   "message": "Lista de postulaciones obtenida exitosamente.",
 *   "applications": [
 *     {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "userId": "123e4567-e89b-12d3-a456-426614174000",
 *       "jobId": "789e0123-e89b-12d3-a456-426614174000",
 *       "status": "pending",
 *       "applicationDate": "2023-12-31T00:00:00.000Z",
 *       "Job": {
 *         "id": "789e0123-e89b-12d3-a456-426614174000",
 *         "title": "Desarrollador Frontend",
 *         "companyName": "Tech Corp",
 *         "location": "Madrid, España",
 *          ...otros campos del Job
 *       }
 *     }
 *   ]
 * }
 */ 
exports.getAppliedJobs = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const applications = await JobApplication.findAll({
            where: { userId },
            include: [{
                model: Job, // Esto incluye el objeto completo del Job anidado dentro de cada postulación
                attributes: [ // Lista los atributos del Job que deseas incluir para no sobrecargar
                    'id', 'title', 'companyName', 'location', 'country',
                    'employmentType', 'description', 'postedAt', 'sourceUrl', 'sourceName',
                    'salary', 'experienceRequired', 'requirements', 'modality',
                    'creationDate', 'deadlineDate'
                ]
            }],
            order: [['applicationDate', 'DESC']] // Ordena por fecha de postulación descendente
        });

        res.status(200).json({
            message: 'Lista de postulaciones obtenida exitosamente.',
            applications: applications
        });

    } catch (error) {
        console.error('Error al obtener las postulaciones del usuario:', error);
        next(error);
    }
};

/**
 * @async
 * Actualiza la contraseña del usuario
 * @param {Object} req - Objeto de la solicitud HTTP (req.user contiene el usuario autenticado)
 * @param {Object} res - Objeto de la respuesta HTTP
 * @param {Function} next - Función para pasar el control al siguiente middleware
 */
exports.updateUserPassword = async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    try {
        // 1. Validaciones iniciales mejoradas
        const missingFields = [];
        if (!currentPassword) missingFields.push('contraseña actual');
        if (!newPassword) missingFields.push('nueva contraseña');
        if (!confirmPassword) missingFields.push('confirmación de contraseña');

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: `Campos requeridos: ${missingFields.join(', ')}`,
                errorType: 'MISSING_FIELDS'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Las contraseñas no coinciden',
                errorType: 'PASSWORD_MISMATCH'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'La nueva contraseña debe ser diferente a la actual',
                errorType: 'SAME_PASSWORD'
            });
        }

        // 2. Validación de fortaleza mejorada
        const passwordRequirements = {
            minLength: 8,
            hasUpper: /[A-Z]/.test(newPassword),
            hasLower: /[a-z]/.test(newPassword),
            hasNumber: /\d/.test(newPassword),
            hasSpecial: /[@$!%*?&]/.test(newPassword)
        };

        if (
            newPassword.length < passwordRequirements.minLength ||
            !passwordRequirements.hasUpper ||
            !passwordRequirements.hasLower ||
            !passwordRequirements.hasNumber ||
            !passwordRequirements.hasSpecial
        ) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener:',
                requirements: {
                    minLength: passwordRequirements.minLength,
                    needsUpper: !passwordRequirements.hasUpper,
                    needsLower: !passwordRequirements.hasLower,
                    needsNumber: !passwordRequirements.hasNumber,
                    needsSpecial: !passwordRequirements.hasSpecial
                },
                errorType: 'WEAK_PASSWORD'
            });
        }

        // 3. Obtener usuario con manejo de caché
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'password', 'authProvider'] // Solo campos necesarios
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
                errorType: 'USER_NOT_FOUND'
            });
        }

        // 4. Verificación mejorada para usuarios OAuth
        if (user.authProvider !== 'local' && !user.password) {
            return res.status(403).json({ 
                success: false,
                message: 'Los usuarios registrados con OAuth deben establecer una contraseña primero',
                errorType: 'OAUTH_USER'
            });
        }

        // 5. Verificación de contraseña actual con protección contra timing attacks
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            // Registrar intento fallido (para posible bloqueo después de X intentos)
            console.warn(`Intento fallido de cambio de contraseña para usuario ${user.id}`);
            
            return res.status(401).json({ 
                success: false,
                message: 'La contraseña actual es incorrecta',
                errorType: 'INVALID_CURRENT_PASSWORD'
            });
        }

        // 6. Hashear con costo adaptable
        const saltRounds = process.env.PASSWORD_SALT_ROUNDS || 12;
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(saltRounds));

        // 7. Actualización atómica con transacción
        const transaction = await sequelize.transaction();
        try {
            await user.update({
                password: hashedPassword,
                passwordChangedAt: new Date(),
                passwordResetToken: null,
                passwordResetExpires: null
            }, { transaction });

            // Invalida tokens existentes (opcional, para mayor seguridad)
            await Token.destroy({
                where: { userId: user.id },
                transaction
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        // 9. Respuesta exitosa con información relevante
        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente',
            changedAt: new Date(),
            nextSteps: [
                'Todos tus dispositivos deberán iniciar sesión nuevamente',
                'Guarda tu nueva contraseña en un lugar seguro'
            ]
        });

    } catch (error) {
        console.error('Error en updateUserPassword:', {
            userId: req.user?.id,
            error: error.message,
            stack: error.stack
        });

        // Manejo especial para errores de Sequelize
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación en la base de datos',
                errorType: 'VALIDATION_ERROR'
            });
        }

        next(error);
    }
};

// Exportar la función generateToken para que pueda ser utilizada en las rutas de OAuth
exports.generateToken = generateToken;

// Nota sobre el "logout" en JWT:
// Con JWT, el "logout" se gestiona principalmente en el frontend.
// Simplemente se elimina el token del almacenamiento local o de sesión del navegador.
// No hay necesidad de una ruta de backend de "logout" a menos que se implementen listas negras de tokens,
// lo cual añade complejidad y generalmente no es necesario para la mayoría de las aplicaciones JWT.

