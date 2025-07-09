// server/models/jobModel.js
// Modelo de Sequelize para Empleos (datos escrapeados)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Define el modelo Job para la tabla 'jobs' en la base de datos.
 * Representa la información detallada de cada empleo obtenido a través del scraping.
 */
const Job = sequelize.define('Job', {
    // `id`: Clave primaria única para cada empleo. Se genera automáticamente como un UUID v4.
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // `title`: Título del puesto de trabajo.
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: true, // Puede ser nulo si no siempre se scrapea o es opcional
    },
    // `description`: Descripción completa del empleo. Se usa TEXT para permitir textos largos.
    description: {
        type: DataTypes.TEXT,
        allowNull: true, // Puede ser nulo si la descripción no se pudo extraer o no está disponible
    },
    // `salary`: Información salarial. Se usa STRING ya que puede ser un rango o texto descriptivo.
    salary: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // `experienceRequired`: Experiencia laboral requerida para el puesto.
    experienceRequired: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // `requirements`: Lista de requisitos del puesto. Se usa TEXT para permitir múltiples requisitos.
    requirements: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // `modality`: Modalidad de trabajo (ej. "Presencial", "Remoto", "Híbrido").
    modality: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    employmentType: {
        type: DataTypes.STRING, // Or ENUM if you have specific types like 'Full-time', 'Part-time'
        allowNull: true, // Set to false if it's always required
    },
    // `location`: Ubicación geográfica del empleo (ej. "Bogotá, Colombia", "New York, NY").
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // `creationDate`: Fecha en la que el empleo fue publicado.
    creationDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // `deadlineDate`: Fecha límite para aplicar al empleo.
    deadlineDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    postedAt: {
        type: DataTypes.DATE, // O STRING, dependiendo de cómo almacenes la fecha
        allowNull: true, // Set to false if it's always required
    },
    // `sourceUrl`: URL original del empleo en la página de donde fue escrapeado. Debe ser única.
    sourceUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Asegura que no se dupliquen empleos de la misma URL
        validate: {
        isUrl: true, // Valida que la cadena sea una URL válida
        },
    },
    // `sourceName`: Nombre de la plataforma de donde se obtuvo el empleo (ej. "LinkedIn", "Indeed").
    sourceName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // `country`: País al que pertenece el empleo.
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'jobs',    // Nombre de la tabla en la base de datos
    timestamps: true,     // Agrega `createdAt` y `updatedAt`
    // Índices para mejorar el rendimiento de las búsquedas y filtrados.
    indexes: [
        { fields: ['title'] },     // Búsqueda por título
        { fields: ['location'] },  // Búsqueda por ubicación
        { fields: ['country'] },   // Búsqueda por país
        { fields: ['modality'] }   // Búsqueda por modalidad
    ]
});

module.exports = Job;