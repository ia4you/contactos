import nodemailer from "nodemailer";

// mail.turel.es usa un certificado autofirmado. Con secure:false en el
// puerto 25, nodemailer intenta STARTTLS de forma oportunista en cuanto el
// servidor lo anuncia, y esa negociación TLS fallaba con "self-signed
// certificate" porque no se indicaba rejectUnauthorized:false — el envío
// nunca llegaba a producirse (verificado con .verify() antes y después del
// fix). No hay forma de evitar el STARTTLS oportunista desde este lado sin
// deshabilitar TLS del todo (ignoreTLS), así que se acepta el certificado
// autofirmado explícitamente en vez de eso.
export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
});
