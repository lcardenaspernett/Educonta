# Educonta

Sistema Contable Multi-Tenant para Instituciones Educativas

Un sistema completo de gestion contable disenado especificamente para colegios, universidades y centros educativos, con capacidades multi-institucion y facturacion automatica.

## Caracteristicas Principales

### Sistema Multi-Tenant
- Aislamiento completo de datos por institucion
- Super Admin puede gestionar multiples instituciones
- Contexto dinamico para administradores

### Gestion de Usuarios
- Roles definidos: Super Admin, Rector, Auxiliar Contable
- Sistema de permisos granular por modulo
- Invitaciones por email con tokens seguros

### Gestion Estudiantil
- Importacion masiva desde CSV/Excel
- Datos completos de estudiantes y padres
- Codigos unicos por institucion

### Sistema Contable
- Plan de cuentas personalizable
- Transacciones con doble entrada
- Categorizacion automatica
- Reportes financieros en tiempo real

### Facturacion Automatica
- Eventos de pago configurables (matriculas, mensualidades, rifas)
- Generacion automatica de facturas
- Notificaciones por email a padres
- Control de vencimientos

### Dashboard y Reportes
- KPIs principales por institucion
- Graficos interactivos de ingresos/egresos
- Estados de cuenta por estudiante
- Reportes fiscales

## Tecnologias

### Backend
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- JWT para autenticacion
- Bcrypt para encriptacion
- Multer para uploads
- Nodemailer para emails

### Deployment
- Railway (recomendado)
- Docker compatible
- Variables de entorno

## Instalacion

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/educonta.git
cd educonta
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Variables principales:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/educonta
JWT_SECRET=tu_super_secreto_jwt_muy_largo_y_seguro
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password
SUPER_ADMIN_EMAIL=admin@educonta.com
SUPER_ADMIN_PASSWORD=Admin123!
```

### 4. Configurar Base de Datos

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### 5. Iniciar el Servidor

```bash
npm run dev
```

## Deploy en Railway

### 1. Conectar con Railway

```bash
npm install -g @railway/cli
railway login
railway init
```

### 2. Configurar Variables de Entorno

En el dashboard de Railway, agregar:

```env
NODE_ENV=production
JWT_SECRET=tu_jwt_secreto_super_seguro
SUPER_ADMIN_EMAIL=admin@educonta.com
SUPER_ADMIN_PASSWORD=TuPasswordSeguro123!
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

### 3. Deploy

```bash
git push origin main
```

Railway automaticamente:
- Detecta el proyecto Node.js
- Configura PostgreSQL
- Ejecuta migraciones
- Genera cliente Prisma
- Ejecuta seeding

## Uso del Sistema

### Acceso Inicial

Despues del seeding, tendras estas credenciales:

**Super Administrador:**
- Email: admin@educonta.com
- Password: Admin123!

**Institucion Demo (solo desarrollo):**
- Rector: rector@colegiosanjose.edu.co / Rector123!
- Contabilidad: contabilidad@colegiosanjose.edu.co / Conta123!

### Crear Nueva Institucion

1. Login como Super Admin
2. Ir a "Instituciones"
3. Crear Nueva Institucion
4. Completar datos (NIT, nombre, direccion, etc.)
5. Agregar datos del Rector
6. El rector recibe email con enlace de registro

### Gestion de Estudiantes

1. **Importacion Masiva:**
   - Preparar archivo CSV con columnas: studentCode,firstName,lastName,documentType,documentNumber,grade,section,parentName,parentPhone,parentEmail
   - Ir a "Estudiantes" → "Importar"
   - Subir archivo y validar

2. **Registro Individual:**
   - "Estudiantes" → "Nuevo Estudiante"
   - Completar formulario
   - Guardar

### Crear Eventos de Pago

1. Ir a "Pagos" → "Eventos"
2. Crear Nuevo Evento
3. Configurar:
   - Nombre (ej: "Matricula 2024")
   - Monto
   - Fecha de vencimiento
   - Tipo de evento
4. Asignar a Estudiantes
5. Se generan facturas automaticamente

### Ver Reportes

1. Dashboard: Metricas principales
2. Reportes Financieros: Ingresos, egresos, balances
3. Estados de Cuenta: Por estudiante
4. Reportes Fiscales: Para declaraciones

## API Endpoints

### Autenticacion
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/register
POST /api/auth/refresh
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Instituciones
```
GET    /api/institutions
POST   /api/institutions
GET    /api/institutions/:id
PUT    /api/institutions/:id
POST   /api/institutions/:id/logo
GET    /api/institutions/:id/dashboard
```

### Estudiantes
```
GET    /api/students
POST   /api/students
GET    /api/students/:id
PUT    /api/students/:id
POST   /api/students/import
GET    /api/students/export
```

### Pagos
```
GET    /api/payments/events
POST   /api/payments/events
PUT    /api/payments/events/:id
POST   /api/payments/events/:id/assign
GET    /api/payments/assignments
PUT    /api/payments/assignments/:id
```

### Facturas
```
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
PUT    /api/invoices/:id
GET    /api/invoices/:id/pdf
```

## Estructura del Proyecto

```
educonta/
├── server.js              # Servidor principal
├── package.json           # Dependencias
├── config/                # Configuraciones
│   ├── config.js          # Config central
│   ├── database.js        # Prisma setup
│   └── multer.js          # Upload files
├── prisma/                # Base de datos
│   ├── schema.prisma      # Schema DB
│   └── seed.js            # Datos iniciales
├── controllers/           # Logica de negocio
├── routes/                # Rutas API
├── middleware/            # Middlewares
├── utils/                 # Utilidades
├── uploads/               # Archivos subidos
└── public/                # Frontend estatico
```

## Seguridad

### Autenticacion
- JWT tokens con expiracion
- Refresh tokens para renovacion
- Blacklist de tokens comprometidos

### Autorizacion
- Roles especificos por tipo de usuario
- Permisos granulares por modulo
- Multi-tenant con aislamiento total

### Validacion
- Validacion de entrada en todos los endpoints
- Sanitizacion automatica contra XSS
- Rate limiting contra ataques

### Base de Datos
- Transacciones ACID para contabilidad
- Encriptacion de contrasenas con bcrypt
- Auditoria completa de operaciones

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor con nodemon
npm run db:migrate       # Ejecutar migraciones
npm run db:generate      # Generar cliente Prisma
npm run db:seed          # Cargar datos iniciales
npm run db:studio        # Abrir Prisma Studio

# Produccion
npm start                # Servidor en produccion
npm run build            # Build para produccion

# Base de datos
npm run db:reset         # Reset completo de DB
npx prisma migrate dev   # Nueva migracion
npx prisma migrate deploy # Deploy migraciones
```

## Troubleshooting

### Error de Conexion a BD
```bash
echo $DATABASE_URL
npx prisma generate
npx prisma studio
```

### Error de Migraciones
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Error de Permisos
- Verificar que el usuario tenga rol correcto
- Verificar que la institucion este activa
- Revisar logs de auditoria

## Roadmap

### v1.1 (Proximo)
- Reportes avanzados con graficos
- Integracion bancaria para conciliacion
- App movil para padres
- Notificaciones push

### v1.2 (Futuro)
- Pagos en linea con PSE
- Facturacion electronica DIAN
- API publica para integraciones
- Modulo de nomina

## Contribuir

1. Fork el proyecto
2. Crear rama para feature
3. Commit cambios
4. Push a la rama
5. Crear Pull Request

## Licencia

Este proyecto esta bajo la Licencia MIT. Ver el archivo LICENSE para mas detalles.

## Autor

**Tu Nombre**
- GitHub: @tuusuario
- Email: tu.email@ejemplo.com

## Agradecimientos

- Railway por el hosting gratuito
- Prisma por el excelente ORM
- Express.js por el framework robusto
- Comunidad de desarrolladores por el feedback

---

Si este proyecto te ayuda, no olvides darle una estrella en GitHub!

Preguntas? Abre un issue o envia un email.

Demo: https://educonta.railway.app