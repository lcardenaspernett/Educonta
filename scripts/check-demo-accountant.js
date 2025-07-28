// Script para verificar y restablecer el usuario auxiliar contable demo
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const EMAIL = 'contabilidad@colegiosanjose.edu.co';
const PASSWORD = 'Conta123!';

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    console.log('❌ Usuario no encontrado:', EMAIL);
    return;
  }
  console.log('Usuario encontrado:');
  console.log({
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    institutionId: user.institutionId,
    lastLogin: user.lastLogin
  });

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(PASSWORD, user.password);
  if (isPasswordValid) {
    console.log('✅ Contraseña válida');
  } else {
    console.log('❌ Contraseña inválida. Restableciendo...');
    await prisma.user.update({
      where: { id: user.id },
      data: { password: PASSWORD }
    });
    console.log('✅ Contraseña restablecida a:', PASSWORD);
  }

  // Verificar activo
  if (!user.isActive) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true }
    });
    console.log('✅ Usuario activado');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
