require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');

const CLAVE = process.env.CLAVE_CIFRADO;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = require('./db');

app.post('/api/login', (req, res) => {
    const { nombre, codigo } = req.body;

    db.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre], (error, resultados) => {
        if (error) {
            return res.json({ exito: false, mensaje: 'Error en el servidor' });
        }
        if (resultados.length === 0) {
            return res.json({ exito: false, mensaje: 'Usuario no encontrado' });
        }

        const usuario = resultados[0];

        bcrypt.compare(codigo, usuario.codigo_maestro, (err, coincide) => {
            if (coincide) {
                res.json({ exito: true, mensaje: 'Bienvenido', usuario: usuario.nombre, id: usuario.id });
            } else {
                res.json({ exito: false, mensaje: 'Código incorrecto' });
            }
        });
    });
});

app.get('/api/contrasenas/:usuario_id', (req, res) => {
    const { usuario_id } = req.params;

    db.query('SELECT * FROM contrasenas WHERE usuario_id = ?', [usuario_id], (error, resultados) => {
        if (error) {
            return res.json({ exito: false, mensaje: 'Error en el servidor' });
        }

        const descifradas = resultados.map(item => {
            const bytes = CryptoJS.AES.decrypt(item.contrasena, CLAVE);
            const contrasenaOriginal = bytes.toString(CryptoJS.enc.Utf8);
            return { ...item, contrasena: contrasenaOriginal };
        });

        res.json({ exito: true, contrasenas: descifradas });
    });
});

app.post('/api/contrasenas', (req, res) => {
    const { usuario_id, app, usuario_app, contrasena } = req.body;

    const contrasenaCifrada = CryptoJS.AES.encrypt(contrasena, CLAVE).toString();

    db.query(
        'INSERT INTO contrasenas (usuario_id, app, usuario_app, contrasena) VALUES (?, ?, ?, ?)',
        [usuario_id, app, usuario_app, contrasenaCifrada],
        (error) => {
            if (error) {
                return res.json({ exito: false, mensaje: 'Error al guardar' });
            }
            res.json({ exito: true, mensaje: 'Contraseña guardada' });
        }
    );
});

app.post('/api/registro', (req, res) => {
    const { nombre, codigo } = req.body;

    bcrypt.hash(codigo, 10, (err, hash) => {
        if (err) {
            return res.json({ exito: false, mensaje: 'Error al crear cuenta' });
        }

        db.query(
            'INSERT INTO usuarios (nombre, codigo_maestro) VALUES (?, ?)',
            [nombre, hash],
            (error) => {
                if (error) {
                    return res.json({ exito: false, mensaje: 'El usuario ya existe' });
                }
                res.json({ exito: true, mensaje: 'Usuario creado' });
            }
        );
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});