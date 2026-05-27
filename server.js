const express = require('express');
const path = require('path');
const app = express();

// Configuración obligatoria para leer datos y archivos
app.use(express.json());

// ¡ESTA ES LA LÍNEA CLAVE! Le dice a Node que busque los HTML dentro de "public"
app.use(express.static(path.join(__dirname, 'public')));

// Tu llave real de Google que conseguimos juntos
const GOOGLE_CLIENT_ID = "885266347130-kcgvl03n08m2k9fnkfs0latlt6k6ufc0.apps.googleusercontent.com";

// Base de datos de prueba en la memoria del servidor
let baseDeDatosAccesos = [];

// Ruta principal: cuando entres a http://localhost:3000 te va a mostrar tu index.html automáticamente
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para recibir el inicio de sesión de Google
app.post('/api/login', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, message: "Falta el token de seguridad." });
    }

    // Simulamos la lectura del token de Luciano de forma segura
    const usuarioSimulado = {
        nombre: "Luciano",
        nombreCompleto: "Luciano Loverso",
        email: "luciano.loverso@bue.edu.ar",
        foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
    };

    // Guardamos el registro de entrada con la fecha y hora actual
    baseDeDatosAccesos.push({
        nombre: usuarioSimulado.nombreCompleto,
        email: usuarioSimulado.email,
        fecha_hora: new Date()
    });

    res.json({ success: true, usuario: usuarioSimulado });
});

// Ruta para que la tabla consulte quién entró
app.get('/api/accesos', (req, res) => {
    res.json(baseDeDatosAccesos);
});

// Encender el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("==================================================");
    console.log("  Servidor del Distrito 19 corriendo exitosamente");
    console.log(`  Dirección local: http://localhost:${PORT}`);
    console.log("==================================================");
});