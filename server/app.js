// server/app.js
// Archivo principal de Express, configura rutas, middleware, y arranca el servidor
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env al inicio de la aplicación

const express = require('express');
const cors = require('cors'); // Middleware para habilitar CORS
const session = require('express-session'); // Middleware para manejar sesiones (requerido por Passport.js para OAuth)
const passport = require('passport');       // Core de Passport.js para autenticación
require('./config/passport-setup'); // Importa y ejecuta la configuración de estrategias de Passport (Google, GitHub)

const { syncDatabase } = require('./models'); // Importa la función para sincronizar la base de datos
const authRoutes = require('./routes/authRoutes'); // Rutas de autenticación
const jobRoutes = require('./routes/jobRoutes'); // Rutas de empleos
const favoriteRoutes = require('./routes/favoriteRoutes'); // Rutas de favoritos

const errorHandler = require('./utils/errorHandler'); // Middleware centralizado para el manejo de errores

const swaggerUi = require('swagger-ui-express'); // Middleware para servir la interfaz de usuario de Swagger
const swaggerSpec = require('./docs/swagger'); // Configuración de la especificación de Swagger

const app = express();
const PORT = process.env.PORT || 5000; // Puerto en el que se ejecutará el servidor (por defecto 5000)

// --- Middlewares Globales ---

// Habilita Cross-Origin Resource Sharing (CORS) para permitir que el frontend se comunique con el backend.
// Se configura para permitir el origen de tu frontend y el envío de credenciales (cookies/sesiones).
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL del frontend, desde .env
    credentials: true, // Permite que las cookies de sesión (para OAuth) sean enviadas y recibidas
}));

// Habilita el parseo de cuerpos de solicitud en formato JSON.
// Esto es necesario para que Express pueda leer los datos enviados en el body de las peticiones POST/PUT.
app.use(express.json());

// Configuración del middleware de sesión.
// Es ESENCIAL para el flujo de autenticación de Passport.js, ya que Passport utiliza sesiones.
app.use(session({
    secret: process.env.SESSION_SECRET, // Secreto utilizado para firmar la cookie de sesión (desde .env)
    resave: false,                      // Evita guardar la sesión si no ha sido modificada
    saveUninitialized: false,           // Evita crear una sesión hasta que algo se almacene en ella
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // Duración de la cookie de sesión (ej. 24 horas en milisegundos)
        // secure: process.env.NODE_ENV === 'production', // ¡Habilitar solo en producción con HTTPS!
        httpOnly: true, // La cookie solo es accesible por el servidor HTTP, no por JavaScript del cliente
        sameSite: 'lax', // Protege contra ataques CSRF; 'lax' es un buen balance entre seguridad y usabilidad
    }
}));

// Inicializa Passport.js para su uso en la aplicación.
app.use(passport.initialize());
// Habilita la integración de Passport con las sesiones de Express.
// Esto permite que Passport gestione la sesión del usuario a través de cookies.
app.use(passport.session());

// --- NUEVO: Servir archivos estáticos desde la carpeta 'public/uploads' ---
// Esto permite que las imágenes subidas sean accesibles a través de URLs como http://localhost:5000/uploads/nombre-de-la-imagen.jpg
app.use('/uploads', express.static('public/uploads'));

// --- Rutas de la API ---

// Define la ruta base '/api/auth' para todas las rutas de autenticación.
app.use('/api/auth', authRoutes);
// Define la ruta base '/api/jobs' para todas las rutas de empleos.
app.use('/api/jobs', jobRoutes);
// Define la ruta base '/api/favorites' para todas las rutas de empleos favoritos.
app.use('/api/favorites', favoriteRoutes);

// --- Documentación de Swagger UI ---

// Sirve la interfaz de usuario de Swagger en la ruta '/api-docs'.
// Puedes acceder a la documentación interactiva de tu API desde el navegador.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Middleware de Manejo de Errores ---

// Este middleware debe ser el ÚLTIMO middleware cargado en la aplicación,
// justo antes de que el servidor comience a escuchar las peticiones.
// Captura cualquier error que ocurra en los middlewares y rutas anteriores.
app.use(errorHandler);

// --- Inicio del Servidor ---

/**
 * Función asíncrona para iniciar el servidor Express.
 * Primero sincroniza los modelos de Sequelize con la base de datos,
 * y luego inicia el servidor para escuchar las peticiones HTTP.
 */
async function startServer() {
    // Sincroniza la base de datos (crea tablas si no existen, o altera si es necesario).
    // Esto asegura que la DB esté lista antes de que la aplicación reciba peticiones.
    await syncDatabase();

    // Inicia el servidor y lo pone a escuchar en el puerto especificado.
    app.listen(PORT, () => {
        console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
        console.log(`Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
    });
}

// Llama a la función para iniciar el servidor.
startServer();