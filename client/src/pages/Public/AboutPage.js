// client/src/pages/Public/AboutPage.js
// Información sobre tu aplicación.
import { Card, Col, Container, Row } from "react-bootstrap";
import { BriefcaseFill, InfoCircleFill, LightbulbFill, PeopleFill } from "react-bootstrap-icons";


/**
 * Componente AboutPage:
 * Página "Acerca de nosotros" que proporciona información sobre la aplicación,
 * su misión, visión, el equipo detrás de ella, o cualquier otro detalle relevante.
 * Diseñada para ser informativa y visualmente coherente con el resto de la aplicación.
 */
const AboutPage = () => {
    return (
        <div className="d-flex flex-column min-vh-100 bg-light font-inter">

            <main className="flex-grow-1 py-5">
                <Container className="my-5">
                    <Row className="justify-content-center mb-5">
                        <Col md={10} lg={8} className="text-center">
                            <InfoCircleFill className="text-primary mb-4" style={{ fontSize: '4rem' }} />
                            <h1 className="display-4 fw-bold text-dark mb-3">Acerca de Nosotros</h1>
                            <p className="lead text-muted">
                                Somos un joven dedicado a crear soluciones innovadoras que facilitan la vida de nuestros usuarios.
                                Nuestro compromiso es ofrecer productos de alta calidad y un servicio excepcional.
                            </p>
                        </Col>
                    </Row>

                    <Row className="justify-content-center g-4">
                        {/* Sección de Nuestra Misión */}
                        <Col md={6} lg={4}>
                            <Card className="h-100 p-4 shadow-sm border-0 rounded-4 text-center">
                                <Card.Body>
                                    <LightbulbFill className="text-success mb-3" style={{ fontSize: '3rem' }} />
                                    <Card.Title className="h4 fw-bold text-dark">Nuestra Misión</Card.Title>
                                    <Card.Text className="text-muted">
                                        Nuestra misión es empoderar a individuos y empresas a través de tecnología intuitiva
                                        y eficiente, optimizando sus procesos diarios y fomentando la creatividad.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sección de Nuestro Equipo */}
                        <Col md={6} lg={4}>
                            <Card className="h-100 p-4 shadow-sm border-0 rounded-4 text-center">
                                <Card.Body>
                                    <PeopleFill className="text-info mb-3" style={{ fontSize: '3rem' }} />
                                    <Card.Title className="h4 fw-bold text-dark">Nuestro Equipo</Card.Title>
                                    <Card.Text className="text-muted">
                                        Soy un profesional apasionado
                                        y dedicado, con años de experiencia en desarrollo, diseño y estrategia.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sección de Nuestros Valores */}
                        <Col md={6} lg={4}>
                            <Card className="h-100 p-4 shadow-sm border-0 rounded-4 text-center">
                                <Card.Body>
                                    <BriefcaseFill className="text-warning mb-3" style={{ fontSize: '3rem' }} />
                                    <Card.Title className="h4 fw-bold text-dark">Nuestros Valores</Card.Title>
                                    <Card.Text className="text-muted">
                                        Nos regimos por la innovación, la integridad, la excelencia y la colaboración.
                                        Creemos en construir relaciones duraderas basadas en la confianza.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Puedes añadir más secciones aquí, como "Nuestra Historia", "Testimonios", etc. */}
                    <Row className="justify-content-center mt-5">
                        <Col md={10} lg={8} className="text-center">
                            <h3 className="h4 fw-bold text-dark mb-3">¿Tienes preguntas?</h3>
                            <p className="text-muted">
                                No dudes en contactarme si deseas saber más sobre nuestro trabajo.
                            </p>
                            {/* Puedes añadir un botón o enlace a tu página de contacto si tienes una */}
                            {/* <Link to="/contact" className="btn btn-outline-primary rounded-pill fw-bold">Contáctanos</Link> */}
                        </Col>
                    </Row>
                </Container>
            </main>

        </div>
    );
};

export default AboutPage;