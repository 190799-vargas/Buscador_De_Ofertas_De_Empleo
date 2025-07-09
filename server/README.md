# Backend del JobLinker

Este repositorio contiene el código fuente del backend (API RESTful) para el proyecto de búsqueda de empleo. Se encarga de la lógica de negocio, la gestión de la base de datos (PostgreSQL), la autenticación de usuarios (tradicional y OAuth con Google/GitHub), y el web scraping de ofertas de empleo.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución JavaScript.
- **Express.js**: Framework web para Node.js.
- **PostgreSQL**: Base de datos relacional.
- **Sequelize**: ORM (Object-Relational Mapper) para PostgreSQL.
- **JWT (JSON Web Tokens)**: Para la autenticación basada en tokens.
- **Bcrypt**: Para el hashing seguro de contraseñas.
- **Passport.js**: Middleware de autenticación para Node.js, con estrategias para Google OAuth 2.0 y GitHub OAuth 2.0.
- **Express-Session**: Middleware para la gestión de sesiones (requerido por Passport.js para OAuth).
- **Dotenv**: Para la gestión de variables de entorno.
- **Cheerio**: Librería rápida para el parsing de HTML (útil para scraping estático).
- **Puppeteer / Puppeteer-core**: Librería para el control de navegadores Chrome/Chromium (esencial para scraping de páginas dinámicas).
- **CORS**: Middleware para habilitar Cross-Origin Resource Sharing.
- **Swagger/OpenAPI**: Para documentar la API.

## Configuración y Ejecución del Proyecto
Sigue estos pasos para poner en marcha el backend en tu entorno local.

## 1. Requisitos Previos
Asegúrate de tener instalado lo siguiente:

- **Node.js** (versión 16.x o superior recomendada) y npm (o Yarn).
- **PostgreSQL** (versión 12 o superior recomendada).

## 2. Clonar el Repositorio
Si aún no lo has hecho, clona el repositorio principal y navega a la carpeta backend:
```bash
git clone https://github.com/tu-usuario/tu-proyecto-buscador-empleos.git
cd tu-proyecto-buscador-empleos/backend
```

## 3. Instalación de Dependencias
Instala todas las dependencias necesarias para el backend:
```bash
npm install
# Si vas a usar nodemon para desarrollo (reinicia el servidor automáticamente con cada cambio)
npm install -D nodemon
```
## 4. Configuración de la Base de Datos

### 4.1. Crear la Base de Datos
Crea una base de datos PostgreSQL. Puedes usar psql (cliente de línea de comandos) o una herramienta gráfica como pgAdmin:
```bash
# Desde la terminal, conéctate como usuario postgres
psql -U postgres
# Dentro de psql, crea la base de datos
CREATE DATABASE job_search_db;
\q
```
### 4.2. Variables de Entorno
Crea un archivo .env en la raíz de la carpeta backend y añade las siguientes variables. ¡Reemplaza los valores con tus credenciales y secretos reales!
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_search_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres

# Configuración de JWT
JWT_SECRET=tu_secreto_super_seguro_y_largo_para_jwt
JWT_EXPIRES_IN=1h

# Google OAuth
GOOGLE_CLIENT_ID=TU_CLIENT_ID_DE_GOOGLE
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_DE_GOOGLE
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=TU_CLIENT_ID_DE_GITHUB
GITHUB_CLIENT_SECRET=TU_CLIENT_SECRET_DE_GITHUB
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Secreto de Sesión (para express-session, DEBE ser una cadena larga y aleatoria)
SESSION_SECRET=un_secreto_muy_largo_y_aleatorio_para_la_sesion

# URL del Frontend (para redirecciones OAuth y CORS)
FRONTEND_URL=http://localhost:3000

# Puerto del Servidor Backend
PORT=5000
```
Nota de seguridad: El archivo .env no debe ser versionado en Git. Asegúrate de que está incluido en tu .gitignore.

## 5. Ejecutar el Servidor Backend
Una vez que todas las dependencias estén instaladas y el archivo .env esté configurado, puedes iniciar el servidor:
```bash
Ejecutar el Servidor Backend
Una vez que todas las dependencias estén instaladas y el archivo .env esté configurado, puedes iniciar el servidor:

# Para ejecutar en modo desarrollo (con reinicio automático usando nodemon)
npm run dev

# Para ejecutar en modo producción (o sin nodemon)
npm start
```
Deberías ver mensajes en la consola indicando que la conexión a la base de datos es exitosa y que el servidor está escuchando en el puerto 5000 (o el que hayas configurado).

## 6. Acceder a la Documentación de la API
Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de Swagger de tu API en:

http://localhost:5000/api-docs
Aquí podrás ver todos los endpoints, sus parámetros, modelos de respuesta y probarlos directamente.

## Estructura del Proyecto

La estructura de carpetas del backend está organizada para una clara separación de responsabilidades:
```bash
config/: Archivos de configuración para la base de datos, JWT y Passport.

controllers/: Contiene la lógica de negocio para cada ruta de la API.

middleware/: Funciones middleware para autenticación (JWT), autorización (roles) y manejo de errores.

models/: Definición de los modelos de Sequelize que interactúan con la base de datos (Usuario, Empleo, EmpleoFavorito).

routes/: Define los endpoints de la API y los asocia con los controladores y middlewares.

services/: Contiene la lógica compleja como el web scraping (scrapingService.js) y el procesamiento/normalización de datos (jobProcessingService.js).

docs/: Configuración para la documentación de Swagger.

utils/: Funciones de utilidad auxiliares.

.env: Variables de entorno.

app.js: Punto de entrada principal de la aplicación Express.
```

## Notas sobre el Web Scraping
El web scraping es una parte compleja del proyecto. Ten en cuenta lo siguiente:

- **Selectores CSS**: Los selectores CSS utilizados en scrapingService.js (para LinkedIn, Indeed, Computrabajo, Infojobs, Monster, etc.) son sensibles a cambios en la estructura HTML de los sitios web. Si los scrapers dejan de funcionar, es probable que necesites inspeccionar el DOM de las páginas y ajustar los selectores.
- **Legalidad y Ética**: Siempre verifica el archivo robots.txt y los términos de servicio de los sitios web antes de raspar. El scraping intensivo o no ético puede llevar a bloqueos de IP o problemas legales.
- **Robustez**: Para un entorno de producción, un sistema de scraping más robusto podría incluir: rotación de User-Agents, uso de proxys, manejo de CAPTCHAs, reintentos con backoff exponencial, y un monitoreo más detallado.
- **Caché de Datos**: Actualmente, el scraping se dispara si no hay resultados en la DB. Para optimizar, se podría implementar una política de caché más sofisticada o ejecutar el scraping de forma programada (cron jobs).

¡Disfruta desarrollando y mejorando este backend!

## Autor
Víctor Alfonso Vargas Díaz
victor19vargas2018@gmail.com



