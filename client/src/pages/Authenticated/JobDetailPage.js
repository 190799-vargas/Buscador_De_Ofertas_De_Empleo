// client/src/pages/Authenticated/JobDetailPage.js
// Detalles de un empleo específico.
import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, ListGroup, ListGroupItem, Row, Spinner } from "react-bootstrap";
import {
    ArrowLeftCircle,
    BriefcaseFill,
    BuildingFill,
    CalendarFill,
    CheckCircleFill,
    CodeSquare,
    CurrencyDollar,
    GeoAltFill,
    Heart,
    HeartFill,
    Link45deg,
    StopwatchFill
} from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import api from "../../services/apiService";

/**
 * Componente JobDetailPage.
 * Muestra los detalles completos de una oferta de empleo específica.
 * @param {object} { showAlert } - Función para mostrar alertas, pasada desde App.js.
 * @returns una vista JSX donde se muestran los detalles del empleo y el link para aplicar
 * y si quiere agregar a favoritos o eliminar de favoritos
 */
const JobDetailPage = ({ showAlert }) => {
    const { id } = useParams(); // Obtiene el ID del empleo de la URL (ej. /jobs/123)
    const navigate = useNavigate(); // Hook para la navegación programática
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true); // Estado de carga para la página
    const [error, setError] = useState(null);
    const [isApplied, setIsApplied] = useState(false); // Estado para rastrear si el usuario ya registró la postulación para *este trabajo específico*
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingFavorite, setTogglingFavorite] = useState(false);

    useEffect(() => {
        const fetchJobDetailsAndUserStatuses = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Obtener detalles del trabajo
                const jobResponse = await api.get(`/jobs/${id}`);
                setJob(jobResponse.data.job);

                // 2. Verificar si el usuario ya se ha postulado a este trabajo
                const applicationsResponse = await api.get('/auth/applications');
                const userApplications = applicationsResponse.data.applications || [];
                const alreadyApplied = userApplications.some(app => app.jobId === id);
                setIsApplied(alreadyApplied);

                // 3. Verifica si el usuario ha favorecido este trabajo.
                const favoritesResponse = await api.get('/favorites');
                const userFavorites = favoritesResponse.data.favorites || [];
                const alreadyFavorited = userFavorites.some(favJob => favJob.id === id);
                setIsFavorite(alreadyFavorited);

            } catch (err) {
                console.error('Error al cargar los detalles del empleo o estados de usuario:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'No se pudieron cargar los detalles del empleo o los estados de usuario.');
                showAlert(err.response?.data?.message || 'Error al cargar detalles.', 'danger');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJobDetailsAndUserStatuses();
        }
    }, [id, showAlert]);

    const handleApply = async () => {
        if (!job?.sourceUrl) {
            showAlert('No se encontró URL de origen para aplicar.', 'warning');
            return;
        }

        try {
            const response = await api.post('/auth/applications', { jobId: job.id });
            showAlert(response.data.message || 'Postulación registrada exitosamente en nuestra plataforma.', 'success');
            setIsApplied(true);

            window.open(job.sourceUrl, '_blank', 'noopener,noreferrer');

        } catch (err) {
            console.error('Error al registrar la postulación:', err.response?.data || err.message);
            if (err.response && err.response.status === 409) {
                showAlert('Ya te has postulado a este empleo.', 'warning');
                setIsApplied(true);
            } else {
                showAlert(err.response?.data?.message || 'Hubo un error al registrar tu postulación.', 'danger');
            }
        }
    };

    const handleToggleFavorite = async () => {
        if (!job?.id) {
            showAlert('ID de empleo no disponible para agregar a favoritos.', 'warning');
            return;
        }

        setTogglingFavorite(true);

        try {
            if (isFavorite) {
                // Si ya es favorito, lo eliminamos
                const response = await api.delete(`/favorites/${job.id}`);
                showAlert(response.data.message || 'Empleo eliminado de favoritos.', 'success');
                setIsFavorite(false);
            } else {
                // Si no es favorito, lo añadimos
                const response = await api.post('/favorites/add', { jobId: job.id });
                showAlert(response.data.message || 'Empleo añadido a favoritos.', 'success');
                setIsFavorite(true);
            }
        } catch (err) {
            console.error('Error al alternar favorito:', err.response?.data || err.message);
            if (err.response && err.response.status === 409) {
                showAlert(err.response.data.message || 'Este empleo ya está en tus favoritos.', 'info');
                setIsFavorite(true);
            } else if (err.response && err.response.status === 404) {
                showAlert(err.response.data.message || 'El empleo no existe para ser agregado/eliminado de favoritos.', 'danger');
            }
            else {
                showAlert(err.response?.data?.message || 'Hubo un error al actualizar tus favoritos.', 'danger');
            }
        } finally {
            setTogglingFavorite(false);
        }
    };

    /**
     * Formatea una cadena de fecha en un formato legible según la configuración regional del navegador.
     * Maneja casos edge como fechas inválidas o valores vacíos.
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'No especificada' : date.toLocaleDateString();
        } catch {
            return 'No especificada';
        }
    };

    /**
     * Componente auxiliar para renderizar información con icono en un ListGroupItem de Bootstrap.
     * Ahora muestra "No especificado" cuando el valor es null o undefined
     */
    const renderInfo = (icon, label, value) => {
        const displayValue = value === undefined || value === null || value === 'N/A' 
            ? 'No especificado' 
            : value;
            
        return (
            <ListGroupItem className="d-flex align-items-center">
                {icon} <strong className="ms-2 me-1">{label}:</strong> {displayValue}
            </ListGroupItem>
        );
    };

    if (loading) {
        return <LoadingSpinner message="Cargando detalles del empleo..." />;
    }

    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger" className="text-center">
                    {error}
                    <div className="mt-3">
                        <Button variant="outline-secondary" onClick={() => navigate('/home')}>
                            <ArrowLeftCircle className="me-2" /> Volver a la búsqueda
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    if (!job) {
        return (
            <Container className="my-5">
                <Alert variant="warning" className="text-center">
                    El empleo solicitado no fue encontrado.
                    <div className="mt-3">
                        <Button variant="outline-secondary" onClick={() => navigate('/home')}>
                            <ArrowLeftCircle className="me-2" /> Volver a la búsqueda
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeftCircle className="me-2" /> Volver
            </Button>

            <Card className="shadow-lg">
                <Card.Header as="h2" className="bg-primary text-white text-center py-3">
                    {job.title}
                </Card.Header>
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <p className="lead text-muted mb-0">
                                <BuildingFill className="me-2" />
                                <strong>Empresa:</strong> {job.companyName || 'No especificada'}
                            </p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <p className="lead text-muted mb-0">
                                <GeoAltFill className="me-2" />
                                <strong>Ubicación:</strong> {job.country?.toUpperCase() || 'No especificada'}
                            </p>
                        </Col>
                    </Row>
                    <hr />

                    <h4 className="mb-3">Detalles del Empleo</h4>
                    <ListGroup variant="flush" className="mb-4">
                        {renderInfo(<CurrencyDollar />, 'Salario', job.salary)}
                        {renderInfo(<StopwatchFill />, 'Experiencia', job.experienceRequired)}
                        {renderInfo(<BriefcaseFill />, 'Modalidad', job.modality)}
                        {renderInfo(<CalendarFill />, 'Fecha de Creación', formatDate(job.creationDate))}
                        {renderInfo(<CalendarFill />, 'Fecha Límite', formatDate(job.deadlineDate))}
                        {renderInfo(<BuildingFill />, 'Fuente', job.sourceName)}
                        {renderInfo(<CheckCircleFill />, 'Tipo de Empleo', job.employmentType)}
                        
                        <ListGroupItem>
                            <strong><CodeSquare className="me-2" /> Requisitos:</strong>
                            <p className="mt-2">{job.requirements || 'No se especificaron requisitos'}</p>
                        </ListGroupItem>
                    </ListGroup>

                    <h4 className="mb-3">Descripción</h4>
                    <p className="mb-4">
                        {job.description && job.description !== 'N/A' 
                            ? job.description 
                            : 'No hay descripción disponible para este empleo.'}
                    </p>
                    <hr />

                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Publicado el: {formatDate(job.createdAt)}</small>
                        <div className="d-flex gap-2">
                            {/* Botón de Favoritos */}
                            <Button
                                variant={isFavorite ? "danger" : "outline-danger"}
                                onClick={handleToggleFavorite}
                                disabled={togglingFavorite}
                                className="d-flex align-items-center"
                            >
                                {togglingFavorite ? (
                                    <Spinner animation="border" size="sm" className="me-2" />
                                ) : isFavorite ? (
                                    <HeartFill className="me-2" />
                                ) : (
                                    <Heart className="me-2" />
                                )}
                                {togglingFavorite ? 'Procesando...' : (isFavorite ? 'En Favoritos' : 'Añadir a Favoritos')}
                            </Button>

                            {/* Botón de Aplicar */}
                            {job.sourceUrl && (
                                <Button
                                    variant={isApplied ? "outline-secondary" : "success"}
                                    onClick={handleApply}
                                    disabled={isApplied}
                                    className="d-flex align-items-center"
                                >
                                    {isApplied ? (
                                        <>
                                            <CheckCircleFill className="me-2" /> Ya Postulado (Registrado)
                                        </>
                                    ) : (
                                        <>
                                            <Link45deg className="me-2" /> Aplicar en la fuente oficial
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default JobDetailPage;