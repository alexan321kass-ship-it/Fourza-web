const db = require('./database');
const { defaults } = require('./seed');

console.log("Iniciando reseeding de base de datos...");

db.serialize(() => {
    // Limpiar tabla productos
    db.run("DELETE FROM productos", (err) => {
        if (err) {
            console.error("Error al limpiar tabla productos:", err.message);
            process.exit(1);
        }
        console.log("Tabla de productos limpia.");
    });

    // Reiniciar secuencia autoincremental de SQLite si existe sqlite_sequence
    db.run("DELETE FROM sqlite_sequence WHERE name='productos'", (err) => {
        // Ignorar si no existe
    });

    // Insertar productos reales
    const stmt = db.prepare(`INSERT INTO productos (titulo, descripcion, categoria, imagen_url) VALUES (?, ?, ?, ?)`);
    
    defaults.forEach((p, idx) => {
        stmt.run(p.titulo, p.descripcion, p.categoria, p.imagen_url, (err) => {
            if (err) {
                console.error(`Error insertando producto #${idx + 1} (${p.titulo}):`, err.message);
            }
        });
    });

    stmt.finalize((err) => {
        if (err) {
            console.error("Error al finalizar inserciones:", err.message);
            process.exit(1);
        }
        console.log(`Se insertaron con éxito ${defaults.length} productos.`);
        
        // Verificar conteo total final
        db.get("SELECT COUNT(*) as count FROM productos", (err, row) => {
            if (err) {
                console.error("Error consultando total de productos:", err.message);
            } else {
                console.log(`Conteo final en base de datos: ${row.count} productos.`);
            }
            process.exit(0);
        });
    });
});
