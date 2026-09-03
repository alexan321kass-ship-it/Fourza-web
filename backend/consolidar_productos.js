/**
 * SCRIPT DE CONSOLIDACIÓN DE PRODUCTOS
 * Fusiona productos con presentaciones múltiples en un solo producto con variantes.
 * Ejecutar una sola vez: node backend/consolidar_productos.js
 */

const db = require('./database');

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  await wait(800); // esperar que la DB conecte

  const grupos = [
    /* ── ALIMENTOS: GRANOLA ESPECIAL ── */
    {
      mantener: 3,   // 1000 G (la imagen más representativa)
      titulo:   'GRANOLA ESPECIAL',
      variantes: [
        { nombre: '250 G',  precio: 'Consultar' },
        { nombre: '500 G',  precio: 'Consultar' },
        { nombre: '1000 G', precio: 'Consultar' },
      ],
      eliminar: [1, 2],
    },
    /* ── GRANOLA FRUTOS ROJOS & SECOS → mantener separados, agregar variantes de presentación ── */
    // (solo existen en 450g, se deja como producto único sin variante de peso)

    /* ── ARITOS TROPICALES ── */
    {
      mantener: 10,
      titulo:   'ARITOS TROPICALES',
      variantes: [
        { nombre: '250 G', precio: 'Consultar' },
        { nombre: '500 G', precio: 'Consultar' },
      ],
      eliminar: [11],
    },
    /* ── ARROZ ACHOCOLATADO ── */
    {
      mantener: 8,
      titulo:   'ARROZ ACHOCOLATADO',
      variantes: [
        { nombre: '250 G', precio: 'Consultar' },
        { nombre: '500 G', precio: 'Consultar' },
      ],
      eliminar: [9],
    },
    /* ── AVENA EN HOJUELA ── */
    {
      mantener: 20,
      titulo:   'AVENA EN HOJUELA',
      variantes: [
        { nombre: '250 G',  precio: 'Consultar' },
        { nombre: '500 G',  precio: 'Consultar' },
        { nombre: '1000 G', precio: 'Consultar' },
      ],
      eliminar: [21, 22],
    },
    /* ── HOJUELAS AZUCARADAS ── */
    {
      mantener: 12,
      titulo:   'HOJUELAS AZUCARADAS',
      variantes: [
        { nombre: '250 G', precio: 'Consultar' },
        { nombre: '500 G', precio: 'Consultar' },
      ],
      eliminar: [13],
    },
    /* ── HOJUELAS NATURALES ── */
    {
      mantener: 14,
      titulo:   'HOJUELAS NATURALES',
      variantes: [
        { nombre: '250 G', precio: 'Consultar' },
        { nombre: '500 G', precio: 'Consultar' },
      ],
      eliminar: [15],
    },
    /* ── EMBALAJE: CINTA ADHESIVA TRANSPARENTE 48MM ── */
    {
      mantener: 55,
      titulo:   'CINTA ADHESIVA TRANSPARENTE 48 MM',
      variantes: [
        { nombre: '100 M', precio: 'Consultar' },
        { nombre: '200 M', precio: 'Consultar' },
        { nombre: '300 M', precio: 'Consultar' },
        { nombre: '500 M', precio: 'Consultar' },
      ],
      eliminar: [56, 57, 58],
    },
    /* ── CINTA DE ENMASCARAR MULTIPRO ── */
    {
      mantener: 50,
      titulo:   'CINTA DE ENMASCARAR MULTIPRO',
      variantes: [
        { nombre: '12 MM × 20 M', precio: 'Consultar' },
        { nombre: '18 MM × 20 M', precio: 'Consultar' },
        { nombre: '24 MM × 20 M', precio: 'Consultar' },
        { nombre: '36 MM × 20 M', precio: 'Consultar' },
        { nombre: '48 MM × 20 M', precio: 'Consultar' },
      ],
      eliminar: [51, 52, 53, 54],
    },
    /* ── VINIPEL INDUSTRIAL (transparente) — por ancho, variante = gramaje ── */
    {
      mantener: 60,
      titulo:   'VINIPEL INDUSTRIAL 12,5 CM',
      variantes: [
        { nombre: '325 G', precio: 'Consultar' },
        { nombre: '525 G', precio: 'Consultar' },
      ],
      eliminar: [61],
    },
    {
      mantener: 62,
      titulo:   'VINIPEL INDUSTRIAL 15 CM',
      variantes: [
        { nombre: '390 G', precio: 'Consultar' },
        { nombre: '630 G', precio: 'Consultar' },
      ],
      eliminar: [63],
    },
    {
      mantener: 64,
      titulo:   'VINIPEL INDUSTRIAL 20 CM',
      variantes: [
        { nombre: '520 G', precio: 'Consultar' },
        { nombre: '840 G', precio: 'Consultar' },
      ],
      eliminar: [65],
    },
    {
      mantener: 66,
      titulo:   'VINIPEL INDUSTRIAL 30 CM',
      variantes: [
        { nombre: '780 G',  precio: 'Consultar' },
        { nombre: '1260 G', precio: 'Consultar' },
      ],
      eliminar: [67],
    },
    {
      mantener: 68,
      titulo:   'VINIPEL INDUSTRIAL 45 CM',
      variantes: [
        { nombre: '1170 G', precio: 'Consultar' },
        { nombre: '1890 G', precio: 'Consultar' },
      ],
      eliminar: [69],
    },
    {
      mantener: 70,
      titulo:   'VINIPEL INDUSTRIAL 50 CM',
      variantes: [
        { nombre: '1300 G', precio: 'Consultar' },
        { nombre: '2100 G', precio: 'Consultar' },
      ],
      eliminar: [71],
    },
    /* ── VINIPEL INDUSTRIAL NEGRO — misma lógica ── */
    {
      mantener: 72,
      titulo:   'VINIPEL INDUSTRIAL NEGRO 12,5 CM',
      variantes: [
        { nombre: '325 G', precio: 'Consultar' },
        { nombre: '525 G', precio: 'Consultar' },
      ],
      eliminar: [73],
    },
    {
      mantener: 74,
      titulo:   'VINIPEL INDUSTRIAL NEGRO 15 CM',
      variantes: [
        { nombre: '390 G', precio: 'Consultar' },
        { nombre: '630 G', precio: 'Consultar' },
      ],
      eliminar: [75],
    },
    {
      mantener: 76,
      titulo:   'VINIPEL INDUSTRIAL NEGRO 20 CM',
      variantes: [
        { nombre: '520 G', precio: 'Consultar' },
        { nombre: '840 G', precio: 'Consultar' },
      ],
      eliminar: [77],
    },
    {
      mantener: 78,
      titulo:   'VINIPEL INDUSTRIAL NEGRO 30 CM',
      variantes: [
        { nombre: '780 G',  precio: 'Consultar' },
        { nombre: '1260 G', precio: 'Consultar' },
      ],
      eliminar: [79],
    },
    {
      mantener: 80,
      titulo:   'VINIPEL INDUSTRIAL NEGRO 45 CM',
      variantes: [
        { nombre: '1170 G', precio: 'Consultar' },
        { nombre: '1890 G', precio: 'Consultar' },
      ],
      eliminar: [81],
    },
    {
      mantener: 82,
      titulo:   'VINIPEL INDUSTRIAL NEGRO 50 CM',
      variantes: [
        { nombre: '1300 G', precio: 'Consultar' },
        { nombre: '2100 G', precio: 'Consultar' },
      ],
      eliminar: [83],
    },
  ];

  let actualizados = 0;
  let eliminados   = 0;

  for (const grupo of grupos) {
    const varJson = JSON.stringify(grupo.variantes);

    // Actualizar producto principal: nuevo título y variantes
    await new Promise((res, rej) => {
      db.run(
        'UPDATE productos SET titulo = ?, variantes = ?, precio = ? WHERE id = ?',
        [grupo.titulo, varJson, '', grupo.mantener],
        function(err) {
          if (err) { console.error('Error actualizando', grupo.mantener, err.message); rej(err); }
          else { console.log('✅ Actualizado:', grupo.titulo, '(id', grupo.mantener + ')'); actualizados++; res(); }
        }
      );
    });

    // Eliminar duplicados
    for (const id of grupo.eliminar) {
      await new Promise((res, rej) => {
        db.run('DELETE FROM productos WHERE id = ?', [id], function(err) {
          if (err) { console.error('Error eliminando', id, err.message); rej(err); }
          else { console.log('  🗑  Eliminado id:', id); eliminados++; res(); }
        });
      });
    }
  }

  console.log(`\n✨ Listo. ${actualizados} productos actualizados, ${eliminados} duplicados eliminados.`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
