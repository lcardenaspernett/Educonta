# 📍 Dónde Aparecen las Facturas Pendientes

## 🎯 Ubicación Exacta en el Dashboard

### **1. Nueva Tarjeta en Dashboard Principal**

Las facturas aparecen en una **nueva tarjeta** que se agrega automáticamente al dashboard:

```
Dashboard Principal
├── Tarjeta "Ingresos del Mes"
├── Tarjeta "Egresos del Mes" 
├── Tarjeta "Balance Neto"
├── Tarjeta "Transacciones Pendientes"
└── 🆕 Tarjeta "📋 Facturas Pendientes de Aprobación" ← AQUÍ APARECEN
```

### **2. Contenido de la Tarjeta**

```
📋 Facturas Pendientes de Aprobación
┌─────────────────────────────────────────┐
│ Requieren mi aprobación: 3              │
│ Total pendientes: 5                     │
├─────────────────────────────────────────┤
│ 🚨 Ana María - Matrícula $800.000       │
│ ⚡ Carlos López - Mensualidad $350.000   │
│ 📋 María José - Rifa $75.000            │
├─────────────────────────────────────────┤
│ [Ver Todas (5)] [Aprobar Facturas (3)] │
└─────────────────────────────────────────┘
```

## 🔄 Proceso de Aparición

### **Paso 1: Carga del Dashboard (0-2 segundos)**
- Se cargan los scripts básicos
- Se inicializa el dashboard principal

### **Paso 2: Inicialización del Sistema (2-3 segundos)**
```javascript
// En pending-invoices.js línea 15-20
setTimeout(() => {
    this.createPendingInvoicesCard();  // ← Crea la tarjeta
    this.updateDashboardStats();
}, 2000);
```

### **Paso 3: Generación de Datos (3 segundos)**
```javascript
// Se ejecuta generateSampleInvoices() que crea:
const sampleInvoices = [
    {
        studentName: 'Ana María González Pérez',
        concept: 'Matrícula 2024',
        amount: 800000,
        // ... más datos
    },
    // ... 4 facturas más
];
```

### **Paso 4: Renderizado Visual (3-4 segundos)**
- La tarjeta aparece en el dashboard
- Se muestran las facturas más urgentes
- Se calculan los contadores según el rol

## 🎭 Cambios Según el Rol

### **Como Contador Auxiliar:**
```
Requieren mi aprobación: 3
├── ✅ Carlos López - Mensualidad $350.000
├── ✅ María José - Rifa $75.000  
└── ✅ Sofía Torres - Uniforme $120.000

NO puedo aprobar: 2
├── 🔒 Ana María - Matrícula $800.000 (Solo Rector)
└── 🔒 Diego Martínez - Excursión $450.000 (Solo Rector)
```

### **Como Rector:**
```
Requieren mi aprobación: 5 (TODAS)
├── ✅ Ana María - Matrícula $800.000
├── ✅ Carlos López - Mensualidad $350.000
├── ✅ María José - Rifa $75.000
├── ✅ Diego Martínez - Excursión $450.000
└── ✅ Sofía Torres - Uniforme $120.000
```

## 🖱️ Interacciones Disponibles

### **Desde la Tarjeta Principal:**
1. **✅ Botón de aprobación rápida** - Aparece solo si puedes aprobar
2. **👁️ Ver detalles** - Muestra información completa
3. **"Ver Todas"** - Abre modal con lista completa
4. **"Aprobar Facturas"** - Abre interfaz de aprobación masiva

### **Modal Completo (clic en "Ver Todas"):**
```
📋 Gestión de Facturas Pendientes
┌─────────────────────────────────────────────────────┐
│ Filtros: [Concepto ▼] [Estado ▼] [Limpiar] [Aprobar]│
├─────────────────────────────────────────────────────┤
│ 📄 Ana María González - Matrícula $800.000          │
│    10°A • Creada hace 2 días • Vence en 5 días     │
│    🔒 Requiere: Rector                              │
│    [👁️ Ver] [✏️ Editar] [❌ Rechazar]               │
├─────────────────────────────────────────────────────┤
│ 📄 Carlos López - Mensualidad $350.000             │
│    8°B • Vencida ayer • URGENTE                    │
│    ✅ Puedes aprobar                                │
│    [✅ Aprobar] [👁️ Ver] [✏️ Editar]                │
└─────────────────────────────────────────────────────┘
```

## 🔍 Cómo Verificar que Funciona

### **1. Abrir Consola del Navegador**
```javascript
// Verificar que el manager existe
window.pendingInvoicesManager

// Ver facturas cargadas
window.pendingInvoicesManager.pendingInvoices

// Verificar tarjeta en DOM
document.querySelector('.pending-invoices-card')
```

### **2. Usar Script de Verificación**
```javascript
// Ejecutar en consola después de cargar la página
window.verificarFacturas()
```

### **3. Indicadores Visuales**
- ✅ **Tarjeta aparece** en dashboard después de 3-4 segundos
- ✅ **Contadores actualizados** según tu rol
- ✅ **Botones habilitados/deshabilitados** según permisos
- ✅ **Iconos de prioridad** (🚨 urgente, ⚡ alta, 📋 normal)

## 🚨 Si No Aparecen las Facturas

### **Posibles Causas:**
1. **Scripts no cargados** - Verificar que todos los .js estén incluidos
2. **Timing incorrecto** - Esperar al menos 4-5 segundos
3. **Error en consola** - Revisar errores JavaScript
4. **Dashboard grid no encontrado** - Verificar estructura HTML

### **Solución Rápida:**
```javascript
// Forzar creación manual en consola
if (window.pendingInvoicesManager) {
    window.pendingInvoicesManager.createPendingInvoicesCard();
}
```

## 📱 Responsive

La tarjeta se adapta a diferentes tamaños de pantalla:
- **Desktop**: Tarjeta completa con todos los detalles
- **Tablet**: Información condensada
- **Mobile**: Lista vertical optimizada

---

**¡Las facturas deberían aparecer automáticamente después de 3-4 segundos de cargar el dashboard!** 🚀