// client/src/pages/Authenticated/ProfileEditPage.js
// Editar el perfil del usuario.
// client/src/pages/Authenticated/ProfileEditPage.js
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Image, InputGroup, Row, Spinner } from "react-bootstrap";
import {
    ArrowLeftCircle,
    CheckCircleFill,
    EnvelopeFill,
    LockFill,
    PencilSquare,
    PersonFill,
    Trash,
    Upload,
    XCircleFill
} from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import api from "../../services/apiService";

/**
 * Componente ProfileEditPage.
 * Permite al usuario editar su perfil, incluyendo:
 * - Información básica (username, email)
 * - Cambio de contraseña (con validaciones)
 * - Gestión de foto de perfil (subir/eliminar)
 * 
 * @param {Object} props - Props del componente
 * @param {Function} props.showAlert - Función para mostrar alertas globales
 */
const ProfileEditPage = ({ showAlert }) => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    // Estados del formulario
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Inicializar campos con datos del usuario
    useEffect(() => {
        if (!user) {
        navigate('/login');
        return;
        }
        setUsername(user.username || '');
        setEmail(user.email || '');
    }, [user, navigate]);

    // Función para mostrar alertas
    const displayAlert = useCallback((msg, type) => {
        showAlert(msg, type);
    }, [showAlert]);

    // Validación de contraseña (coincide con backend)
    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    // Manejar cambio de contraseña con validación en tiempo real
    const handlePasswordChange = (value) => {
        setNewPassword(value);
        if (value && !validatePassword(value)) {
        setPasswordError('Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo');
        } else {
        setPasswordError('');
        }
    };

    /**
     * Actualiza la información del perfil del usuario
     * @param {Event} e - Evento del formulario
     */
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
        const updates = { username, email };
        let passwordChanged = false;

        // Validación de cambio de contraseña
        if (currentPassword || newPassword || confirmPassword) {
            if (!currentPassword || !newPassword || !confirmPassword) {
            displayAlert('Todos los campos de contraseña son requeridos', 'danger');
            setLoading(false);
            return;
            }

            if (newPassword !== confirmPassword) {
            displayAlert('Las contraseñas no coinciden', 'danger');
            setLoading(false);
            return;
            }

            if (!validatePassword(newPassword)) {
            displayAlert('La contraseña debe tener 8+ caracteres con mayúsculas, minúsculas, números y un símbolo', 'warning');
            setLoading(false);
            return;
            }

            updates.currentPassword = currentPassword;
            updates.newPassword = newPassword;
            passwordChanged = true;
        }

        // Llamada al endpoint correcto del backend
        const response = await api.put(`/auth/${user.id}/profile`, updates);
        
        // Actualizar contexto de autenticación
        updateUser(response.data.user);
        displayAlert('Perfil actualizado exitosamente', 'success');

        // Limpiar campos de contraseña si se cambió
        if (passwordChanged) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            displayAlert('Contraseña actualizada correctamente', 'success');
        }

        } catch (error) {
        console.error('Error al actualizar perfil:', error);
        
        let errorMessage = 'Error al actualizar el perfil';
        if (error.response) {
            if (error.response.status === 401) {
            errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente';
            logout();
            navigate('/login');
            } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
            }
        } else if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Error de conexión. Verifica tu conexión a internet';
        }

        displayAlert(errorMessage, 'danger');
        } finally {
        setLoading(false);
        }
    };

    /**
     * Maneja la selección de archivo para la foto de perfil
     * @param {Event} e - Evento de cambio de input file
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo y tamaño de archivo (2MB máximo)
        if (!file.type.startsWith('image/')) {
        displayAlert('Por favor selecciona un archivo de imagen', 'warning');
        e.target.value = '';
        return;
        }

        if (file.size > 5 * 1024 * 1024) {
        displayAlert('La imagen debe ser menor a 2MB', 'warning');
        e.target.value = '';
        return;
        }

        setSelectedFile(file);
    };

    /**
     * Sube una nueva foto de perfil al servidor
     * @param {Event} e - Evento del formulario
     */
    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
        displayAlert('Por favor selecciona una imagen', 'warning');
        return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('profilePhoto', selectedFile);

        try {
        // Usar el endpoint correcto del backend (POST en lugar de PUT)
        const response = await api.post(
            `/auth/${user.id}/profile/photo`,
            formData,
            {
            headers: { 'Content-Type': 'multipart/form-data' }
            }
        );

        displayAlert('Foto de perfil actualizada correctamente', 'success');
        updateUser({
            ...user,
            profilePictureUrl: response.data.profilePhotoUrl
        });
        
        setSelectedFile(null);
        e.target.reset();

        } catch (error) {
        console.error('Error al subir foto:', error);
        
        let errorMessage = 'Error al subir la foto';
        if (error.response) {
            if (error.response.status === 401) {
            errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente';
            logout();
            navigate('/login');
            } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
            }
        } else if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Error de conexión. Verifica tu conexión a internet';
        }

        displayAlert(errorMessage, 'danger');
        } finally {
        setLoading(false);
        }
    };

    /**
     * Elimina la foto de perfil actual
     */
    const handlePhotoDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar tu foto de perfil?')) return;

        setLoading(true);
        
        try {
        // Usar el endpoint correcto del backend
        await api.delete(`/auth/${user.id}/profile/photo`);
        
        displayAlert('Foto de perfil eliminada correctamente', 'success');
        updateUser({ ...user, profilePictureUrl: null });

        } catch (error) {
        console.error('Error al eliminar foto:', error);
        
        let errorMessage = 'Error al eliminar la foto';
        if (error.response) {
            if (error.response.status === 401) {
            errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente';
            logout();
            navigate('/login');
            } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
            }
        } else if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Error de conexión. Verifica tu conexión a internet';
        }

        displayAlert(errorMessage, 'danger');
        } finally {
        setLoading(false);
        }
    };

    if (!user) {
        return (
        <Container className="my-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Redirigiendo...</p>
        </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="text-center mb-4">
                <PencilSquare className="me-2 align-text-bottom" />
                Editar Perfil
            </h1>

            {loading && <LoadingSpinner message="Guardando cambios..." />}

            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    {/* Tarjeta de Información Personal */}
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h2 className="card-title text-center mb-4">
                                <PencilSquare className="me-2" />
                                Información Personal
                            </h2>
                            
                            <Form onSubmit={handleProfileUpdate}>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Nombre de Usuario:</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><PersonFill /></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email:</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <h3 className="mt-4 mb-3">Cambiar Contraseña</h3>
                                <p className="text-muted small mb-3">
                                    Para cambiar tu contraseña, ingresa la actual y la nueva.
                                </p>

                                <Form.Group className="mb-3" controlId="formCurrentPassword">
                                    <Form.Label>Contraseña Actual:</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><LockFill /></InputGroup.Text>
                                        <Form.Control
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formNewPassword">
                                <Form.Label>
                                        Nueva Contraseña:
                                        {newPassword && (
                                        <span className="ms-2">
                                            {validatePassword(newPassword) ? (
                                                <CheckCircleFill className="text-success" />
                                            ) : (
                                                <XCircleFill className="text-danger" />
                                            )}
                                        </span>
                                        )}
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><LockFill /></InputGroup.Text>
                                        <Form.Control
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => handlePasswordChange(e.target.value)}
                                            disabled={loading}
                                            isInvalid={!!passwordError}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {passwordError}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formConfirmPassword">
                                    <Form.Label>Confirmar Nueva Contraseña:</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><LockFill /></InputGroup.Text>
                                        <Form.Control
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                            isInvalid={newPassword && newPassword !== confirmPassword}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Las contraseñas no coinciden
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                        className="w-100"
                                    >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                className="me-2"
                                            />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <PencilSquare className="me-2" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Tarjeta de Foto de Perfil */}
                    <Card className="shadow-sm mb-4">
                        <Card.Body className="text-center">
                            <h2 className="card-title mb-4">Foto de Perfil</h2>
                            
                            <div className="mb-3 position-relative">
                                {user.profilePictureUrl ? (
                                <>
                                    <Image
                                        src={user.profilePictureUrl}
                                        roundedCircle
                                        className="border border-4 border-light shadow-sm"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            objectFit: 'cover'
                                        }}
                                        alt="Foto de perfil actual"
                                    />
                                    <div className="position-absolute top-0 end-0 bg-white rounded-circle p-1 shadow-sm">
                                        <PencilSquare size={16} className="text-primary" />
                                    </div>
                                </>
                                ) : (
                                <div
                                    className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                    style={{
                                    width: '120px',
                                    height: '120px',
                                    fontSize: '3rem'
                                    }}
                                >
                                    {user.username ? user.username[0].toUpperCase() : 'U'}
                                </div>
                                )}
                            </div>
                            
                            <Form onSubmit={handlePhotoUpload}>
                                <Form.Group controlId="formProfilePhoto" className="mb-3">
                                <Form.Label>Subir nueva foto:</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                                <Form.Text muted>
                                    Formatos aceptados: JPG, PNG. Tamaño máximo: 2MB
                                </Form.Text>
                                </Form.Group>
                                
                                <div className="d-grid gap-2">
                                    <Button
                                        variant="outline-primary"
                                        type="submit"
                                        disabled={!selectedFile || loading}
                                    >
                                        <Upload className="me-2" />
                                        {loading ? 'Subiendo...' : 'Subir Foto'}
                                    </Button>
                                    
                                    {user.profilePictureUrl && (
                                        <Button
                                            variant="outline-danger"
                                            onClick={handlePhotoDelete}
                                            disabled={loading}
                                        >
                                            <Trash className="me-2" />
                                            {loading ? 'Eliminando...' : 'Eliminar Foto Actual'}
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Botón para volver */}
                    <div className="text-center mt-4">
                        <Button
                            variant="outline-secondary"
                            as={Link}
                            to="/profile"
                            className="d-inline-flex align-items-center"
                        >
                            <ArrowLeftCircle className="me-2" />
                            Volver al Perfil
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfileEditPage;