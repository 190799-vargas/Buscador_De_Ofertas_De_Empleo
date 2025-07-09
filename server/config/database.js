// server/config/database.js
// Conexión y sincronización con PostgreSQL
require('dotenv').config(); // Cargar variables de entorno desde .env al inicio

const { Sequelize } = require('sequelize');
const config = require('./config')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: 'postgres',
        logging: config.logging,
        dialectOptions: config.dialectOptions, // Para configuración de SSL en producción
    }
);

// Función para probar la conexión
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos PostgreSQL establecida exitosamente.');
    } catch (error) {
        console.error('¡ERROR! No se pudo conectar a la base de datos:', error);
        process.exit(1); // Salir de la aplicación si la conexión falla
    }
}

module.exports = {
    sequelize,
    testConnection
};