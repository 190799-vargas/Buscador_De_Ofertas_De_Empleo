// server/controllers/jobController.js
// Lógica para obtener empleos, buscar, filtrar
const { Job, User } = require('../models'); // Importa el modelo Job y User
const scrapingService = require('../services/scrapingService'); // Importa el servicio de scraping
const { Op } = require('sequelize');
const { logInfo, logWarn } = require('../utils/helpers');

/**
 * @route GET /api/jobs
 * @desc Busca empleos basados en parámetros de consulta (keyword, country, page, limit)
 * y maneja la lógica de scraping si no hay empleos en la DB o si se fuerza la búsqueda.
 * @access Public (invitado) o Autenticado (usuario)
 */
exports.searchJobs = async (req, res, next) => {
    let keyword;
    let countriesInput; // Renombrado para evitar conflicto con el array 'countries'
    let page;
    let limit;

    try {
        ({ keyword, country: countriesInput, page = 1, limit = 10 } = req.query);
        const offset = (parseInt(page) - 1) * parseInt(limit);

        if (!keyword || !countriesInput) {
        return res.status(400).json({ message: 'Se requiere una palabra clave y al menos un país para la búsqueda.' });
        }

        // Convertir la entrada de países (ej. "co,es,us") en un array de códigos de país en minúsculas.
        const countries = countriesInput.split(',').map(c => c.trim().toLowerCase());

        // Opcional: Podrías añadir una validación aquí para asegurar que todos los países están en 'allowedCountries'
        // Sin embargo, scrapingService.performScraping ya maneja países no admitidos saltándolos.

        let jobs = [];
        let totalJobs = 0;

        // --- INICIO DE LOGS PARA LA PRIMERA CONSULTA A LA DB ---
        logInfo(`[JOB_CONTROLLER] Intentando primera búsqueda en DB para keyword: "${keyword}", countries: [${countries.join(', ')}], page: ${page}, limit: ${limit}`);
        // --- FIN DE LOGS PARA LA PRIMERA CONSULTA A LA DB ---


        // Primero, intenta buscar empleos en la base de datos que coincidan con los criterios
        const { count, rows } = await Job.findAndCountAll({
        where: {
            [Op.or]: [
                { title: { [Op.iLike]: `%${keyword}%` } },
                { description: { [Op.iLike]: `%${keyword}%` } },
                { requirements: { [Op.iLike]: `%${keyword}%` } },
            ],
            // CAMBIO CLAVE: Buscar empleos en CUALQUIERA de los países proporcionados
            country: { [Op.in]: countries },
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
        });

        jobs = rows;
        totalJobs = count;

        // --- INICIO DE LOGS PARA RESULTADOS DE LA PRIMERA CONSULTA ---
        logInfo(`[JOB_CONTROLLER] Primera búsqueda en DB finalizada. Encontrados ${totalJobs} empleos en DB.`);
        // --- FIN DE LOGS PARA RESULTADOS DE LA PRIMERA CONSULTA ---


        // Si no se encontraron suficientes empleos o si es una nueva búsqueda, iniciar scraping.
        // Consideramos scraping si no hay resultados para CUALQUIERA de los países solicitados.
        if (jobs.length === 0) { // O puedes usar un umbral, ej. `if (jobs.length < 10 && !req.query.noScrape)`
        logWarn(`No se encontraron suficientes empleos en DB para "${keyword}" en [${countries.join(', ')}]. Iniciando scraping...`);
        
        // CAMBIO CLAVE: Pasar el ARRAY de países a performScraping
        const scrapedJobs = await scrapingService.performScraping(keyword, countries); 
        
        // --- INICIO DE LOGS PARA LA SEGUNDA CONSULTA A LA DB (después de scraping) ---
            logInfo(`[JOB_CONTROLLER] Scraping finalizado. Reconsultando DB para incluir nuevos empleos. Keyword: "${keyword}", countries: [${countries.join(', ')}], page: ${page}, limit: ${limit}`);
            // --- FIN DE LOGS PARA LA SEGUNDA CONSULTA A LA DB ---

        // Después de scraping, vuelve a consultar la DB para incluir los nuevos empleos
        const { count: newCount, rows: newRows } = await Job.findAndCountAll({
            where: {
            [Op.or]: [
                { title: { [Op.iLike]: `%${keyword}%` } },
                { description: { [Op.iLike]: `%${keyword}%` } },
                { requirements: { [Op.iLike]: `%${keyword}%` } },
            ],
            country: { [Op.in]: countries }, // Usar el array de países de nuevo
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });
        jobs = newRows;
        totalJobs = newCount;
        logInfo(`[JOB_CONTROLLER] Segunda búsqueda en DB finalizada. Se encontraron ${totalJobs} empleos (nuevos y existentes) para "${keyword}" en [${countries.join(', ')}].`);

        }

        const isGuest = req.user ? req.user.role === 'guest' : true;

        const responseJobs = jobs.map(job => {
        const jobData = job.toJSON();
        if (isGuest) {
            delete jobData.sourceUrl;
        }
        return jobData;
        });

        res.status(200).json({
        message: 'Búsqueda de empleos exitosa.',
        totalResults: totalJobs,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / limit),
        jobs: responseJobs,
        });

    } catch (error) {
        const logKeyword = typeof keyword !== 'undefined' ? keyword : 'N/A';
        const logCountries = Array.isArray(countries) ? countries.join(', ') : (typeof countriesInput !== 'undefined' ? countriesInput : 'N/A');
        logWarn(`ERROR en searchJobs para keyword: "${logKeyword}", countries: "${logCountries}":`, error);
        next(error);
    }
};

/**
 * @route GET /api/jobs/:id
 * @desc Obtiene los detalles de un empleo específico por su ID.
 * @access Public (invitado) o Autenticado (usuario)
 */
exports.getJobDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const job = await Job.findByPk(id);

        if (!job) {
        return res.status(404).json({ message: 'Empleo no encontrado.' });
        }

        const isGuest = req.user ? req.user.role === 'guest' : true;
        const jobData = job.toJSON();

        if (isGuest) {
        delete jobData.sourceUrl;
        }

        res.status(200).json({
        message: 'Detalles del empleo obtenidos exitosamente.',
        job: jobData,
        });

    } catch (error) {
        logWarn('Error en getJobDetails:', error);
        next(error);
    }
};
