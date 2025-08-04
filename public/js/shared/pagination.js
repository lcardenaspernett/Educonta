// ===================================
// EDUCONTA - Sistema de Paginación Mejorado
// ===================================

/**
 * Clase para manejar paginación de manera consistente
 */
class PaginationManager {
    constructor(options = {}) {
        this.itemsPerPage = options.itemsPerPage || 5;
        this.currentPage = 1;
        this.totalItems = 0;
        this.containerId = options.containerId || 'pagination';
        this.onPageChange = options.onPageChange || (() => {});
        this.showPageNumbers = options.showPageNumbers !== false; // Por defecto true
        this.maxVisiblePages = options.maxVisiblePages || 5;
        
        // Inyectar estilos CSS
        injectPaginationStyles();
    }

    /**
     * Actualizar el total de elementos y recalcular páginas
     */
    updateTotal(totalItems) {
        this.totalItems = totalItems;
        const totalPages = this.getTotalPages();
        
        // Ajustar página actual si es necesario
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        } else if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        
        this.render();
    }

    /**
     * Obtener número total de páginas
     */
    getTotalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    /**
     * Ir a una página específica
     */
    goToPage(page) {
        const totalPages = this.getTotalPages();
        
        if (page < 1 || page > totalPages) {
            return;
        }
        
        this.currentPage = page;
        this.render();
        this.onPageChange(page);
    }

    /**
     * Ir a la página anterior
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    /**
     * Ir a la página siguiente
     */
    nextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }

    /**
     * Obtener elementos para la página actual
     */
    getPageItems(items) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return items.slice(startIndex, endIndex);
    }

    /**
     * Renderizar la paginación
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const totalPages = this.getTotalPages();
        
        // Si no hay elementos o solo una página, ocultar paginación
        if (totalPages <= 1) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        
        let html = '<div class="pagination-wrapper">';
        
        // Información de elementos
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        
        html += `
            <div class="pagination-info">
                <span>Mostrando ${startItem}-${endItem} de ${this.totalItems} elementos</span>
            </div>
        `;
        
        html += '<div class="pagination-controls">';
        
        // Botón anterior
        html += `
            <button class="pagination-btn prev-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="window.paginationInstance_${this.containerId}.previousPage()"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <svg width="16" height="16" fill="currentColor">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
                Anterior
            </button>
        `;
        
        // Números de página (solo si está habilitado)
        if (this.showPageNumbers) {
            const pageNumbers = this.getVisiblePageNumbers(totalPages);
            
            pageNumbers.forEach(pageNum => {
                if (pageNum === '...') {
                    html += '<span class="pagination-ellipsis">...</span>';
                } else {
                    html += `
                        <button class="pagination-btn page-btn ${pageNum === this.currentPage ? 'active' : ''}" 
                                onclick="window.paginationInstance_${this.containerId}.goToPage(${pageNum})">
                            ${pageNum}
                        </button>
                    `;
                }
            });
        }
        
        // Botón siguiente
        html += `
            <button class="pagination-btn next-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="window.paginationInstance_${this.containerId}.nextPage()"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Siguiente
                <svg width="16" height="16" fill="currentColor">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </button>
        `;
        
        html += '</div></div>';
        
        container.innerHTML = html;
        
        // Registrar instancia globalmente para los onclick
        window[`paginationInstance_${this.containerId}`] = this;
    }

    /**
     * Obtener números de página visibles con elipsis
     */
    getVisiblePageNumbers(totalPages) {
        const pages = [];
        const current = this.currentPage;
        const maxVisible = this.maxVisiblePages;
        
        if (totalPages <= maxVisible) {
            // Mostrar todas las páginas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar páginas con elipsis
            if (current <= 3) {
                // Mostrar primeras páginas
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (current >= totalPages - 2) {
                // Mostrar últimas páginas
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Mostrar páginas del medio
                pages.push(1);
                pages.push('...');
                for (let i = current - 1; i <= current + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    }

    /**
     * Obtener información de la página actual
     */
    getPageInfo() {
        return {
            currentPage: this.currentPage,
            totalPages: this.getTotalPages(),
            itemsPerPage: this.itemsPerPage,
            totalItems: this.totalItems,
            startIndex: (this.currentPage - 1) * this.itemsPerPage,
            endIndex: Math.min(this.currentPage * this.itemsPerPage, this.totalItems)
        };
    }
}

// Inyectar estilos CSS para la paginación
function injectPaginationStyles() {
    if (document.getElementById('pagination-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pagination-styles';
    style.textContent = `
        .pagination-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: var(--card-bg);
            border-top: 1px solid var(--border);
            border-radius: 0 0 var(--radius-lg) var(--radius-lg);
            gap: 1rem;
        }

        .pagination-info {
            font-size: 0.875rem;
            color: var(--text-secondary);
            font-weight: 500;
        }

        .pagination-controls {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .pagination-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            padding: 0.5rem 1rem;
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            background: var(--card-bg);
            color: var(--text-primary);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            min-width: 40px;
            height: 40px;
            text-decoration: none;
        }

        .pagination-btn:hover:not(.disabled) {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .pagination-btn.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            font-weight: 600;
        }

        .pagination-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: var(--bg-secondary);
            color: var(--text-light);
        }

        .pagination-btn.prev-btn,
        .pagination-btn.next-btn {
            padding: 0.5rem 1.5rem;
            font-weight: 600;
        }

        .pagination-ellipsis {
            padding: 0.5rem;
            color: var(--text-secondary);
            font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .pagination-wrapper {
                flex-direction: column;
                gap: 1rem;
            }
            
            .pagination-info {
                order: 2;
            }
            
            .pagination-controls {
                order: 1;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .pagination-btn {
                min-width: 36px;
                height: 36px;
                padding: 0.25rem 0.5rem;
            }
        }

        /* Tema oscuro */
        [data-theme="dark"] .pagination-wrapper {
            background: var(--card-bg);
            border-color: var(--border);
        }

        [data-theme="dark"] .pagination-btn {
            background: var(--bg-tertiary);
            border-color: var(--border);
            color: var(--text-primary);
        }

        [data-theme="dark"] .pagination-btn:hover:not(.disabled) {
            background: var(--primary);
            border-color: var(--primary);
        }

        [data-theme="dark"] .pagination-btn.disabled {
            background: var(--bg-secondary);
            color: var(--text-light);
        }
    `;
    
    document.head.appendChild(style);
}

// Exportar para uso global
window.PaginationManager = PaginationManager;