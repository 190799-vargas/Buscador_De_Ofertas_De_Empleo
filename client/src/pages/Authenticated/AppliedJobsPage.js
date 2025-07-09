// client/src/pages/Authenticated/AppliedJobsPage.js
// Empleos a los que ha aplicado.
import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, ListGroup, Row } from "react-bootstrap";
import {
    ArrowLeftCircle,
    BriefcaseFill,
    BuildingFill,
    CalendarCheckFill,
    CheckCircleFill,
    GeoAltFill,
    HourglassSplit,
    XCircleFill
} from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import api from "../../services/apiService";

/**
 * Componente AppliedJobsPage.
 * Muestra la lista de empleos a los que el usuario se ha postulado.
 * @param {object} { showAlert } - Función para mostrar alertas, pasada desde App.js.
 * @returns Lista de empleos que tiene el usuario aplicados o dependiendo el estado
 */
const AppliedJobsPage = ({ showAlert }) => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                // que devuelve las postulaciones del usuario autenticado.
                const response = await api.get('/auth/applications');
                setApplications(response.data.applications || []); // Ajusta si la respuesta tiene otro nombre, ej. response.data.data
                if (response.data.applications && response.data.applications.length === 0) {
                    showAlert('Aún no te has postulado a ningún empleo.', 'info');
                }
            } catch (err) {
                console.error('Error al cargar postulaciones:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'No se pudieron cargar tus postulaciones.');
                showAlert(err.response?.data?.message || 'Error al cargar postulaciones.', 'danger');
            } finally {
                setLoading(false);
            }
        };
        
        fetchAppliedJobs();
    }, [showAlert]);

    /**
     * Formatea una cadena de fecha en un formato legible según la configuración regional del navegador.
     * Maneja casos edge como fechas inválidas o valores vacíos.
     * @param {string} dateString - Cadena de fecha en formato ISO (ej. "2023-12-31T00:00:00Z") o compatible con el constructor Date.
     * @returns {string} Fecha formateada (ej. "31/12/2023") o mensajes descriptivos para errores.
     * @example
     *  Returns "31/12/2023"
     * formatDate("2023-12-31");
     * @example
     *  Returns "Fecha inválida"
     * formatDate("invalid-date");
    */
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
    };

    // Función para obtener el ícono y el color del estado de la postulación
    const getStatusDisplay = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { icon: <HourglassSplit className="text-warning me-1" />, text: 'Pendiente' };
            case 'reviewed':
                return { icon: <BriefcaseFill className="text-info me-1" />, text: 'Revisado' };
            case 'accepted':
                return { icon: <CheckCircleFill className="text-success me-1" />, text: 'Aceptado' };
            case 'rejected':
                return { icon: <XCircleFill className="text-danger me-1" />, text: 'Rechazado' };
            default:
                return { icon: <BriefcaseFill className="text-muted me-1" />, text: status || 'Desconocido' };
        }
    };

    if (loading) {
        return <LoadingSpinner message="Cargando tus postulaciones..." />;
    }

    if (error) {
        return (
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
    }

    return (
        <Container className="my-4">
            <h1 className="text-center mb-4">Mis Postulaciones</h1>
            <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeftCircle className="me-2" /> Volver
            </Button>

            {applications.length === 0 ? (
                <Alert variant="info" className="text-center py-4">
                    <p className="lead mb-3">Aún no te has postulado a ningún empleo.</p>
                    <p>¡Explora nuestra <Link to="/home">página de inicio</Link> para encontrar nuevas oportunidades!</p>
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {applications.map((app) => (
                        <Col key={app.id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="mb-2">{app.job?.title || 'Empleo desconocido'}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        <BuildingFill className="me-1" /> {app.job?.companyName || 'Empresa desconocida'}
                                    </Card.Subtitle>
                                    <ListGroup variant="flush" className="mt-3 mb-3">
                                        <ListGroup.Item className="d-flex align-items-center">
                                            <GeoAltFill className="me-1" />
                                            {app.job?.location && app.job?.location !== 'No especificada'
                                                ? `${app.job.location}, ${app.job.country?.toUpperCase() || ''}`
                                                : `País: ${app.job?.country?.toUpperCase() || 'No especificado'}`
                                            }
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex align-items-center">
                                            <CalendarCheckFill className="me-1" />
                                            <strong className="me-1">Postulado el:</strong> {formatDate(app.applicationDate)}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex align-items-center">
                                            {getStatusDisplay(app.status).icon}
                                            <strong className="me-1">Estado:</strong> {getStatusDisplay(app.status).text}
                                        </ListGroup.Item>
                                    </ListGroup>
                                    <div className="d-grid gap-2">
                                        <Button variant="primary" as={Link} to={`/jobs/${app.jobId}`}>
                                            Ver Detalles del Empleo
                                        </Button>
                                        {/* Puedes añadir un botón para actualizar el estado de la aplicación si el backend lo permite */}
                                        {/* <Button variant="outline-info" size="sm">Actualizar Estado</Button> */}
                                    </div>
                                </Card.Body>
                                <Card.Footer className="text-muted">
                                    Última actualización: {formatDate(app.updatedAt || app.applicationDate)}
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default AppliedJobsPage;