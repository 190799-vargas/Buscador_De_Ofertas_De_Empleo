// client/src/pages/Public/NotFoundPage.js
// ¡La página 404! Se muestra si una URL no existe.
import { Button, Col, Container, Row } from "react-bootstrap";
import { HouseDoorFill, QuestionCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";


/**
 * Componente NotFoundPage:
 * Esta página se muestra cuando el usuario intenta acceder a una ruta que no existe (error 404).
 * Proporciona un mensaje claro y una opción para volver a la página de inicio.
 */
const NotFoundPage = () => {
    return (
        <div className="d-flex flex-column min-vh-100 bg-light font-inter">

            <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <Container className="text-center">
                    <Row>
                        <Col>
                            <QuestionCircleFill className="text-primary mb-4" style={{ fontSize: '6rem' }} />
                            <h1 className="display-1 fw-bold text-dark">404</h1>
                            <h2 className="mb-3 text-secondary">¡Página no encontrada!</h2>
                            <p className="lead mb-4 text-muted">
                                Lo sentimos, la página que buscas no existe o se ha movido.
                            </p>
                            <Link to="/" className="text-decoration-none">
                                <Button variant="primary" size="lg" className="rounded-pill fw-bold">
                                    <HouseDoorFill className="me-2" /> Volver al Inicio
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </main>

        </div>
    );
};

export default NotFoundPage;