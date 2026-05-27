const express = require('express');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library'); // <-- Conectamos la herramienta de validación de Google

// Configuración obligatoria para leer datos y archivos
app.use(express.json());

// Le dice a Node que busque los HTML dentro de "public"
app.use(express.static(path.join(__dirname, 'public')));

// Tu llave real de Google 
const GOOGLE_CLIENT_ID = "885266347130-kcgvl03n08m2k9fnkfs0latlt6k6ufc0.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Base de datos de prueba en la memoria del servidor
let baseDeDatosAccesos = [];

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para recibir el inicio de sesión de Google REAL
app.post('/api/login', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, message: "Falta el token de seguridad." });
    }

    try {
        // =========================================================================
        // VALIDACIÓN REAL DEL TOKEN DE GOOGLE
        // =========================================================================
        // Google abre el token de forma segura y nos da los datos reales del docente
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        
        // Creamos el objeto del usuario con sus datos verdaderos de la cuenta @bue
        const usuarioReal = {
            nombre: payload.given_name,          // Ejemplo: "Luciano"
            nombreCompleto: payload.name,        // Ejemplo: "Luciano Loverso"
            email: payload.email,                // Ejemplo: "luciano.loverso@bue.edu.ar"
            foto: payload.picture                // Su foto real de perfil de Google
        };

        const fechaActual = new Date();

        // Guardamos el registro verdadero de entrada en la tabla
        baseDeDatosAccesos.push({
            nombre: usuarioReal.nombreCompleto,
            email: usuarioReal.email,
            fecha_hora: fechaActual
        });

        // =========================================================================
        // CONFIGURACIÓN DEL ENVÍO DE MAIL AUTOMÁTICO (NODEMAILER)
        // =========================================================================
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'recurserodistrito19@gmail.com',
                pass: 'yppa flir xief yuts' // <-- Colocá aquí tus 16 letras amarillas de Google sin espacios
            }
        });

        const mailOptions = {
            from: 'recurserodistrito19@gmail.com',
            to: 'recurserodistrito19@gmail.com', 
            subject: `🔔 Ingreso: ${usuarioReal.nombreCompleto} en Distrito 19`,
            text: `¡Hola!\n\nUn docente acaba de iniciar sesión en la plataforma:\n\n• Nombre: ${usuarioReal.nombreCompleto}\n• Email: ${usuarioReal.email}\n• Fecha y Hora: ${fechaActual.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}\n\nSaludos.`
        };

        // Enviamos el correo de alerta
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("❌ Error al enviar el correo: ", error);
            } else {
                console.log("✅ Correo enviado con éxito: " + info.response);
            }
        });

        // Le devolvemos a la página web los datos de la persona real para que diga "Hola, [Nombre]"
        res.json({ success: true, usuario: usuarioReal });

    } catch (error) {
        console.error("Error al validar con Google:", error);
        res.status(401).json({ success: false, message: "El token de Google no es válido o expiró." });
    }
});

// Ruta para que la tabla consulte quién entró
app.get('/api/accesos', (req, res) => {
    res.json(baseDeDatosAccesos);
});

// Encender el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("==================================================");
    console.log("  Servidor del Distrito 19 corriendo exitosamente");
    console.log(`  Dirección: http://localhost:${PORT}`);
    console.log("==================================================");
});
