const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'fourza.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        
        // Crear tabla de Contactos
        db.run(`CREATE TABLE IF NOT EXISTS contactos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            telefono TEXT,
            mensaje TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Crear tabla de Cotizaciones
        db.run(`CREATE TABLE IF NOT EXISTS cotizaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            telefono TEXT,
            categoria TEXT,
            descripcion TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Crear tabla de Productos
        db.run(`CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            categoria TEXT NOT NULL,
            imagen_url TEXT NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Crear tabla de Galeria
        db.run(`CREATE TABLE IF NOT EXISTS galeria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            imagen_url TEXT NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Añadir columna 'estado' si no existe (usamos un try-catch silencioso para la inserción)
        db.run(`ALTER TABLE contactos ADD COLUMN estado TEXT DEFAULT 'pendiente'`, (err) => {
            // Ignorar error de "duplicate column" si ya existe
        });
        db.run(`ALTER TABLE cotizaciones ADD COLUMN estado TEXT DEFAULT 'pendiente'`, (err) => {
            // Ignorar error de "duplicate column" si ya existe
        });

        // Añadir columna 'precio' a productos si no existe
        db.run(`ALTER TABLE productos ADD COLUMN precio TEXT DEFAULT ''`, (err) => {
            // Ignorar error de "duplicate column" si ya existe
        });

        // Añadir columna 'variantes' a productos si no existe
        db.run(`ALTER TABLE productos ADD COLUMN variantes TEXT DEFAULT '[]'`, (err) => {
            // Ignorar error de "duplicate column" si ya existe
        });

        // ==========================================
        // NUEVAS TABLAS: SISTEMA DE USUARIOS Y CATEGORÍAS
        // ==========================================

        // Crear tabla de Reseñas (Experiencia de compra)
        db.run(`CREATE TABLE IF NOT EXISTS resenas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referencia_pedido TEXT,
            calificacion INTEGER NOT NULL,
            comentario TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`ALTER TABLE resenas ADD COLUMN nombre_cliente TEXT DEFAULT 'Cliente Anónimo'`, (err) => {});
        db.run(`ALTER TABLE resenas ADD COLUMN publicado INTEGER DEFAULT 0`, (err) => {});
        
        // Crear tabla de Usuarios
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            rol TEXT DEFAULT 'admin',
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                // Verificar si existe algún usuario
                db.get(`SELECT COUNT(*) as count FROM usuarios`, (err, row) => {
                    if (!err && row.count === 0) {
                        const bcrypt = require('bcrypt');
                        const defaultPassword = 'admin';
                        const hash = bcrypt.hashSync(defaultPassword, 10);
                        db.run(`INSERT INTO usuarios (nombre, email, password_hash) VALUES ('Admin Principal', 'admin@fourza.co', ?)`, [hash]);
                        console.log('✅ Usuario por defecto creado: admin@fourza.co / admin');
                    }
                });
            }
        });

        // Crear tabla de Categorías
        db.run(`CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT NOT NULL UNIQUE,
            nombre TEXT NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                db.get(`SELECT COUNT(*) as count FROM categorias`, (err, row) => {
                    if (!err && row.count === 0) {
                        const defaultCats = [
                            { slug: 'alimentos', nombre: 'Alimentos' },
                            { slug: 'embalaje', nombre: 'Embalaje' },
                            { slug: 'insumos', nombre: 'Insumos' }
                        ];
                        const stmt = db.prepare(`INSERT INTO categorias (slug, nombre) VALUES (?, ?)`);
                        defaultCats.forEach(c => stmt.run([c.slug, c.nombre]));
                        stmt.finalize();
                        console.log('✅ Categorías por defecto creadas.');
                    }
                });
            }
        });

        // Crear tabla de Historial de Acciones
        db.run(`CREATE TABLE IF NOT EXISTS historial_acciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            accion TEXT NOT NULL,
            detalle TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        )`);

        // Crear tabla de Pedidos
        db.run(`CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referencia TEXT NOT NULL UNIQUE,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            telefono TEXT,
            direccion TEXT,
            productos TEXT NOT NULL,
            monto INTEGER NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            wompi_transaction_id TEXT,
            metodo_pago TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

module.exports = db;
