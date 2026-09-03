const db = require('./database');

const defaults = [
    // --- GRANOLAS ---
    {
        titulo: "GRANOLA ESPECIAL X 250 G",
        descripcion: "Granola crocante con frutos secos, coco y semillas seleccionadas. Presentación de 250g.",
        categoria: "alimentos",
        imagen_url: "/img/granola.svg"
    },
    {
        titulo: "GRANOLA ESPECIAL X 500 G",
        descripcion: "Granola crocante con frutos secos, coco y semillas seleccionadas. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/granola.svg"
    },
    {
        titulo: "GRANOLA ESPECIAL X 1000 G",
        descripcion: "Granola crocante con frutos secos, coco y semillas seleccionadas. Presentación de 1000g.",
        categoria: "alimentos",
        imagen_url: "/img/granola.svg"
    },
    {
        titulo: "GRANOLA LIGHT X 400",
        descripcion: "Granola ligera con bajo contenido de azúcar, perfecta para desayunos saludables. Presentación de 400g.",
        categoria: "alimentos",
        imagen_url: "/img/granola.svg"
    },
    {
        titulo: "GRANOLA FRUTOS X 500 G",
        descripcion: "Granola con una mezcla especial de frutos deshidratados y miel natural. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/granola.svg"
    },
    {
        titulo: "GRANOLA FRUTOS ROJOS X 450 G",
        descripcion: "Granola adicionada con deliciosos frutos rojos y arándanos deshidratados. Presentación de 450g.",
        categoria: "alimentos",
        imagen_url: "/img/granola.svg"
    },
    {
        titulo: "GRANOLA FRUTOS SECOS X 450 G",
        descripcion: "Granola premium con alta concentración de almendras, nueces y maní. Presentación de 450g.",
        categoria: "alimentos",
        imagen_url: "/img/granola.svg"
    },

    // --- CEREALES Y AVENA ---
    {
        titulo: "ARROZ ACHOCOLATADO X 250 G",
        descripcion: "Delicioso arroz inflado achocolatado, crujiente y nutritivo. Presentación de 250g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "ARROZ ACHOCOLATADO X 500 G",
        descripcion: "Delicioso arroz inflado achocolatado, crujiente y nutritivo. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "ARITOS TROPICALES X 250 G",
        descripcion: "Aritos de cereal sabor a frutas tropicales, ideales para niños. Presentación de 250g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "ARITOS TROPICALES X 500 G",
        descripcion: "Aritos de cereal sabor a frutas tropicales, ideales para niños. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "HOJUELAS AZUCARADAS X 250 G",
        descripcion: "Hojuelas de maíz tostadas y azucaradas para un desayuno lleno de energía. Presentación de 250g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "HOJUELAS AZUCARADAS X 500 G",
        descripcion: "Hojuelas de maíz tostadas y azucaradas para un desayuno lleno de energía. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "HOJUELAS NATURALES X 250 G",
        descripcion: "Hojuelas de maíz natural tostadas sin azúcar añadida. Presentación de 250g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "HOJUELAS NATURALES X 500 G",
        descripcion: "Hojuelas de maíz natural tostadas sin azúcar añadida. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "KIT DE CEREAL X 3",
        descripcion: "Práctico paquete surtido con 3 de nuestros mejores cereales en porciones de muestra.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "SNACK BARRA DE CEREAL X 12UND",
        descripcion: "Barras de cereal nutritivas para llevar y consumir en cualquier momento. Caja de 12 unidades.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "COOKIE LONCHERITA X 600 G",
        descripcion: "Galletas crujientes y deliciosas para merienda. Presentación familiar de 600g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "MI LONCHERITA X 340 G",
        descripcion: "Mezcla de cereales y snacks para la lonchera escolar. Presentación de 340g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "AVENA EN HOJUELA X 250 G",
        descripcion: "Avena entera en hojuelas de alta calidad, fuente de fibra natural. Presentación de 250g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "AVENA EN HOJUELA X 500 G",
        descripcion: "Avena entera en hojuelas de alta calidad, fuente de fibra natural. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },
    {
        titulo: "AVENA EN HOJUELA X 1000 G",
        descripcion: "Avena entera en hojuelas de alta calidad, fuente de fibra natural. Presentación de 1000g.",
        categoria: "alimentos",
        imagen_url: "/img/cereal.svg"
    },

    // --- PANADERÍA ---
    {
        titulo: "MOGOLLA DE CENTENO X 12",
        descripcion: "Mogollas tradicionales elaboradas con harina de centeno integral. Paquete de 12 unidades.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },
    {
        titulo: "TAJADO DE AVENA SIN DULCE X 500 G",
        descripcion: "Pan tajado con avena, sin azúcares añadidos. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },
    {
        titulo: "TAJADO B REVA X 650 G",
        descripcion: "Pan tajado blanco de excelente suavidad y frescura. Presentación de 650g.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },
    {
        titulo: "TAJADO PIÑA X 650 G",
        descripcion: "Pan tajado especial con toques y aroma a piña. Presentación de 650g.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },
    {
        titulo: "TAJADO UVA NUEZ X 650 G",
        descripcion: "Pan tajado premium con uvas pasas y trocitos de nuez. Presentación de 650g.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },
    {
        titulo: "TAJADO OCHO GRANOS X 500 G",
        descripcion: "Pan tajado multigrano, rico en fibra y nutrientes. Presentación de 500g.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },
    {
        titulo: "CASERITAS X 14 UND",
        descripcion: "Galletas caseras tradicionales crujientes y suaves. Paquete de 14 unidades.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },
    {
        titulo: "TURRON X 12 UND",
        descripcion: "Turrones tradicionales dulces de textura crujiente. Paquete de 12 unidades.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },
    {
        titulo: "TORTA X 10 UND",
        descripcion: "Porciones de torta suave y esponjosa de sabor tradicional. Caja de 10 unidades.",
        categoria: "alimentos",
        imagen_url: "/img/panaderia.svg"
    },

    // --- VEGANOS ---
    {
        titulo: "CHORIZO VEGANO COCTEL X250 X 15UND",
        descripcion: "Chorizos veganos tamaño cóctel a base de proteína vegetal. Contiene 15 unidades (250g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "JAMON VEGANO X 270 X 9 UND",
        descripcion: "Tajadas de jamón vegano, textura y sabor idénticos al tradicional. Contiene 9 unidades (270g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "SALAMI VEGANO X 250 X 18 UND",
        descripcion: "Salami vegano sazonado con especias finas. Contiene 18 tajadas (250g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "MUCHACHO RELLENO X 300 X 5 UND",
        descripcion: "Muchacho relleno vegano, ideal para festividades y cenas especiales. Contiene 5 porciones (300g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "SALCHICHA VEGANA AMERICANA X 320 X 5 UND",
        descripcion: "Salchichas veganas estilo americano, perfectas para asar. Contiene 5 unidades (320g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "CHORIZO VEGANO X 270 X 6 UND",
        descripcion: "Chorizos veganos de tamaño estándar para asados o guisos. Contiene 6 unidades (270g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "SALCHICHA VEGANA X 270 X 5 UND",
        descripcion: "Salchichas veganas tradicionales para hot dogs y comidas rápidas. Contiene 5 unidades (270g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "SALCHICHON VEGANO X 500 X 1 UND",
        descripcion: "Salchichón vegano de tamaño familiar, perfecto para compartir. Bloque de 500g (1 unidad).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "ALBONDIGAS VEGANAS X 240 X 8 UND",
        descripcion: "Albóndigas veganas de gran sabor, listas para cocinar en salsa. Contiene 8 unidades (240g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "HAMBURGUESA VEGANA X350 X5 UND",
        descripcion: "Hamburguesas veganas jugosas y ricas en proteína vegetal. Contiene 5 unidades (350g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "SALCHICHA VEGANA PERRO X250 X5 UND",
        descripcion: "Salchichas veganas largas especiales para hot dogs. Contiene 5 unidades (250g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "CHURRASCO VEGANO X 360 X 3 UND",
        descripcion: "Churrascos de base vegetal para asar, sazonados al punto. Contiene 3 porciones (360g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "MEDALLONES X 250 X 18",
        descripcion: "Medallones de carne vegetal ideales para acompañar almuerzos. Paquete de 18 porciones (250g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "CARNE VEGANA PARA ASAR X360 X 3 UND",
        descripcion: "Filetes de carne vegana con sabor ahumado para asar. Contiene 3 unidades (360g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "SEITAN X 350 X 5 UND",
        descripcion: "Seitán vegano tradicional rico en proteína de trigo. Contiene 5 porciones (350g).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "TOFU X 400G",
        descripcion: "Tofu natural extra firme, rico en calcio y proteína de soya. Presentación de 400g.",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },
    {
        titulo: "TAMAL X 400 X 1 UND",
        descripcion: "Tamal vegano tradicional, envuelto en hoja de plátano con relleno vegetal. Presentación de 400g (1 unidad).",
        categoria: "alimentos",
        imagen_url: "/img/vegano.svg"
    },

    // --- EMBALAJE (Cintas y Vinipel Alimentos) ---
    {
        titulo: "VINIPEL DE ALIMENTOS 3000 MT X 30 CM X 9,5 KG",
        descripcion: "Película extensible de PVC apta para contacto directo con alimentos. 3000m de largo, 30cm de ancho y 9.5kg.",
        categoria: "embalaje",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "CINTA DE ENMASCARAR MULTIPRO 12MM X 20 M",
        descripcion: "Cinta de papel crepé multiusos, excelente adherencia y fácil de remover. Medidas: 12 mm x 20 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA DE ENMASCARAR MULTIPRO 18MM X 20 M",
        descripcion: "Cinta de papel crepé multiusos, excelente adherencia y fácil de remover. Medidas: 18 mm x 20 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA DE ENMASCARAR MULTIPRO 24MM X 20 M",
        descripcion: "Cinta de papel crepé multiusos, excelente adherencia y fácil de remover. Medidas: 24 mm x 20 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA DE ENMASCARAR MULTIPRO 36MM X 20 M",
        descripcion: "Cinta de papel crepé de uso general, perfecta para marcar y proteger superficies. Medidas: 36 mm x 20 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA DE ENMASCARAR MULTIPRO 48MM X 20 M",
        descripcion: "Cinta de papel crepé de uso general, perfecta para marcar y proteger superficies. Medidas: 48 mm x 20 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA ADHESIVA TRANSPARENTE 48MM X 100M",
        descripcion: "Cinta de empaque transparente de alta adhesión para cerrado de cajas. Medidas: 48 mm x 100 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA ADHESIVA TRANSPARENTE 48MM X 200M",
        descripcion: "Cinta de empaque transparente de alta adhesión para cerrado de cajas. Medidas: 48 mm x 200 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA ADHESIVA TRANSPARENTE 48MM X 300M",
        descripcion: "Cinta de empaque transparente de alta resistencia, ideal para uso comercial. Medidas: 48 mm x 300 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA ADHESIVA TRANSPARENTE 48MM X 500M",
        descripcion: "Cinta de empaque transparente de larga duración para uso industrial de alto volumen. Medidas: 48 mm x 500 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },
    {
        titulo: "CINTA DOBLE FAZ 12MM X 50M",
        descripcion: "Cinta con adhesivo por ambas caras, excelente para fijaciones ligeras y manualidades. Medidas: 12 mm x 50 m.",
        categoria: "embalaje",
        imagen_url: "/img/cinta.svg"
    },

    // --- INSUMOS (Vinipel Industrial) ---
    {
        titulo: "VINIPEL INDUSTRIAL 12,5 CM X 325 G",
        descripcion: "Película estirable transparente para paletizado y protección de productos. Ancho: 12.5 cm. Peso: 325g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 12,5 CM X 525 G",
        descripcion: "Película estirable transparente para paletizado y protección de productos. Ancho: 12.5 cm. Peso: 525g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 15 CM X 390 G",
        descripcion: "Película estirable transparente para asegurar cargas ligeras y embalaje. Ancho: 15 cm. Peso: 390g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 15 CM X 630 G",
        descripcion: "Película estirable transparente para asegurar cargas ligeras y embalaje. Ancho: 15 cm. Peso: 630g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 20 CM X 520 G",
        descripcion: "Película extensible transparente de alta elasticidad para embalar bultos. Ancho: 20 cm. Peso: 520g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 20 CM X 840 G",
        descripcion: "Película extensible transparente de alta elasticidad para embalar bultos. Ancho: 20 cm. Peso: 840g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 30 CM X 780 G",
        descripcion: "Película estirable transparente para paletizado manual de cajas de tamaño medio. Ancho: 30 cm. Peso: 780g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 30 CM X 1260 G",
        descripcion: "Película estirable transparente para paletizado manual de cajas de tamaño medio. Ancho: 30 cm. Peso: 1260g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 45 CM X 1170 G",
        descripcion: "Película estirable para estibas grandes, asegura estabilidad durante el transporte. Ancho: 45 cm. Peso: 1170g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 45 CM X 1890 G",
        descripcion: "Película estirable para estibas grandes, asegura estabilidad durante el transporte. Ancho: 45 cm. Peso: 1890g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 50 CM X 1300 G",
        descripcion: "Película estirable industrial de máximo ancho para estibados estándar. Ancho: 50 cm. Peso: 1300g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL 50 CM X 2100 G",
        descripcion: "Película estirable industrial de máximo ancho para estibados estándar. Ancho: 50 cm. Peso: 2100g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 12,5 CM X 325 G",
        descripcion: "Película estirable de color negro que oculta y protege mercadería valiosa. Ancho: 12.5 cm. Peso: 325g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 12,5 CM X 525 G",
        descripcion: "Película estirable de color negro que oculta y protege mercadería valiosa. Ancho: 12.5 cm. Peso: 525g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 15 CM X 390 G",
        descripcion: "Película estirable negra de alta opacidad y resistencia contra rasgados. Ancho: 15 cm. Peso: 390g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 15 CM X 630 G",
        descripcion: "Película estirable negra de alta opacidad y resistencia contra rasgados. Ancho: 15 cm. Peso: 630g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 20 CM X 520 G",
        descripcion: "Película extensible negra ideal para paletizados y bultos opacos. Ancho: 20 cm. Peso: 520g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 20 CM X 840 G",
        descripcion: "Película extensible negra ideal para paletizados y bultos opacos. Ancho: 20 cm. Peso: 840g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 30 CM X 780 G",
        descripcion: "Película estirable de color negro que previene la visibilidad del contenido y lo protege del sol. Ancho: 30 cm. Peso: 780g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 30 CM X 1260 G",
        descripcion: "Película estirable de color negro que previene la visibilidad del contenido y lo protege del sol. Ancho: 30 cm. Peso: 1260g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 45 CM X 1170 G",
        descripcion: "Película de empaque estirable negra, perfecta para proteger estibas grandes del polvo y miradas. Ancho: 45 cm. Peso: 1170g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 45 CM X 1890 G",
        descripcion: "Película de empaque estirable negra, perfecta para proteger estibas grandes del polvo y miradas. Ancho: 45 cm. Peso: 1890g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 50 CM X 1300 G",
        descripcion: "Película estirable negra extra ancha de grado industrial para máxima confidencialidad. Ancho: 50 cm. Peso: 1300g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    },
    {
        titulo: "VINIPEL INDUSTRIAL NEGRO 50 CM X 2100 G",
        descripcion: "Película estirable negra extra ancha de grado industrial para máxima confidencialidad. Ancho: 50 cm. Peso: 2100g.",
        categoria: "insumos",
        imagen_url: "/img/vinipel.svg"
    }
];

setTimeout(() => {
    db.get("SELECT COUNT(*) as count FROM productos", (err, row) => {
        if (row && row.count === 0) {
            console.log("Poblando base de datos inicial...");
            const stmt = db.prepare(`INSERT INTO productos (titulo, descripcion, categoria, imagen_url) VALUES (?, ?, ?, ?)`);
            defaults.forEach(p => {
                stmt.run(p.titulo, p.descripcion, p.categoria, p.imagen_url);
            });
            stmt.finalize();
            console.log(`Productos iniciales agregados: ${defaults.length}`);
        } else {
            console.log("La base de datos ya tiene productos.");
        }
    });
}, 1500);

module.exports = { defaults };
