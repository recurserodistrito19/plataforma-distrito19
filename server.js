const express = require('express');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const cors = require('cors'); // Agregamos cors explícito para romper el candado

app.use(cors()); // Habilitamos que acepte datos desde cualquier navegador
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta simplificada y directa para enviar el mail
app.post('/api/login', (req, res) => {
    const { email, nombreCompleto } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false });
    }

    const fechaActual = new Date();

    // Configuración del cartero digital con tus credenciales
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'recurserodistrito19@gmail.com',
            pass: 'yppaflirxiefyuts' // Tu clave real sin espacios
        }
    });

    // Armamos el mail privado para vos
    const mailOptions = {
        from: 'recurserodistrito19@gmail.com',
        to: 'recurserodistrito19@gmail.com', 
        subject: `🔔 Alerta de Ingreso: ${email}`,
        text: `¡Hola!\n\nSe acaba de registrar un acceso en la plataforma:\n\n• Nombre: ${nombreCompleto}\n• Correo Electrónico: ${email}\n• Fecha y Hora: ${fechaActual.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}\n\nControl de accesos del Distrito 19.`
    };

    // Enviamos el correo
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("❌ Error al enviar el correo: ", error);
        } else {
            console.log("✅ Correo enviado con éxito: " + info.response);
        }
    });

    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
