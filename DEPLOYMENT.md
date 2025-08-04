# 🚀 Guía de Deployment - Educonta

## 📋 Opciones de Deployment

### 1. Railway (Recomendado)
### 2. Heroku
### 3. DigitalOcean
### 4. AWS
### 5. Docker

---

## 🚂 Deployment en Railway

Railway es la opción recomendada por su simplicidad y soporte nativo para PostgreSQL.

### **Paso 1: Preparar el Repositorio**

```bash
# Clonar el proyecto
git clone https://github.com/tuusuario/educonta.git
cd educonta

# Instalar Railway CLI
npm install -g @railway/cli

# Login en Railway
railway login
```

### **Paso 2: Crear Proyecto en Railway**

```bash
# Inicializar proyecto
railway init

# Conectar con GitHub (opcional pero recomendado)
railway connect
```

### **Paso 3: Configurar Variables de Entorno**

En el dashboard de Railway, agregar estas variables:

```env
# Obligatorias
NODE_ENV=production
JWT_SECRET=tu_jwt_secreto_super_seguro_de_al_menos_32_caracteres
SUPER_ADMIN_EMAIL=admin@tudominio.com
SUPER_ADMIN_PASSWORD=TuPasswordSeguro123!

# Email (configurar con tu proveedor)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=Educonta <noreply@tudominio.com>

# Opcionales
PORT=3000
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### **Paso 4: Configurar Base de Datos**

Railway automáticamente:
1. Detecta que necesitas PostgreSQL
2. Crea una instancia de PostgreSQL
3. Configura la variable `DATABASE_URL`

### **Paso 5: Deploy**

```bash
# Deploy manual
railway up

# O configurar auto-deploy desde GitHub
# (se configura en el dashboard de Railway)
```

### **Paso 6: Verificar Deployment**

1. Railway ejecutará automáticamente:
   - `npm install`
   - `npx prisma generate`
   - `npx prisma migrate deploy`
   - `npx prisma db seed`
   - `npm run deploy`

2. Verificar en los logs que todo funcione correctamente

3. Acceder a tu aplicación en la URL proporcionada por Railway

---

## 🟣 Deployment en Heroku

### **Paso 1: Preparar Heroku**

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Crear aplicación
heroku create tu-app-educonta
```

### **Paso 2: Configurar Add-ons**

```bash
# Agregar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Verificar que DATABASE_URL se configuró automáticamente
heroku config
```

### **Paso 3: Configurar Variables de Entorno**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_jwt_secreto_super_seguro
heroku config:set SUPER_ADMIN_EMAIL=admin@tudominio.com
heroku config:set SUPER_ADMIN_PASSWORD=TuPasswordSeguro123!
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_USER=tu_email@gmail.com
heroku config:set EMAIL_PASS=tu_app_password
```

### **Paso 4: Deploy**

```bash
# Agregar remote de Heroku
heroku git:remote -a tu-app-educonta

# Deploy
git push heroku main

# Ejecutar migraciones y seeding
heroku run npm run db:setup
```

---

## 🌊 Deployment en DigitalOcean

### **Opción 1: App Platform**

1. Conectar repositorio de GitHub
2. Configurar build command: `npm install && npx prisma generate`
3. Configurar run command: `npm run deploy`
4. Agregar base de datos PostgreSQL
5. Configurar variables de entorno
6. Deploy automático

### **Opción 2: Droplet (VPS)**

```bash
# Conectar al droplet
ssh root@tu_ip

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PostgreSQL
apt-get install postgresql postgresql-contrib

# Clonar proyecto
git clone https://github.com/tuusuario/educonta.git
cd educonta

# Configurar .env
cp .env.example .env
nano .env

# Instalar dependencias y configurar
npm install
npm run db:setup

# Instalar PM2 para gestión de procesos
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name educonta
pm2 startup
pm2 save
```

---

## ☁️ Deployment en AWS

### **Opción 1: Elastic Beanstalk**

1. Crear aplicación en Elastic Beanstalk
2. Configurar plataforma Node.js
3. Subir código como ZIP
4. Configurar RDS PostgreSQL
5. Configurar variables de entorno
6. Deploy

### **Opción 2: EC2 + RDS**

Similar al deployment en DigitalOcean Droplet, pero usando:
- EC2 para el servidor
- RDS para PostgreSQL
- Load Balancer para alta disponibilidad
- CloudFront para CDN

---

## 🐳 Deployment con Docker

### **Paso 1: Crear Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

### **Paso 2: Crear docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://educonta:password@db:5432/educonta
      - JWT_SECRET=tu_jwt_secreto
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=educonta
      - POSTGRES_USER=educonta
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### **Paso 3: Deploy**

```bash
# Build y ejecutar
docker-compose up -d

# Ejecutar migraciones
docker-compose exec app npm run db:setup
```

---

## 🔧 Configuraciones Post-Deployment

### **1. Verificar Funcionalidad**

```bash
# Verificar que la aplicación responde
curl https://tu-app.railway.app/

# Verificar base de datos
curl https://tu-app.railway.app/api/health
```

### **2. Configurar Dominio Personalizado**

En Railway:
1. Ir a Settings → Domains
2. Agregar dominio personalizado
3. Configurar DNS según las instrucciones

### **3. Configurar SSL**

Railway y Heroku proporcionan SSL automáticamente.
Para otros proveedores, usar Let's Encrypt:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com
```

### **4. Configurar Monitoreo**

```bash
# Instalar herramientas de monitoreo
npm install --save express-status-monitor

# Agregar al server.js
app.use(require('express-status-monitor')());
```

### **5. Configurar Backups**

Para Railway:
- Los backups de PostgreSQL son automáticos
- Configurar backups adicionales si es necesario

Para otros proveedores:
```bash
# Script de backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🚨 Troubleshooting

### **Error: Cannot connect to database**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar conectividad
npx prisma studio
```

### **Error: Migrations failed**
```bash
# Reset y re-ejecutar migraciones
npx prisma migrate reset --force
npx prisma migrate deploy
```

### **Error: Build failed**
```bash
# Limpiar cache
npm ci
rm -rf node_modules
npm install
```

### **Error: App crashes on startup**
```bash
# Verificar logs
railway logs
# o
heroku logs --tail
```

---

## 📊 Monitoreo y Mantenimiento

### **Logs**
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Docker
docker-compose logs -f
```

### **Métricas**
- Usar el dashboard de tu proveedor
- Configurar alertas para errores
- Monitorear uso de recursos

### **Updates**
```bash
# Actualizar dependencias
npm update

# Actualizar Prisma
npm install @prisma/client@latest prisma@latest

# Re-deploy
git push origin main
```

---

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL configurada
- [ ] Migraciones ejecutadas correctamente
- [ ] Datos iniciales cargados (seeding)
- [ ] SSL configurado
- [ ] Dominio personalizado (opcional)
- [ ] Monitoreo configurado
- [ ] Backups configurados
- [ ] Logs funcionando
- [ ] Aplicación accesible públicamente
- [ ] Login de Super Admin funciona
- [ ] Creación de instituciones funciona
- [ ] Sistema de eventos funciona

---

## 🎯 Recomendaciones de Producción

1. **Seguridad**
   - Usar secretos fuertes y únicos
   - Configurar rate limiting
   - Mantener dependencias actualizadas

2. **Performance**
   - Configurar CDN para archivos estáticos
   - Optimizar consultas de base de datos
   - Usar conexión pooling

3. **Monitoreo**
   - Configurar alertas de errores
   - Monitorear métricas de performance
   - Logs estructurados

4. **Backups**
   - Backups automáticos diarios
   - Probar restauración regularmente
   - Backups en múltiples ubicaciones

---

¿Necesitas ayuda con algún deployment específico? ¡Abre un issue en GitHub!