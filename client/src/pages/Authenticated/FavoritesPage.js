// client/src/pages/Authenticated/FavoritesPage.js
// Lista de empleos favoritos.
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import {
    ArrowLeftCircle,
    BuildingFill,
    CalendarFill,
    GeoAltFill,
    HeartFill
} from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import api from "../../services/apiService";

/**
 * @description Componente FavoritesPage.
 * Muestra la lista de empleos que el usuario ha marcado como favoritos.
 * @param {object} { showAlert } - Función para mostrar alertas, pasada desde App.js.
 * @returns
 * - Se muestra un LoadingSpinner mientras los datos se están cargando.
 * - Se muestra una Alert de peligro si ocurre un error.
 * - Si favoriteJobs.length es 0 después de la carga, se muestra una Alert informativa amigable, sugiriendo al usuario que explore la página de inicio.
 * - Muestra la lista de favoritos de un usuario
 * - Un botón "Ver Detalles" que enlaza a la JobDetailPage (/jobs/:jobId).
 * - Un botón "Eliminar de Favoritos" que llama a handleRemoveFavorite. Este botón muestra un spinner mientras se elimina.
 */
const FavoritesPage = ({ showAlert }) => {
    const navigate = useNavigate();
    const [favoriteJobs, setFavoriteJobs] = useState([]);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    const [removingJobId, setRemovingJobId] = useState(null);

    const fetchFavoriteJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/favorites');
            // Acceder a response.data.favorites
            setFavoriteJobs(response.data.favorites || []);

            if (response.data.favorites && response.data.favorites.length === 0) {
                showAlert('Aún no tienes empleos marcados como favoritos.', 'info');
            }
        } catch (err) {
            console.error('Error al cargar favoritos:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'No se pudieron cargar tus empleos favoritos.');
            showAlert(err.response?.data?.message || 'Error al cargar favoritos.', 'danger');
        } finally {
            setLoading(false);
        }
    }, [showAlert]); // Dependencia para useCallback

    useEffect(() => {
        fetchFavoriteJobs();
    }, [fetchFavoriteJobs]); // Ejecutar al montar el componente

    const handleRemoveFavorite = async (jobId) => {
        setRemovingJobId(jobId);
        try {
            const response = await api.delete(`/favorites/${jobId}`);
            setFavoriteJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
            showAlert(response.data.message || 'Empleo eliminado de favoritos.', 'success'); // Usa el mensaje del backend
            if (favoriteJobs.length === 1) { // Si era el último, muestra el mensaje de no favoritos
                showAlert('Aún no tienes empleos marcados como favoritos.', 'info');
            }
        } catch (err) {
            console.error('Error al eliminar de favoritos:', err.response?.data || err.message);
            showAlert(err.response?.data?.message || 'Error al eliminar el empleo de favoritos.', 'danger');
        } finally {
            setRemovingJobId(null);
        }
    };

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

    if (loading) {
        return <LoadingSpinner message="Cargando tus empleos favoritos..." />;
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
            <h1 className="text-center mb-4">Mis Empleos Favoritos</h1>
            <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeftCircle className="me-2" /> Volver
            </Button>

            {favoriteJobs.length === 0 ? (
                <Alert variant="info" className="text-center py-4">
                    <p className="lead mb-3">Aún no tienes empleos marcados como favoritos.</p>
                    <p>¡Explora nuestra <Link to="/home">página de inicio</Link> para encontrar nuevas oportunidades!</p>
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {favoriteJobs.map((job) => (
                        <Col key={job.id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="mb-2">{job.title || 'Título desconocido'}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        <BuildingFill className="me-1" /> {job.companyName || 'Empresa desconocida'}
                                    </Card.Subtitle>
                                    <div className="mb-3">
                                        <p className="mb-1"><GeoAltFill className="me-1" /> {job.location && job.location !== 'No especificada' ? `${job.location}, ${job.country?.toUpperCase() || ''}` : `País: ${job.country?.toUpperCase() || 'No especificado'}`}</p>
                                        <p className="mb-1"><CalendarFill className="me-1" /> Publicado el: {formatDate(job.postedAt || job.creationDate)}</p>
                                    </div>
                                    <div className="mt-auto d-grid gap-2">
                                        <Button variant="primary" as={Link} to={`/jobs/${job.id}`}>
                                            Ver Detalles
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => handleRemoveFavorite(job.id)}
                                            disabled={removingJobId === job.id}
                                            className="d-flex align-items-center justify-content-center"
                                        >
                                            {removingJobId === job.id ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Eliminando...
                                                </>
                                            ) : (
                                                <>
                                                    <HeartFill className="me-2" /> Eliminar de Favoritos
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default FavoritesPage;
