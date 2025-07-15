// ===================================
// EDUCONTA - Utilidades de Email
// ===================================

const nodemailer = require('nodemailer');
const path = require('path');
const config = require('../config/config');

/**
 * Configurar transporter de nodemailer
 */
const createTransporter = () => {
  const emailConfig = config.getEmailConfig();
  
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('⚠️  Configuración de email incompleta. Los emails no se enviarán.');
    return null;
  }

  return nodemailer.createTransporter({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
    tls: {
      rejectUnauthorized: false // Para desarrollo
    }
  });
};

/**
 * Verificar conexión de email
 */
const verifyEmailConnection = async () => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, error: 'Configuración de email no disponible' };
  }

  try {
    await transporter.verify();
    return { success: true, message: 'Conexión de email verificada' };
  } catch (error) {
    console.error('Error verificando conexión de email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Plantillas de email predefinidas
 */
const emailTemplates = {
  // Plantilla para reseteo de contraseña
  'password-reset': {
    subject: 'Reseteo de contraseña - Educonta',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Educonta</h1>
            <p>Sistema Contable Educativo</p>
          </div>
          <div class="content">
            <h2>Hola ${data.firstName},</h2>
            <p>Recibimos una solicitud para resetear tu contraseña en Educonta${data.institutionName ? ` para ${data.institutionName}` : ''}.</p>
            
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            
            <a href="${data.resetUrl}" class="button">Resetear Contraseña</a>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expira en 1 hora</li>
                <li>Solo puedes usarlo una vez</li>
                <li>Si no solicitaste esto, ignora este email</li>
              </ul>
            </div>
            
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
          </div>
          <div class="footer">
            <p>Este email fue enviado automáticamente. No respondas a este mensaje.</p>
            <p>© ${new Date().getFullYear()} Educonta - Sistema Contable Educativo</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      Hola ${data.firstName},
      
      Recibimos una solicitud para resetear tu contraseña en Educonta${data.institutionName ? ` para ${data.institutionName}` : ''}.
      
      Usa este enlace para crear una nueva contraseña:
      ${data.resetUrl}
      
      IMPORTANTE:
      - Este enlace expira en 1 hora
      - Solo puedes usarlo una vez
      - Si no solicitaste esto, ignora este email
      
      © ${new Date().getFullYear()} Educonta - Sistema Contable Educativo
    `
  },

  // Plantilla para invitación de usuario
  'user-invitation': {
    subject: 'Invitación a Educonta',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .info-box { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Educonta</h1>
            <p>¡Bienvenido al equipo!</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>${data.invitedByName} te ha invitado a unirte a <strong>${data.institutionName}</strong> en Educonta como <strong>${data.roleName}</strong>.</p>
            
            <div class="info-box">
              <h3>📋 Detalles de tu invitación:</h3>
              <ul>
                <li><strong>Institución:</strong> ${data.institutionName}</li>
                <li><strong>Rol:</strong> ${data.roleName}</li>
                <li><strong>Email:</strong> ${data.email}</li>
                <li><strong>Invitado por:</strong> ${data.invitedByName}</li>
              </ul>
            </div>
            
            <p>Haz clic en el siguiente botón para crear tu cuenta:</p>
            
            <a href="${data.registrationUrl}" class="button">Crear mi cuenta</a>
            
            <p><strong>⏰ Esta invitación expira en 7 días.</strong></p>
            
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${data.registrationUrl}</p>
          </div>
          <div class="footer">
            <p>Este email fue enviado automáticamente. No respondas a este mensaje.</p>
            <p>© ${new Date().getFullYear()} Educonta - Sistema Contable Educativo</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      ¡Bienvenido a Educonta!
      
      ${data.invitedByName} te ha invitado a unirte a ${data.institutionName} como ${data.roleName}.
      
      Detalles de tu invitación:
      - Institución: ${data.institutionName}
      - Rol: ${data.roleName}
      - Email: ${data.email}
      - Invitado por: ${data.invitedByName}
      
      Usa este enlace para crear tu cuenta:
      ${data.registrationUrl}
      
      Esta invitación expira en 7 días.
      
      © ${new Date().getFullYear()} Educonta - Sistema Contable Educativo
    `
  },

  // Plantilla para notificación de factura
  'invoice-notification': {
    subject: 'Nueva factura - Educonta',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .invoice-details { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #7c3aed; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Nueva Factura</h1>
            <p>${data.institutionName}</p>
          </div>
          <div class="content">
            <h2>Estimado/a ${data.parentName || data.studentName},</h2>
            <p>Se ha generado una nueva factura para el estudiante <strong>${data.studentName}</strong>.</p>
            
            <div class="invoice-details">
              <h3>📋 Detalles de la factura:</h3>
              <ul>
                <li><strong>Número de factura:</strong> ${data.invoiceNumber}</li>
                <li><strong>Estudiante:</strong> ${data.studentName}</li>
                <li><strong>Concepto:</strong> ${data.concept}</li>
                <li><strong>Fecha de vencimiento:</strong> ${data.dueDate}</li>
                <li class="amount"><strong>Total a pagar:</strong> $${data.amount}</li>
              </ul>
            </div>
            
            <p>Puedes descargar la factura haciendo clic en el siguiente botón:</p>
            
            <a href="${data.invoiceUrl}" class="button">Descargar Factura</a>
            
            <p><strong>💳 Métodos de pago disponibles:</strong></p>
            <ul>
              <li>Pago en la institución</li>
              <li>Transferencia bancaria</li>
              <li>PSE</li>
            </ul>
          </div>
          <div class="footer">
            <p>Para cualquier consulta, contacta a ${data.institutionName}</p>
            <p>© ${new Date().getFullYear()} Educonta - Sistema Contable Educativo</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      Nueva Factura - ${data.institutionName}
      
      Estimado/a ${data.parentName || data.studentName},
      
      Se ha generado una nueva factura para el estudiante ${data.studentName}.
      
      Detalles:
      - Número: ${data.invoiceNumber}
      - Estudiante: ${data.studentName}
      - Concepto: ${data.concept}
      - Vencimiento: ${data.dueDate}
      - Total: $${data.amount}
      
      Descarga tu factura en: ${data.invoiceUrl}
      
      © ${new Date().getFullYear()} Educonta - Sistema Contable Educativo
    `
  },

  // Plantilla para recordatorio de pago
  'payment-reminder': {
    subject: 'Recordatorio de pago - Educonta',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .amount { font-size: 20px; font-weight: bold; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Recordatorio de Pago</h1>
            <p>${data.institutionName}</p>
          </div>
          <div class="content">
            <h2>Estimado/a ${data.parentName || data.studentName},</h2>
            <p>Te recordamos que tienes un pago pendiente para el estudiante <strong>${data.studentName}</strong>.</p>
            
            <div class="warning">
              <h3>💰 Pago pendiente:</h3>
              <ul>
                <li><strong>Concepto:</strong> ${data.concept}</li>
                <li><strong>Fecha de vencimiento:</strong> ${data.dueDate}</li>
                <li class="amount"><strong>Monto:</strong> $${data.amount}</li>
                <li><strong>Días de retraso:</strong> ${data.daysOverdue}</li>
              </ul>
            </div>
            
            <p>Para evitar inconvenientes, realiza tu pago lo antes posible.</p>
            
            <a href="${data.paymentUrl}" class="button">Ver detalles de pago</a>
          </div>
          <div class="footer">
            <p>Para cualquier consulta, contacta a ${data.institutionName}</p>
            <p>© ${new Date().getFullYear()} Educonta - Sistema Contable Educativo</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      Recordatorio de Pago - ${data.institutionName}
      
      Estimado/a ${data.parentName || data.studentName},
      
      Tienes un pago pendiente para ${data.studentName}:
      - Concepto: ${data.concept}
      - Vencimiento: ${data.dueDate}
      - Monto: $${data.amount}
      - Días de retraso: ${data.daysOverdue}
      
      Ver detalles: ${data.paymentUrl}
      
      © ${new Date().getFullYear()} Educonta - Sistema Contable Educativo
    `
  }
};

/**
 * Enviar email usando plantilla
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('⚠️  Email no configurado. Email no enviado:', options.subject);
      return { success: false, error: 'Configuración de email no disponible' };
    }

    let emailContent = {};

    // Si se especifica una plantilla
    if (options.template && emailTemplates[options.template]) {
      const template = emailTemplates[options.template];
      
      emailContent = {
        subject: options.subject || template.subject,
        html: template.html(options.data),
        text: template.text(options.data)
      };
    } else {
      // Email personalizado
      emailContent = {
        subject: options.subject,
        html: options.html,
        text: options.text
      };
    }

    const mailOptions = {
      from: `${config.EMAIL.FROM_NAME} <${config.EMAIL.FROM_ADDRESS}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      ...emailContent,
      attachments: options.attachments
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente:', {
      to: options.to,
      subject: options.subject,
      messageId: result.messageId
    });

    return { 
      success: true, 
      messageId: result.messageId,
      response: result.response
    };

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Enviar múltiples emails en lote
 */
const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    const result = await sendEmail(email);
    results.push({
      to: email.to,
      success: result.success,
      error: result.error,
      messageId: result.messageId
    });
    
    // Pequeña pausa para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

/**
 * Obtener plantillas disponibles
 */
const getAvailableTemplates = () => {
  return Object.keys(emailTemplates).map(key => ({
    id: key,
    name: emailTemplates[key].subject
  }));
};

/**
 * Previsualizar plantilla
 */
const previewTemplate = (templateId, data) => {
  const template = emailTemplates[templateId];
  
  if (!template) {
    return null;
  }

  return {
    subject: template.subject,
    html: template.html(data),
    text: template.text(data)
  };
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  verifyEmailConnection,
  getAvailableTemplates,
  previewTemplate,
  emailTemplates
};