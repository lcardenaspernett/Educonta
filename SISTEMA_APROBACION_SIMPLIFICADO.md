# Sistema de Aprobación Simplificado

## 🎯 Reglas de Aprobación

### **Regla Principal: Monto**
- **≤ $1,000,000**: Contador Auxiliar puede aprobar
- **> $1,000,000**: Solo Rector puede aprobar

### **Regla Secundaria: Conceptos Importantes**
Independiente del monto, estos conceptos **SIEMPRE** requieren Rector:
- ✅ **Matrículas** (política institucional)
- ✅ **Excursiones** (responsabilidad institucional)  
- ✅ **Ceremonias de Grado** (eventos importantes)
- ✅ **Cursos Vacacionales** (programas especiales)

### **Conceptos que puede aprobar Contador Auxiliar:**
- ✅ Mensualidades regulares
- ✅ Rifas y eventos menores
- ✅ Uniformes y materiales
- ✅ Certificados y carnets
- ✅ Servicios de transporte regular
- ✅ Cursos de nivelación

## 📋 Estados de Transacciones

### **⏳ PENDIENTE**
- Esperando aprobación
- Muestra quién debe aprobar (Rector/Contador)
- Muestra razón (monto alto/concepto importante)

### **✅ APROBADA**
- Transacción aprobada y contabilizada
- Muestra fecha de aprobación

### **❌ RECHAZADA**
- Transacción rechazada por el aprobador
- Muestra fecha y razón del rechazo

## 🖥️ Interfaz Visual

### **En Sección de Movimientos:**
```
⏳ Pendientes de Aprobación (3)
├── Matrícula Pedro Ramírez - $1,200,000
│   Requiere: Rector | Razón: Monto superior a $1,000,000
│   [🔒 Rector] [👁️ Ver]
├── Mensualidad Laura González - $350,000  
│   Requiere: Contador Auxiliar | Razón: Monto regular
│   [✅ Aprobar] [❌ Rechazar] [👁️ Ver]
└── Excursión Transporte - $800,000
    Requiere: Rector | Razón: Concepto requiere aprobación del Rector
    [🔒 Rector] [👁️ Ver]

✅ Aprobadas (5)
├── Pago servicios públicos - $150,000
├── Mensualidad María García - $300,000
└── ...

❌ Rechazadas (0)
```

### **Filtros Disponibles:**
- **Estado**: Todos / Pendientes / Aprobadas / Rechazadas
- **Tipo**: Ingresos / Egresos
- **Fecha**: Rango de fechas

## 🔄 Flujo de Trabajo

### **1. Creación de Transacción**
```
Usuario crea transacción → Estado: PENDIENTE
```

### **2. Evaluación Automática**
```
Sistema evalúa:
├── ¿Monto > $1,000,000? → Rector
├── ¿Concepto importante? → Rector  
└── Caso contrario → Contador Auxiliar
```

### **3. Aprobación**
```
Usuario autorizado aprueba → Estado: APROBADA
└── Se contabiliza automáticamente
```

### **4. Rechazo (solo Rector)**
```
Rector rechaza → Estado: RECHAZADA
└── Se registra razón del rechazo
```

## 👥 Permisos por Rol

### **🧮 Contador Auxiliar**
- ✅ Ver todas las transacciones
- ✅ Aprobar transacciones ≤ $1,000,000 (conceptos regulares)
- ❌ No puede aprobar conceptos importantes
- ❌ No puede rechazar transacciones

### **🎓 Rector**
- ✅ Ver todas las transacciones
- ✅ Aprobar CUALQUIER transacción
- ✅ Rechazar CUALQUIER transacción
- ✅ Único que puede aprobar conceptos importantes

## 🎨 Indicadores Visuales

### **Colores por Estado:**
- **⏳ Pendiente**: Amarillo/Naranja
- **✅ Aprobada**: Verde
- **❌ Rechazada**: Rojo

### **Iconos:**
- **💰** Ingresos
- **💸** Egresos
- **🔒** Requiere aprobación superior
- **⏳** Esperando aprobación
- **✅** Aprobada
- **❌** Rechazada

### **Bordes:**
- **Borde izquierdo coloreado** según estado
- **Gradiente sutil** de fondo según estado

## 🔧 Implementación Técnica

### **Archivos Principales:**
- `approval-system.js`: Lógica simplificada de reglas
- `approval-status.js`: Interfaz visual de estados
- `approval-status.css`: Estilos para estados

### **Datos de Ejemplo:**
- 3 transacciones pendientes con diferentes casos
- 5 transacciones aprobadas
- Estados variados para demostrar funcionalidad

### **Integración:**
- Se integra automáticamente con la sección de movimientos
- Intercepta la renderización de transacciones
- Agrega filtros y acciones según permisos

---

**El sistema está diseñado para ser simple, claro y funcional, enfocándose en las necesidades reales de una institución educativa.**