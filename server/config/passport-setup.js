// server/config/passport-setup.js
// Configuración de Passport para autenticación con Google y GitHub
require('dotenv').config(); // Cargar variables de entorno desde .env
const passport = require('passport'); // Importar Passport para la autenticación
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Estrategia de Google OAuth 2.0
const GitHubStrategy = require('passport-github2').Strategy; // Estrategia de GitHub OAuth 2.0
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { User } = require("../models/"); // Importar el modelo User de Sequelize

// JWT Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}, async (payload, done) => {
    try {
        const user = await User.findByPk(payload.id);
        if (user) {
        return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

// Serializar usuario: Guardar el ID del usuario en la sesión
passport.serializeUser((user, done) => {
    done(null, user.id); // Almacena el ID del usuario en la sesión
});

// Deserializar usuario: Recupera el usuario de la DB usando el ID de la sesión
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// --- Estrategia de Google OAuth ---
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'], // Solicita acceso al perfil básico y al email del usuario

    },
    async (accessToken, refreshToken, profile, done) => {
        // Esta función se llama cuando Google redirige de vuelta a nuestro callback URL.
        try {
            let user = await User.findOne({ where: { googleId: profile.id } });

            if (user) {
                // Si el usuario ya existe con este googleId, lo devuelve
                done(null, user);
            } else {
                // Si no existe, verifica si hay un usuario con el mismo email para vincular
                user = await User.findOne({ where: { email: profile.emails[0].value } });

                if (user) {
                     // Si existe un usuario con el mismo email, vincular la cuenta de Google
                    user.googleId = profile.id;
                    await user.save();
                    done(null, user);
                } else {
                    // Si no existe, crea un nuevo usuario
                    const newUser = await User.create({
                        googleId: profile.id,
                        username: profile.displayName || profile.emails[0].value.split('@')[0], // Intenta usar display name o parte del email
                        email: profile.emails[0].value,
                        profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                        password: null, // No hay contraseña si se registra con OAuth
                        role: 'user', // Rol de usuario por defecto
                    });
                    done(null, newUser);
                }
            }
        } catch (error) {
            console.error("Error en estrategia de Google:", error);
            done(error, null);
        }
    }
));

// --- Estrategia de GitHub OAuth ---
passport.use(new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'] // Solicita permiso para acceder al email del usuario
    },
    async (accessToken, refreshToken, profile, done) => {
        // Esta función se llama cuando GitHub redirige de vuelta a nuestro callback URL.
        try {
            let user = await User.findOne({ where: { githubId: profile.id } });

            if (user) {
                done(null, user);
            } else {
                // GitHub puede no devolver el email en el perfil directamente, puede requerir una llamada a la API o un scope específico.
                // Si el email no está en profile.emails, puedes intentar obtenerlo de profile._json.email
                const userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : profile._json.email;

                if (!userEmail) {
                    console.warn("GitHub no proporcionó email para el usuario:", profile.username);
                    // Decide qué hacer si no hay email (ej. pedir al usuario que lo añada manualmente, o usar un email temporal)
                    return done(new Error("No se pudo obtener el email del perfil de GitHub."), null);
                }

                // Verificar si hay un usuario con el mismo email para vincular
                user = await User.findOne({ where: { email: userEmail } });

                if (user) {
                    // Vincular la cuenta de GitHub
                    user.githubId = profile.id;
                    await user.save();
                    done(null, user);
                } else {
                    // Crear un nuevo usuario
                    const newUser = await User.create({
                        githubId: profile.id,
                        username: profile.username || userEmail.split('@')[0],
                        email: userEmail,
                        profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                        password: null,
                        role: 'user',
                    });
                    done(null, newUser);
                }
            }
        } catch (error) {
            console.error("Error en estrategia de GitHub:", error);
            done(error, null);
        }
    }
));