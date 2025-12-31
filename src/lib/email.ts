import nodemailer from "nodemailer"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@saldofy.com",
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail(email: string, code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .code {
            background: white;
            border: 2px dashed #667eea;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 20px 0;
            border-radius: 8px;
            color: #667eea;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Saldofy</h1>
            <p>Verificação de Email</p>
          </div>
          <div class="content">
            <p>Olá!</p>
            <p>Use o código abaixo para verificar seu email:</p>
            <div class="code">${code}</div>
            <p>Este código expira em 15 minutos.</p>
            <p>Se você não solicitou este código, ignore este email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Saldofy. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Código de Verificação - Saldofy",
    html,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/new-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Saldofy</h1>
            <p>Redefinição de Senha</p>
          </div>
          <div class="content">
            <p>Olá!</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Saldofy. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Redefinição de Senha - Saldofy",
    html,
  })
}