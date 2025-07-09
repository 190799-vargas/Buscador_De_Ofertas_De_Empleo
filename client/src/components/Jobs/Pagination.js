// client/src/components/Jobs/Pagination.js
// Para navegar entre las páginas de resultados de empleo.
import PropTypes from "prop-types";
import { Pagination } from "react-bootstrap";

/**
 * Componente de controles de paginación.
 * Muestra los botones de paginación para navegar entre páginas de resultados.
 * Permite al usuario cambiar de página y muestra un rango limitado de números de página.
 * @param {Object} param0 - Props del componente.
 * @param {number} param0.currentPage - Número de la página actual.
 * @param {number} param0.totalPages - Número total de páginas disponibles.
 * @param {function} param0.onPageChange - Función que se llama cuando se
 * cambia de página.
 * Esta función recibe el número de la página a la que se desea cambiar.
 * La función debe ser implementada por el componente padre que utiliza PaginationControls.
 * Esta función es requerida y debe ser pasada como prop.
 * @returns {JSX.Element} - Elemento JSX que representa los controles de paginación.
 * Muestra botones para navegar a la página anterior, siguiente y números de páginas.
 * Si hay más de 5 páginas, muestra "..." para indicar que hay más páginas disponibles.
 * La página actual se marca como activa y los botones de navegación se deshabilitan
 * si el usuario está en la primera o última página.
 */
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    // Array para almacenar los items de paginación
    let items = [];

    // Agregar el "Anterior" (Previous)
    items.push(
        <Pagination.Prev
            key="prev"
            onClick={() => onPageChange(currentPage -1)}
            disabled={currentPage === 1} // Deshabilita si es la primera página
        />
    );

    // Lógica para generar números de página
    // Muestra un rango limitado de páginas para evitar una barra de paginación muy larga
    const maxPagesToShow = 5; // Número máximo de páginas a mostrar
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, currentPage + Math.ceil(maxPagesToShow / 2) - 1);

    // Si hay más páginas al inicio que el rango mostrado, añade "..."
    if (startPage > 1) {
        items.push(<Pagination.Item key={1} onClick={() => onPageChange(1)}>{1}</Pagination.Item>);
        if (startPage > 2) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" />);
        }
    }

    // Agregar los números de página en el rango calculado
    for (let page = startPage; page<= endPage; page++) {
        items.push(
            <Pagination.Item
                key={page}
                active={page === currentPage} // Marca la página actual como activa
                onClick={() => onPageChange(page)}
            >
                {page}
            </Pagination.Item>
        );
    }

    // Si hay mas páginas al final que el rango mostrado, añade "..."
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        }
        items.push(<Pagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>{totalPages}</Pagination.Item>);
    }

    // Agregar el botón "Siguiente" (Next)
    items.push(
        <Pagination.Next
            key="next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages} // Deshabilita si es la última página
        />
    );

    return (
        // Contenedor de paginación
        <div className="d-flex justify-content-center my-4">
            <Pagination>{items}</Pagination>
        </div>
    );
};

/**
 * PropTypes para el componente PaginationControls.
 * Define los tipos y requisitos de las props que el componente espera recibir.
 * - `currentPage` es un número entero requerido que indica la página actual.
 * - `totalPages` es un número entero requerido que indica el total de páginas disponibles.
 * - `onPageChange` es una función requerida que se llama cuando se cambia de página.
 */
PaginationControls.propTypes = {
    // 'currentPage' es el número de la página actual (entero, requerido)
    currentPage: PropTypes.number.isRequired,
    // 'totalPages' es el número total de páginas disponibles (entero, requerido)
    totalPages: PropTypes.number.isRequired,
    // 'onPageChange' es una función requerida que se llama cuando se cambia de página
    onPageChange: PropTypes.func.isRequired,
};

export default PaginationControls;