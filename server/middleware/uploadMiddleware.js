// server/middleware/uploadMiddleware.js
const multer = require('multer'); // Libreria multer para manejar la subida de archivos
const path = require('path'); // Módulo de Node.js para manejar rutas de archivos
const fs = require('fs'); // Módulo de Node.js para manejar el sistema de archivos

// Define la carpeta de destino para las subidas
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

// Asegúrate de que la carpeta de subida exista. Si no, créala.
// Esto es importante para evitar errores al intentar guardar archivos en un directorio inexistente.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configura el almacenamiento de Multer
const storage = multer.diskStorage({
    // `destination` define dónde se guardarán los archivos en el servidor.
    // Usamos `uploadDir` que hemos definido para apuntar a `public/uploads`.
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    // `filename` define cómo se nombrarán los archivos guardados.
    // Creamos un nombre de archivo único usando el campo del archivo, un timestamp y la extensión original.
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Configura la instancia de Multer
const upload = multer({
    storage: storage, // Usa la configuración de almacenamiento definida arriba
    limits: { fileSize: 10000000 }, // Limita el tamaño de archivo a 10MB (10 * 1024 * 1024 bytes)
    // `fileFilter` es una función para controlar qué archivos deben ser aceptados.
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('profilePhoto'); // `.single('profilePhoto')` indica que esperamos un solo archivo
                          // con el nombre de campo 'profilePhoto' en el formulario.

/**
 * Función auxiliar para verificar el tipo de archivo.
 * Solo permite archivos de imagen (JPEG, JPG, PNG, GIF).
 * @param {Object} file - Objeto de archivo proporcionado por Multer.
 * @param {Function} cb - Callback para indicar si el archivo es aceptado o no.
 */
function checkFileType(file, cb) {
    // Expresiones regulares para tipos de archivo permitidos.
    const filetypes = /jpeg|jpg|png|gif/;
    // Verifica la extensión del archivo.
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Verifica el tipo MIME del archivo.
    const mimetype = filetypes.test(file.mimetype);

    // Si ambos (extensión y tipo MIME) son válidos, acepta el archivo.
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // Si no son válidos, rechaza el archivo con un mensaje de error.
        cb('Error: ¡Solo se permiten imágenes (JPEG, JPG, PNG, GIF)!');
    }
}

module.exports = upload; // Exporta la configuración de Multer