// client/src/components/Common/AlertMessage.js
// Un componente reutilizable para mostrar mensajes (éxito, error, etc.).
import { useEffect, useRef } from "react";
import { Alert } from "react-bootstrap";
import { CheckCircleFill, ExclamationTriangleFill, InfoCircleFill, XCircleFill } from "react-bootstrap-icons";

/**
 * @description Componente AlertMessage.
 * Muestra un mensaje de alerta configurable (éxito, error, info, advertencia).
 * Se integra con React-Bootstrap para los estilos y con React-Bootstrap Icons para los iconos.
 *
 * @param {object} props - Las props del componente.
 * @param {string} props.message - El mensaje a mostrar.
 * @param {string} [props.type='info'] - El tipo de alerta ('success', 'danger', 'warning', 'info').
 * @param {function} [props.onClose] - Función a llamar cuando la alerta se cierra (opcional, para alertas con botón de cierre).
 * @param {number} [props.autoHideDuration=5000] - Duración en ms para ocultar la alerta automáticamente (0 para no auto-ocultar).
 * @returns La prop 'dismissible' de Alert de Bootstrap muestra el botón de cierre (X).
 * - muestra el tipo de alerta: 'success', 'danger', 'warning', 'info'
 * - Función para manejar el cierre manual
 * - Muestra el icono segun el alerta
 * - Muestra el mensaje
 */
const AlertMessage = ({ message, type = 'info', onClose, autoHideDuration = 5000}) => {
    // Usamos useRef para mantener una referencia al temporizador y poder limpiarlo
    const timerRef = useRef(null);

    // Efecto para auto-ocultar la alerta
    useEffect(() => {
        if (autoHideDuration > 0 && onClose) {
            timerRef.current = setTimeout(() => {
                onClose(); // Llama a la función onClose para cerrar la alerta
            }, autoHideDuration);
        }

        // Función de limpieza: Limpia el temporizador si el componente se desmonta o las dependencias cambian
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [autoHideDuration, onClose]); // Dependencias del efecto

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleFill className="me-2" />;
            case 'danger':
                return<XCircleFill className="me-2" />;
            case 'warning':
                return <ExclamationTriangleFill className="me-2" />
            case 'info':
            default:
                return <InfoCircleFill className="me-2" />;
        }
    };

    // La prop 'dismissible' de Alert de Bootstrap muestra el botón de cierre (X)
    return (
        <div className="alert-message-container d-flex justify-content-center w-100 position-fixed" style={{ top: '65px', zIndex: 1050 }}>
            <Alert
                variant={type} // 'success', 'danger', 'warning', 'info'
                onClose={onClose} // Función para manejar el cierre manual
                dismissible={!!onClose} // Solo es 'dismissible' si se proporciona una función onClose
                className="w-75 shadow-lg d-flex align-items-center" // Clases de Bootstrap para estilo
            >
                {getIcon()} {/* Muestra el icono */}
                <span>{message}</span> {/* Muestra el mensaje */}
            </Alert>
        </div>
    );
};

export default AlertMessage;