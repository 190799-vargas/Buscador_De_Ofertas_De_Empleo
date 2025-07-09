// client/src/pages/Authenticated/HomePage.js
// La página principal de búsqueda de empleos.
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { BuildingFill, CalendarFill, GeoAltFill, Heart, HeartFill, Search } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PaginationControls from "../../components/Jobs/Pagination";
import useAuth from "../../hooks/useAuth";
import api from "../../services/apiService";

const SUPPORTED_COUNTRIES_INFO = [
    { code: 'co', name: 'Colombia', flag: 'https://flagcdn.com/co.svg' },
    { code: 'es', name: 'España', flag: 'https://flagcdn.com/es.svg' },
    { code: 'mx', name: 'México', flag: 'https://flagcdn.com/mx.svg' },
    { code: 'ar', name: 'Argentina', flag: 'https://flagcdn.com/ar.svg' },
    { code: 'cl', name: 'Chile', flag: 'https://flagcdn.com/cl.svg' },
    { code: 'pe', name: 'Perú', flag: 'https://flagcdn.com/pe.svg' },
    { code: 'us', name: 'Estados Unidos', flag: 'https://flagcdn.com/us.svg' },
];

const HomePage = ({ showAlert }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [favoritedJobIds, setFavoritedJobIds] = useState(new Set());
    const [togglingFavoriteId, setTogglingFavoriteId] = useState(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/jobs', {
                params: {
                    keyword: searchTerm,
                    country: location,
                    page: currentPage,
                    limit: jobsPerPage
                }
            });

            setJobs(response.data.jobs || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalResults(response.data.totalResults || 0);

        } catch (err) {
            console.error('Error al cargar los trabajos:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || 'No se pudieron cargar los trabajos. Por favor, intenta de nuevo.';
            setError(errorMessage);
            showAlert(errorMessage, 'danger');
            setJobs([]);
            setTotalResults(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, location, currentPage, jobsPerPage, showAlert]);

    const fetchFavoriteJobIds = useCallback(async () => {
        try {
            const response = await api.get('/favorites');
            const favoriteIds = new Set((response.data.favorites || []).map(job => job.id));
            setFavoritedJobIds(favoriteIds);
        } catch (err) {
            console.error('Error al cargar IDs de favoritos:', err.response?.data || err.message);
        }
    }, []);

    useEffect(() => {
        if (searchTerm && location) {
            fetchJobs();
        } else {
            setJobs([]);
            setTotalPages(1);
            setTotalResults(0);
            setLoading(false);
            setError('Por favor, ingresa una palabra clave y al menos un país para iniciar la búsqueda.');
        }
        fetchFavoriteJobIds();
    }, [fetchJobs, fetchFavoriteJobIds, searchTerm, location, currentPage]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleToggleFavorite = async (jobId) => {
        setTogglingFavoriteId(jobId);
        try {
            if (favoritedJobIds.has(jobId)) {
                const response = await api.delete(`/favorites/${jobId}`);
                setFavoritedJobIds(prevIds => {
                    const newIds = new Set(prevIds);
                    newIds.delete(jobId);
                    return newIds;
                });
                showAlert(response.data.message || 'Empleo eliminado de favoritos.', 'success');
            } else {
                const response = await api.post('/favorites/add', { jobId });
                setFavoritedJobIds(prevIds => new Set(prevIds).add(jobId));
                showAlert(response.data.message || 'Empleo añadido a favoritos.', 'success');
            }
        } catch (err) {
            console.error('Error al alternar favorito:', err.response?.data || err.message);
            if (err.response?.status === 409) {
                showAlert(err.response.data.message || 'Este empleo ya está en tus favoritos.', 'info');
                setFavoritedJobIds(prevIds => new Set(prevIds).add(jobId));
            } else {
                showAlert(err.response?.data?.message || 'Hubo un error al actualizar tus favoritos.', 'danger');
            }
        } finally {
            setTogglingFavoriteId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
    };

    if (loading && !error && (!searchTerm && !location)) {
        return <LoadingSpinner message="Cargando empleos..." />;
    }

    return (
        <Container className="my-4">
            <h1 className="text-center mb-4">
                ¡Hola {user?.username || user?.email || 'Usuario'}! Encuentra tu próximo empleo.
            </h1>

            {/* Search Form */}
            <Form className="mb-4 p-4 border rounded shadow-sm bg-light">
                <Row className="g-3">
                    <Col md={6}>
                        <Form.Group controlId="searchTerm">
                            <Form.Label>Buscar por palabra clave</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text"><Search /></span>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: React, Desarrollador, Marketing..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="location">
                            <Form.Label>País (código ISO ej: co, es, mx, ar, cl, pe, us)</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text"><GeoAltFill /></span>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: co, es, mx (separados por coma)"
                                    value={location}
                                    onChange={handleLocationChange}
                                />
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            {/* Supported Countries Guide */}
            <Card className="mb-4 shadow-sm">
                <Card.Header as="h5" className="bg-primary text-white">
                    Códigos de País Soportados <GeoAltFill className="ms-2" />
                </Card.Header>
                <Card.Body>
                    <Row xs={2} sm={3} md={4} lg={6} className="g-3">
                        {SUPPORTED_COUNTRIES_INFO.map((c) => (
                            <Col key={c.code} className="d-flex align-items-center">
                                <img 
                                    src={c.flag} 
                                    alt={c.name} 
                                    style={{ 
                                        width: '24px', 
                                        height: '16px', 
                                        marginRight: '8px',
                                        border: '1px solid #dee2e6'
                                    }}
                                    className="flag-img"
                                />
                                <strong className="me-1 text-uppercase">{c.code}:</strong> {c.name}
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            {/* Resto del código permanece igual */}
            {error && (
                <Alert variant="danger" className="text-center mb-4">
                    {error}
                </Alert>
            )}

            {loading && searchTerm && location && (
                <div className="text-center my-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando empleos...</span>
                    </Spinner>
                    <p className="mt-2">Buscando y/o raspando empleos...</p>
                </div>
            )}

            {totalResults > 0 && (
                <div className="text-muted mb-3">
                    Mostrando {(currentPage - 1) * jobsPerPage + 1}-{Math.min(currentPage * jobsPerPage, totalResults)} de {totalResults} empleos
                </div>
            )}

            {jobs.length === 0 && !loading && searchTerm && location && !error ? (
                <Alert variant="info" className="text-center py-4">
                    No se encontraron empleos que coincidan con tus criterios de búsqueda.
                </Alert>
            ) : jobs.length === 0 && !loading && (!searchTerm || !location) && !error ? (
                <Alert variant="info" className="text-center py-4">
                    Por favor, ingresa una **palabra clave** y al menos un **código de país** (ej. "co" para Colombia, "es" para España) para buscar empleos.
                </Alert>
            ) : (
                <>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {jobs.map((job) => (
                            <Col key={job.id}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <Card.Title className="mb-0 fs-5">{job.title || 'Título desconocido'}</Card.Title>
                                            <Button
                                                variant="link"
                                                className="p-0 border-0"
                                                onClick={() => handleToggleFavorite(job.id)}
                                                disabled={togglingFavoriteId === job.id}
                                            >
                                                {togglingFavoriteId === job.id ? (
                                                    <Spinner animation="border" size="sm" />
                                                ) : favoritedJobIds.has(job.id) ? (
                                                    <HeartFill color="red" size={24} />
                                                ) : (
                                                    <Heart color="grey" size={24} />
                                                )}
                                            </Button>
                                        </div>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            <BuildingFill className="me-1" /> {job.companyName || 'Empresa desconocida'}
                                        </Card.Subtitle>
                                        <div className="mb-3">
                                            <p className="mb-1">
                                                <GeoAltFill className="me-1" />
                                                {job.location && job.location !== 'No especificada'
                                                    ? `${job.location}, ${job.country?.toUpperCase() || ''}`
                                                    : `País: ${job.country?.toUpperCase() || 'No especificado'}`
                                                }
                                            </p>
                                            <p className="mb-1">
                                                <CalendarFill className="me-1" />
                                                Publicado el: {formatDate(job.postedAt || job.creationDate)}
                                            </p>
                                        </div>
                                        <Card.Text className="text-truncate" style={{ maxHeight: '3em' }}>
                                            {job.description || 'No hay descripción disponible.'}
                                        </Card.Text>
                                        <div className="mt-auto d-grid">
                                            <Button variant="primary" as={Link} to={`/jobs/${job.id}`}>
                                                Ver Detalles
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {totalPages > 1 && (
                        <div className="mt-4">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default HomePage;