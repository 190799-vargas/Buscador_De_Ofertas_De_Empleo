// server/docs/swagger.js
// Configuración de Swagger/OpenAPI para la documentación de la API
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    // Definición de OpenAPI (anteriormente Swagger)
    definition: {
        openapi: '3.0.0', // Versión de OpenAPI Specification
        info: {
            title: 'API de Buscador de Empleos Full-Stack', // Título de la API que se mostrará en Swagger UI
            version: '1.0.0',                        // Versión de tu API
            description: 'Documentación de la API RESTful para el buscador de empleos, incluyendo funcionalidades de autenticación (JWT y OAuth), búsqueda de empleos con web scraping, y gestión de empleos favoritos.',
            contact: {
                name: 'Víctor Alfonso Vargas Díaz',         // Nombre del contacto
                email: 'victor19vargas2018@gmail.com', // Email del contacto (corregido el doble .com)
            },
        },
        // Definición de los servidores donde la API estará disponible
        servers: [
            {
                url: 'http://localhost:5000/api', // URL base de tu API en entorno de desarrollo
                description: 'Servidor de Desarrollo Local',
            },
            // Puedes añadir más servidores para entornos de staging o producción
            // {
            //   url: 'https://api.tudominio.com/api',
            //   description: 'Servidor de Producción',
            // },
        ],
        // Componentes reutilizables para la documentación (esquemas de datos, cabeceras, etc.)
        components: {
            // Esquemas de seguridad (cómo se autentican las peticiones)
            securitySchemes: {
                // Esquema para autenticación con Bearer Token (JWT)
                bearerAuth: {
                    type: 'http',      // Tipo de esquema HTTP
                    scheme: 'bearer',  // Esquema de autenticación 'bearer'
                    bearerFormat: 'JWT', // Formato del token (JWT)
                    description: 'Introduce el token JWT con el prefijo "Bearer ". Ejemplo: "Bearer eyJhbGciOiJIUzI1Ni..."',
                },
            },
            // Definición de esquemas de datos reutilizables (modelos)
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'ID único del usuario' },
                        username: { type: 'string', description: 'Nombre de usuario (único)' },
                        email: { type: 'string', format: 'email', description: 'Correo electrónico (único)' },
                        role: { type: 'string', enum: ['guest', 'user'], description: 'Rol del usuario' },
                        profilePicture: { type: 'string', format: 'url', nullable: true, description: 'URL de la foto de perfil (para usuarios OAuth)' },
                        createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación del usuario' },
                        updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización del usuario' },
                    },
                    example: {
                        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
                        username: 'usuarioEjemplo',
                        email: 'ejemplo@correo.com',
                        role: 'user',
                        profilePicture: 'https://example.com/pic.jpg',
                        createdAt: '2023-01-01T00:00:00.000Z',
                        updatedAt: '2023-01-01T00:00:00.000Z',
                    }
                },
                Login: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', description: 'Nombre de usuario del usuario' },
                        password: { type: 'string', format: 'password', description: 'Contraseña del usuario' },
                    },
                    example: {
                        username: 'testuser',
                        password: 'password123',
                    }
                },
                Register: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: { type: 'string', description: 'Nombre de usuario para el registro' },
                        email: { type: 'string', format: 'email', description: 'Correo electrónico para el registro' },
                        password: { type: 'string', format: 'password', description: 'Contraseña para el registro' },
                    },
                    example: {
                        username: 'nuevoUsuario',
                        email: 'nuevo@correo.com',
                        password: 'contraseñaSegura',
                    }
                },
                Job: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'ID único del empleo' },
                        title: { type: 'string', description: 'Título del puesto de trabajo' },
                        description: { type: 'string', description: 'Descripción completa del empleo' },
                        salary: { type: 'string', nullable: true, description: 'Salario o rango salarial' },
                        experienceRequired: { type: 'string', nullable: true, description: 'Experiencia requerida' },
                        requirements: { type: 'string', nullable: true, description: 'Requisitos del puesto' },
                        modality: { type: 'string', nullable: true, description: 'Modalidad de trabajo (Presencial, Remoto, Híbrido)' },
                        location: { type: 'string', description: 'Ubicación del empleo' },
                        creationDate: { type: 'string', format: 'date-time', nullable: true, description: 'Fecha de publicación del empleo' },
                        deadlineDate: { type: 'string', format: 'date-time', nullable: true, description: 'Fecha límite para aplicar al empleo' },
                        sourceUrl: { type: 'string', format: 'url', description: 'URL original del empleo (visible solo para usuarios autenticados)' },
                        sourceName: { type: 'string', description: 'Nombre de la plataforma de donde se obtuvo el empleo' },
                        country: { type: 'string', description: 'País del empleo' },
                        createdAt: { type: 'string', format: 'date-time', description: 'Fecha de registro del empleo en la DB' },
                        updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización del empleo en la DB' },
                    },
                    example: {
                        id: 'b2c3d4e5-f678-9012-3456-7890abcdef12',
                        title: 'Desarrollador Full Stack',
                        description: 'Se busca desarrollador con experiencia en React y Node.js para unirse a nuestro equipo.',
                        salary: '60000 - 80000 USD/año',
                        experienceRequired: '3+ años de experiencia',
                        requirements: 'Conocimiento en React, Node.js, PostgreSQL, APIs REST.',
                        modality: 'Remoto',
                        location: 'Bogotá, Colombia',
                        creationDate: '2024-06-20T10:00:00Z',
                        deadlineDate: '2024-07-20T23:59:59Z',
                        sourceUrl: 'https://www.ejemplo.com/empleo/123',
                        sourceName: 'LinkedIn',
                        country: 'co',
                        createdAt: '2024-06-20T10:05:00Z',
                        updatedAt: '2024-06-20T10:05:00Z',
                    }
                },
                // --- NUEVOS ESQUEMAS AGREGADOS ---
                JobApplication: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'ID único de la postulación' },
                        userId: { type: 'string', format: 'uuid', description: 'ID del usuario que postuló' },
                        jobId: { type: 'string', format: 'uuid', description: 'ID de la oferta de trabajo postulada' },
                        status: { type: 'string', enum: ['pending', 'reviewed', 'rejected', 'accepted'], description: 'Estado de la postulación' },
                        applicationDate: { type: 'string', format: 'date-time', description: 'Fecha en que se realizó la postulación' },
                        createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación del registro de postulación' },
                        updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización del registro de postulación' },
                    },
                    example: {
                        id: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
                        userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
                        jobId: 'b2c3d4e5-f678-9012-3456-7890abcdef12',
                        status: 'pending',
                        applicationDate: '2024-07-04T10:30:00Z',
                        createdAt: '2024-07-04T10:30:00Z',
                        updatedAt: '2024-07-04T10:30:00Z',
                    }
                },
                JobApplicationWithDetails: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'ID único de la postulación' },
                        userId: { type: 'string', format: 'uuid', description: 'ID del usuario que postuló' },
                        jobId: { type: 'string', format: 'uuid', description: 'ID de la oferta de trabajo postulada' },
                        status: { type: 'string', enum: ['pending', 'reviewed', 'rejected', 'accepted'], description: 'Estado de la postulación' },
                        applicationDate: { type: 'string', format: 'date-time', description: 'Fecha en que se realizó la postulación' },
                        createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación del registro de postulación' },
                        updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización del registro de postulación' },
                        Job: { // Referencia al esquema Job para incluir los detalles
                            $ref: '#/components/schemas/Job',
                            description: 'Detalles completos de la oferta de trabajo a la que se postuló.'
                        }
                    },
                    example: {
                        id: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
                        userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
                        jobId: 'b2c3d4e5-f678-9012-3456-7890abcdef12',
                        status: 'pending',
                        applicationDate: '2024-07-04T10:30:00Z',
                        createdAt: '2024-07-04T10:30:00Z',
                        updatedAt: '2024-07-04T10:30:00Z',
                        Job: {
                            id: 'b2c3d4e5-f678-9012-3456-7890abcdef12',
                            title: 'Desarrollador Full Stack',
                            description: 'Se busca desarrollador con experiencia en React y Node.js para unirse a nuestro equipo.',
                            salary: '60000 - 80000 USD/año',
                            experienceRequired: '3+ años de experiencia',
                            requirements: 'Conocimiento en React, Node.js, PostgreSQL, APIs REST.',
                            modality: 'Remoto',
                            location: 'Bogotá, Colombia',
                            creationDate: '2024-06-20T10:00:00Z',
                            deadlineDate: '2024-07-20T23:59:59Z',
                            sourceUrl: 'https://www.ejemplo.com/empleo/123',
                            sourceName: 'LinkedIn',
                            country: 'co',
                            createdAt: '2024-06-20T10:05:00Z',
                            updatedAt: '2024-06-20T10:05:00Z',
                        }
                    }
                }
            },
            // --- NUEVAS RESPUESTAS AGREGADAS ---
            responses: {
                Unauthorized: {
                    description: 'No autorizado. Token JWT inválido o no proporcionado.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', example: 'No autorizado. Token no proporcionado o inválido.' }
                                }
                            }
                        }
                    }
                },
                Forbidden: {
                    description: 'Acceso denegado. El usuario no tiene permisos suficientes para acceder a este recurso.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', example: 'Acceso denegado. No tienes los permisos necesarios.' }
                                }
                            }
                        }
                    }
                }
            }
        },
        // Definición de tags para organizar los endpoints en la interfaz de Swagger UI
        tags: [
            {
                name: 'Autenticación',
                description: 'Endpoints para el registro de usuarios, inicio de sesión tradicional y autenticación con proveedores OAuth (Google, GitHub).'
            },
            {
                name: 'Empleos',
                description: 'Endpoints para buscar ofertas de empleo y obtener detalles específicos de un empleo, incluyendo la funcionalidad de web scraping.'
            },
            {
                name: 'Favoritos',
                description: 'Endpoints para gestionar la lista de empleos favoritos de un usuario autenticado.'
            },
            { // Nuevo tag para Postulaciones
                name: 'Postulaciones',
                description: 'Endpoints para gestionar las postulaciones de los usuarios a ofertas de trabajo.'
            }
        ],
    },
    // Rutas donde Swagger-JSdoc buscará los comentarios JSDoc para generar la documentación
    apis: [
        './routes/*.js',    // Lee los comentarios en todos los archivos .js dentro de la carpeta routes
        './controllers/*.js' // Lee los comentarios en todos los archivos .js dentro de la carpeta controllers (aunque las anotaciones están en rutas, esto no estorba)
    ],
};

// Genera la especificación de Swagger (OpenAPI) a partir de las opciones definidas
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; // Exporta la especificación para ser usada por `swagger-ui-express` en `app.js`