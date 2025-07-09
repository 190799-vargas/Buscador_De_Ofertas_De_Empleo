// server/services/scrapingService.js
// Contiene la lógica central del web scraping (Puppeteer/Cheerio)
// Contiene la lógica central del web scraping (Puppeteer/Cheerio)
const cheerio = require('cheerio') // Librería para analizar HTML (útil para scraping estático)
const puppeteer = require('puppeteer-extra'); // Librería para automatización de navegadores (útil para scraping dinámico)
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); // Solo si usas puppeteer-extra
puppeteer.use(StealthPlugin()); // Inicializa el plugin stealth (solo si usas puppeteer-extra)

const { Job } = require('../models'); // Importa el modelo Job para guardar los datos escrapeados
const { Op } = require('sequelize'); // Operadores de Sequelize para consultas de base de datos

const jobProcessingService = require('./jobProcessingService'); // Se asegura que la ruta sea correcta

/**
 * Retrasa la ejecución por un número dado de milisegundos.
 * Útil para evitar ser bloqueado por sitios web.
 * @param {number} ms - Milisegundos para esperar.
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene la ruta al ejecutable del navegador Chromium/Chrome.
 * Es crucial para `puppeteer-core`, ya que no descarga el navegador por sí mismo.
 * Asegúrate de que esta ruta sea correcta para tu sistema operativo y la instalación de Chrome.
 * Para entornos de producción (servidores), asegúrate de tener Chrome/Chromium instalado.
 * @returns {string} La ruta al ejecutable del navegador.
 */
const getBrowserExecutablePath = () => {
    // Ejemplos comunes de rutas para diferentes sistemas operativos.
    // Es posible que necesites ajustar esto según tu instalación.
    if (process.platform === 'win32') {
        // Windows: Ruta por defecto de Chrome
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else if (process.platform === 'linux') {
        // Linux: Rutas comunes para Chromium o Google Chrome
        return '/usr/bin/google-chrome';
        // return '/usr/bin/chromium-browser'; // Otra opción común en Linux
    } else if (process.platform === 'darwin') {
        // macOS: Ruta por defecto de Chrome
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }
    console.warn('Advertencia: No se encontró una ruta conocida para el ejecutable del navegador. Por favor, configura manualmente en getBrowserExecutablePath.');
    return null;
};

/**
 * Realiza el scraping de una URL usando Puppeteer.
 * Ideal para páginas web dinámicas que cargan contenido con JavaScript.
 * @param {string} url - La URL de la página a raspar.
 * @returns {Promise<string|null>} El HTML de la página o null si ocurre un error.
 */
async function scrapeWithPuppeteer(url) {
    let browser;
    try {
        const executablePath = getBrowserExecutablePath();
        if (!executablePath) {
            console.error('ERROR: No se pudo encontrar el ejecutable del navegador para Puppeteer.');
            return null;
        }

        browser = await puppeteer.launch({
            executablePath: executablePath,
            headless: true, // Ejecutar en modo headless (sin interfaz gráfica)
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--single-process'
            ]
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }); // 90 segundos
        await delay(2000); // Espera 2 segundos

        const html = await page.content();
        return html;
    } catch (error) {
        console.error(`Error al raspar ${url} con Puppeteer:`, error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Realiza el scraping de una URL usando Cheerio.
 * Ideal para páginas web estáticas donde el contenido HTML ya está presente en la respuesta inicial.
 * @param {string} url - La URL de la página a raspar.
 * @returns {Promise<string|null>} El HTML de la página o null si ocurre un error.
 */
async function scrapeWithCheerio(url) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 20000); // 20 segundos de timeout para fetch

    try {
        await delay(1500);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: controller.signal // Asocia el AbortController con la petición
        });
        clearTimeout(id); // Limpia el timeout si la petición se completa antes

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Respuesta HTTP no exitosa para ${url}: ${response.status} - ${response.statusText}. Cuerpo: ${errorText.substring(0, 200)}...`);
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        const html = await response.text();
        return html;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`Error al raspar ${url} con Cheerio: La petición excedió el tiempo límite (timeout). Esto puede indicar un bloqueo o un problema de red.`);
        } else {
            console.error(`Error al raspar ${url} con Cheerio:`, error);
        }
        return null;
    } finally {
        clearTimeout(id); // Asegura que el timeout se limpie siempre
    }
}

/**
 * Raspa ofertas de empleo de Computrabajo.
 * @param {string} keyword - Palabra clave para la búsqueda.
 * @param {string} countryCode - Código de país (ej. 'co').
 * @returns {Promise<Array<Object>>} Una lista de objetos de empleo.
 */
async function scrapeComputrabajo(keyword, countryCode) {
    console.log(`Iniciando scraping de Computrabajo para "${keyword}" en "${countryCode}"...`);
    let domain = 'www.computrabajo.com';
    if (countryCode === 'co') domain = 'www.computrabajo.com.co';
    else if (countryCode === 'es') domain = 'www.computrabajo.es';
    else if (countryCode === 'mx') domain = 'www.computrabajo.com.mx';
    else if (countryCode === 'pe') domain = 'www.computrabajo.com.pe';
    else if (countryCode === 'ar') domain = 'www.computrabajo.com.ar';
    else if (countryCode === 'cl') domain = 'www.computrabajo.cl';


    const url = `https://${domain}/empleos-de-${encodeURIComponent(keyword)}?q=${encodeURIComponent(keyword)}`;
    const html = await scrapeWithPuppeteer(url);

    if (!html) {
        console.warn('No se pudo obtener HTML de Computrabajo.');
        return [];
    }

    const $ = cheerio.load(html);
    const jobs = [];

    $('.box_offer').each((i, el) => {
        try {
            const title = $(el).find('.js-o-link').text().trim();
            const sourceUrlRelative = $(el).find('.js-o-link').attr('href');

            if (!title || !sourceUrlRelative) {
                console.warn(`Elemento de Computrabajo omitido: Título (${title ? 'presente' : 'ausente'}) o URL relativa (${sourceUrlRelative ? 'presente' : 'ausente'}) no encontrados para el elemento ${i}.`);
                return; // Saltar este elemento si falta el título o la URL relativa
            }

            const company = $(el).find('.badge-tag').text().trim();
            const location = $(el).find('.location').text().trim();
            const description = $(el).find('.description').text().trim() || 'N/A';
            const salary = $(el).find('.salary').text().trim() || 'N/A';
            const postedDateText = $(el).find('.posted-date').text().trim();

            let creationDate = null;
            if (postedDateText) {
                if (postedDateText.toLowerCase().includes('hoy')) {
                    creationDate = new Date();
                } else if (postedDateText.toLowerCase().includes('ayer')) {
                    creationDate = new Date();
                    creationDate.setDate(creationDate.getDate() - 1);
                } else {
                    const match = postedDateText.match(/(\d+) (día|días)/i);
                    if (match) {
                        const daysAgo = parseInt(match[1], 10);
                        creationDate = new Date();
                        creationDate.setDate(creationDate.getDate() - daysAgo);
                    }
                }
            }

            let fullSourceUrl = sourceUrlRelative;
            if (!sourceUrlRelative.startsWith('http')) {
                fullSourceUrl = `https://${domain}${sourceUrlRelative.startsWith('/') ? '' : '/'}${sourceUrlRelative}`;
            }

            jobs.push({
                title,
                company,
                description,
                salary,
                experienceRequired: 'N/A',
                requirements: 'N/A',
                modality: 'N/A',
                location,
                creationDate,
                deadlineDate: null,
                sourceUrl: fullSourceUrl,
                sourceName: 'Computrabajo',
                country: countryCode,
            });
        } catch (parseError) {
            console.error('Error al parsear un elemento de empleo de Computrabajo (inesperado en catch):', parseError.message);
        }
    });
    console.log(`Computrabajo scraping finalizado. Encontrados ${jobs.length} empleos.`);
    return jobs;
}

/**
 * Raspa ofertas de empleo de Monster (Estados Unidos).
 * @param {string} keyword - Palabra clave para la búsqueda.
 * @param {string} countryCode - Código de país (solo 'us' en este caso).
 * @returns {Promise<Array<Object>>} Una lista de objetos de empleo.
 */
async function scrapeMonster(keyword, countryCode) {
    if (countryCode !== 'us') {
        console.warn(`Monster.com se enfoca en 'us'. Saltando para ${countryCode}.`);
        return [];
    }
    console.log(`Iniciando scraping de Monster para "${keyword}" en Estados Unidos...`);
    const url = `https://www.monster.com/jobs/search?q=${encodeURIComponent(keyword)}&where=United%20States`;
    const html = await scrapeWithPuppeteer(url);

    if (!html) {
        console.warn('No se pudo obtener HTML de Monster.');
        return [];
    }

    const $ = cheerio.load(html);
    const jobs = [];

    $('.card-content').each((i, el) => {
        try {
            const title = $(el).find('.title a').text().trim();
            const company = $(el).find('.company').text().trim();
            const location = $(el).find('.location').text().trim();
            const sourceUrlRelative = $(el).find('.title a').attr('href');
            const sourceUrl = sourceUrlRelative ? `https://www.monster.com${sourceUrlRelative}` : null;
            const snippet = $(el).find('.job-description').text().trim() || 'N/A';
            const salary = $(el).find('.salary').text().trim() || 'N/A';

            const postedDateText = $(el).find('.posted-date').text().trim();
            let creationDate = null;
            if (postedDateText && postedDateText.includes('Posted')) {
                const match = postedDateText.match(/Posted (\d+) day/i);
                if (match) {
                    const daysAgo = parseInt(match[1], 10);
                    creationDate = new Date();
                    creationDate.setDate(creationDate.getDate() - daysAgo);
                }
            }

            if (title && sourceUrl) {
                jobs.push({
                    title,
                    company,
                    description: snippet,
                    salary,
                    experienceRequired: 'N/A',
                    requirements: 'N/A',
                    modality: 'N/A',
                    location,
                    creationDate,
                    deadlineDate: null,
                    sourceUrl,
                    sourceName: 'Monster',
                    country: countryCode,
                });
            } else {
                if (!title) console.warn('Elemento de Monster omitido: Sin título.');
                if (!sourceUrl) console.warn('Elemento de Monster omitido: Sin URL de fuente.');
            }
        } catch (parseError) {
            console.error('Error al parsear un elemento de empleo de Monster:', parseError.message);
        }
    });
    console.log(`Monster scraping finalizado. Encontrados ${jobs.length} empleos.`);
    return jobs;
}

/**
 * Función principal para iniciar el proceso de scraping de múltiples sitios.
 * Guarda los empleos únicos en la base de datos.
 * @param {string} keyword - Palabra clave para buscar empleos.
 * @param {string[]} countries - Array de códigos de país para la búsqueda (ej. ['co', 'es']).
 * @returns {Promise<Array<Object>>} Una lista combinada de todos los empleos escrapeados.
 */
exports.performScraping = async (keyword, countries) => { 
    let allJobs = [];
    // Países admitidos por los scrapers estables (Computrabajo y Monster para US).
    const allowedCountries = ['co', 'es', 'mx', 'ar', 'cl', 'pe', 'us']; 

    const unsupportedCountries = countries.filter(c => !allowedCountries.includes(c));
    if (unsupportedCountries.length > 0) {
        console.warn(`Los siguientes países solicitados no son admitidos para scraping por los sitios configurados y serán ignorados: [${unsupportedCountries.join(', ')}].`);
    }

    try {
        // No hay scrapers globales/remotos genéricos que no dependan del país y sean estables.
        // Se elimina RemoteOK, Jooble y Glassdoor de aquí.

        // Iterar sobre cada país solicitado y ejecutar los scrapers relevantes
        for (const countryLower of countries) {
            if (!allowedCountries.includes(countryLower)) {
                console.log(`Saltando scraping para país no admitido: "${countryLower}"`);
                continue;
            }

            // --- Lógica para scrapers específicos por país ---
            // Computrabajo se encarga de la mayoría de los países de habla hispana.
            if (['co', 'es', 'mx', 'ar', 'cl', 'pe'].includes(countryLower)) {
                const computrabajoJobs = await scrapeComputrabajo(keyword, countryLower);
                allJobs = allJobs.concat(computrabajoJobs);
            }

            // Monster es para Estados Unidos.
            if (countryLower === 'us') {
                const monsterJobs = await scrapeMonster(keyword, countryLower); 
                allJobs = allJobs.concat(monsterJobs);
            }
            // Si necesitas añadir más fuentes ESTABLES para otros países, agrégalas aquí.
        }


        console.log(`Procesando ${allJobs.length} empleos escrapeados para guardar en DB.`);

        const processedJobs = await jobProcessingService.processAndNormalizeJobs(allJobs);
        console.log(`Total de ${processedJobs.length} empleos procesados y normalizados.`);


        for (const jobData of processedJobs) {
            try {
                // Loguear los datos del empleo antes de intentar el upsert
                console.log(`Intentando upsert para job con sourceUrl: ${jobData.sourceUrl || 'N/A'}, title: ${jobData.title || 'N/A'}, country: ${jobData.country || 'N/A'}`);
                
                const [job, created] = await Job.upsert(jobData, {
                    conflictFields: ['sourceUrl']
                });
                if (created) {
                    console.log(`[UPSERT INFO] Nuevo empleo creado: ${job.title} (${job.sourceName})`);
                } else {
                    console.log(`[UPSERT INFO] Empleo actualizado: ${job.title} (${job.sourceName})`);
                }
            } catch (dbError) {
                console.error(`[UPSERT ERROR] Error al guardar/actualizar empleo en DB para ${jobData.sourceUrl}:`, dbError.message);
                console.error('[UPSERT ERROR] Job data que falló:', JSON.stringify(jobData, null, 2));
            }
        }

        console.log(`Scraping, procesamiento y guardado en DB completado. Total de ${allJobs.length} empleos procesados.`);
        return processedJobs;

    } catch (error) {
        console.error('ERROR general en performScraping:', error);
        return [];
    }
};