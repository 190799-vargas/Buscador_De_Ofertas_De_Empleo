// client/src/pages/Authenticated/UserSettingsPage.js
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import {
    ArrowLeftCircle,
    BellFill,
    CheckCircleFill,
    GearFill,
    LockFill,
    Palette
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import api from "../../services/apiService";

/**
 * Página de configuración del usuario
 * Permite modificar preferencias de notificaciones, privacidad, apariencia y cambiar contraseña
 */
const UserSettingsPage = ({ showAlert }) => {
    const { user: authUser, updateUser } = useAuth();
    const navigate = useNavigate();
    
    // Estado seguro del usuario con valores por defecto
    const [userData, setUserData] = useState({
        id: '',
        email: 'Cargando...',
        isReady: false
    });
    
    // Configuración inicial segura
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            news: true
        },
        privacy: {
            profileVisibility: 'public',
            searchVisibility: true
        },
        appearance: {
            theme: 'light',
            fontSize: 'medium'
        }
    });
    
    // Estado para cambio de contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Estados de carga
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    // Inicialización segura del componente
    useEffect(() => {
        let isMounted = true;

        const initializeUser = async () => {
            try {
                // Verificación profunda de autenticación
                if (!authUser?.id) {
                    navigate('/login');
                    return;
                }

                // Datos mínimos garantizados
                const safeUser = {
                    id: authUser.id || '',
                    email: authUser.email || 'Usuario no identificado',
                    isReady: true
                };

                if (isMounted) {
                    setUserData(safeUser);
                }

                // Carga segura de configuración
                const response = await api.get(`/auth/${safeUser.id}/settings`);
                
                if (isMounted) {
                    setSettings(response.data || {
                        notifications: {
                            email: true,
                            push: true,
                            news: true
                        },
                        privacy: {
                            profileVisibility: 'public',
                            searchVisibility: true
                        },
                        appearance: {
                            theme: 'light',
                            fontSize: 'medium'
                        }
                    });
                }
                
            } catch (err) {
                if (isMounted) {
                    console.error('Error inicializando usuario:', err);
                    setError(err.response?.data?.message || 'Error al cargar configuración');
                    showAlert('Error al cargar configuración', 'danger');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeUser();

        return () => {
            isMounted = false;
        };
    }, [authUser, navigate, showAlert]);

    // Manejo seguro de cambios en configuración
    const handleSettingChange = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    // Cambio de contraseña con validación
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);

        try {
            // Validaciones
            if (!passwordData.currentPassword || !passwordData.newPassword) {
                throw new Error('Todos los campos son requeridos');
            }

            if (passwordData.newPassword.length < 8) {
                throw new Error('La contraseña debe tener al menos 8 caracteres');
            }

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            // Petición segura
            const response = await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            showAlert(response.data.message || 'Contraseña actualizada exitosamente', 'success');
            
            // Reset seguro del formulario
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            console.error('Error al cambiar contraseña:', errorMessage);
            setError(errorMessage);
            showAlert(errorMessage, 'danger');
        } finally {
            setUpdating(false);
        }
    };

    // Guardado seguro de configuración
    const saveSettings = async () => {
        if (!userData.isReady) return;

        setUpdating(true);
        setError(null);

        try {
            const response = await api.put(`/auth/${userData.id}/settings`, settings);
            
            // Actualización segura del contexto
            if (authUser) {
                updateUser({ 
                    ...authUser, 
                    settings: response.data || settings 
                });
            }

            showAlert('Configuración guardada exitosamente', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al guardar configuración';
            console.error('Error al guardar configuración:', errorMessage);
            setError(errorMessage);
            showAlert(errorMessage, 'danger');
        } finally {
            setUpdating(false);
        }
    };

    // Renderizado condicional seguro
    if (loading) {
        return <LoadingSpinner message="Cargando configuración..." />;
    }

    if (!userData.isReady) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    Error al cargar los datos del usuario
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate('/')}
                        className="ms-3"
                    >
                        Volver al inicio
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            {/* Encabezado seguro */}
            <div className="d-flex align-items-center mb-4">
                <Button 
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    className="me-3"
                >
                    <ArrowLeftCircle className="me-1" /> Volver
                </Button>
                <h1 className="mb-0">
                    <GearFill className="me-2 align-text-bottom" />
                    Configuración de Cuenta
                </h1>
                <small className="ms-2 text-muted">{userData.email}</small>
            </div>

            {/* Manejo seguro de errores */}
            {error && (
                <Alert 
                    variant="danger" 
                    className="mb-4" 
                    onClose={() => setError(null)} 
                    dismissible
                >
                    {error}
                </Alert>
            )}

            <Row>
                {/* Columna de Configuración Principal */}
                <Col md={8}>
                    {/* Sección de Notificaciones */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-light">
                            <h3 className="mb-0">
                                <BellFill className="me-2 text-primary" />
                                Notificaciones
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="email-notifications"
                                    label="Recibir notificaciones por email"
                                    checked={settings.notifications.email}
                                    onChange={(e) => handleSettingChange(
                                        'notifications', 
                                        'email', 
                                        e.target.checked
                                    )}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="push-notifications"
                                    label="Notificaciones push en la aplicación"
                                    checked={settings.notifications.push}
                                    onChange={(e) => handleSettingChange(
                                        'notifications', 
                                        'push', 
                                        e.target.checked
                                    )}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="news-notifications"
                                    label="Recibir novedades y ofertas"
                                    checked={settings.notifications.news}
                                    onChange={(e) => handleSettingChange(
                                        'notifications', 
                                        'news', 
                                        e.target.checked
                                    )}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Sección de Privacidad */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-light">
                            <h3 className="mb-0">
                                <LockFill className="me-2 text-primary" />
                                Privacidad
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Visibilidad del perfil</Form.Label>
                                <Form.Select
                                    value={settings.privacy.profileVisibility}
                                    onChange={(e) => handleSettingChange(
                                        'privacy', 
                                        'profileVisibility', 
                                        e.target.value
                                    )}
                                >
                                    <option value="public">Público</option>
                                    <option value="private">Privado</option>
                                    <option value="connections">Solo conexiones</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="search-visibility"
                                    label="Aparecer en resultados de búsqueda"
                                    checked={settings.privacy.searchVisibility}
                                    onChange={(e) => handleSettingChange(
                                        'privacy', 
                                        'searchVisibility', 
                                        e.target.checked
                                    )}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Sección de Apariencia */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-light">
                            <h3 className="mb-0">
                                <Palette className="me-2 text-primary" />
                                Apariencia
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Tema de la aplicación</Form.Label>
                                <Form.Select
                                    value={settings.appearance.theme}
                                    onChange={(e) => handleSettingChange(
                                        'appearance', 
                                        'theme', 
                                        e.target.value
                                    )}
                                >
                                    <option value="light">Claro</option>
                                    <option value="dark">Oscuro</option>
                                    <option value="system">Según sistema</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Tamaño de texto</Form.Label>
                                <Form.Select
                                    value={settings.appearance.fontSize}
                                    onChange={(e) => handleSettingChange(
                                        'appearance', 
                                        'fontSize', 
                                        e.target.value
                                    )}
                                >
                                    <option value="small">Pequeño</option>
                                    <option value="medium">Mediano</option>
                                    <option value="large">Grande</option>
                                </Form.Select>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Botón para guardar configuración */}
                    <div className="text-end mb-5">
                        <Button
                            variant="primary"
                            onClick={saveSettings}
                            disabled={updating || !userData.isReady}
                        >
                            {updating ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <CheckCircleFill className="me-2" />
                                    Guardar Configuración
                                </>
                            )}
                        </Button>
                    </div>
                </Col>

                {/* Columna de Cambio de Contraseña */}
                <Col md={4}>
                    <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
                        <Card.Header className="bg-light">
                            <h3 className="mb-0">
                                <LockFill className="me-2 text-primary" />
                                Cambiar Contraseña
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handlePasswordChange}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña Actual</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData, 
                                            currentPassword: e.target.value
                                        })}
                                        required
                                        disabled={!userData.isReady}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nueva Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData, 
                                            newPassword: e.target.value
                                        })}
                                        required
                                        isInvalid={passwordData.newPassword.length > 0 && 
                                                  passwordData.newPassword.length < 8}
                                        disabled={!userData.isReady}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Mínimo 8 caracteres
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData, 
                                            confirmPassword: e.target.value
                                        })}
                                        required
                                        isInvalid={passwordData.confirmPassword !== 
                                                  passwordData.newPassword}
                                        disabled={!userData.isReady}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Las contraseñas no coinciden
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Button
                                    variant="outline-primary"
                                    type="submit"
                                    disabled={updating || !userData.isReady}
                                    className="w-100"
                                >
                                    {updating ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        'Cambiar Contraseña'
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};


export default UserSettingsPage;