/* ==========================================
   FOURZA - CART.JS
   Sistema de Carrito de Compras / Cotización
   ========================================== */

const Cart = (() => {

    /* ------ Estado del Carrito ------ */
    let items = JSON.parse(localStorage.getItem('fourza_cart') || '[]');

    /* ------ Configuración ------ */
    const MINIMUM_ORDER_AMOUNT = 50000; // Monto mínimo en COP. Cambia este valor si deseas otro monto.

    const PAYMENT_METHODS = {
        nequi: {
            label: 'Nequi',
            detail: 'Número: +57 322 819 4061',
            note: 'Realiza la transferencia desde Nequi por el valor indicado. Tu pago será verificado y recibirás confirmación por correo electrónico.'
        },
        daviplata: {
            label: 'Daviplata',
            detail: 'Número: +57 322 819 4061',
            note: 'Realiza la transferencia desde Daviplata por el valor indicado. Tu pago será verificado y recibirás confirmación por correo electrónico.'
        },
        bancolombia: {
            label: 'Bancolombia',
            detail: 'Cuenta Bancolombia: pendiente por configurar',
            note: 'Realiza la transferencia bancaria por el valor indicado. Tu pago será verificado y recibirás confirmación por correo electrónico.'
        }
    };

    /* ------ Persistencia ------ */
    function save() {
        localStorage.setItem('fourza_cart', JSON.stringify(items));
    }

    /* ------ Métodos Públicos ------ */

    function add(product) {
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            existing.qty++;
            showCartNotification(`<strong>${product.titulo}</strong> — cantidad actualizada`, 'info');
        } else {
            items.push({ ...product, qty: 1 });
            showCartNotification(`<strong>${product.titulo}</strong> agregado al carrito`, 'success');
        }
        save();
        render();
        updateBadge();
    }

    function addQty(product, qty) {
        qty = Math.max(1, parseInt(qty) || 1);
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            existing.qty += qty;
            showCartNotification(`<strong>${product.titulo}</strong> — cantidad actualizada`, 'info');
        } else {
            items.push({ ...product, qty });
            showCartNotification(`<strong>${product.titulo}</strong> agregado al carrito`, 'success');
        }
        save();
        render();
        updateBadge();
    }

    function remove(id) {
        const item = items.find(i => String(i.id) === String(id));
        items = items.filter(i => String(i.id) !== String(id));
        if (item) showCartNotification(`<strong>${item.titulo}</strong> eliminado del carrito`, 'warning');
        save();
        render();
        updateBadge();
    }

    function updateQty(id, delta) {
        const item = items.find(i => i.id === id);
        if (!item) return;
        item.qty = Math.max(1, item.qty + delta);
        save();
        render();
    }

    function clear() {
        items = [];
        save();
        render();
        updateBadge();
    }

    function getItems() { return items; }

    function getTotalItems() {
        return items.reduce((sum, i) => sum + i.qty, 0);
    }

    /* ------ Sistema de Notificaciones Premium ------ */
    const Notify = {
        _container: null,
        _init() {
            if (!this._container) {
                this._container = document.getElementById('toast-container');
                if (!this._container) {
                    this._container = document.createElement('div');
                    this._container.id = 'toast-container';
                    document.body.appendChild(this._container);
                }
            }
            return this._container;
        },
        show(message, type = 'success', duration = 3500) {
            const container = this._init();
            const icons = {
                success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️'
            };
            const item = document.createElement('div');
            item.className = `toast-item toast-${type}`;
            item.innerHTML = `
                <span class="toast-icon">${icons[type] || '🔔'}</span>
                <span class="toast-text">${message}</span>
                <button class="toast-close" aria-label="Cerrar">✕</button>
                <div class="toast-progress"></div>
            `;
            item.querySelector('.toast-close').addEventListener('click', () => this._dismiss(item));
            container.appendChild(item);
            requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('show')));
            const timer = setTimeout(() => this._dismiss(item), duration);
            item._timer = timer;
        },
        _dismiss(item) {
            clearTimeout(item._timer);
            item.classList.add('hide');
            item.addEventListener('transitionend', () => item.remove(), { once: true });
        }
    };

    function showCartNotification(message, type = 'success') {
        Notify.show(message, type);
    }

    /* ------ Actualizar Badge del Ícono ------ */
    function updateBadge() {
        const badge = document.getElementById('cart-badge');
        if (!badge) return;
        const total = getTotalItems();
        badge.textContent = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    }

    /* ------ Helper para parsear precios de texto a números ------ */
    function getNumericPrice(priceStr) {
        if (!priceStr) return 0;
        const raw = priceStr.replace(/[^0-9.,]/g, '').split(/[-–]/)[0].replace(/\./g, '').replace(',', '.');
        const val = parseFloat(raw);
        return isNaN(val) ? 0 : val;
    }

    /* ------ Calcular total estimado ------ */
    function calcTotal() {
        let hasPrice = false;
        let total = 0;
        items.forEach(item => {
            const val = getNumericPrice(item.precio);
            if (val > 0) {
                total += val * item.qty;
                hasPrice = true;
            }
        });
        return hasPrice ? total : null;
    }

    function getSelectedPaymentMethod() {
        const selected = document.querySelector('input[name="checkout-metodo"]:checked');
        return selected?.value || 'nequi';
    }

    function checkMinimumAmount() {
        const total = calcTotal();
        if (total !== null && total > 0 && total < MINIMUM_ORDER_AMOUNT) {
            const formattedMin = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(MINIMUM_ORDER_AMOUNT);
            Notify.show(`El pedido mínimo debe ser de ${formattedMin}`, 'warning', 4000);
            return false;
        }
        return true;
    }

    function updatePaymentInstructions() {
        const box = document.getElementById('checkout-payment-instructions');
        if (!box) return;

        const method = PAYMENT_METHODS[getSelectedPaymentMethod()] || PAYMENT_METHODS.nequi;
        const total = calcTotal();
        const totalText = total
            ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total)
            : 'Total por confirmar';

        box.innerHTML = `
            <strong>📋 Instrucciones de pago</strong><br><br>
            <strong>1.</strong> Transfiere <strong>${totalText}</strong> a:<br>
            <strong>${method.label}</strong> — ${method.detail}<br><br>
            <strong>2.</strong> ${method.note}<br><br>
            <strong>3.</strong> Tu pedido será procesado y preparado para entrega.
        `;
    }

    /* ------ Renderizar Carrito en el Drawer ------ */
    function render() {
        const list = document.getElementById('cart-items-list');
        const emptyMsg = document.getElementById('cart-empty');
        const cartFooter = document.getElementById('cart-footer');
        const cartCount = document.getElementById('cart-count-label');

        if (!list) return;

        const total = getTotalItems();

        if (cartCount) cartCount.textContent = `${total} producto${total !== 1 ? 's' : ''}`;

        if (items.length === 0) {
            list.innerHTML = '';
            if (emptyMsg) emptyMsg.style.display = 'flex';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'flex';

        list.innerHTML = items.map(item => {
            const unitPriceVal = getNumericPrice(item.precio);
            const unitPriceFormatted = item.precio || '';
            const itemTotalVal = unitPriceVal * item.qty;
            const itemTotalFormatted = unitPriceVal > 0 
                ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(itemTotalVal) 
                : (item.precio || '');

            return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-img">
                    <img src="${item.imagen_url}" alt="${item.titulo}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.titulo}</h4>
                    <span class="cart-item-category">${item.categoria}</span>
                    <div class="cart-item-details-row">
                        <div class="cart-qty-controls">
                            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', -1)" aria-label="Disminuir">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="qty-value">${item.qty}</span>
                            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', 1)" aria-label="Aumentar">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="cart-item-price-info">
                            ${unitPriceVal > 0 ? `<span class="cart-item-unit-price">${unitPriceFormatted} c/u</span>` : ''}
                            <span class="cart-item-total-price">${itemTotalFormatted}</span>
                        </div>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="Cart.remove('${item.id}')" aria-label="Eliminar producto">
                    <i class="fas fa-trash-can"></i>
                </button>
            </div>
            `;
        }).join('');

        // Mostrar o actualizar el total estimado
        const estimado = calcTotal();
        let totalRow = document.getElementById('cart-total-row');
        if (estimado !== null) {
            const formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(estimado);
            if (!totalRow) {
                totalRow = document.createElement('div');
                totalRow.id = 'cart-total-row';
                totalRow.className = 'cart-total-row';
                list.after(totalRow);
            }
            totalRow.innerHTML = `
                <span class="cart-total-label">Subtotal estimado</span>
                <span class="cart-total-value">${formatted}</span>
            `;
            let noteEl = document.getElementById('cart-total-note');
            if (!noteEl) {
                noteEl = document.createElement('span');
                noteEl.id = 'cart-total-note';
                noteEl.className = 'cart-total-note';
                noteEl.textContent = '* Precios según catálogo. Costo de envío por confirmar.';
                totalRow.after(noteEl);
            }
        } else if (totalRow) {
            totalRow.remove();
            document.getElementById('cart-total-note')?.remove();
        }
    }

    /* ------ Abrir / Cerrar Drawer ------ */
    function openDrawer() {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        if (drawer) drawer.classList.add('open');
        if (overlay) overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        if (drawer) drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    /* ------ Construir mensaje de WhatsApp ------ */
    function buildWhatsAppMessage() {
        if (items.length === 0) return '';
        let msg = '🛒 *NUEVO PEDIDO - FOURZA*\n\n';
        msg += 'Hola, quiero confirmar el siguiente pedido:\n\n';
        msg += '*Detalle del Pedido:*\n';
        
        let subtotalGeneral = 0;
        let hasPrices = false;
        
        items.forEach((item, i) => {
            const unitPrice = getNumericPrice(item.precio);
            
            if (unitPrice > 0) {
                hasPrices = true;
                const itemSubtotal = unitPrice * item.qty;
                subtotalGeneral += itemSubtotal;
                
                const formattedUnit = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(unitPrice);
                const formattedSub = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(itemSubtotal);
                
                msg += `${i + 1}. *${item.titulo}*\n   Cant: ${item.qty} x ${formattedUnit} = *${formattedSub}*\n`;
            } else {
                msg += `${i + 1}. *${item.titulo}*\n   Cant: ${item.qty} (Precio a convenir)\n`;
            }
        });
        
        if (hasPrices && subtotalGeneral > 0) {
            const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(subtotalGeneral);
            msg += `\n💵 *Total:* ${formattedTotal}\n`;
        }
        
        msg += '\nAdjuntaré el comprobante de pago. ¡Gracias!';
        return encodeURIComponent(msg);
    }

    /* ------ Pre-llenar modal de checkout con el carrito ------ */
    function fillCheckoutModal() {
        const textarea = document.getElementById('checkout-desc');
        if (textarea) textarea.value = '';
        updatePaymentInstructions();
    }

    /* ------ Exportar a PDF ------ */
    async function generatePDF() {
        if (items.length === 0) {
            Notify.show('El carrito está vacío', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Cargar logo
        const logo = new Image();
        logo.src = '../img/logos/Logofourza.png';
        
        await new Promise((resolve) => {
            logo.onload = resolve;
            logo.onerror = resolve; // Continuar aunque falle el logo
        });

        // Dibujar encabezado
        if (logo.complete && logo.naturalHeight !== 0) {
            doc.addImage(logo, 'PNG', 14, 10, 45, 12);
        } else {
            doc.setFontSize(16);
            doc.setTextColor(249, 115, 22);
            doc.text("FOURZA S.A.S", 14, 18);
        }

        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text("Cotización", 150, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        const fecha = new Date().toLocaleDateString('es-CO');
        doc.text(`Fecha: ${fecha}`, 150, 28);
        doc.text("Comercializadora Fourza S.A.S", 14, 35);
        doc.text("ventas@fourza.com | +57 322 819 4061", 14, 40);

        // Preparar tabla
        const tableColumn = ["Producto", "Categoría", "Cant.", "V. Unitario", "Subtotal"];
        const tableRows = [];
        let total = 0;
        let hasPrice = false;

        items.forEach(item => {
            const unitPrice = getNumericPrice(item.precio);
            const qty = item.qty;
            let subtotalStr = "A convenir";
            let unitStr = item.precio || "A convenir";

            if (unitPrice > 0) {
                const subtotal = unitPrice * qty;
                total += subtotal;
                hasPrice = true;
                subtotalStr = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(subtotal);
                unitStr = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(unitPrice);
            }

            tableRows.push([
                item.titulo,
                item.categoria,
                qty.toString(),
                unitStr,
                subtotalStr
            ]);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22] }, // Color secundario (Naranja)
            styles: { fontSize: 10 }
        });

        const finalY = doc.lastAutoTable.finalY + 12;
        
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        if (hasPrice) {
            const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total);
            doc.text(`Total Estimado: ${formattedTotal}`, 14, finalY);
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text("* Precios sujetos a confirmación. No incluye costo de envío ni impuestos adicionales si aplican.", 14, finalY + 6);
        } else {
            doc.text("Total Estimado: A convenir", 14, finalY);
        }

        doc.save(`Cotizacion_Fourza_${fecha.replace(/\//g, '-')}.pdf`);
        Notify.show('Cotización descargada en PDF', 'success');
    }

    /* ------ Inicialización ------ */
    function init() {
        updateBadge();
        render();

        /* Cart toggle button */
        const cartBtn = document.getElementById('cart-toggle-btn');
        if (cartBtn) cartBtn.addEventListener('click', openDrawer);

        /* Close button inside drawer */
        const closeBtn = document.getElementById('cart-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

        /* Overlay click closes drawer */
        const overlay = document.getElementById('cart-overlay');
        if (overlay) overlay.addEventListener('click', closeDrawer);

        /* Clear cart button */
        const clearBtn = document.getElementById('cart-clear-btn');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            if (items.length > 0 && confirm('¿Vaciar el carrito?')) clear();
        });

        /* WhatsApp checkout */
        const waBtn = document.getElementById('cart-whatsapp-btn');
        if (waBtn) waBtn.addEventListener('click', () => {
            if (items.length === 0) return;
            if (!checkMinimumAmount()) return;
            const msg = buildWhatsAppMessage();
            window.open(`https://wa.me/573228194061?text=${msg}`, '_blank');
        });

        /* Descargar PDF btn */
        const pdfBtn = document.getElementById('cart-pdf-btn');
        if (pdfBtn) pdfBtn.addEventListener('click', () => {
            if (items.length === 0) {
                Notify.show('El carrito está vacío', 'warning');
                return;
            }
            // Mismo check de mínimo para PDF? Opcional, pero dejémoslo libre para cotizar.
            pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
            pdfBtn.disabled = true;
            generatePDF().finally(() => {
                pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Descargar PDF';
                pdfBtn.disabled = false;
            });
        });

        /* Checkout modal checkout */
        const checkoutBtn = document.getElementById('cart-checkout-btn');
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (items.length === 0) return;
                if (!checkMinimumAmount()) return;
                fillCheckoutModal();
                closeDrawer();
                if (checkoutModal) {
                    checkoutModal.classList.add('show');
                    // Scroll to name field
                    const nameInput = document.getElementById('checkout-nombre');
                    if (nameInput) setTimeout(() => nameInput.focus(), 300);
                }
            });
        }

        document.querySelectorAll('input[name="checkout-metodo"]').forEach(input => {
            input.addEventListener('change', updatePaymentInstructions);
        });

        /* Close checkout modal */
        const closeCheckoutBtn = document.getElementById('close-checkout');
        if (closeCheckoutBtn && checkoutModal) {
            closeCheckoutBtn.addEventListener('click', () => {
                checkoutModal.classList.remove('show');
            });
        }
        
        // Also close checkout modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('show');
            }
        });

        /* Submit Checkout Form */
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                const btn = document.getElementById('btn-confirmar-pago');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando Pedido...';
                btn.disabled = true;

                const addressVal = document.getElementById('checkout-direccion').value;
                const commentsVal = document.getElementById('checkout-desc').value;

                const itemsToSend = items.map(item => ({
                    id: item.id,
                    titulo: item.titulo,
                    precio: item.precio,
                    cantidad: item.qty
                }));

                const payload = {
                    nombre: document.getElementById('checkout-nombre').value,
                    email: document.getElementById('checkout-email').value,
                    telefono: document.getElementById('checkout-telefono').value,
                    direccion: addressVal + (commentsVal ? ` - ${commentsVal}` : ''),
                    metodo_pago: getSelectedPaymentMethod(),
                    productos: itemsToSend
                };

                try {
                    const res = await fetch("/api/crear-pedido", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    
                    const data = await res.json();

                    if (res.ok) {
                        if (checkoutModal) checkoutModal.classList.remove('show');
                        Notify.show('Pedido creado. Te mostramos las instrucciones de pago.', 'success', 2500);
                        checkoutForm.reset();
                        clear();
                        setTimeout(() => {
                            window.location.href = window.location.origin + `/catalogo/resultado.html?ref=${data.referencia}`;
                        }, 900);
                    } else {
                        Notify.show(data.error || 'Error al iniciar el proceso de pago. Intenta de nuevo.', 'error');
                    }
                } catch (error) {
                    console.error("Error enviando pedido:", error);
                    Notify.show('Error de conexión. Verifica tu internet.', 'error');
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        }
    }

    /* ------ API Pública ------ */
    return { add, addQty, remove, updateQty, clear, getItems, getTotalItems, openDrawer, closeDrawer, generatePDF, init };

})();

/* Inicializar cuando el DOM esté listo */
document.addEventListener('DOMContentLoaded', () => Cart.init());
