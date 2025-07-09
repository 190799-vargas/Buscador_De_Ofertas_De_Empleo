// server/models/index.js
// Archivo para importar y exportar todos los modelos de Sequelize
const { sequelize, testConnection } = require('../config/database');
const User = require('./userModel');
const Job = require('./jobModel');
const FavoriteJob = require('./favoriteJobModel'); // Este archivo ya contiene las asociaciones
const JobApplication = require('./jobApplicationModel');

// En este archivo `index.js`, se recomienda centralizar la importación de todos los modelos
// y también la función para sincronizar la base de datos.
// Las asociaciones entre modelos (ej. User.hasMany(FavoriteJob)) también pueden definirse aquí
// si no se definieron directamente en los archivos de modelo individuales.
// En este caso, ya están definidas en favoriteJobModel.js, por lo que no es estrictamente necesario duplicarlas aquí.

/**
 * Sincroniza todos los modelos definidos con la base de datos.
 * Esta función debe ser llamada al iniciar la aplicación (usualmente en app.js)
 * para asegurar que las tablas existen y están actualizadas según los modelos.
 */
async function syncDatabase() {
    await testConnection(); // Primero, se verifica que la conexión a la base de datos sea exitosa
    try {
        // `sequelize.sync()` sincroniza los modelos con la base de datos.
        // Opciones importantes:
        // - `alter: true`: Intenta realizar los cambios necesarios en la tabla existente para que coincida con el modelo.
        //   Es útil en desarrollo para cambios menores sin perder datos existentes.
        //   En producción, para cambios de esquema mayores, se recomiendan migraciones (Sequelize CLI).
        // - `force: true`: (¡ADVERTENCIA!) Elimina la tabla si existe y luego la recrea.
        //   Esto es muy útil en las primeras etapas de desarrollo para empezar con una tabla limpia,
        //   pero ¡nunca debe usarse en un entorno de producción con datos reales!
        await sequelize.sync({ alter: true }); // Usamos alter: true para permitir cambios y mantener datos en desarrollo
        console.log('Todos los modelos de la base de datos fueron sincronizados exitosamente.');
    } catch (error) {
        console.error('¡ERROR! Ocurrió un problema al sincronizar la base de datos:', error);
        // Si la sincronización falla, la aplicación no puede funcionar correctamente, por lo que se termina el proceso.
        process.exit(1);
    }
}

module.exports = {
    sequelize,
    User,
    Job,
    FavoriteJob,
    JobApplication,
    syncDatabase, // Exportamos la función para sincronizar la base de datos
};