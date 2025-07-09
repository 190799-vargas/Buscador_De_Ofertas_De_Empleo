// client/src/pages/Authenticated/UserProfilePage.js
// La página principal del perfil.
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Image, ListGroup, Row } from "react-bootstrap";
import {
    ArrowLeftCircle,
    BriefcaseFill,
    BuildingFill,
    CalendarCheckFill,
    CheckCircleFill,
    GearFill,
    GeoAltFill,
    HeartFill,
    HourglassSplit,
    ListUl,
    PencilSquare,
    PersonFill,
    XCircleFill
} from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import api from "../../services/apiService";

/**
 * Componente UserProfilePage.
 * Muestra el perfil del usuario con:
 * - Información personal
 * - Resumen de postulaciones (últimas 3)
 * - Acceso rápido a favoritos
 * - Enlaces a edición y configuración
 * 
 * @param {Object} props - Props del componente
 * @param {Function} props.showAlert - Función para mostrar alertas globales
 */
const UserProfilePage = ({ showAlert }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Redirige si no hay usuario autenticado
    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    // Función para mostrar alertas
    const displayAlert = useCallback((msg, type) => {
        showAlert?.(msg, type) || setError(type === 'danger' ? msg : null);
    }, [showAlert]);

    // Obtiene datos del perfil y postulaciones
    const fetchUserData = useCallback(async () => {
        if (!user?.id) {
        setLoading(false);
        return;
        }

        setLoading(true);
        setError(null);

        try {
        const [profileRes, appsRes] = await Promise.all([
            api.get('/auth/current-user'),
            api.get('/auth/applications?limit=3') // Usamos parámetro limit en lugar de slice
        ]);

        setProfileData(profileRes.data);
        setApplications(appsRes.data.applications || []);
        } catch (err) {
        console.error('Error fetching profile data:', err);
        
        const errorMsg = err.response?.data?.message ||
                        (err.code === 'ERR_NETWORK' ? 'Error de conexión' : 'Error al cargar datos');
        
        displayAlert(errorMsg, 'danger');
        setError(errorMsg);

        if (err.response?.status === 401) {
            logout();
            navigate('/login');
        }
        } finally {
        setLoading(false);
        }
    }, [user, logout, navigate, displayAlert]);

    // Carga inicial de datos
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    /**
     * Formatea una fecha ISO a formato local
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada o mensaje alternativo
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString('es-ES');
    };

    /**
     * Obtiene los elementos visuales para el estado de postulación
     * @param {string} status - Estado de la postulación
     * @returns {Object} {icon: JSX.Element, text: string}
     */
    const getStatusDisplay = (status) => {
        const statusMap = {
        pending: { icon: <HourglassSplit className="text-warning" />, text: 'Pendiente' },
        reviewed: { icon: <BriefcaseFill className="text-info" />, text: 'Revisado' },
        accepted: { icon: <CheckCircleFill className="text-success" />, text: 'Aceptado' },
        rejected: { icon: <XCircleFill className="text-danger" />, text: 'Rechazado' },
        default: { icon: <BriefcaseFill className="text-muted" />, text: 'Desconocido' }
        };

        return statusMap[status?.toLowerCase()] || statusMap.default;
    };

    // Estados de carga y error
    if (!user) return <LoadingSpinner message="Redirigiendo..." />;
    if (loading) return <LoadingSpinner message="Cargando tu perfil..." />;
    if (error) return (
        <Container className="my-5">
            <Alert variant="danger" className="text-center">
                {error}
                <div className="mt-3">
                <Button variant="outline-secondary" onClick={() => navigate('/home')}>
                    <ArrowLeftCircle className="me-2" /> Volver a Inicio
                </Button>
                </div>
            </Alert>
        </Container>
    );

    return (
        <Container className="my-4">
        <h1 className="text-center mb-4">
            <PersonFill className="me-2" />
            Mi Perfil
        </h1>

        {/* Sección de Información del Usuario */}
        <Row className="justify-content-center mb-4">
            <Col md={8} lg={6}>
                <Card className="shadow-sm">
                    <Card.Body className="text-center">
                        <div className="mb-3 position-relative">
                            {profileData?.profilePictureUrl ? (
                            <Image
                                src={profileData.profilePictureUrl}
                                roundedCircle
                                className="border border-4 border-light shadow-sm"
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                alt="Foto de perfil"
                            />
                            ) : (
                            <div
                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                            >
                                {profileData?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            )}
                        </div>
                        
                        <Card.Title as="h2" className="mb-1">
                            {profileData?.username || 'Usuario'}
                        </Card.Title>
                        
                        <Card.Subtitle className="mb-2 text-muted">
                            {profileData?.email || 'Email no disponible'}
                        </Card.Subtitle>
                        
                        <p className="text-muted">
                            Rol: <span className="badge bg-secondary">{profileData?.role || 'user'}</span>
                        </p>

                        <div className="d-grid gap-2 mt-4">
                            <Button variant="primary" as={Link} to="/profile/edit">
                                <PencilSquare className="me-2" /> Editar Perfil
                            </Button>
                            <Button variant="outline-secondary" as={Link} to="/settings">
                                <GearFill className="me-2" /> Configuración
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        <hr className="my-5" />

        {/* Sección de Postulaciones Recientes */}
        <section>
            <h2 className="mb-3 text-center">
                <BriefcaseFill className="me-2 align-text-bottom" />
                Mis Postulaciones Recientes
            </h2>
            
            {applications.length === 0 ? (
            <Alert variant="info" className="text-center py-4">
                <p className="lead mb-3">Aún no tienes postulaciones</p>
                <Button variant="primary" as={Link} to="/home">
                    <BriefcaseFill className="me-2" /> Buscar Empleos
                </Button>
            </Alert>
            ) : (
            <>
                <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                {applications.map((app) => (
                    <Col key={app.id}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                        <Card.Title className="mb-2">
                            {app.job?.title || 'Título no disponible'}
                        </Card.Title>
                        
                        <Card.Subtitle className="mb-2 text-muted">
                            <BuildingFill className="me-1" />
                            {app.job?.companyName || 'Empresa no disponible'}
                        </Card.Subtitle>
                        
                        <ListGroup variant="flush" className="mb-3">
                            <ListGroup.Item className="d-flex align-items-center px-0">
                            <GeoAltFill className="me-2" />
                            {app.job?.location || 'Ubicación no disponible'}
                            </ListGroup.Item>
                            
                            <ListGroup.Item className="d-flex align-items-center px-0">
                            <CalendarCheckFill className="me-2" />
                            Postulado: {formatDate(app.applicationDate)}
                            </ListGroup.Item>
                            
                            <ListGroup.Item className="d-flex align-items-center px-0">
                            <span className="me-2">
                                {getStatusDisplay(app.status).icon}
                            </span>
                            Estado: {getStatusDisplay(app.status).text}
                            </ListGroup.Item>
                        </ListGroup>
                        
                        <Button
                            variant="outline-primary"
                            as={Link}
                            to={`/jobs/${app.jobId}`}
                            className="w-100"
                        >
                            Ver Detalles
                        </Button>
                        </Card.Body>
                    </Card>
                    </Col>
                ))}
                </Row>
                
                {applications.length > 0 && (
                    <div className="text-center mt-4">
                        <Button
                            variant="outline-info"
                            as={Link}
                            to="/applied-jobs"
                            className="d-inline-flex align-items-center py-2 px-3"
                        >
                            <ListUl size={18} className="me-2" />
                            Ver Todas Mis Postulaciones
                        </Button>
                    </div>
                )}
            </>
            )}
        </section>

        <hr className="my-5" />

        {/* Sección de Favoritos */}
        <section className="text-center">
            <h2 className="mb-3">Mis Favoritos</h2>
            <p className="lead mb-3">Accede rápidamente a tus empleos guardados</p>
            <Button variant="outline-success" as={Link} to="/favorites">
                <HeartFill className="me-2" /> Ver Favoritos
            </Button>
        </section>

        {/* Botón de Volver */}
        <div className="text-center mt-5">
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                <ArrowLeftCircle className="me-2" /> Volver
            </Button>
        </div>
        </Container>
    );
};

export default UserProfilePage;