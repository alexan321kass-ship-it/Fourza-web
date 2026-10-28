/* ==========================================
   FOURZA - SCRIPT.JS
   ========================================== */

function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    const toastItem = document.createElement("div");
    toastItem.className = "toast-item toast-success";
    toastItem.innerHTML = `<div class="toast-icon"><i class="fas fa-check-circle"></i></div><div class="toast-text">${message}</div>`;
    container.appendChild(toastItem);
    setTimeout(() => toastItem.classList.add("show"), 10);
    setTimeout(() => {
        toastItem.classList.remove("show");
        setTimeout(() => { if (toastItem.parentNode) toastItem.parentNode.removeChild(toastItem); }, 350);
    }, 3500);
}

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       MENU HAMBURGUESA
       ========================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle) {

        menuToggle.addEventListener("click", () => {

            navMenu.classList.toggle("active");

            const icon = menuToggle.querySelector("i");

            if (navMenu.classList.contains("active")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }

        });

    }

    /* ==========================================
       CERRAR MENU AL DAR CLICK
       ========================================== */

    document.querySelectorAll(".nav-menu a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

            if (menuToggle.querySelector("i")) {

                menuToggle.querySelector("i").classList.remove("fa-xmark");
                menuToggle.querySelector("i").classList.add("fa-bars");

            }

        });
    });

    document.querySelectorAll(".flip-card").forEach(card => {
        card.addEventListener("click", () => {
            card.classList.toggle("flipped");
        });
    });

    /* ==========================================
       CONTADORES ANIMADOS
       ========================================== */

    const counters = document.querySelectorAll(".counter");

    const startCounter = () => {

        counters.forEach(counter => {

            const target = +counter.getAttribute("data-target");

            let current = 0;

            const increment = target / 100;

            const updateCounter = () => {

                if (current < target) {

                    current += increment;

                    counter.innerText = Math.ceil(current);

                    requestAnimationFrame(updateCounter);

                } else {

                    counter.innerText = target;

                }

            };

            updateCounter();

        });

    };

    /* ==========================================
       OBSERVER PARA CONTADORES
       ========================================== */

    const statsSection = document.querySelector(".stats") || document.querySelector(".hero-proof");

    if (statsSection) {

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    startCounter();

                    observer.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.5
        });

        observer.observe(statsSection);

    }

    /* ==========================================
       HEADER AL HACER SCROLL
       ========================================== */

    const header = document.querySelector(".header");

    if (header && !header.classList.contains("header-static")) {

        const checkHeaderScroll = () => {

            if (window.scrollY > 30) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        };

        window.addEventListener("scroll", checkHeaderScroll);

        checkHeaderScroll();

    }

    /* ==========================================
       BOTON VOLVER ARRIBA
       ========================================== */

    const backToTop = document.createElement("button");

    backToTop.innerHTML = "↑";

    backToTop.classList.add("back-to-top");
    backToTop.setAttribute("aria-label", "Volver arriba");

    document.body.appendChild(backToTop);

    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

    window.addEventListener("scroll", () => {

        if (window.scrollY > 400) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });

    /* ==========================================
       ANIMACIONES SCROLL
       ========================================== */

    const revealElements = document.querySelectorAll(
        ".about, .mission-card, .product-card, .category-card, .benefit-card, .brand, .testimonial, .contact"
    );

    const revealObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show-element");

            }

        });

    }, {
        threshold: 0.15
    });

    revealElements.forEach(element => {

        element.classList.add("hidden-element");

        revealObserver.observe(element);

    });

    /* ==========================================
       EFECTO PARALLAX HERO
       ========================================== */

    const hero = document.querySelector(".hero");

    window.addEventListener("scroll", () => {

        let offset = window.pageYOffset;

        if (hero) {

            hero.style.backgroundPositionY = offset * 0.4 + "px";

        }

    });

    /* ==========================================
       EFECTO HOVER PRODUCTOS
       ========================================== */

    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach(card => {

        card.addEventListener("mouseenter", () => {

            card.style.transform = "translateY(-10px)";

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform = "translateY(0)";

        });

    });

    /* ==========================================
       FORMULARIO DEMO
       ========================================== */

    const form = document.querySelector(".contact-form");

    if (form) {

        form.addEventListener("submit", (e) => {

            e.preventDefault();

            const inputs = form.querySelectorAll("input, textarea");

            let valid = true;

            inputs.forEach(input => {

                if (input.value.trim() === "") {
                    valid = false;
                    input.style.borderColor = "red";
                } else if (input.type === "email") {
                    // Validación de email
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value.trim())) {
                        valid = false;
                        input.style.borderColor = "red";
                    } else {
                        input.style.borderColor = "#ddd";
                    }
                } else {
                    input.style.borderColor = "#ddd";
                }

            });

            if (!valid) {
                showToast("Por favor completa todos los campos correctamente. Verifica tu correo electrónico.");
                return;
            }

            // Enviar datos al backend
            const formData = {
                nombre: inputs[0].value,
                email: inputs[1].value,
                telefono: inputs[2].value,
                mensaje: inputs[3].value
            };

            fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showToast("¡Gracias por contactarnos! Pronto nos comunicaremos contigo.");
                        form.reset();
                    } else {
                        showToast("Hubo un error al enviar tu mensaje.");
                    }
                })
                .catch(err => {
                    console.error(err);
                    showToast("Error de conexión con el servidor.");
                });

        });

    }

});

/* ==========================================
   ESTILOS DINÁMICOS
   ========================================== */

const style = document.createElement("style");

style.innerHTML = `

.back-to-top{

    position:fixed;
    right:25px;
    bottom:100px;

    width:50px;
    height:50px;

    border:none;
    border-radius:50%;

    background:#F97316;
    color:white;

    font-size:24px;
    cursor:pointer;

    opacity:0;
    visibility:hidden;

    transition:.3s;

    z-index:999;
}

.back-to-top.show{

    opacity:1;
    visibility:visible;

}

.hidden-element{

    opacity:0;
    transform:translateY(40px);
    transition:all .8s ease;

}

.show-element{

    opacity:1;
    transform:translateY(0);

}

`;

document.head.appendChild(style);


/* ==========================================
   HERO SLIDER AUTOMATICO
========================================== */

const slides = document.querySelectorAll(".slide");

if (slides.length > 0) {

    let currentSlide = 0;

    function changeSlide() {

        slides[currentSlide].classList.remove("active");

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        slides[currentSlide].classList.add("active");

    }

    setInterval(changeSlide, 5000);

}

/* ==========================================
   CATÁLOGO DINÁMICO (CMS) Y FILTROS
   ========================================== */

const getProductsGrid = () => document.querySelector(".products-grid");
let filterBtns = document.querySelectorAll(".filter-btn");

// Mapa de imagen_url a sub-categoría para los nuevos filtros
const subcatMap = {
    '/img/vegano.svg': 'vegano',
    '/img/panaderia.svg': 'panaderia'
};

let allProductos = [];
let activeFilter = 'all';
let filterCatData = {}; // Para mapear slug -> nombre

async function fetchCategorias() {
    try {
        const res = await fetch("/api/categorias");
        if (res.ok) {
            const categorias = await res.json();
            const container = document.getElementById("dynamic-filters");
            if (container) {
                let html = '<button class="filter-btn active" data-filter="all">Todos</button>';
                categorias.forEach(c => {
                    filterCatData[c.slug] = c.nombre;
                    html += `<button class="filter-btn" data-filter="${c.slug}">${c.nombre}</button>`;
                });
                container.innerHTML = html;

                // Re-asignar los listeners a los nuevos botones
                filterBtns = document.querySelectorAll(".filter-btn");
                iniciarFiltros();
            } else {
                categorias.forEach(c => filterCatData[c.slug] = c.nombre);
            }
        }
    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}

// Fallback robusto con productos reales de Fourza en caso de que el backend no responda
const FALLBACK_PRODUCTOS = [
    {
        id: 3,
        titulo: "Granola Especial Fourza",
        descripcion: "Granola crocante con frutos secos, coco y miel seleccionada. Ideal para desayunos y meriendas saludables.",
        categoria: "alimentos",
        precio: "11.400",
        variantes: JSON.stringify([{ nombre: '250 G', precio: '8.500' }, { nombre: '500 G', precio: '11.400' }, { nombre: '1000 G', precio: '21.000' }]),
        imagen_url: "img/prod_alimentos.png"
    },
    {
        id: 4,
        titulo: "Granola Light Sin Azúcar Añadida",
        descripcion: "Granola ligera con avena tostada y semillas nutritivas. Presentación 400g.",
        categoria: "alimentos",
        precio: "8.700",
        imagen_url: "img/granola.svg"
    },
    {
        id: 6,
        titulo: "Granola Frutos Rojos Premium",
        descripcion: "Granola adicionada con deliciosos arándanos y fresas deshidratadas. 450g.",
        categoria: "alimentos",
        precio: "11.400",
        imagen_url: "img/granola.svg"
    },
    {
        id: 7,
        titulo: "Granola Frutos Secos & Almendras",
        descripcion: "Granola premium con alta concentración de almendras, nueces y maní tostado. 450g.",
        categoria: "alimentos",
        precio: "11.400",
        imagen_url: "img/prod_alimentos.png"
    },
    {
        id: 8,
        titulo: "Arroz Achocolatado Inflado",
        descripcion: "Crujiente y nutritivo arroz tostado sabor a chocolate. Favorito en desayunos.",
        categoria: "alimentos",
        precio: "6.900",
        variantes: JSON.stringify([{ nombre: '250 G', precio: '4.200' }, { nombre: '500 G', precio: '6.900' }]),
        imagen_url: "img/cereal.svg"
    },
    {
        id: 20,
        titulo: "Avena en Hojuela Entera",
        descripcion: "Avena 100% natural sin conservantes, rica en fibra y energía duradera.",
        categoria: "alimentos",
        precio: "5.500",
        variantes: JSON.stringify([{ nombre: '250 G', precio: '3.200' }, { nombre: '500 G', precio: '5.500' }, { nombre: '1000 G', precio: '9.800' }]),
        imagen_url: "img/cereal.svg"
    },
    {
        id: 38,
        titulo: "Caja de Cartón Corrugado Estándar",
        descripcion: "Cajas de alta resistencia para embalaje seguro de despachos y mercancías.",
        categoria: "embalaje",
        precio: "3.200",
        imagen_url: "img/prod_embalaje.png"
    },
    {
        id: 39,
        titulo: "Rollo de Vinipel Transparente 500m",
        descripcion: "Película extensible de polietileno de alta adherencia para paletizado y protección.",
        categoria: "embalaje",
        precio: "28.500",
        imagen_url: "img/vinipel.svg"
    },
    {
        id: 40,
        titulo: "Cinta de Embalaje Transparente 100m",
        descripcion: "Cinta adhesiva de máxima fijación para sellado de cajas y paquetes.",
        categoria: "embalaje",
        precio: "4.800",
        imagen_url: "img/cinta.svg"
    },
    {
        id: 23,
        titulo: "Harina de Trigo Especial Panadería",
        descripcion: "Harina de alta fuerza y excelente rendimiento para masas, panes y pastelería.",
        categoria: "panaderia",
        precio: "14.200",
        imagen_url: "img/panaderia.svg"
    },
    {
        id: 32,
        titulo: "Proteína Vegetal Texturizada",
        descripcion: "Base nutritiva 100% vegetal para recetas saludables y menús vegetarianos.",
        categoria: "vegetariana",
        precio: "9.500",
        imagen_url: "img/vegano.svg"
    },
    {
        id: 41,
        titulo: "Desengrasante y Limpiador Industrial",
        descripcion: "Fórmula de alta concentración para superficies y plantas de producción de alimentos.",
        categoria: "insumos",
        precio: "32.000",
        imagen_url: "img/prod_insumos.png"
    }
];

function showSkeletons(count = 8) {
    const grid = getProductsGrid();
    if (!grid) return;
    grid.innerHTML = Array.from({ length: count }, () => `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-body">
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line full"></div>
                    <div class="skeleton-line btn"></div>
                </div>
            </div>
        `).join('');
}

async function fetchProductos() {
    showSkeletons();
    await fetchCategorias();
    try {
        const res = await fetch("/api/productos");
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                allProductos = data;
                renderProductos(allProductos);
                return;
            }
        }
        allProductos = FALLBACK_PRODUCTOS;
        renderProductos(allProductos);
    } catch (error) {
        console.warn("Cargando catálogo local Fourza:", error);
        allProductos = FALLBACK_PRODUCTOS;
        renderProductos(allProductos);
    }
}

// Almacena productos globalmente para el modal
let _allProductos = [];

function resolverRutaImagen(url) {
    if (!url) return 'img/prod_alimentos.png';
    const isInCatalogo = window.location.pathname.includes('/catalogo/');
    if (isInCatalogo && !url.startsWith('/') && !url.startsWith('http') && !url.startsWith('../')) {
        return '../' + url;
    }
    return url;
}

function renderProductos(productos) {
    const grid = getProductsGrid();
    if (!grid) return;
    _allProductos = productos;

    if (productos.length === 0) {
        grid.innerHTML = "<p style='text-align:center;padding:60px;color:#888;grid-column:1/-1;'>No se encontraron productos en esta sección.</p>";
        return;
    }

    grid.innerHTML = productos.map(p => {
        const subcat = subcatMap[p.imagen_url] || p.categoria;

        let variants = [];
        try { 
            if (p.variantes) variants = typeof p.variantes === 'string' ? JSON.parse(p.variantes) : p.variantes; 
        } catch (e) { }

        const hasVariants = variants && variants.length > 0;

        // Calcular rango de precio o precio unitario
        let precioDisplay = '';
        if (hasVariants) {
            const precios = variants.map(v => v.precio).filter(Boolean);
            if (precios.length > 1) {
                precioDisplay = `$${precios[0]} – $${precios[precios.length - 1]}`;
            } else if (precios.length === 1) {
                precioDisplay = `$${precios[0]}`;
            }
        } else if (p.precio && p.precio !== 'Consultar') {
            precioDisplay = p.precio.startsWith('$') ? p.precio : `$${p.precio}`;
        }

        const catLabel = filterCatData[p.categoria] || (p.categoria ? p.categoria.toUpperCase() : 'FOURZA');
        const imgSrc = resolverRutaImagen(p.imagen_url);

        const btnLabel = (hasVariants && variants.length > 1)
            ? '<i class="fas fa-sliders"></i> Elegir Presentación'
            : '<i class="fas fa-bag-shopping"></i> Añadir al Carrito';

        return `
            <div class="product-card" 
                data-category="${p.categoria || ''}" 
                data-subcat="${subcat}" 
                data-titulo="${(p.titulo || '').toLowerCase()}"
                onclick="abrirProductoModal(${p.id})"
                role="button" tabindex="0"
                aria-label="Ver detalle de ${p.titulo}">
                <div class="product-card-img-wrap">
                    <img src="${imgSrc}" alt="${p.titulo}" loading="lazy" onerror="this.onerror=null; this.src='img/prod_alimentos.png';">
                    <div class="product-card-overlay">
                        <span class="quick-view-badge"><i class="fas fa-eye"></i> Vista Rápida</span>
                    </div>
                    <span class="product-card-badge">${catLabel}</span>
                </div>
                <div class="product-info">
                    <span class="product-card-cat-small">${catLabel}</span>
                    <h3 class="product-card-title">${p.titulo}</h3>
                    <div class="product-card-price-row">
                        ${precioDisplay ? `<span class="product-card-price">${precioDisplay}</span>` : '<span class="product-card-price consult">Precio Mayorista</span>'}
                    </div>
                    <button class="btn-add-cart" onclick="handleCardAddToCart(event, ${p.id})" aria-label="Añadir ${p.titulo} al carrito">
                        ${btnLabel}
                    </button>
                </div>
            </div>`;
    }).join('');

    iniciarFiltros();
    iniciarBusqueda();
}

// ---- MODAL DE DETALLE DE PRODUCTO ----
window.abrirProductoModal = function (id) {
    const p = _allProductos.find(x => x.id === id);
    if (!p) return;

    let variants = [];
    try { if (p.variantes) variants = JSON.parse(p.variantes); } catch (e) { }
    const hasVariants = variants && variants.length > 0;

    // Precio rango
    let precioDisplay = '';
    if (hasVariants) {
        const precios = variants.map(v => v.precio).filter(Boolean);
        precioDisplay = precios.length > 1 ? `${precios[0]} – ${precios[precios.length - 1]}` : (precios[0] || '');
    } else {
        precioDisplay = p.precio || '';
    }

    const catLabel = filterCatData[p.categoria] || p.categoria;

    // Pills de variantes
    const variantsPills = hasVariants ? `
            <div class="pdm-variants">
                <span class="pdm-variants-label">Presentación</span>
                <div class="pdm-pills" id="pdm-pills">
                    ${variants.map((v, i) => `
                        <button type="button" 
                            class="pdm-pill${i === 0 ? ' active' : ''}"
                            data-precio="${v.precio}"
                            data-nombre="${v.nombre}"
                            onclick="seleccionarVarianteModal(this)">
                            ${v.nombre}
                        </button>`).join('')}
                </div>
            </div>` : '';

    const overlay = document.getElementById('product-detail-overlay');
    const modal = document.getElementById('product-detail-modal');
    if (!overlay || !modal) return;

    modal.innerHTML = `
            <button class="pdm-close" onclick="cerrarProductoModal()" aria-label="Cerrar">&times;</button>
            <div class="pdm-body">
                <div class="pdm-image-section">
                    <div class="pdm-main-img-wrap">
                        <span class="pdm-cat-tag">${catLabel}</span>
                        <img id="pdm-main-img" src="${p.imagen_url}" alt="${p.titulo}">
                    </div>
                    <div class="pdm-meta-footer">
                        <span><strong>SKU:</strong> FRZ-${p.id.toString().padStart(4, '0')}</span>
                        <span><strong>Categoría:</strong> ${catLabel}</span>
                    </div>
                </div>
                <div class="pdm-info-section">
                    <h2 class="pdm-title">${p.titulo}</h2>
                    <div class="pdm-price-block">
                        <p id="pdm-price" class="pdm-price">${precioDisplay}</p>
                    </div>
                    
                    <p class="pdm-desc">${p.descripcion}</p>
                    
                    <hr class="pdm-divider">
                    
                    ${variantsPills}
                    
                    <div class="pdm-actions-container">
                        <div class="pdm-stepper">
                            <button type="button" class="pdm-step-btn" onclick="cambiarCantidadModal(-1)"><i class="fas fa-minus"></i></button>
                            <span class="pdm-step-val" id="pdm-qty">1</span>
                            <button type="button" class="pdm-step-btn" onclick="cambiarCantidadModal(1)"><i class="fas fa-plus"></i></button>
                        </div>
                        <button class="pdm-add-btn" id="pdm-add-btn"
                            data-id="${hasVariants ? id + '-' + variants[0].nombre : id}"
                            data-base-titulo="${p.titulo}"
                            data-titulo="${hasVariants ? p.titulo + ' (' + variants[0].nombre + ')' : p.titulo}"
                            data-imagen="${p.imagen_url}"
                            data-categoria="${p.categoria}"
                            data-precio="${hasVariants ? (variants[0].precio || '') : (p.precio || '')}"
                            onclick="handleAddToCartModal(this)">
                            <i class="fas fa-bag-shopping"></i> Añadir al carrito
                        </button>
                    </div>
                </div>
            </div>`;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('visible'));
};

window.cerrarProductoModal = function () {
    const overlay = document.getElementById('product-detail-overlay');
    if (!overlay) return;
    overlay.classList.remove('visible');
    setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }, 280);
};

window.seleccionarVarianteModal = function (pill) {
    document.querySelectorAll('#pdm-pills .pdm-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const precio = pill.getAttribute('data-precio');
    const nombre = pill.getAttribute('data-nombre');
    const priceEl = document.getElementById('pdm-price');
    if (priceEl) priceEl.textContent = precio;
    const btn = document.getElementById('pdm-add-btn');
    if (btn) {
        const base = btn.getAttribute('data-base-titulo');
        const baseId = btn.getAttribute('data-id').split('-')[0];
        btn.setAttribute('data-id', `${baseId}-${nombre}`);
        btn.setAttribute('data-titulo', `${base} (${nombre})`);
        btn.setAttribute('data-precio', precio);
    }
};

window.cambiarCantidadModal = function (delta) {
    const el = document.getElementById('pdm-qty');
    if (!el) return;
    let v = Math.max(1, Math.min(99, (parseInt(el.textContent) || 1) + delta));
    el.textContent = v;
};

window.handleAddToCartModal = function (btn) {
    const qty = parseInt(document.getElementById('pdm-qty')?.textContent) || 1;
    const product = {
        id: btn.dataset.id,
        titulo: btn.dataset.titulo,
        imagen_url: btn.dataset.imagen,
        categoria: btn.dataset.categoria,
        precio: btn.dataset.precio,
    };
    if (typeof Cart !== 'undefined') Cart.addQty(product, qty);

    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
    btn.classList.add('added');
    btn.disabled = true;
    document.getElementById('pdm-qty').textContent = '1';

    setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.remove('added');
        btn.disabled = false;
    }, 1600);
};

window.handleCardAddToCart = function (e, id) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const p = _allProductos.find(x => x.id === id);
    if (!p) return;

    let variants = [];
    try { 
        if (p.variantes) variants = typeof p.variantes === 'string' ? JSON.parse(p.variantes) : p.variantes; 
    } catch (err) { }
    const hasVariants = variants && variants.length > 0;

    // Si tiene múltiples variantes (ej: 250g, 500g, 1000g), abrir modal para que elija la presentación
    if (hasVariants && variants.length > 1) {
        abrirProductoModal(id);
        return;
    }

    let precio = p.precio || '';
    let itemTitulo = p.titulo;
    let itemId = p.id;
    if (hasVariants && variants.length === 1) {
        precio = variants[0].precio || precio;
        itemTitulo = `${p.titulo} (${variants[0].nombre})`;
        itemId = `${p.id}-${variants[0].nombre}`;
    }

    const item = {
        id: itemId,
        titulo: itemTitulo,
        imagen_url: p.imagen_url,
        categoria: p.categoria,
        precio: precio
    };

    if (typeof Cart !== 'undefined') {
        Cart.add(item);
    }

    // Feedback visual en el botón
    const btn = e ? e.currentTarget : null;
    if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
        btn.classList.add('added');
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('added');
        }, 1400);
    }
};

window.filterBySlug = function(slug) {
    activeFilter = slug;
    const storeSec = document.getElementById('tienda') || document.getElementById('productos');
    if (storeSec) {
        storeSec.scrollIntoView({ behavior: 'smooth' });
    }
    document.querySelectorAll(".filter-btn").forEach(b => {
        if (b.getAttribute("data-filter") === slug) {
            b.classList.add("active");
        } else {
            b.classList.remove("active");
        }
    });
    document.querySelectorAll(".cat-pill").forEach(p => {
        if (p.getAttribute("data-filter") === slug) {
            p.classList.add("active");
        } else {
            p.classList.remove("active");
        }
    });
    aplicarFiltros();
};

function aplicarFiltros() {
    const productCards = document.querySelectorAll(".product-card");
    const searchVal = document.getElementById('catalog-search')?.value || document.getElementById('header-search')?.value || '';
    const searchTerm = searchVal.trim().toLowerCase();

    productCards.forEach(card => {
        const cat = card.getAttribute("data-category") || '';
        const subcat = card.getAttribute("data-subcat") || '';
        const titulo = card.getAttribute("data-titulo") || '';

        let matchFilter = false;
        if (activeFilter === 'all') {
            matchFilter = true;
        } else if (activeFilter === 'vegano' || activeFilter === 'panaderia') {
            matchFilter = (subcat === activeFilter || cat === activeFilter);
        } else {
            matchFilter = (cat.toLowerCase() === activeFilter.toLowerCase());
        }

        const matchSearch = searchTerm === '' || titulo.includes(searchTerm) || cat.toLowerCase().includes(searchTerm);

        if (matchFilter && matchSearch) {
            card.style.display = "flex";
            card.style.animation = "fadeIn 0.3s ease";
        } else {
            card.style.display = "none";
        }
    });
}

function iniciarFiltros() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeFilter = btn.getAttribute("data-filter");
            aplicarFiltros();
        };
    });
}

function iniciarBusqueda() {
    const inputs = ['catalog-search', 'header-search', 'store-search'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.oninput = (e) => {
            const val = e.target.value;
            // Sincronizar otros inputs si existen
            inputs.forEach(otherId => {
                const otherEl = document.getElementById(otherId);
                if (otherEl && otherEl !== e.target) otherEl.value = val;
            });
            aplicarFiltros();
        };
        el.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const storeSec = document.getElementById('tienda') || document.getElementById('productos');
                if (storeSec) storeSec.scrollIntoView({ behavior: 'smooth' });
            }
        };
    });
}

// Llamar a la carga de productos al inicio
fetchProductos();

/* ------ Cerrar modal al hacer clic en el fondo ------ */
window.cerrarProductoModalOverlay = function (e) {
    if (e.target === document.getElementById('product-detail-overlay')) {
        cerrarProductoModal();
    }
};

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarProductoModal();
});

/* ------ Función global para agregar al carrito (tarjetas normales) ------ */
function handleAddToCart(btn) {
    const qtyId = btn.getAttribute('data-qty-id');
    const qty = qtyId ? (parseInt(document.getElementById(qtyId)?.textContent) || 1) : 1;

    const product = {
        id: btn.dataset.id,
        titulo: btn.dataset.titulo,
        imagen_url: btn.dataset.imagen,
        categoria: btn.dataset.categoria,
        precio: btn.dataset.precio,
    };

    if (typeof Cart !== 'undefined') {
        Cart.addQty(product, qty);
    }

    // Feedback visual
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Agregado';
    btn.classList.add('added');
    btn.disabled = true;

    // Reset cantidad a 1 tras agregar
    if (qtyId) {
        const qtyEl = document.getElementById(qtyId);
        if (qtyEl) qtyEl.textContent = '1';
    }

    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('added');
        btn.disabled = false;
    }, 1500);
}

/* ==========================================
   MODAL COTIZACION
========================================== */

const modal = document.getElementById("quoteModal");
const openButtons = document.querySelectorAll(".open-modal");
const closeModal = document.querySelector(".close-modal");

if (modal) {

    openButtons.forEach(button => {

        button.addEventListener("click", (e) => {

            e.preventDefault();

            modal.classList.add("show");

        });

    });

    if (closeModal) {
        closeModal.addEventListener("click", () => {
            modal.classList.remove("show");
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    });

}

/* ==========================================
   ENVIO DEMO
========================================== */

const quoteForm = document.getElementById("quoteForm");

if (quoteForm) quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputs = quoteForm.querySelectorAll("input, select, textarea");

    const formData = {
        nombre: inputs[0].value,
        email: inputs[1].value,

        telefono: inputs[2].value,
        categoria: inputs[3].value,
        descripcion: inputs[4].value
    };

    fetch('/api/cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                quoteForm.reset();
                if (modal) modal.classList.remove("show");
                if (modal) modal.classList.remove("active");
                showToast("¡Gracias! Hemos recibido tu mensaje.");
            } else {
                showToast("Hubo un error al enviar tu mensaje.");
            }
        })
        .catch(err => {
            console.error(err);
            showToast("Error de conexión con el servidor.");
        });
});

/* ==========================================
   TESTIMONIAL SLIDER
========================================== */

const testimonialSlides = document.querySelectorAll(".testimonial-slide");
const testimonialDots = document.querySelectorAll(".testimonial-dot");

if (testimonialSlides.length > 0) {

    let testimonialIndex = 0;

    function showTestimonial(index) {

        testimonialSlides.forEach(slide => slide.classList.remove("active"));
        testimonialDots.forEach(dot => dot.classList.remove("active"));

        testimonialSlides[index].classList.add("active");
        testimonialDots[index].classList.add("active");

    }

    function nextTestimonial() {

        testimonialIndex++;

        if (testimonialIndex >= testimonialSlides.length) {
            testimonialIndex = 0;
        }

        showTestimonial(testimonialIndex);

    }

    setInterval(nextTestimonial, 5000);

    /* CLICK EN DOTS */

    testimonialDots.forEach((dot, index) => {

        dot.addEventListener("click", () => {

            testimonialIndex = index;
            showTestimonial(index);

        });

    });

}

/* ==========================================
   LIGHTBOX GALLERY
========================================== */

const galleryImages = document.querySelectorAll(".gallery-item img");
const lightbox = document.querySelector(".lightbox");
const lightboxImg = document.querySelector(".lightbox-img");
const lightboxClose = document.querySelector(".lightbox-close");

if (lightbox && lightboxClose) {

    galleryImages.forEach(image => {

        image.addEventListener("click", () => {

            lightbox.classList.add("show");
            lightboxImg.src = image.src;

        });

    });

    lightboxClose.addEventListener("click", () => {

        lightbox.classList.remove("show");

    });

    lightbox.addEventListener("click", (e) => {

        if (e.target === lightbox) {
            lightbox.classList.remove("show");
        }

    });

}

const fadeElements =
    document.querySelectorAll(
        '.section-title,.product-card,.category-card,.benefit-card,.brand,.gallery-item,.testimonial,.about-content,.about-image'
    );

const fadeObserver =
    new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add('show');

            }

        });

    }, {
        threshold: 0.15
    });

fadeElements.forEach(element => {

    element.classList.add('fade-up');

    fadeObserver.observe(element);

});

/* ==========================================
   PRELOADER
========================================== */

function ocultarPreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader && !preloader.classList.contains('hide')) {
        preloader.classList.add('hide');
    }
}

window.addEventListener('load', ocultarPreloader);
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(ocultarPreloader, 600);
});
// Respaldo de seguridad para que jamás se quede congelado
setTimeout(ocultarPreloader, 2000);

/* ==========================================
   MODAL PROMOCIONAL
========================================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Array con todos los selectores de modales activos en tu HTML
    const modales = [
        { modal: document.getElementById("promoModal"), closeBtn: document.querySelector(".promo-close") },
        { modal: document.getElementById("quoteModal"), closeBtn: document.querySelector(".close-modal") }
    ];

    modales.forEach(item => {
        if (item.modal) {
            // Acción de cerrar removiendo la clase 'active'
            const cerrar = () => item.modal.classList.remove("active");

            // Cierre al dar clic en su botón X correspondiente
            if (item.closeBtn) {
                item.closeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    cerrar();
                });
            }

            // Cierre al hacer clic afuera (En el fondo difuminado)
            item.modal.addEventListener("click", (e) => {
                // Si el clic es exactamente en el envoltorio oscuro exterior y no adentro
                if (e.target === item.modal) {
                    cerrar();
                }
            });
        }
    });
});

/* Funcionalidad Pestañas Mision y Vision */
function openMVTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("mv-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("mv-tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

/* ==========================================
   CARGAR TESTIMONIOS Y LOGICA DEL CARRUSEL CLASICO
========================================== */
document.addEventListener("DOMContentLoaded", async () => {
    const track = document.querySelector(".carousel-track");
    if (!track) return;

    try {
        const res = await fetch("/api/resenas");
        const resenas = await res.json();
        
        if (resenas && resenas.length > 0) {
            let html = "";
            resenas.forEach((r, index) => {
                const numEstrellas = parseInt(r.calificacion) || 5;
                let estrellasHtml = "";
                for(let i=0; i<numEstrellas; i++) estrellasHtml += '<i class="fas fa-star"></i>';
                
                const comentarioText = r.comentario ? `"${r.comentario}"` : '"Excelente servicio y atencin."';
                const activeClass = index === 0 ? "active" : "";
                
                html += `
                <div class="classic-testi-card ${activeClass}">
                    <div class="testi-stars">${estrellasHtml}</div>
                    <p>${comentarioText}</p>
                    <div class="testi-author-info">
                        <div class="author-avatar"><i class="fas fa-user-check"></i></div>
                        <div>
                            <h4>${r.nombre_cliente}</h4>
                            <span>Cliente Verificado</span>
                        </div>
                    </div>
                </div>
                `;
            });
            
            // Reemplazar los estaticos por los dinamicos
            track.innerHTML = html;
            
            // Actualizar dots
            const dotsContainer = document.querySelector(".carousel-indicators");
            if (dotsContainer) {
                let dotsHtml = "";
                for(let i=0; i<resenas.length; i++) {
                    dotsHtml += `<span class="dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></span>`;
                }
                dotsContainer.innerHTML = dotsHtml;
            }
        }
    } catch (error) {
        console.log("Testimonios dinámicos no disponibles, usando estáticos.");
    }

    // Inicializar Lógica del Carrusel
    const cards = document.querySelectorAll('.classic-testi-card');
    const dots = document.querySelectorAll('.carousel-indicators .dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;
    let autoPlayInterval;

    function updateCarousel() {
        // Move track
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });

        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }

    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
                resetAutoPlay();
            });
        });
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Pause on hover
    const carouselContainer = document.querySelector('.classic-carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
});

/* ==========================================
   EASTER EGG ADMIN ACCESS (SECRETO)
========================================== */
let secretCode = "admin";
let typedCode = "";

document.addEventListener("keydown", (e) => {
    // Si el usuario está escribiendo en un input o textarea, ignorar
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    typedCode += e.key.toLowerCase();

    // Mantener la longitud de lo escrito igual a la longitud del código
    if (typedCode.length > secretCode.length) {
        typedCode = typedCode.substring(typedCode.length - secretCode.length);
    }

    // Si coincide, redirigir al panel de administración
    if (typedCode === secretCode) {
        window.location.href = "/admin.html";
    }
});
