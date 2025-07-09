// server/models/userModel.js
// Modelo de Sequelize para Usuarios
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/**
 * Define el modelo User para la tabla 'users' en la base de datos.
 * Incluye campos para autenticación tradicional y OAuth (Google, GitHub).
 */
const User = sequelize.define('User', {
    // `id`: Clave primaria única para cada usuario. Se genera automáticamente como un UUID v4.
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Genera un UUID v4 por defecto
        primaryKey: true,
    },
    // `username`: Nombre de usuario único para el inicio de sesión.
    username: {
        type: DataTypes.STRING,
        allowNull: true,            // Ahora puede ser nulo si el usuario se registra solo con OAuth
        unique: true,              // Debe ser único en la tabla
    },
    // `email`: Correo electrónico del usuario, también debe ser único y válido.
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,             // Valida que el valor sea un formato de correo electrónico válido
        },
    },
    // `password`: Almacenará el hash de la contraseña, puede ser nulo para usuarios OAuth
    password: {
        type: DataTypes.STRING,
        allowNull: true, // Permite que sea nulo si el usuario usa OAuth
    },
    // `role`: Define el tipo de rol del usuario. Puede ser 'guest' (invitado) o 'user' (usuario registrado).
    role: {
        type: DataTypes.ENUM('guest', 'user'), // Define un tipo de dato ENUM con valores permitidos
        defaultValue: 'guest',                // Valor por defecto para nuevos registros
        allowNull: false,
    },
    // Campos específicos para OAuth
    googleId: {
        type: DataTypes.STRING,
        unique: true, // Debe ser único para Google
        allowNull: true, // Puede ser nulo si el usuario no usa Google
    },
    githubId: {
        type: DataTypes.STRING,
        unique: true, // Debe ser único para GitHub
        allowNull: true, // Puede ser nulo si el usuario no usa GitHub
    },
    provider: {
        type: DataTypes.ENUM('local', 'github', 'google'),
        defaultValue: 'local',
    },
    providerId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profilePicture: {
        type: DataTypes.STRING, // Para almacenar la URL de la foto
        allowNull: true,
    },
    // Nuevo campo: `settings` para almacenar las preferencias del usuario como un objeto JSONB
    settings: {
        type: DataTypes.JSONB,
        allowNull: false, // Asegura que siempre haya un objeto de configuración
        defaultValue: {
            emailNotifications: true,
            pushNotifications: false,
            profileVisibility: 'public', // 'public', 'private', 'friends'
            language: 'es', // Nuevo campo de ejemplo para el idioma
        },
        // Puedes añadir validaciones personalizadas si es necesario para el JSONB
    },
}, {
    tableName: 'users', // Nombre de la tabla en la base de datos
    timestamps: true,   // Agrega automáticamente los campos `createdAt` y `updatedAt` para control de tiempo
    // Índices para optimizar el rendimiento de las consultas y asegurar la unicidad.
    indexes: [
        {
            unique: true,
            fields: ['email'],
            where: {
                email: { [Op.ne]: null } // Solo aplica unicidad si el email no es nulo
            }
        },
        {
            unique: true,
            fields: ['username'],
            where: {
                username: { [Op.ne]: null }
            }
        },
        {
            unique: true,
            fields: ['googleId'],
            where: {
                googleId: { [Op.ne]: null }
            }
        },
        {
            unique: true,
            fields: ['githubId'],
            where: {
                githubId: { [Op.ne]: null }
            }
        }
    ]
});

module.exports = User; // Exporta el modelo User para su uso en otras partes de la aplicación
