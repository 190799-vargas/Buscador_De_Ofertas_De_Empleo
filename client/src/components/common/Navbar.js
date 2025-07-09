// client/src/components/Common/Navbar.js
// La barra de navegación (se muestra cuando el usuario está logueado).
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { BoxArrowRight, BriefcaseFill, GearFill, HeartFill, HouseFill, PencilSquare, PersonBadge, PersonCircle } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

/**
 * @description Componente Navbar.
 * Barra de navegación superior de la aplicación.
 * - Muestra diferentes enlaces y opciones según el estado de autenticación del usuario.
 *
 * @param {object} { showAlert } - Función para mostrar alertas, pasada desde App.js.
 * @returns una barra de navegacion con enlaces para usuarios autenticados y no autenticados
 */
const Navbar = ({ showAlert }) => {
    const { isAuthenticated, user, logout } = useAuth(); // Obtiene el estado y las funciones del contexto
    const navigate = useNavigate(); // Para la navegación programática

    /**
     * @description Cierre de sesion de usuario.
     * - Llama a la función de cierre de sesión del contexto.
     * - Redirige al login después de cerrar sesión.
     * - Mostrar una alerta de éxito de cierre de sesión.
     */
    const handleLogout = () => {
        logout(); // Llama a la función de cierre de sesión del contexto
        navigate('/login', { replace: true }); // Redirige al login después de cerrar sesión
        showAlert('Cierre de sesión exitoso.', 'success')
    };

    return (
        <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
            <Container>
                {/* Logo o Título de la aplicación */}
                <BootstrapNavbar.Brand as={Link} to={isAuthenticated ? "/home" : "/"}>
                    JobSeeker App
                </BootstrapNavbar.Brand>

                {/* Botón de Hamburguesa para pantallas pequeñas */}
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

                {/* Contenido Colapsable de Navbar */}
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto"> {/* 'ms-auto' empuja los elementos a la derecha */}
                        {isAuthenticated ? (
                            <>
                                {/* Enlaces para Usuarios Autenticados */}
                                <Nav.Link as={Link} to="/home">
                                    <HouseFill className="me-1" /> Inicio
                                </Nav.Link>
                                <Nav.Link as={Link} to="/applied-jobs">
                                    <BriefcaseFill className="me-1" /> Mis Postulaciones
                                </Nav.Link>
                                <Nav.Link as={Link} to="/favorites">
                                    <HeartFill className="me-1" /> Favoritos
                                </Nav.Link>

                                {/* Dropdown para Perfil y Configuración */}
                                <NavDropdown
                                    title={
                                        <>
                                            <PersonCircle className="me-1" /> {user?.username || user?.email || 'Mi Cuenta'}
                                        </>
                                    }
                                    id="basic-nav-dropdown"
                                    align="end" // Alinea el menú desplegable a la derecha
                                >
                                    <NavDropdown.Item as={Link} to="/profile">
                                        <PersonBadge className="me-1" /> Ver Perfil
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/profile/edit">
                                        <PencilSquare className="me-1" /> Editar Perfil
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/settings">
                                        <GearFill className="me-1" /> Configuración
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>
                                        <BoxArrowRight className="me-1" /> Cerrar Sesión
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                {/* Enlaces para Usuarios NO Autenticados */}
                                <Nav.Link as={Link} to="/login">
                                    Iniciar Sesión
                                </Nav.Link>
                                <Nav.Link as={Link} to="/"> {/* '/' apunta a Register.js si no está autenticado */}
                                    Registrarse
                                </Nav.Link>
                                {/* Opcional: Enlace a "Acerca de" o "Contacto" para públicos */}
                                <Nav.Link as={Link} to="/about">Acerca de</Nav.Link>
                                <Nav.Link as={Link} to="/contact">Contacto</Nav.Link>
                            </>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;