// client/src/components/Common/LoadingSpinner.js
// Un indicador visual para cuando algo está cargando.
import { Spinner } from 'react-bootstrap'; // Importa el componente Spinner de react-bootstrap

/**
 * @description Componente LoadingSpinner
 * Muestra un indicador de carga (spinner) centrado en la pantalla.
 * Utiliza el componente Spinner de React-Bootstrap para una apariencia consistente.
 *
 * @prop
 * - message: String opcional para mostrar un mensaje junto al spinner (ej: "Cargando...").
 */
function LoadingSpinner({ message }) {
    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '80vh' }} //Establece una altura mínima para centrar verticalmente en la pantalla
        >
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span> {/* Texto para accesibilidad */}
            </Spinner>
            {/* Muestra un mensaje si se proporciona */}
            {message && <p className="ms-3 h5 text-primary">{message}</p>}
        </div>
    );
}

export default LoadingSpinner;