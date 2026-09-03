const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('./database');
const mailer = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

// ConfiguraciÃ³n secreta
const SECRET_KEY = process.env.SECRET_KEY || "fourza_secreto_super_seguro";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/img', express.static(path.join(__dirname, '../img')));
app.use(express.static(path.join(__dirname, '..')));

// ConfiguraciÃ³n de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware de AutenticaciÃ³n
function verificarToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.usuario = authData;
                next();
            }
        });
    } else {
        res.sendStatus(401);
    }
}

// ================= ADMIN RUTAS (Seguras) =================

app.post('/api/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }
    const { email, password } = req.body;
    db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        if (bcrypt.compareSync(password, user.password_hash)) {
            const token = jwt.sign({ id: user.id, nombre: user.nombre, rol: user.rol }, SECRET_KEY, { expiresIn: '24h' });
            res.json({ token, usuario: { nombre: user.nombre, rol: user.rol } });
        } else {
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    });
});

app.get('/api/contactos', verificarToken, (req, res) => {
    db.all("SELECT * FROM contactos ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/cotizaciones', verificarToken, (req, res) => {
    db.all("SELECT * FROM cotizaciones ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/pedidos', verificarToken, (req, res) => {
    db.all("SELECT * FROM pedidos ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ================= LEADS MANAGEMENT =================

app.put('/api/contactos/:id/estado', verificarToken, (req, res) => {
    db.run(`UPDATE contactos SET estado = ? WHERE id = ?`, [req.body.estado, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/contactos/:id', verificarToken, (req, res) => {
    db.run(`DELETE FROM contactos WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.put('/api/cotizaciones/:id/estado', verificarToken, (req, res) => {
    db.run(`UPDATE cotizaciones SET estado = ? WHERE id = ?`, [req.body.estado, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.put('/api/pedidos/:id/estado', verificarToken, (req, res) => {
    const estadosPermitidos = ['pendiente', 'aprobado', 'rechazado', 'anulado'];
    const nuevoEstado = req.body.estado;

    if (!estadosPermitidos.includes(nuevoEstado)) {
        return res.status(400).json({ error: 'Estado invalido' });
    }

    db.get("SELECT * FROM pedidos WHERE id = ?", [req.params.id], (err, pedido) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

        db.run(`UPDATE pedidos SET estado = ? WHERE id = ?`, [nuevoEstado, req.params.id], function(updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });

            if (nuevoEstado === 'aprobado' && pedido.estado !== 'aprobado') {
                db.get("SELECT * FROM pedidos WHERE id = ?", [req.params.id], (errNew, updatedOrder) => {
                    if (!errNew && updatedOrder) {
                        mailer.enviarConfirmacionPedido(updatedOrder);
                    }
                });
            }

            res.json({ success: true });
        });
    });
});

app.delete('/api/cotizaciones/:id', verificarToken, (req, res) => {
    db.run(`DELETE FROM cotizaciones WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ================= SISTEMA DE USUARIOS =================
app.get('/api/usuarios', verificarToken, (req, res) => {
    db.all("SELECT id, nombre, email, rol, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/usuarios', verificarToken, (req, res) => {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' });
    
    const hash = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)", [nombre, email, hash, rol || 'admin'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, id: this.lastID });
    });
});

app.delete('/api/usuarios/:id', verificarToken, (req, res) => {
    db.run("DELETE FROM usuarios WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ================= GESTIÃ“N DE CATEGORÃAS =================
app.get('/api/categorias', (req, res) => {
    db.all("SELECT * FROM categorias ORDER BY nombre ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/categorias', verificarToken, (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Falta nombre' });
    
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    db.run("INSERT INTO categorias (slug, nombre) VALUES (?, ?)", [slug, nombre], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, id: this.lastID, slug, nombre });
    });
});

app.delete('/api/categorias/:id', verificarToken, (req, res) => {
    db.run("DELETE FROM categorias WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ================= HISTORIAL =================
app.get('/api/historial', verificarToken, (req, res) => {
    const query = `
        SELECT h.*, u.nombre as usuario_nombre 
        FROM historial_acciones h 
        LEFT JOIN usuarios u ON h.usuario_id = u.id 
        ORDER BY h.fecha DESC LIMIT 100`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Helper para historial
function registrarAccion(usuario_id, accion, detalle) {
    if(!usuario_id) return;
    db.run("INSERT INTO historial_acciones (usuario_id, accion, detalle) VALUES (?, ?, ?)", [usuario_id, accion, detalle]);
}

// ================= CMS PRODUCTOS =================

app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/productos', verificarToken, upload.single('imagen'), (req, res) => {
    const { titulo, descripcion, categoria, precio, variantes } = req.body;
    
    if (!titulo || !descripcion || !categoria || !req.file) {
        return res.status(400).json({ error: 'Todos los campos y la imagen son obligatorios' });
    }

    const imagen_url = `/uploads/${req.file.filename}`;
    
    const sql = `INSERT INTO productos (titulo, descripcion, categoria, imagen_url, precio, variantes) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [titulo, descripcion, categoria, imagen_url, precio || '', variantes || '[]'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        registrarAccion(req.usuario.id, 'CREAR_PRODUCTO', `AÃ±adiÃ³ producto: ${titulo}`);
        res.status(201).json({ success: true, message: 'Producto creado', id: this.lastID });
    });
});

// ================= EDITAR PRODUCTO =================

app.put('/api/productos/:id', verificarToken, upload.single('imagen'), (req, res) => {
    const id = req.params.id;
    const { titulo, descripcion, categoria, precio, variantes } = req.body;

    if (!titulo || !descripcion || !categoria) {
        return res.status(400).json({ error: 'TÃ­tulo, descripciÃ³n y categorÃ­a son obligatorios' });
    }

    // Obtener imagen actual para decidir si reemplazar
    db.get(`SELECT imagen_url FROM productos WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Producto no encontrado' });

        let imagen_url = row.imagen_url;

        if (req.file) {
            // Hay nueva imagen â€” borrar la anterior si era un upload (no un SVG del sistema)
            if (imagen_url && imagen_url.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, imagen_url);
                fs.unlink(oldPath, (err) => {
                    if (err) console.error('Error borrando imagen anterior:', err);
                });
            }
            imagen_url = `/uploads/${req.file.filename}`;
        }

        const sql = `UPDATE productos SET titulo = ?, descripcion = ?, categoria = ?, imagen_url = ?, precio = ?, variantes = ? WHERE id = ?`;
        db.run(sql, [titulo, descripcion, categoria, imagen_url, precio || '', variantes || '[]', id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            registrarAccion(req.usuario.id, 'EDITAR_PRODUCTO', `EditÃ³ producto: ${titulo}`);
            res.json({ success: true, message: 'Producto actualizado' });
        });
    });
});

app.delete('/api/productos/:id', verificarToken, (req, res) => {
    const id = req.params.id;
    
    db.get(`SELECT imagen_url FROM productos WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row && row.imagen_url && row.imagen_url.startsWith('/uploads/')) {
            const filepath = path.join(__dirname, row.imagen_url);
            fs.unlink(filepath, (err) => {
                if (err) console.error("Error borrando imagen fÃ­sica:", err);
            });
        }
        
        db.run(`DELETE FROM productos WHERE id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            registrarAccion(req.usuario.id, 'BORRAR_PRODUCTO', `EliminÃ³ producto ID: ${id}`);
            res.json({ success: true, message: 'Producto eliminado' });
        });
    });
});


// ================= CMS GALERIA =================

app.get('/api/galeria', (req, res) => {
    db.all("SELECT * FROM galeria ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/galeria', verificarToken, upload.single('imagen'), (req, res) => {
    const { titulo } = req.body;
    if (!titulo || !req.file) return res.status(400).json({ error: 'TÃ­tulo e imagen son obligatorios' });
    const imagen_url = `/uploads/${req.file.filename}`;
    db.run(`INSERT INTO galeria (titulo, imagen_url) VALUES (?, ?)`, [titulo, imagen_url], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true });
    });
});

app.delete('/api/galeria/:id', verificarToken, (req, res) => {
    const id = req.params.id;
    db.get(`SELECT imagen_url FROM galeria WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row && row.imagen_url) {
            const filepath = path.join(__dirname, row.imagen_url);
            fs.unlink(filepath, (err) => {});
        }
        db.run(`DELETE FROM galeria WHERE id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// ================= PUBLIC RUTAS (Con ValidaciÃ³n) =================

// Ruta para guardar un contacto
app.post('/api/contacto', [
    body('nombre').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('telefono').optional().trim().escape(),
    body('mensaje').optional().trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos invÃ¡lidos', details: errors.array() });
    }

    const { nombre, email, telefono, mensaje } = req.body;
    
    const sql = `INSERT INTO contactos (nombre, email, telefono, mensaje) VALUES (?, ?, ?, ?)`;
    db.run(sql, [nombre, email, telefono, mensaje], function(err) {
        if (err) {
            console.error('Error insertando contacto:', err);
            return res.status(500).json({ error: 'Error al guardar el contacto.' });
        }
        
        mailer.enviarNotificacionContacto(req.body); // NotificaciÃ³n por correo
        res.status(201).json({ success: true, message: 'Contacto guardado con Ã©xito.', id: this.lastID });
    });
});

// ================= ANTI-SPAM (Rate Limit Simple) =================
const rateMap = new Map(); // IP -> { count, resetAt }

function antiSpam(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const WINDOW_MS = 5 * 60 * 1000; // 5 minutos
    const MAX_REQUESTS = 3;

    if (!rateMap.has(ip) || rateMap.get(ip).resetAt < now) {
        rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return next();
    }

    const entry = rateMap.get(ip);
    if (entry.count >= MAX_REQUESTS) {
        const wait = Math.ceil((entry.resetAt - now) / 60000);
        return res.status(429).json({ error: `Demasiadas solicitudes. Intenta de nuevo en ${wait} minuto(s).` });
    }

    entry.count++;
    next();
}

// Ruta para guardar una cotizaciÃ³n
app.post('/api/cotizacion', antiSpam, [
    body('nombre').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('telefono').optional().trim().escape(),
    body('categoria').notEmpty().trim().escape(),
    body('descripcion').optional().trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos invÃ¡lidos', details: errors.array() });
    }

    const { nombre, email, telefono, categoria, descripcion } = req.body;
    
    const sql = `INSERT INTO cotizaciones (nombre, email, telefono, categoria, descripcion) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [nombre, email, telefono, categoria, descripcion], function(err) {
        if (err) {
            console.error('Error insertando cotizaciÃ³n:', err);
            return res.status(500).json({ error: 'Error al guardar la cotizaciÃ³n.' });
        }

        mailer.enviarNotificacionFeedback(req.body);
        mailer.enviarConfirmacionFeedbackCliente(req.body);
        res.status(201).json({ success: true, message: 'Mensaje guardado con éxito.', id: this.lastID });
    });
});
// Ruta para guardar una reseña de experiencia de compra
app.post('/api/resenas', antiSpam, [
    body('referencia_pedido').notEmpty().trim().escape(),
    body('nombre_cliente').optional().trim().escape(),
    body('calificacion').isInt({ min: 1, max: 5 }),
    body('comentario').optional().trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }

    const { referencia_pedido, nombre_cliente, calificacion, comentario } = req.body;
    const nombreFinal = nombre_cliente || 'Cliente Anónimo';
    
    const sql = `INSERT INTO resenas (referencia_pedido, nombre_cliente, calificacion, comentario) VALUES (?, ?, ?, ?)`;
    db.run(sql, [referencia_pedido, nombreFinal, calificacion, comentario], function(err) {
        if (err) {
            console.error('Error insertando reseña:', err);
            return res.status(500).json({ error: 'Error al guardar la reseña.' });
        }

        mailer.enviarNotificacionResena(req.body);
        res.status(201).json({ success: true, message: 'Reseña guardada con éxito.', id: this.lastID });
    });
});

// Obtener reseñas públicas aprobadas
app.get('/api/resenas', (req, res) => {
    const sql = `SELECT nombre_cliente, calificacion, comentario, fecha FROM resenas WHERE publicado = 1 ORDER BY id DESC LIMIT 10`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener reseñas.' });
        res.json(rows);
    });
});

// Obtener todas las reseñas (Admin)
app.get('/api/admin/resenas', verificarToken, (req, res) => {
    const sql = `SELECT * FROM resenas ORDER BY id DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener reseñas.' });
        res.json(rows);
    });
});

// Alternar estado de publicación (Admin)
app.put('/api/admin/resenas/:id', verificarToken, [
    body('publicado').isInt({ min: 0, max: 1 })
], (req, res) => {
    const { publicado } = req.body;
    const { id } = req.params;
    const sql = `UPDATE resenas SET publicado = ? WHERE id = ?`;
    db.run(sql, [publicado, id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al actualizar reseña.' });
        res.json({ success: true });
    });
});



// ================= PEDIDOS CON PAGO MANUAL =================

const METODOS_PAGO = ['nequi', 'daviplata', 'bancolombia'];

// 1. Crear un pedido pendiente de confirmacion manual
app.post('/api/crear-pedido', [
    body('nombre').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('telefono').optional().trim().escape(),
    body('direccion').notEmpty().trim().escape(),
    body('metodo_pago').isIn(METODOS_PAGO),
    body('productos').isArray({ min: 1 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos invÃ¡lidos', details: errors.array() });
    }

    const { nombre, email, telefono, direccion, productos, metodo_pago } = req.body;
    
    // Calcular monto total
    let montoTotal = 0;
    try {
        productos.forEach(item => {
            const precioNum = parseInt(String(item.precio).replace(/[^0-9]/g, '')) || 0;
            const cantNum = parseInt(item.cantidad) || 0;
            montoTotal += (precioNum * cantNum);
        });
    } catch (e) {
        return res.status(400).json({ error: 'Error al procesar los productos del carrito.' });
    }

    if (montoTotal <= 0) {
        return res.status(400).json({ error: 'El monto total debe ser mayor a 0.' });
    }

    // Generar referencia Ãºnica
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const referencia = `FOURZA-${timestamp}-${random}`;
    
    // Guardar en base de datos como pendiente
    const productosJSON = JSON.stringify(productos);
    const sql = `INSERT INTO pedidos (referencia, nombre, email, telefono, direccion, productos, monto, estado, metodo_pago) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`;
                 
    db.run(sql, [referencia, nombre, email, telefono, direccion, productosJSON, montoTotal, metodo_pago], function(err) {
        if (err) {
            console.error('Error insertando pedido:', err);
            return res.status(500).json({ error: 'Error al registrar el pedido.' });
        }

        db.get("SELECT * FROM pedidos WHERE referencia = ?", [referencia], (errOrder, pedido) => {
            if (!errOrder && pedido && mailer.enviarPedidoPendientePago) {
                mailer.enviarPedidoPendientePago(pedido);
            }
        });
        
        res.status(201).json({
            success: true,
            referencia
        });
    });
});

// 2. Obtener estado del pedido por referencia
app.get('/api/pedido/:referencia', (req, res) => {
    const ref = req.params.referencia;
    db.get("SELECT * FROM pedidos WHERE referencia = ?", [ref], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(row);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT} (Con Seguridad, Panel y Correos)`);
});

