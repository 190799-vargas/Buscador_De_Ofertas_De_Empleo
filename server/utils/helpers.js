// server/utils/helpers.js
// Funciones de utilidad varias (ej. formateo de fechas)

/**
 * Formatea una fecha a un string legible en formato YYYY-MM-DD.
 * @param {Date | string} dateInput - La fecha a formatear. Puede ser un objeto Date o un string parseable a Date.
 * @returns {string} - La fecha formateada como 'YYYY-MM-DD'.
 */
function formatDate(dateInput) {
    let date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        // Intenta parsear el string a una fecha
        date = new Date(dateInput);
    }

    // Verifica si la fecha es válida
    if (isNaN(date.getTime())) {
        return 'Fecha inválida';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
    }

/**
 * Simula una función de logging para mensajes de información.
 * En un entorno de producción real, se usaría una librería de logging.
 * @param {string} message - El mensaje a loguear.
 * @param {Object} [data={}] - Datos adicionales a incluir en el log.
 */
function logInfo(message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp}: ${message}`, data);
}

/**
 * Simula una función de logging para mensajes de advertencia.
 * @param {string} message - El mensaje de advertencia.
 * @param {Object} [data={}] - Datos adicionales a incluir.
 */
function logWarn(message, data = {}) {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp}: ${message}`, data);
}

// Puedes añadir más funciones de utilidad aquí según las necesites, por ejemplo:
// - capitalizeString(str)
// - validateEmail(email) (aunque Sequelize ya tiene una validación)
// - calculateReadingTime(text)
// - sanitizeInput(input) // Para prevenir XSS, aunque Express ya tiene middleware para esto

module.exports = {
    formatDate,
    logInfo,
    logWarn,
};