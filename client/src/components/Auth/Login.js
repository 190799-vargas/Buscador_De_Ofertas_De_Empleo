// client/src/components/Auth/Login.js
// Formulario para iniciar sesión.
import React, { useState } from "react";
import { Button, Card, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { BoxArrowInRight, EnvelopeFill, Github, Google, LockFill, PersonCircle } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth"; // Hook para acceder al contexto de autenticación.
import api from "../../services/apiService"; // Tu instancia de Axios configurada.
import LoadingSpinner from "../common/LoadingSpinner"; // Componente de carga.

/**
 * @description Componente Login.
 * Permite a los usuarios iniciar sesión con email y contraseña,
 * o a través de OAuth con Google y GitHub. usa estilos Bootstrap.
 * @param {object} { showAlert } - Función para mostrar alertas, pasada desde App.js.
 * @returns Un formulario de inicio de sesion de usuario, con redireccion al HomePage, tambien OAuth con Google y Github.
 */
const Login = ({ showAlert }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Estado de carga para el formulario.
    const navigate = useNavigate(); // Hook para la navegación programática.
    const { login, isAuthenticated } = useAuth(); // Obtenemos la función login y el estado isAuthenticated.

    // Si el usuario ya está autenticado, redirigir a la página principal
    if (isAuthenticated) {
        navigate('/home', { replace: true });
        return null; // No renderizar nada si ya está autenticado.
    }

    
    /**
     * @description Manejador del envío del formulario de login (email/password)
     * - Previene el comportamiento por defecto del formulario.
     * - Valida que email, password,  no esten vacios, ya que estos campos son obligatorios.
     * - Enviamos email y password al backend.
     * - Si el inicio de sesion es exitoso redirige a la pagina HomePage.
     * @param {React.FormEvent<HTMLFormElement>} e - Evento de envío del formulario
     * @returns Mensaje de exito o error al Iniciar sesion el usuario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario.

        if (!email || !password) {
            showAlert('Por favor, introduce tu email y contraseña.', 'danger');
            return;
        }

        setLoading(true); // Activar spinner de carga
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user, message } = response.data; // Desestructuramos el token, user y message

            // Llamar a la función login del contexto para establecer el usuario y el token
            await login(token, user);
            showAlert(message || '¡Inicio de sesión exitoso! Bienvenido de nuevo.', 'success');
            console.log("Usuario ha iniciado sesión:", user.email);
            navigate('/home', { replace: true }); // Redirigir al usuario a la página principal
        } catch (error) {
            console.error('Error durante el inicio de sesión:', error.response?.data || error.message);
            // Mostrar el mensaje de error específico del backend si está disponible (ej. credenciales inválidas)
            showAlert(error.response?.data?.message || 'Error en el inicio de sesión. Verifica tus credenciales.', 'danger');
        } finally {
            setLoading(false); // Desactivar spinner de carga
        }
    };

    /**
     * @description Manejadores para el inicio de sesión con OAuth (Google)
     */
    const handleGoogleAuth = () => {
        // CORRECCIÓN: Usar template string y import.meta.env
        window.location.href = `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/auth/google`;
        showAlert(message || '¡Inicio de sesión exitoso! Ahora puedes buscar los empleos que desees.', 'success');
        console.log("Usuario ha iniciado sesión:", user.email);
        navigate('/home');
    };

    /**
     * @description Manejadores para el inicio de sesión con OAuth (GitHub)
     */
    const handleGitHubAuth = () => {
        // CORRECCIÓN: Usar import.meta.env
        window.location.href = `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/auth/github`;
        showAlert(message || '¡Inicio de sesión exitoso! Ahora puedes buscar los empleos que desees.', 'success');
        console.log("Usuario ha iniciado sesión:", user.email);
        navigate('/home');
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            {loading && <LoadingSpinner />} {/* Mostrar spinner si está cargando */}
            <Row>
                <Col md={12}>
                    <Card className="shadow p-4">
                        <Card.Body>
                            <h2 className="text-center mb-4 text-primary fw-bold">
                                <PersonCircle className="me-2" /> Iniciar Sesión
                            </h2>
                            <Form onSubmit={handleSubmit}>
                                {/* Campo de Email */}
                                <Form.Group className="mb-3" controlId="loginEmail">
                                    <Form.Label>Email</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            placeholder="Introduce tu email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                {/* Campo de Contraseña */}
                                <Form.Group className="mb-4" controlId="loginPassword">
                                    <Form.Label>Contraseña</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><LockFill /></InputGroup.Text>
                                        <Form.Control
                                            type="password"
                                            placeholder="Introduce tu contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit" disabled={loading} className="btn-lg rounded-pill fw-bold">
                                        {loading ? (
                                            <LoadingSpinner size="sm" className="me-2" />
                                            ) : (
                                                <>
                                                    <BoxArrowInRight size={20} className="me-2" />
                                                    Iniciar Sesión
                                                </>
                                        )}
                                    </Button>
                                </div>
                            </Form>

                            <div className="text-center my-3">
                                <span className="text-muted">O inicia sesión con</span>
                            </div>

                            <div className="d-grid gap-2">
                                <Button variant="outline-dark" onClick={handleGoogleAuth} disabled={loading}>
                                    <Google className="me-2" /> Google
                                </Button>
                                <Button variant="outline-secondary" onClick={handleGitHubAuth} disabled={loading}>
                                    <Github className="me-2" /> GitHub
                                </Button>
                            </div>

                            <p className="text-center text-muted mt-4">
                                ¿No tienes una cuenta?{' '}
                                <Link to="/" className="text-primary text-decoration-none fw-semibold">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;