# 📊 GUÍA PARA CARGAR ESTUDIANTES DESDE EXCEL

## 🎉 ¡INSTITUCIÓN CREADA EXITOSAMENTE!

**Institución Educativa Distrital Villas de San Pablo** ha sido creada con todos los datos oficiales:

### 📋 DATOS DE ACCESO CREADOS:

**👨‍💼 Usuario Rector:**
- 📧 Email: `rector@villasanpablo.edu.co`
- 🔑 Contraseña: `VillasSP2024!`
- 👤 Nombre: Yasmin Rico

**💰 Usuario Contabilidad:**
- 📧 Email: `contabilidad@villasanpablo.edu.co`
- 🔑 Contraseña: `ContaVSP2024!`
- 👤 Nombre: Auxiliar Contable

**🆔 ID de Institución:** `cmdt7n66m00003t1jy17ay313`

---

## 📊 CÓMO CARGAR ESTUDIANTES DESDE EXCEL

### 📁 **PASO 1: PREPARAR EL ARCHIVO EXCEL**

Tu archivo Excel debe tener las siguientes columnas (pueden estar en cualquier orden):

#### **COLUMNAS REQUERIDAS:**
- `CODIGO` o `codigo` - Código único del estudiante
- `NOMBRES` o `nombres` - Nombres del estudiante
- `APELLIDOS` o `apellidos` - Apellidos del estudiante
- `DOCUMENTO` o `documento` - Número de documento
- `GRADO` o `grado` - Grado (ej: 6, 7, 8, 9, 10, 11)

#### **COLUMNAS OPCIONALES:**
- `TIPO_DOC` o `tipo_doc` - Tipo documento (TI, CC, CE, etc.)
- `SECCION` o `seccion` - Sección (A, B, C)
- `FECHA_NACIMIENTO` o `fecha_nacimiento` - Fecha de nacimiento
- `GENERO` o `genero` - Género (M/F)
- `DIRECCION` o `direccion` - Dirección
- `TELEFONO` o `telefono` - Teléfono
- `EMAIL` o `email` - Email del estudiante
- `ACUDIENTE` o `acudiente` - Nombre del acudiente
- `TEL_ACUDIENTE` o `tel_acudiente` - Teléfono del acudiente
- `EMAIL_ACUDIENTE` o `email_acudiente` - Email del acudiente

### 📂 **PASO 2: UBICAR EL ARCHIVO**

Puedes colocar tu archivo Excel en cualquiera de estas ubicaciones:

1. **En la raíz del proyecto:** `C:\Users\LUIS C\Educonta\estudiantes.xlsx`
2. **En una carpeta data:** `C:\Users\LUIS C\Educonta\data\estudiantes.xlsx`
3. **En tu escritorio:** `C:\Users\LUIS C\Desktop\estudiantes.xlsx`

### 🚀 **PASO 3: EJECUTAR LA CARGA**

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Si el archivo está en la raíz del proyecto
node scripts/load-students-excel.js estudiantes.xlsx cmdt7n66m00003t1jy17ay313

# Si el archivo está en otra ubicación
node scripts/load-students-excel.js "C:\ruta\completa\estudiantes.xlsx" cmdt7n66m00003t1jy17ay313

# Ejemplo con archivo en el escritorio
node scripts/load-students-excel.js "C:\Users\LUIS C\Desktop\estudiantes.xlsx" cmdt7n66m00003t1jy17ay313
```

### 📋 **EJEMPLO DE ESTRUCTURA EXCEL:**

| CODIGO | NOMBRES | APELLIDOS | DOCUMENTO | GRADO | SECCION | ACUDIENTE |
|--------|---------|-----------|-----------|-------|---------|-----------|
| EST001 | Juan Carlos | Pérez García | 1234567890 | 6 | A | María García |
| EST002 | Ana María | López Ruiz | 0987654321 | 7 | B | Carlos López |
| EST003 | Luis Fernando | Martínez Silva | 1122334455 | 8 | A | Carmen Silva |

---

## ✅ **QUÉ HACE EL SCRIPT:**

1. **📖 Lee el archivo Excel** y detecta automáticamente las columnas
2. **🔍 Valida los datos** y muestra errores si los hay
3. **🚫 Evita duplicados** verificando códigos y documentos existentes
4. **💾 Carga los estudiantes** en la base de datos
5. **📊 Muestra estadísticas** finales por grado

## 🔧 **CARACTERÍSTICAS AVANZADAS:**

- **Detección automática de columnas** - No importa el orden
- **Validación de datos** - Verifica campos requeridos
- **Manejo de errores** - Te dice exactamente qué está mal
- **Prevención de duplicados** - No carga estudiantes que ya existen
- **Estadísticas en tiempo real** - Muestra progreso cada 50 estudiantes

---

## 🌐 **ENLACES DE ACCESO AL SISTEMA:**

Una vez cargados los estudiantes, puedes acceder a:

- **🌐 Login:** http://localhost:3000/login.html
- **🏫 Dashboard Rector:** http://localhost:3000/rector-dashboard.html?institutionId=cmdt7n66m00003t1jy17ay313
- **💰 Dashboard Contable:** http://localhost:3000/accounting-dashboard.html?institutionId=cmdt7n66m00003t1jy17ay313
- **🎉 Gestión Eventos:** http://localhost:3000/events-management.html?institutionId=cmdt7n66m00003t1jy17ay313
- **👥 Gestión Estudiantes:** http://localhost:3000/students-management.html?institutionId=cmdt7n66m00003t1jy17ay313

---

## 🆘 **SOLUCIÓN DE PROBLEMAS:**

### **Error: Archivo no encontrado**
- Verifica la ruta completa del archivo
- Usa comillas si la ruta tiene espacios

### **Error: Columnas faltantes**
- Verifica que tu Excel tenga las columnas requeridas
- Los nombres pueden estar en mayúsculas o minúsculas

### **Error: Estudiantes duplicados**
- El script omitirá automáticamente los duplicados
- Revisa los códigos y documentos únicos

### **Error: Datos inválidos**
- El script te mostrará exactamente qué fila tiene problemas
- Corrige los datos en Excel y vuelve a ejecutar

---

## 📞 **¿NECESITAS AYUDA?**

Si tienes problemas:

1. **Revisa el formato de tu Excel** según la guía
2. **Verifica que el servidor esté corriendo** (`npm start`)
3. **Comprueba la conexión a la base de datos**
4. **Ejecuta el comando exactamente como se muestra**

¡El sistema está listo para recibir tus estudiantes! 🚀