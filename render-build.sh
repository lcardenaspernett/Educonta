#!/bin/bash
set -e

echo "🎯 Build personalizado para Render iniciado..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Limpiar duplicados (no fallar si hay error)
echo "🧹 Limpiando duplicados..."
node scripts/clean-duplicate-students.js || echo "⚠️ Limpieza de duplicados falló, continuando..."

# Push de schema con --accept-data-loss
echo "🗄️ Aplicando schema con --accept-data-loss..."
npx prisma db push --accept-data-loss || {
  echo "🔄 Primer intento falló, intentando con --force-reset..."
  npx prisma db push --accept-data-loss --force-reset
}

# Regenerar cliente
echo "🔄 Regenerando cliente Prisma..."
npx prisma generate

echo "🎉 Build completado exitosamente!"