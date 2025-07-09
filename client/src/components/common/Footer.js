// client/src/components/Common/Footer.js
// El pie de página.
import { Col, Container, Row } from "react-bootstrap";
import { Envelope, Github, Globe, HeartFill, Linkedin, TelephoneFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

/**
 * @description Componente Footer.
 * El pie de página de la aplicación, visible en todas las páginas.
 * Contiene información de derechos de autor, enlaces útiles y redes sociales.
 * @returns Un footer o pie de página con el nombre de la aplicacion, descripción breve dela aplicación,
 * links para redirigir a paginas como acerca de, pagina de contacto, enlaces de perfiles sociales como
 * linkedIn, Github, portafolio, parte de derechos reservados, etc.
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-5 mt-auto" style={{ backgroundColor: '#222020' }}> {/* Color azul oscuro */}
            <Container>
                <Row className="g-4">
                    {/* Sección Sobre Nosotros */}
                    <Col lg={4} className="mb-4 mb-lg-0">
                        <div className="footer-brand">
                            <h4 className="text-white mb-3">JobSeeker App</h4> {/* Texto blanco */}
                        </div>
                        <h5 className="text-uppercase mb-3 text-white">SOBRE NOSOTROS</h5> {/* Texto blanco */}
                        <p className="text-white" style={{ fontSize: '0.9rem', opacity: 0.9 }}> {/* Texto blanco con ligera transparencia */}
                            Tu Portal de Empleos es una plataforma diseñada para conectar a profesionales
                            con las mejores oportunidades laborales en diversas industrias.
                            Encuentra tu próximo empleo ideal con nosotros.
                        </p>
                    </Col>
                    
                    {/* Sección Contacto */}
                    <Col lg={4} className="mb-4 mb-lg-0">
                        <h5 className="text-uppercase mb-3 text-white">CONTACTO</h5> {/* Texto blanco */}
                        <div className="d-flex flex-column text-white"> {/* Texto blanco */}
                            <div className="mb-3">
                                <h6 className="text-white">Victor Alfonso Vargas Díaz</h6> {/* Texto blanco */}
                                <small className="text-white" style={{ opacity: 0.8 }}>(Creador)</small> {/* Texto blanco */}
                            </div>
                            
                            <a
                                href="mailto:victor19vargas2018@gmail.com"
                                className="text-white text-decoration-none mb-2 d-flex align-items-center" /* Texto blanco */
                                aria-label="Enviar un correo electrónico"
                                style={{ opacity: 0.9 }}
                            >
                                <Envelope size={18} className="me-2"/>
                                victor19vargas2018@gmail.com
                            </a>
                            
                            <a
                                href="tel:+573233812937"
                                className="text-white text-decoration-none d-flex align-items-center" /* Texto blanco */
                                aria-label="Llamar al número de teléfono"
                                style={{ opacity: 0.9 }}
                            >
                                <TelephoneFill size={18} className="me-2"/>
                                +57 323 381 2937
                            </a>
                        </div>
                    </Col>
                    
                    {/* Sección Enlaces Rápidos y Redes */}
                    <Col lg={4}>
                        <div className="d-flex flex-column h-100">
                            <div className="mb-4">
                                <h5 className="text-uppercase mb-3 text-white">ENLACES RÁPIDOS</h5> {/* Texto blanco */}
                                <div className="d-flex flex-wrap gap-3">
                                    <Link 
                                        to="/about" 
                                        className="text-white text-decoration-none hover-text-white" /* Texto blanco */
                                        style={{ opacity: 0.9 }}
                                    >
                                        Acerca de
                                    </Link>
                                    <Link 
                                        to="/contact" 
                                        className="text-white text-decoration-none hover-text-white" /* Texto blanco */
                                        style={{ opacity: 0.9 }}
                                    >
                                        Contacto
                                    </Link>
                                    <Link 
                                        to="/" 
                                        className="text-white text-decoration-none hover-text-white" /* Texto blanco */
                                        style={{ opacity: 0.9 }}
                                    >
                                        Registrarse
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="mt-auto">
                                <h5 className="text-uppercase mb-3 text-white">SÍGUENOS</h5> {/* Texto blanco */}
                                <div className="d-flex gap-3">
                                    <a
                                        href="https://github.com/190799-vargas"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white hover-text-white" /* Texto blanco */
                                        aria-label="Perfil de GitHub"
                                        style={{ opacity: 0.9 }}
                                    >
                                        <Github size={24}/>
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/Víctor-Alfonso-Vargas-diaz-6b853a355"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white hover-text-white" /* Texto blanco */
                                        aria-label="Perfil de LinkedIn"
                                        style={{ opacity: 0.9 }}
                                    >
                                        <Linkedin size={24}/>
                                    </a>
                                    <a
                                        href="https://tu-sitio-web.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white hover-text-white" /* Texto blanco */
                                        aria-label="Sitio web personal (portafolio)"
                                        style={{ opacity: 0.9 }}
                                    >
                                        <Globe size={24}/>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                
                <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}/> {/* Línea divisora sutil */}
                
                <Row className="align-items-center">
                    <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
                        <small className="text-white" style={{ opacity: 0.8 }}> {/* Texto blanco */}
                            &copy; {currentYear} Tu Portal de Empleos. ¡Distritalol! Todos los derechos reservados.
                        </small>
                    </Col>
                    <Col md={6} className="text-center text-md-end">
                        <small className="text-white" style={{ opacity: 0.8 }}> {/* Texto blanco */}
                            Desarrollado con <HeartFill color="#ffffff" size={12} style={{ opacity: 0.8 }}/> para ayudarte a encontrar tu próximo empleo.
                        </small>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;
