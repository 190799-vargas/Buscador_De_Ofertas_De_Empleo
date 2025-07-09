// server/services/jobProcessingService.js
// Podría manejar el guardado de empleos escrapeados, deduplicación, etc.
const { Job } = require('../models');
// Podrías importar otras utilidades si las necesitaras para el procesamiento, ej:
// const { logInfo, logWarn } = require('../utils/helpers');

/**
 * Función auxiliar para limpiar y estandarizar cadenas de texto.
 * Elimina espacios extra, saltos de línea y tabulaciones.
 * @param {string} text - El texto a limpiar.
 * @returns {string} El texto limpio.
 */
function cleanText(text) {
    if (typeof text !== 'string' || !text) return '';
    return text.replace(/\s+/g, ' ').trim(); // Reemplaza múltiples espacios/saltos de línea con uno y recorta
}

/**
 * Intenta parsear y normalizar las fechas de publicación/límite.
 * Maneja formatos como "Hace X días", "Publicado hoy", "Ayer", etc.
 * @param {string | Date | null} dateInput - La fecha a parsear.
 * @returns {Date | null} Un objeto Date si se puede parsear, de lo contrario null.
 */
function normalizeDate(dateInput) {
    if (!dateInput) return null;

    // Si ya es un objeto Date válido
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
        return dateInput;
    }

    // Si es un string, intenta parsear varios formatos comunes
    if (typeof dateInput === 'string') {
        const lowerCaseInput = dateInput.toLowerCase();
        const now = new Date();

        if (lowerCaseInput.includes('hoy') || lowerCaseInput.includes('justo ahora') || lowerCaseInput.includes('publicado hoy')) {
        return now;
        }
        if (lowerCaseInput.includes('ayer')) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return yesterday;
        }

        // "Hace X (hora/horas/día/días/semana/semanas/mes/meses/año/años)"
        const match = lowerCaseInput.match(/hace\s*(\d+)\s*(hora|horas|día|días|semana|semanas|mes|meses|año|años)/i);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];
            const date = new Date(now);

            switch (unit) {
                case 'hora':
                case 'horas':
                date.setHours(now.getHours() - value);
                break;
                case 'día':
                case 'días':
                date.setDate(now.getDate() - value);
                break;
                case 'semana':
                case 'semanas':
                date.setDate(now.getDate() - (value * 7));
                break;
                case 'mes':
                case 'meses':
                date.setMonth(now.getMonth() - value);
                break;
                case 'año':
                case 'años':
                date.setFullYear(now.getFullYear() - value);
                break;
            }
            return date;
        }

        // Intenta parsear el string directamente como una fecha estándar
        const parsedDate = new Date(dateInput);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }

    return null; // Si no se puede parsear, devuelve null
}


/**
 * Normaliza y limpia los datos de un empleo individual.
 * @param {Object} jobData - Objeto de datos de un empleo escrapeado (puede ser crudo).
 * @returns {Object} El objeto de empleo con los datos limpios y normalizados.
 */
function normalizeJobData(jobData) {
    let cleanedJob = { ...jobData }; // Crea una copia para no modificar el original

    // 1. Limpieza y Normalización de Títulos y Textos (description, requirements)
    cleanedJob.title = cleanText(cleanedJob.title);
    cleanedJob.description = cleanText(cleanedJob.description);
    cleanedJob.requirements = cleanText(cleanedJob.requirements);
    cleanedJob.company = cleanText(cleanedJob.company || 'Confidencial'); // Asegura que la empresa no sea nula

    // 2. Normalización de Ubicación
    cleanedJob.location = cleanText(cleanedJob.location);
    if (!cleanedJob.location || cleanedJob.location.toLowerCase() === 'n/a') {
        cleanedJob.location = 'No especificada';
    }
    // Podrías añadir lógica para estandarizar ciudades/regiones si fuera necesario.
    // Ejemplo: "Bogota, D.C." -> "Bogotá"

    // 3. Normalización de Salario
    cleanedJob.salary = cleanText(cleanedJob.salary);
    const lowerSalary = cleanedJob.salary.toLowerCase();

    if (!lowerSalary || lowerSalary === 'n/a' || lowerSalary.includes('confidencial')) {
        cleanedJob.salary = 'Confidencial';
    } else {
        // Intenta extraer números para rangos o valores únicos
        const numbers = lowerSalary.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+)/g); // Captura números con puntos/comas
        if (numbers && numbers.length > 0) {
        // Remover puntos y comas para facilitar la conversión a número y unificar
        const cleanNumbers = numbers.map(num => num.replace(/\./g, '').replace(/,/g, '.'));
        if (cleanNumbers.length === 1) {
            cleanedJob.salary = `${cleanNumbers[0]} ${lowerSalary.includes('usd') ? 'USD' : lowerSalary.includes('eur') ? 'EUR' : lowerSalary.includes('cop') ? 'COP' : lowerSalary.includes('brl') ? 'BRL' : ''}`.trim();
        } else if (cleanNumbers.length >= 2) {
            cleanedJob.salary = `${cleanNumbers[0]} - ${cleanNumbers[1]} ${lowerSalary.includes('usd') ? 'USD' : lowerSalary.includes('eur') ? 'EUR' : lowerSalary.includes('cop') ? 'COP' : lowerSalary.includes('brl') ? 'BRL' : ''}`.trim();
        }
        }
        // Asegura que al menos diga "N/A" si no se pudo parsear
        if (cleanedJob.salary === '') cleanedJob.salary = 'N/A';
    }


    // 4. Normalización de Modalidad
    cleanedJob.modality = cleanText(cleanedJob.modality);
    const lowerModality = cleanedJob.modality.toLowerCase();

    if (lowerModality.includes('remot') || lowerModality.includes('teletrabajo')) {
        cleanedJob.modality = 'Remoto';
    } else if (lowerModality.includes('presencial') || lowerModality.includes('on-site') || lowerModality.includes('in-person')) {
        cleanedJob.modality = 'Presencial';
    } else if (lowerModality.includes('híbrid') || lowerModality.includes('hybrid')) {
        cleanedJob.modality = 'Híbrido';
    } else {
        cleanedJob.modality = 'No especificada';
    }

    // 5. Normalización de Experiencia Requerida
    cleanedJob.experienceRequired = cleanText(cleanedJob.experienceRequired);
    const lowerExperience = cleanedJob.experienceRequired.toLowerCase();

    if (lowerExperience.includes('junior')) {
        cleanedJob.experienceRequired = 'Junior';
    } else if (lowerExperience.includes('mid') || lowerExperience.includes('semi-senior')) {
        cleanedJob.experienceRequired = 'Semi-Senior';
    } else if (lowerExperience.includes('senior')) {
        cleanedJob.experienceRequired = 'Senior';
    } else {
        const yearsMatch = lowerExperience.match(/(\d+)\+?\s*(año|años|year|years)/i);
        if (yearsMatch) {
            cleanedJob.experienceRequired = `${yearsMatch[1]}+ años de experiencia`;
        } else {
            cleanedJob.experienceRequired = 'No especificada';
        }
    }


    // 6. Normalización de Fechas (creationDate y deadlineDate)
    cleanedJob.creationDate = normalizeDate(cleanedJob.creationDate);
    cleanedJob.deadlineDate = normalizeDate(cleanedJob.deadlineDate);

    // Asegurar que sourceUrl es absoluta
    if (cleanedJob.sourceUrl && !cleanedJob.sourceUrl.startsWith('http')) {
        // Si la URL es relativa, intentar hacerla absoluta (esto es un fallback,
        // idealmente el scraper debería devolver URLs absolutas)
        console.warn(`URL relativa detectada para ${cleanedJob.title}: ${cleanedJob.sourceUrl}. Intentando corregir.`);
        // Esto requeriría conocer la base URL del sitio escrapeado, lo cual es complejo aquí.
        // Por simplicidad, si el scraper no la hizo absoluta, la dejará como está (puede fallar si es relativa a la raíz).
        // Para un caso real, el scraper o un servicio externo que reciba jobData debería hacer esto antes.
    }

    return cleanedJob;
}

/**
 * Procesa una lista de empleos escrapeados aplicando lógica de limpieza y normalización.
 * @param {Array<Object>} rawJobs - Lista de objetos de empleo crudos escrapeados.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con la lista de empleos procesados.
 */
exports.processAndNormalizeJobs = async (rawJobs) => {
    console.log(`Iniciando procesamiento y normalización de ${rawJobs.length} empleos.`);
    const processedJobs = rawJobs.map(job => normalizeJobData(job));
    console.log(`Procesamiento y normalización finalizada.`);
    return processedJobs;
};