#!/bin/bash

echo "🎯 Iniciando build personalizado para Render..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Limpiar duplicados
echo "🧹 Limpiando datos duplicados..."
node scripts/clean-duplicate-students.js || echo "⚠️ Error limpiando duplicados, continuando..."

# Push de schema con aceptación de pérdida de datos
echo "🗄️ Aplicando schema con --accept-data-loss..."
npx prisma db push --accept-data-loss

# Regenerar cliente
echo "🔄 Regenerando cliente Prisma..."
npx prisma generate

echo "🎉 Build completado exitosamente!"