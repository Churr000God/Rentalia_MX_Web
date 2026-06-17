import express from 'express';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const router = express.Router();

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

router.post('/visitas', async (req, res) => {
  try {
    const data = req.body;

    const sentFrom = new Sender(process.env.MAIL_FROM, 'Rentalia');
    const recipients = [new Recipient(process.env.MAIL_TO)];

    const email = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`Nueva visita agendada – ${data.property.name}`)
      .setHtml(`
        <h2>Nueva visita agendada</h2>

        <p><strong>Propiedad:</strong> ${data.property.name}</p>
        <p><strong>Ubicación:</strong> ${data.property.location}</p>

        <hr />

        <p><strong>Fecha:</strong> ${data.date}</p>
        <p><strong>Hora:</strong> ${data.time}</p>

        <hr />

        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Teléfono:</strong> ${data.phone}</p>

        ${data.comments ? `<p><strong>Comentarios:</strong><br>${data.comments}</p>` : ''}
      `);

    await mailerSend.email.send(email);

    res.json({ success: true });

  } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudo enviar el correo', details: error.message, body: error.body });
    }
});

export default router;