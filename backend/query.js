const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('fourza.db');
db.serialize(() => {
    // Insertar Panadería
    db.run("INSERT OR IGNORE INTO categorias (nombre, slug) VALUES ('Panadería', 'panaderia')");
    
    // Mover 23-31 a panaderia
    db.run("UPDATE productos SET categoria = 'panaderia' WHERE id IN (23, 24, 25, 26, 27, 28, 29, 30, 31)", function(err) {
        if(err) console.error(err);
        else console.log('Productos movidos a Panadería:', this.changes);
    });

    // Mover 32-37 a vegetariana (me faltaron en la pasada)
    db.run("UPDATE productos SET categoria = 'vegetariana' WHERE id IN (32, 33, 34, 35, 36, 37)", function(err) {
        if(err) console.error(err);
        else console.log('Productos extra movidos a Vegetariana:', this.changes);
    });
});
