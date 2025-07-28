// ===================================
// EDUCONTA - Generador de PDF para Facturas
// ===================================

/**
 * Generador de PDFs para facturas usando jsPDF
 */
class InvoicePDFGenerator {
    constructor() {
        this.loadJsPDF();
    }
    
    async loadJsPDF() {
        console.log('📦 Intentando cargar jsPDF...');
        
        // Verificar si ya está cargado (diferentes formas de verificar)
        if (typeof window.jsPDF !== 'undefined' || 
            (window.jspdf && window.jspdf.jsPDF) ||
            typeof jsPDF !== 'undefined') {
            console.log('✅ jsPDF ya está disponible');
            return;
        }
        
        try {
            // Intentar cargar desde CDN principal
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            console.log('✅ jsPDF cargado desde CDN principal');
            
            // Esperar un poco para que se inicialice
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.warn('⚠️ Error cargando desde CDN principal, intentando alternativo...');
            try {
                // CDN alternativo
                await this.loadScript('https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js');
                console.log('✅ jsPDF cargado desde CDN alternativo');
                
                // Esperar un poco para que se inicialice
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error2) {
                console.error('❌ No se pudo cargar jsPDF desde ningún CDN');
                throw new Error('No se pudo cargar la librería jsPDF. Verifica tu conexión a internet.');
            }
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verificar si el script ya existe
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                console.log('✅ Script cargado:', src);
                resolve();
            };
            script.onerror = (error) => {
                console.error('❌ Error cargando script:', src, error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }
    
    /**
     * Generar PDF de factura
     */
    async generateInvoicePDF(invoiceData) {
        console.log('📄 Generando PDF de factura:', invoiceData);
        
        try {
            console.log('🔍 Estado de jsPDF:', {
                'window.jsPDF': typeof window.jsPDF,
                'window.jspdf': typeof window.jspdf,
                'global jsPDF': typeof jsPDF
            });
            
            // Verificar si jsPDF está disponible, si no, cargarlo
            if (typeof window.jsPDF === 'undefined' && 
                !window.jspdf && 
                typeof jsPDF === 'undefined') {
                console.log('📦 Cargando jsPDF...');
                await this.loadJsPDF();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Obtener jsPDF de diferentes formas posibles
            let jsPDFClass;
            if (typeof window.jsPDF !== 'undefined') {
                jsPDFClass = window.jsPDF;
            } else if (window.jspdf && window.jspdf.jsPDF) {
                jsPDFClass = window.jspdf.jsPDF;
            } else if (typeof jsPDF !== 'undefined') {
                jsPDFClass = jsPDF;
            } else if (window.jspdf) {
                jsPDFClass = window.jspdf;
            } else {
                // Intentar cargar nuevamente
                console.log('🔄 Reintentando cargar jsPDF...');
                await this.loadJsPDF();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                if (typeof window.jsPDF !== 'undefined') {
                    jsPDFClass = window.jsPDF;
                } else if (window.jspdf) {
                    jsPDFClass = window.jspdf.jsPDF || window.jspdf;
                } else {
                    throw new Error('No se pudo cargar la librería jsPDF después de reintentar');
                }
            }
            
            const doc = new jsPDFClass('p', 'mm', 'a4');
            
            console.log('📄 Creando documento PDF...');
            
            // Configurar fuente
            doc.setFont('helvetica');
            
            // Encabezado de la institución
            this.addHeader(doc, invoiceData);
            
            // Información del cliente
            this.addClientInfo(doc, invoiceData);
            
            // Detalles de la factura
            this.addInvoiceDetails(doc, invoiceData);
            
            // Totales
            this.addTotals(doc, invoiceData);
            
            // Pie de página
            this.addFooter(doc, invoiceData);
            
            // Generar nombre del archivo
            const fileName = `Factura_${invoiceData.invoiceNumber || Date.now()}.pdf`;
            
            console.log('💾 Descargando PDF:', fileName);
            
            // Descargar el PDF automáticamente
            doc.save(fileName);
            
            // También ofrecer opción de abrir en nueva ventana
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Mostrar opciones al usuario
            this.showPDFOptions(fileName, pdfUrl);
            
            console.log('✅ PDF generado exitosamente:', fileName);
            return { fileName, url: pdfUrl };
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            throw new Error('Error generando PDF: ' + error.message);
        }
    }
    
    showPDFOptions(fileName, pdfUrl) {
        // Crear modal con opciones
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h3 style="color: #2563eb; margin-bottom: 1rem;">📄 Factura Generada</h3>
                <p style="margin-bottom: 1.5rem; color: #6b7280;">
                    La factura <strong>${fileName}</strong> se ha generado exitosamente.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="window.open('${pdfUrl}', '_blank')" style="
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        👁️ Ver PDF
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        Cerrar
                    </button>
                </div>
                <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 1rem;">
                    El archivo también se descargó automáticamente a tu carpeta de Descargas
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 10000);
    }
    
    addHeader(doc, invoiceData) {
        // Fondo del encabezado
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 35, 'F');
        
        // Logo y nombre de la institución (en blanco sobre fondo azul)
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('🎓 EDUCONTA', 20, 20);
        
        doc.setFontSize(14);
        doc.text(invoiceData.institution?.name || 'INSTITUCIÓN EDUCATIVA DEMO', 20, 28);
        
        // Información de contacto de la institución
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('NIT: 900.123.456-7 | Resolución DIAN No. 18764003331 del 2024', 20, 45);
        doc.text('Dirección: Calle 123 #45-67, Bogotá D.C.', 20, 50);
        doc.text('Teléfono: (601) 234-5678 | Email: facturacion@educonta.com', 20, 55);
        doc.text('Régimen Común | Actividad Económica: 8521 - Educación Básica Primaria', 20, 60);
        
        // Recuadro de información de factura
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(1);
        doc.rect(140, 40, 50, 35);
        
        // Título FACTURA DE VENTA
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text('FACTURA DE VENTA', 145, 48);
        
        // Número de factura
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`No. ${invoiceData.invoiceNumber || 'FV-' + Date.now()}`, 145, 55);
        
        // Fecha de expedición
        const fecha = new Date(invoiceData.date || Date.now()).toLocaleDateString('es-CO');
        doc.text(`Fecha: ${fecha}`, 145, 62);
        
        // Fecha de vencimiento
        if (invoiceData.dueDate) {
            const vencimiento = new Date(invoiceData.dueDate).toLocaleDateString('es-CO');
            doc.text(`Vence: ${vencimiento}`, 145, 69);
        }
        
        // Línea separadora principal
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(2);
        doc.line(20, 80, 190, 80);
    }
    
    addInvoiceInfo(doc, invoiceData) {
        let y = 80;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('INFORMACIÓN DE LA FACTURA', 20, y);
        
        y += 10;
        doc.setFontSize(10);
        doc.text(`Concepto: ${invoiceData.concept || 'Servicios educativos'}`, 20, y);
        
        if (invoiceData.description) {
            y += 5;
            doc.text(`Descripción: ${invoiceData.description}`, 20, y);
        }
    }
    
    addClientInfo(doc, invoiceData) {
        let y = 90;
        
        // Recuadro para datos del cliente
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(20, y, 170, 35);
        
        // Título de sección
        doc.setFillColor(248, 250, 252);
        doc.rect(20, y, 170, 8, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(37, 99, 235);
        doc.text('INFORMACIÓN DEL CLIENTE / ESTUDIANTE', 25, y + 5);
        
        y += 15;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Información del estudiante en dos columnas
        if (invoiceData.student) {
            // Columna izquierda
            doc.text(`Nombre del Estudiante: ${invoiceData.student.name || 'N/A'}`, 25, y);
            doc.text(`Grado/Curso: ${invoiceData.student.grade || 'Por asignar'}`, 25, y + 6);
            doc.text(`Documento de Identidad: ${invoiceData.student.document || 'Por registrar'}`, 25, y + 12);
            
            // Columna derecha
            if (invoiceData.parent) {
                doc.text(`Acudiente Responsable: ${invoiceData.parent.name || 'Por registrar'}`, 110, y);
                doc.text(`Teléfono de Contacto: ${invoiceData.parent.phone || 'Por registrar'}`, 110, y + 6);
                doc.text(`Email: ${invoiceData.parent.email || 'Por registrar'}`, 110, y + 12);
            }
        } else {
            doc.text('Información del cliente: Por completar en el sistema', 25, y);
        }
    }
    
    addInvoiceDetails(doc, invoiceData) {
        let y = 135;
        
        // Título de sección
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235);
        doc.text('DETALLE DE SERVICIOS FACTURADOS', 20, y);
        
        y += 8;
        
        // Encabezado de la tabla con mejor diseño
        doc.setFillColor(37, 99, 235);
        doc.rect(20, y, 170, 10, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text('CÓDIGO', 25, y + 6);
        doc.text('DESCRIPCIÓN DEL SERVICIO', 45, y + 6);
        doc.text('CANT.', 120, y + 6);
        doc.text('VALOR UNIT.', 135, y + 6);
        doc.text('VALOR TOTAL', 165, y + 6);
        
        y += 15;
        
        // Detalles de la factura
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        
        const items = invoiceData.items || [
            {
                code: this.getServiceCode(invoiceData.concept),
                description: this.getServiceDescription(invoiceData.concept, invoiceData.student?.name),
                quantity: 1,
                unitPrice: invoiceData.amount || 0,
                total: invoiceData.amount || 0
            }
        ];
        
        items.forEach((item, index) => {
            // Alternar color de fondo
            if (index % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(20, y - 2, 170, 10, 'F');
            }
            
            doc.text(item.code || 'SRV001', 25, y + 3);
            doc.text(item.description, 45, y + 3);
            doc.text(item.quantity.toString(), 125, y + 3);
            doc.text(this.formatCurrency(item.unitPrice), 140, y + 3);
            doc.text(this.formatCurrency(item.total), 170, y + 3);
            
            y += 10;
        });
        
        // Línea separadora
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(1);
        doc.line(20, y + 5, 190, y + 5);
    }
    
    getServiceCode(concept) {
        const codes = {
            'matricula': 'MAT001',
            'mensualidad': 'MEN001', 
            'evento': 'EVE001'
        };
        return codes[concept] || 'SRV001';
    }
    
    getServiceDescription(concept, studentName) {
        const descriptions = {
            'matricula': `Matrícula Académica - ${studentName || 'Estudiante'}`,
            'mensualidad': `Pensión Mensual - ${studentName || 'Estudiante'}`,
            'evento': `Evento Especial - ${studentName || 'Estudiante'}`
        };
        return descriptions[concept] || `Servicio Educativo - ${studentName || 'Estudiante'}`;
    }
    
    addTotals(doc, invoiceData) {
        let y = 200;
        
        const subtotal = invoiceData.subtotal || invoiceData.amount || 0;
        const tax = invoiceData.tax || 0;
        const total = invoiceData.total || subtotal + tax;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Subtotal
        doc.text('Subtotal:', 140, y);
        doc.text(this.formatCurrency(subtotal), 175, y);
        
        // IVA (si aplica)
        if (tax > 0) {
            y += 8;
            doc.text('IVA (19%):', 140, y);
            doc.text(this.formatCurrency(tax), 175, y);
        }
        
        // Total
        y += 12;
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235);
        doc.text('TOTAL A PAGAR:', 140, y);
        doc.text(this.formatCurrency(total), 175, y);
        
        // Total en letras
        y += 10;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const totalEnLetras = this.numberToWords(total);
        doc.text(`Son: ${totalEnLetras} pesos colombianos`, 20, y);
    }
    
    addFooter(doc, invoiceData) {
        const y = 250;
        
        // Información de pago
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('INFORMACIÓN DE PAGO', 20, y);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('• Efectivo en caja de la institución', 20, y + 8);
        doc.text('• Transferencia bancaria: Cuenta 123-456-789', 20, y + 14);
        doc.text('• Consignación Banco XYZ', 20, y + 20);
        
        // Nota legal
        doc.setFontSize(8);
        doc.text('Esta factura es válida como soporte contable según la normatividad vigente.', 20, y + 30);
        
        // Línea final
        doc.setDrawColor(37, 99, 235);
        doc.line(20, y + 35, 190, y + 35);
        
        // Pie de página
        doc.setTextColor(150, 150, 150);
        doc.text('Generado por EDUCONTA - Sistema de Gestión Educativa', 20, y + 42);
        doc.text(`Fecha de generación: ${new Date().toLocaleString('es-CO')}`, 20, y + 47);
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }
    
    numberToWords(num) {
        // Implementación básica para convertir números a letras
        if (num === 0) return 'cero';
        
        const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
        
        if (num < 10) return unidades[num];
        if (num < 100) {
            if (num < 20) {
                const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
                return especiales[num - 10];
            }
            const dec = Math.floor(num / 10);
            const uni = num % 10;
            return decenas[dec] + (uni > 0 ? ' y ' + unidades[uni] : '');
        }
        
        // Para números más grandes, usar una aproximación
        if (num >= 1000000) {
            return Math.floor(num / 1000000) + ' millones';
        }
        if (num >= 1000) {
            return Math.floor(num / 1000) + ' mil';
        }
        
        return num.toString();
    }
}

// Crear instancia global
window.invoicePDFGenerator = new InvoicePDFGenerator();

// Exportar para uso en módulos
window.InvoicePDFGenerator = InvoicePDFGenerator;