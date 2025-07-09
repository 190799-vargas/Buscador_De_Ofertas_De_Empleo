// client/src/components/Auth/Register.js
// Formulario para crear una cuenta (página inicial).
import React, { useState } from "react";
import { Button, Card, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { EnvelopeFill, Github, Google, LockFill, PersonFill, PersonPlus } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom"; // Para navegación y enlaces

import useAuth from "../../hooks/useAuth"; // Hook para acceder al contexto de autenticación
import api from "../../services/apiService"; // Tu instancia de Axios configurada
import LoadingSpinner from "../common/LoadingSpinner"; // Componente de carga.

/**
 * @description Componente Register.
 * Permite a los usuarios registrarse con nombre de usuario, email y contraseña,
 * o a través de OAuth con Google y GitHub. Utiliza estilos de Bootstrap.
 * @param {object} { showAlert } - Función para mostrar alertas, pasada desde App.js.
 * @returns Un formulario de registro de usuario, con redireccion al login, tambien OAuth con Google y Github.
 */
const Register = ({ showAlert }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Redirigir si el usuario ya está autenticado
    if (isAuthenticated) {
        navigate('/home', { replace: true});
        return null;
    }

    /**
     * @description Maneja el envío del formulario de Registro.
     * - Previene el comportamiento por defecto del formulario.
     * - Valida que username, email, password, confirmPassword no esten vacios, ya que estos campos son obligatorios.
     * - Valida que password y confirmPassword coincidan.
     * - Valida que la contraseña tengo al menos 8 caracteres.
     * - Enviamos username, email y password al backend.
     * - Si el registro es exitoso redirige a la pagina login.
     * @param {React.FormEvent<HTMLFormElement>} e - Evento de envío del formulario
     * @returns Mensaje de exito o error al registrar usuario
     */
    const handleSubmit = async(e) => {
        e.preventDefault();

        //Validaciones básicas del lado del cliente
        if (!username || !email || !password || !confirmPassword) {
            showAlert("Todos los campos son obligatorios.", "danger"); // Cambiado a 'danger' para errores
            return;
        }
        if (password !== confirmPassword) {
            showAlert('Las contraseñas no coinciden.', 'danger');
            return;
        }
        if (password.length < 8) {
            showAlert('La contraseña debe tener al menos 8 caracteres.', 'danger');
            return;
        }

        setLoading(true);
        try {
            // Enviamos username, email y password al backend
            const response = await api.post('/auth/register', { username, email, password });
            showAlert(response.data.message || 'Registro exitoso. Ahora puedes iniciar sesión.', 'success');
            navigate('/login'); // Redirigir al usuario a la página de login
        } catch (error) {
            console.error('Error durante el registro:', error.response?.data || error.message);
            // Mostrar el mensaje de error específico del backend si está disponible
            showAlert(error.response?.data?.message || 'Error en el registro. Inténtalo de nuevo.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    /**
     * @description Manejadores para el inicio de sesión con OAuth (Google)
     */
    const handleGoogleAuth = () => {
        // CORRECCIÓN: Usar template string y import.meta.env
        window.location.href = `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/auth/google`;
        showAlert(response.data.message || 'Registro exitoso. Ahora puedes buscar los empleos que desees.', 'success');
        navigate('/home')
    };

    /**
     * @description Manejadores para el inicio de sesión con OAuth (GitHub)
     */
    const handleGitHubAuth = () => {
        // CORRECCIÓN: Usar import.meta.env
        window.location.href = `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/auth/github`;
        showAlert(response.data.message || 'Registro exitoso. Ahora puedes buscar los empleos que desees.', 'success');
        navigate('/home')
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh'}}>
            {loading && <LoadingSpinner />} {/* Mostrar spinner si está cargando */}
            <Row>
                <Col md={12}>
                    <Card className="shadow p-4">
                        <Card.Body>
                            <h2 className="text-center mb-4">Regístrarse</h2>
                            <Form onSubmit={handleSubmit}>
                                {/* Campo de Nombre de Usuario */}
                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Nombre de Usuario</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><PersonFill /></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Introduce tu nombre de usuario"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                {/* Campo de Email */}
                                <Form.Group className="mb-3" controlId="email">
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
                                <Form.Group className="mb-3" controlId="password">
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

                                {/* Campo de Confirmar Contraseña */}
                                <Form.Group className="mb-4" controlId="confirmPassword">
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><LockFill /></InputGroup.Text>
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirma tu contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit" disabled={loading} className="btn-lg rounded-pill fw-bold">
                                        {loading ? (
                                            <>
                                                <LoadingSpinner size="sm" className="me-2" />
                                                Registrando...
                                            </>
                                        ) : (
                                            <>
                                                <PersonPlus size={20} className="me-2" />
                                                Registrarse
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                            
                            {/* Registro OAuth con Google o GitHub */}
                            <div className="text-center my-3">
                                <span className="text-muted">O regístrate con</span>
                            </div>

                            <div className="d-grid gap-2">
                                <Button variant="outline-dark" onClick={handleGoogleAuth} disabled={loading}>
                                    <Google className="me-2" /> Google
                                </Button>
                                <Button variant="outline-secondary" onClick={handleGitHubAuth} disabled={loading}>
                                    <Github className="me-2" /> GitHub
                                </Button>
                            </div>

                            <p className="text-center text-muted mt-3">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                                    Iniciar Sesión aquí
                                </Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;