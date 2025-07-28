// Script para probar el cálculo de egresos
console.log('🧮 Probando cálculo de egresos...');

// Simular datos de transacciones
const transactions = [
    {
        id: '1',
        date: new Date().toISOString(),
        amount: 500000,
        type: 'INCOME',
        status: 'APPROVED'
    },
    {
        id: '2',
        date: new Date(Date.now() - 86400000).toISOString(),
        amount: 150000,
        type: 'EXPENSE',
        status: 'APPROVED'
    },
    {
        id: '3',
        date: new Date(Date.now() - 172800000).toISOString(),
        amount: 300000,
        type: 'INCOME',
        status: 'APPROVED'
    },
    {
        id: '4',
        date: new Date(Date.now() - 259200000).toISOString(),
        amount: 80000,
        type: 'EXPENSE',
        status: 'APPROVED'
    },
    {
        id: '5',
        date: new Date(Date.now() - 345600000).toISOString(),
        amount: 120000,
        type: 'INCOME',
        status: 'APPROVED'
    }
];

// Calcular estadísticas
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

let totalIncome = 0;
let totalExpenses = 0;

transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                         transactionDate.getFullYear() === currentYear;
    
    console.log(`Transacción ${transaction.id}:`, {
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        isCurrentMonth,
        status: transaction.status
    });
    
    if (transaction.status === 'APPROVED' && isCurrentMonth) {
        if (transaction.type === 'INCOME') {
            totalIncome += transaction.amount;
        } else if (transaction.type === 'EXPENSE') {
            totalExpenses += transaction.amount;
        }
    }
});

console.log('📊 Resultados:');
console.log(`💰 Total Ingresos: $${totalIncome.toLocaleString('es-CO')}`);
console.log(`💸 Total Egresos: $${totalExpenses.toLocaleString('es-CO')}`);
console.log(`📈 Balance Neto: $${(totalIncome - totalExpenses).toLocaleString('es-CO')}`);

// Verificar si el total de egresos es $230,000
if (totalExpenses === 230000) {
    console.log('✅ ¡Correcto! Los egresos suman exactamente $230,000');
} else {
    console.log(`❌ Error: Los egresos suman $${totalExpenses.toLocaleString('es-CO')}, pero deberían ser $230,000`);
}