// client/src/components/Common/ErrorBoundary.js
// Un guardián que captura y maneja errores en la interfaz.
import React from 'react';
/**
 * ErrorBoundary es un componente de React que captura errores JavaScript
 * en cualquier parte de su árbol de componentes hijo, registra esos errores,
 * y muestra una UI de reserva en lugar del árbol de componentes que falló.
 *
 * Utiliza los métodos de ciclo de vida getDerivedStateFromError y componentDidCatch.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    /**
     * getDerivedStateFromError() se llama durante la fase de renderizado
     * y se utiliza para renderizar una UI de reserva después de que se ha lanzado un error.
     *
     * @param {Error} error - El error que se lanzó.
     * @returns {object} Un objeto de estado para actualizar el estado del componente.
     */
    static getDerivedStateFromError(error) {
        // Actualiza el estado para que el siguiente renderizado muestre la UI de reserva.
        return { hasError: true, error: error };
    }

    /**
     * componentDidCatch() se llama durante la fase de commit
     * y se utiliza para registrar información del error.
     *
     * @param {Error} error - El error que se lanzó.
     * @param {object} errorInfo - Un objeto con un componenteStack que representa
     * qué componente lanzó el error.
     */
    componentDidCatch(error, errorInfo) {
        // También puedes registrar el error en un servicio de informes de errores
        console.error("ErrorBoundary ha capturado un error:", error, errorInfo);
        this.setState({ errorInfo: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // Renderiza la UI de reserva con clases de Bootstrap
            return (
                <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-danger-subtle text-danger p-4 rounded shadow m-4">
                    <h1 className="display-5 fw-bold mb-4">¡Algo salió mal!</h1>
                    <p className="lead text-center mb-4">
                        Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde o
                        contacta con soporte si el problema persiste.
                    </p>
                    {/* Opcionalmente, mostrar detalles del error solo en desarrollo */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-4 p-4 bg-danger-subtle border border-danger rounded-3 text-sm text-danger-emphasis w-100" style={{ maxWidth: '600px', overflow: 'auto' }}>
                            <summary className="fw-semibold cursor-pointer mb-2">Detalles del Error (solo desarrollo)</summary>
                            <pre className="text-wrap">{this.state.error.toString()}</pre>
                            <pre className="text-wrap">{this.state.errorInfo?.componentStack}</pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-danger btn-lg mt-4 shadow-sm"
                    >
                        Recargar Página
                    </button>
                </div>
            );
        }

        return this.props.children; // Renderiza los componentes hijos normalmente
    }
}

export default ErrorBoundary;