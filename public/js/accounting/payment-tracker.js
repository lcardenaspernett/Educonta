// ===================================
// EDUCONTA - Sistema de Seguimiento de Pagos y Abonos (LEGACY)
// ===================================

/**
 * NOTA: Este archivo ha sido reemplazado por debt-management.js
 * Se mantiene por compatibilidad pero se recomienda usar DebtManagement
 */

console.log('⚠️ payment-tracker.js es legacy, usar debt-management.js en su lugar');

// Redirigir a la nueva implementación si existe
if (window.DebtManagement) {
    console.log('✅ Usando DebtManagement en lugar de PaymentTracker');
} else {
    console.log('� Car gando sistema de seguimiento básico...');

    // Implementación básica de compatibilidad
    class PaymentTracker {
        constructor() {
            console.log('💰 PaymentTracker básico inicializado');
        }

        // Métodos básicos para compatibilidad
        loadPayments() {
            return JSON.parse(localStorage.getItem('educonta-payments') || '[]');
        }

        loadDebts() {
            return JSON.parse(localStorage.getItem('educonta-debts') || '[]');
        }
    }

    window.PaymentTracker = PaymentTracker;
}