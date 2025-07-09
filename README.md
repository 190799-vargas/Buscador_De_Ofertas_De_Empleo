# 🌍 Buscador de Ofertas de Empleo Global

¡Bienvenido al Buscador de Ofertas de Empleo Global! Este es un proyecto Full-Stack diseñado para centralizar y facilitar la búsqueda de oportunidades laborales a nivel mundial. Combina un robusto backend Node.js (Express) con un dinámico frontend React, ofreciendo funcionalidades clave como búsqueda de empleos, autenticación de usuarios (local y OAuth), gestión de favoritos y postulaciones, y un sistema de web scraping para obtener datos actualizados.

## ✨ Características Principales

### Frontend (React)
* **Interfaz Intuitiva:** Desarrollado con React, proporcionando una experiencia de usuario fluida y reactiva.
* **Búsqueda Avanzada de Empleos:** Permite buscar y filtrar ofertas de empleo de diversas fuentes.
* **Autenticación de Usuarios:**
    * Registro y Login tradicional (email/contraseña).
    * Integración con OAuth para inicio de sesión a través de Google y GitHub.
* **Gestión de Perfil:**
    * Visualización y edición del perfil de usuario.
    * Gestión de empleos favoritos.
    * Seguimiento de empleos a los que se ha postulado.
    * Configuración de preferencias de usuario.
* **Componentes Reutilizables:** Estructura modular con componentes bien definidos para una fácil extensibilidad y mantenimiento.
* **Manejo de Estado Global:** Utiliza React Context (AuthContext) para la gestión centralizada del estado de autenticación.
* **Protección de Rutas:** Implementación de `PrivateRoute` para asegurar que solo los usuarios autenticados accedan a ciertas secciones.

### Backend (Node.js con Express & Sequelize)
* **API RESTful:** Construido con Express.js, proporcionando endpoints eficientes para la comunicación con el frontend.
* **Base de Datos PostgreSQL:** Persistencia de datos mediante Sequelize ORM, con modelos para `User`, `Job`, `FavoriteJob` y `JobApplication`.
* **Autenticación Robusta:**
    * Estrategias de autenticación JWT para usuarios locales.
    * Integración con Passport.js para OAuth (Google y GitHub).
* **Autorización basada en Roles:** Middleware para diferenciar entre usuarios autenticados y visitantes (`guest`).
* **Web Scraping:** Servicio de scraping (`scrapingService.js`) para obtener datos de ofertas de empleo de diversas fuentes (por ejemplo, Computrabajo).
* **Manejo de Archivos:** Subida de imágenes de perfil con Multer y almacenamiento de archivos estáticos.
* **Documentación de API:** Integración con Swagger UI para una documentación interactiva y fácil de usar de todos los endpoints de la API.
* **Manejo Centralizado de Errores:** Middleware `errorHandler` para una gestión consistente y robusta de errores.

## 🚀 Tecnologías Utilizadas

### Frontend
* **React.js** (con Vite)
* **React Router DOM**
* **Axios**
* **Context API** & **Custom Hooks**
* **CSS / SCSS** (según tu configuración en `src/styles`)

### Backend
* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Sequelize ORM**
* **Passport.js** (Passport-Google-OAuth20, Passport-GitHub2, Passport-JWT)
* **jsonwebtoken** (JWT)
* **bcrypt** (para hashing de contraseñas)
* **dotenv**
* **cors**
* **express-session**
* **multer** (para subida de archivos)
* **Swagger-UI-Express** & **Swagger-Jsdoc** (para documentación API)
* **Puppeteer** / **Cheerio** (en `scrapingService.js`)

## 📂 Estructura del Proyecto
```bash
├── frontend/
│   ├── public/                 # Archivos estáticos públicos (index.html, favicons)
│   ├── src/
│   │   ├── App.jsx             # Componente principal, define rutas.
│   │   ├── main.jsx            # Punto de entrada de la aplicación React.
│   │   ├── assets/             # Imágenes, iconos y otros recursos.
│   │   ├── components/
│   │   │   ├── Auth/           # Componentes de autenticación (Login, Register, AuthSuccess).
│   │   │   ├── Common/         # Componentes reutilizables (Navbar, Footer, LoadingSpinner, Alert, ErrorBoundary, PrivateRoute).
│   │   │   ├── Jobs/           # Componentes para la interfaz de empleos (JobCard, JobList, SearchBar, Pagination).
│   │   │   ├── UserProfile/    # Componentes del perfil de usuario (Profile, ProfileEdit, Settings, AppliedJobs, Favorites).
│   │   │   └── ...
│   │   ├── contexts/           # Contextos globales (AuthContext).
│   │   ├── hooks/              # Hooks personalizados (useAuth).
│   │   ├── pages/              # Páginas principales, mapeadas a rutas.
│   │   │   ├── Public/         # Páginas públicas (About, Contact, NotFound).
│   │   │   ├── Authenticated/  # Páginas protegidas (Home, JobDetail, UserProfile, Favorites, AppliedJobs, UserSettings, ProfileEdit).
│   │   │   └── ...
│   │   ├── services/           # Lógica para comunicarse con el backend (api.js).
│   │   ├── utils/              # Utilidades varias (authUtils).
│   │   └── styles/             # Archivos CSS/SCSS (main.css, variables.css).
│   └── package.json            # Dependencias y scripts del frontend.
│   └── README.md
│
└── server/
├── config/                 # Configuraciones (base de datos, Passport.js).
│   ├── config.js           # Configuración de la base de datos (desarrollo, producción).
│   ├── database.js         # Conexión y sincronización con PostgreSQL.
│   └── passport-setup.js   # Configuración de estrategias de Passport.
├── controllers/            # Lógica de negocio para las rutas (auth, favorites, jobs).
│   ├── authController.js
│   ├── favoriteController.js
│   └── jobController.js
├── docs/                   # Documentación de la API (Swagger).
│   └── swagger.js
├── middleware/             # Middlewares personalizados (autenticación, roles, subidas).
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── uploadMiddleware.js
├── models/                 # Modelos de Sequelize (Job, User, FavoriteJob, JobApplication).
│   ├── favoriteJobModel.js
│   ├── index.js            # Agrupa y exporta todos los modelos.
│   ├── JobApplicationModel.js
│   ├── jobModel.js
│   └── userModel.js
├── public/                 # Archivos públicos accesibles (ej. uploads).
│   └── uploads/
│       └── ...             # Imágenes de perfil subidas.
├── routes/                 # Definición de rutas de la API (auth, favorites, jobs).
│   ├── authRoutes.js
│   ├── favoriteRoutes.js
│   └── jobRoutes.js
├── services/               # Lógica de servicios (procesamiento de empleos, scraping).
│   ├── jobProcessingService.js
│   └── scrapingService.js
├── utils/                  # Utilidades generales (manejo de errores, helpers).
│   ├── errorHandler.js
│   └── helpers.js
├── .env                    # Variables de entorno (¡no subir a Git!).
├── app.js                  # Archivo principal del servidor Express.
└── package.json            # Dependencias y scripts del backend.
└── README.md
```

## Diagrama de flijo
```mermaid
graph TD
    A[Usuario] --> B{Frontend React};
    B -- Peticiones HTTP --> C[Backend Node.js/Express];
    C -- Consultas/Actualizaciones --> D[Base de Datos PostgreSQL];
    C -- Web Scraping (Cheerio/Puppeteer/Playwright) --> E[Sitios de Empleo];

    subgraph Autenticación
        B -- Login/Registro --> C;
        C -- Genera JWT --> B;
        B -- Envía JWT en cada petición protegida --> C;
    end

    subgraph Scraping
        C -- Recibe solicitud de búsqueda --> C_Scraper[Módulo de Scraping];
        C_Scraper -- Visita Sitios de Empleo --> E;
        E -- Devuelve HTML --> C_Scraper;
        C_Scraper -- Parsear y Extraer Datos --> C;
        C -- Envía Datos al Frontend --> B;
    end

    subgraph Base de Datos
        C -- Almacena Usuarios --> D;
        C -- Almacena Empleos Favoritos --> D;
        C -- Almacena Datos de Empleos Scrapeados (Opcional, para cache) --> D;
    end
```
## ⚙️ Configuración y Ejecución

### Requisitos Previos

* Node.js (v14 o superior recomendado)
* npm o Yarn
* PostgreSQL (base de datos)

### 1. Configuración de la Base de Datos

1.  Asegúrate de tener una instancia de PostgreSQL en ejecución.
2.  Crea una base de datos para el proyecto (ej. `job_finder_db`).

### 2. Configuración del Backend

1.  Navega a la carpeta `server/`:
    ```bash
    cd server
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    # o
    yarn install
    ```
3.  Crea un archivo `.env` en la raíz de la carpeta `server/` y añade tus variables de entorno. Aquí hay un ejemplo básico:
    ```env
    PORT=5000
    DATABASE_URL=postgresql://user:password@host:port/job_finder_db
    JWT_SECRET=tu_secreto_jwt_muy_seguro
    SESSION_SECRET=tu_secreto_de_sesion_muy_seguro

    # Google OAuth
    GOOGLE_CLIENT_ID=tu_google_client_id
    GOOGLE_CLIENT_SECRET=tu_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

    # GitHub OAuth
    GITHUB_CLIENT_ID=tu_github_client_id
    GITHUB_CLIENT_SECRET=tu_github_client_secret
    GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

    FRONTEND_URL=http://localhost:5173
    ```
    **Importante:** Reemplaza los valores de ejemplo con tus propias credenciales y configuraciones.

4.  Inicia el servidor backend:
    ```bash
    npm start
    # o
    yarn start
    ```
    El servidor se ejecutará en `http://localhost:5000` (o el puerto que hayas configurado).
    La documentación de la API estará disponible en `http://localhost:5000/api-docs`.

### 3. Configuración del Frontend

1.  Navega a la carpeta `frontend/`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    # o
    yarn install
    ```
3.  Crea un archivo `.env` en la raíz de la carpeta `frontend/` y añade la URL de tu backend.
    ```env
    VITE_REACT_APP_API_BASE_URL=http://localhost:5000/api
    ```
    **Nota:** `VITE_REACT_APP_API_BASE_URL` es para entornos Vite.

4.  Inicia la aplicación frontend:
    ```bash
    npm run dev
    # o
    yarn dev
    ```
    La aplicación se ejecutará en `http://localhost:5173` (o el puerto que Vite asigne).

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor, sigue estos pasos:

1.  Haz un "fork" de este repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y haz "commit" (`git commit -m 'feat: Añade nueva funcionalidad X'`).
4.  Empuja tus cambios a tu "fork" (`git push origin feature/nueva-funcionalidad`).
5.  Abre un "Pull Request" explicando tus cambios.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

¡Disfruta buscando tu próximo empleo!