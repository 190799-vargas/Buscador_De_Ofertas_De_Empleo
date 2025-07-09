// server/test_scraper.js
require('dotenv').config(); // Carga las variables de entorno
const { sequelize, syncDatabase } = require('./models'); // Importa la conexión y modelos
const scrapingService = require('./services/scrapingService');

async function runTestScraper() {
  // Sincroniza la DB primero
    await syncDatabase();

    console.log('Iniciando prueba de scraping...');
    const keyword = 'desarrollador fullstack'; // Cambia la palabra clave
    const country = 'es'; // Cambia el país para probar diferentes scrapers

    try {
        const scrapedJobs = await scrapingService.performScraping(keyword, country);
        console.log(`Prueba de scraping finalizada. Total de empleos procesados: ${scrapedJobs.length}`);
        // console.log('Primeros 5 empleos procesados:', scrapedJobs.slice(0, 5));
    } catch (error) {
        console.error('Error durante la prueba de scraping:', error);
    } finally {
        await sequelize.close(); // Cierra la conexión a la DB
        console.log('Conexión a la base de datos cerrada.');
    }
}

runTestScraper();