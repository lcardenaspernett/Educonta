# Guía del Sistema de Aprobaciones de Facturas

## 🎯 Resumen del Sistema Implementado

Hemos implementado un sistema completo de aprobaciones de facturas basado en **roles** y **conceptos**, que distingue claramente entre:

- **Facturas Pendientes**: Documentos reales que requieren aprobación
- **Transacciones Pendientes**: Movimientos contables esperando procesamiento

## 👥 Roles y Capacidades

### 🧮 Contador Auxiliar
**Puede aprobar:**
- ✅ Mensualidades hasta $500.000 (montos estándar)
- ✅ Rifas hasta $100.000
- ✅ Uniformes hasta $200.000
- ✅ Carnets hasta $20.000 (auto-aprobación)
- ✅ Certificados hasta $50.000 (auto-aprobación)
- ✅ Transporte hasta $150.000

**NO puede aprobar:**
- ❌ Matrículas (solo Rector)
- ❌ Excursiones (solo Rector)
- ❌ Ceremonias de grado (solo Rector)
- ❌ Montos superiores a $1.000.000
- ❌ Mensualidades con descuentos especiales

### 🎓 Rector
**Puede aprobar:**
- ✅ **TODAS** las facturas sin excepción
- ✅ Matrículas (exclusivo del rector)
- ✅ Excursiones pedagógicas (exclusivo)
- ✅ Ceremonias de grado (exclusivo)
- ✅ Cursos vacacionales (exclusivo)
- ✅ Mensualidades con descuentos
- ✅ Cualquier monto sin límite
- ✅ Rechazar cualquier factura

### 👑 Super Administrador
- ✅ Todas las capacidades del Rector
- ✅ Gestión multi-institución
- ✅ Configuración de reglas de aprobación

## 📋 Conceptos y Reglas de Aprobación

### 🎒 Matrículas
- **Aprobador**: Solo RECTOR
- **Razón**: Define el ingreso principal de la institución
- **Auto-aprobación**: NO
- **Límite**: Sin límite

### 📚 Mensualidades
- **Aprobador**: Contador Auxiliar o Rector
- **Auto-aprobación**: SÍ (hasta $500k, montos estándar, sin descuentos)
- **Límite**: $500.000 para contador auxiliar
- **Especial**: Con descuentos requiere Rector

### 🎲 Rifas
- **Aprobador**: Contador Auxiliar (hasta $100k) o Rector
- **Razón**: Requieren validación legal
- **Auto-aprobación**: NO
- **Límite**: $100.000 para contador auxiliar

### 🚌 Excursiones
- **Aprobador**: Solo RECTOR
- **Razón**: Involucran responsabilidad institucional
- **Auto-aprobación**: NO

### 🎓 Ceremonias de Grado
- **Aprobador**: Solo RECTOR
- **Razón**: Eventos institucionales importantes
- **Auto-aprobación**: NO

### 👕 Uniformes
- **Aprobador**: Contador Auxiliar
- **Razón**: Actividad comercial regular
- **Auto-aprobación**: SÍ (hasta $200k)

### 📄 Certificados
- **Aprobador**: Contador Auxiliar
- **Razón**: Servicios administrativos rutinarios
- **Auto-aprobación**: SÍ (hasta $50k)
- **Requiere aprobación**: NO

### 🆔 Carnets
- **Aprobador**: Contador Auxiliar
- **Auto-aprobación**: SÍ (hasta $20k)
- **Requiere aprobación**: NO

## 🚨 Sistema de Prioridades

### 🔴 Urgente
- Facturas vencidas
- Matrículas cerca del inicio de clases
- Facturas marcadas como "urgent"

### 🟡 Alta Prioridad
- Excursiones próximas
- Facturas marcadas como "high"
- Montos superiores a $500.000

### 🟢 Normal
- Mensualidades regulares
- Servicios administrativos
- Facturas sin fecha límite crítica

## 🎮 Cómo Usar el Sistema (Demo)

### 1. Cambiar Rol
- En el dashboard, usa el selector de rol en la esquina superior derecha
- Cambia entre "Contador Auxiliar", "Rector" y "Super Admin"
- Observa cómo cambian las capacidades de aprobación

### 2. Ver Facturas Pendientes
- En el dashboard principal, revisa la tarjeta "Facturas Pendientes de Aprobación"
- Muestra cuántas facturas puedes aprobar con tu rol actual
- Indica facturas urgentes con iconos especiales

### 3. Aprobar Facturas
- **Aprobación rápida**: Clic en ✅ desde el dashboard
- **Gestión completa**: Clic en "Aprobar Facturas" para ver todas
- **Aprobación masiva**: "Aprobar todas las mías" para facturas que puedes aprobar

### 4. Entender las Reglas
- Cada factura muestra si puedes aprobarla
- Se explica la razón si no puedes aprobar
- Se indica qué rol se requiere para la aprobación

## 🔄 Flujo de Aprobación

```
1. CREACIÓN
   └── Factura creada → Estado: PENDING

2. EVALUACIÓN
   └── Sistema evalúa concepto y monto
   └── Determina aprobador requerido

3. AUTO-APROBACIÓN (si aplica)
   └── Certificados, carnets → APPROVED automáticamente
   └── Mensualidades estándar → APPROVED automáticamente

4. APROBACIÓN MANUAL
   └── Usuario con rol adecuado aprueba
   └── Estado: APPROVED
   └── Se crea transacción contable automáticamente

5. CONTABILIZACIÓN
   └── Transacción registrada en cuentas correspondientes
   └── Actualización de estadísticas
```

## 💰 Creación Automática de Transacciones

Cuando se aprueba una factura, el sistema automáticamente:

1. **Crea transacción contable** con las cuentas correctas
2. **Actualiza estadísticas** del dashboard
3. **Registra auditoría** de la aprobación
4. **Notifica** al usuario del éxito

### Mapeo de Cuentas por Concepto:
- **Matrícula/Mensualidad**: Caja → Ingresos Servicios Educativos
- **Rifa/Uniforme/Certificado**: Caja → Otros Ingresos Operacionales
- **Otros conceptos**: Caja → Otros Ingresos Operacionales

## 🎯 Beneficios del Sistema

### Para Rectores:
- ✅ Control total sobre ingresos institucionales
- ✅ Aprobación obligatoria de conceptos críticos
- ✅ Visibilidad completa de facturas pendientes
- ✅ Capacidad de rechazar facturas problemáticas

### Para Contadores:
- ✅ Agilidad en aprobaciones rutinarias
- ✅ Auto-aprobación de servicios estándar
- ✅ Límites claros de autorización
- ✅ Creación automática de transacciones contables

### Para la Institución:
- ✅ Trazabilidad completa de aprobaciones
- ✅ Separación clara de responsabilidades
- ✅ Reducción de errores manuales
- ✅ Cumplimiento de políticas institucionales

## 🔧 Configuración Técnica

### Archivos Implementados:
- `approval-system.js`: Lógica de reglas de aprobación
- `pending-invoices.js`: Gestión de facturas pendientes
- `role-config.js`: Configurador de roles para demo

### Datos de Ejemplo:
- 5 facturas pendientes con diferentes conceptos
- Diferentes niveles de urgencia
- Montos variados para probar límites
- Estudiantes de diferentes grados

## 🚀 Próximos Pasos

1. **Integración con Base de Datos**: Conectar con Prisma para persistencia real
2. **Notificaciones**: Sistema de alertas por email/SMS
3. **Reportes**: Informes de aprobaciones por período
4. **Configuración Dinámica**: Permitir cambiar reglas sin código
5. **Auditoría Avanzada**: Logs detallados de todas las acciones

---

**¡El sistema está listo para usar!** Cambia roles en el dashboard y experimenta con las diferentes capacidades de aprobación.