// sever/models/favoriteJobModel.js
// Modelo de Sequelize para Favoritos (relación User-Job)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./userModel');
const Job = require('./jobModel');

/**
 * Define el modelo FavoriteJob para la tabla 'favorite_jobs' en la base de datos.
 * Esta tabla es una tabla de unión que gestiona los empleos que un usuario ha marcado como favoritos.
 */
const FavoriteJob = sequelize.define('FavoriteJob', {
    // `id`: Clave primaria única para cada entrada de favorito. Se genera automáticamente como un UUID v4.
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // `userId`: Clave foránea que referencia el ID del usuario que marcó el empleo como favorito.
    userId: {
        type: DataTypes.UUID,
        references: {
        model: User, // Referencia al modelo User
        key: 'id',   // La columna 'id' en la tabla 'users'
        },
        allowNull: false,
    },
    // `jobId`: Clave foránea que referencia el ID del empleo que fue marcado como favorito.
    jobId: {
        type: DataTypes.UUID,
        references: {
        model: Job, // Referencia al modelo Job
        key: 'id',  // La columna 'id' en la tabla 'jobs'
        },
        allowNull: false,
    },
}, {
    tableName: 'favorite_jobs', // Nombre de la tabla en la base de datos
    timestamps: true,         // Agrega `createdAt` y `updatedAt`
    // Índice único compuesto para asegurar que un usuario no pueda añadir el mismo empleo como favorito más de una vez.
    indexes: [
        {
        unique: true,            // La combinación de userId y jobId debe ser única
        fields: ['userId', 'jobId']
        }
    ]
});

// --- Definición de las asociaciones entre Modelos ---

// Un Usuario (`User`) puede tener muchos Empleos Favoritos (`FavoriteJob`).
// Cuando un usuario es eliminado, todas sus entradas en FavoriteJob también se eliminan (CASCADE).
User.hasMany(FavoriteJob, {
    foreignKey: 'userId', // Especifica la clave foránea en la tabla FavoriteJob
    onDelete: 'CASCADE'   // Comportamiento al eliminar un registro padre
});

// Un Empleo Favorito (`FavoriteJob`) pertenece a un solo Usuario (`User`).
FavoriteJob.belongsTo(User, {
    foreignKey: 'userId'
});

// Un Empleo (`Job`) puede ser marcado como favorito por muchos usuarios (es decir, aparecer en muchas entradas de FavoriteJob).
// Cuando un empleo es eliminado, todas las referencias a él en FavoriteJob también se eliminan (CASCADE).
Job.hasMany(FavoriteJob, {
    foreignKey: 'jobId', // Especifica la clave foránea en la tabla FavoriteJob
    onDelete: 'CASCADE'
});

// Un Empleo Favorito (`FavoriteJob`) se relaciona con un solo Empleo (`Job`).
FavoriteJob.belongsTo(Job, {
    foreignKey: 'jobId'
});

module.exports = FavoriteJob;