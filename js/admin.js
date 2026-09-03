document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const loginContainer = document.getElementById("login-container");
    const adminPanel = document.getElementById("admin-panel");
    const loginError = document.getElementById("login-error");
    const logoutBtn = document.getElementById("logout-btn");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // Verificar si ya hay token
    const token = localStorage.getItem("admin_token");
    if (token) {
        mostrarPanelAdmin();
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.token) {
                localStorage.setItem("admin_token", data.token);
                mostrarPanelAdmin();
            } else {
                loginError.textContent = data.error || "Credenciales incorrectas";
            }
        } catch (error) {
            loginError.textContent = "Error de conexión con el servidor";
        }
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("admin_token");
        loginContainer.style.display = "flex";
        adminPanel.style.display = "none";
    });

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(btn.getAttribute("data-target")).classList.add("active");
        });
    });

    let chartInstance = null;
    let pedidosChart = null;
    let productosChart = null;
    let contactosChart = null;

    async function mostrarPanelAdmin() {
        loginContainer.style.display = "none";
        adminPanel.style.display = "block";
        cargarDatos();
    }

    async function cargarDatos() {
        const token = localStorage.getItem("admin_token");
        
        try {
            // Cargar Contactos
            const resContactos = await fetch("/api/contactos", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (resContactos.status === 401 || resContactos.status === 403) {
                logoutBtn.click(); // Token expirado o inválido
                return;
            }

            const contactos = await resContactos.json();
            graficarContactos(contactos);
            const tbodyContactos = document.querySelector("#contactos-table tbody");
            tbodyContactos.innerHTML = contactos.map(c => `
                <tr class="${c.estado === 'atendido' ? 'row-atendido' : ''}">
                    <td>${new Date(c.fecha).toLocaleString()}</td>
                    <td>${c.nombre}</td>
                    <td>${c.email}</td>
                    <td>${c.telefono || '-'}</td>
                    <td>${c.mensaje || '-'}</td>
                    <td><span class="badge ${c.estado === 'atendido' ? 'badge-ok' : 'badge-pending'}">${c.estado}</span></td>
                    <td>
                        <button onclick="toggleEstado('contactos', ${c.id}, '${c.estado}')" class="btn-action btn-ok">✅</button>
                        <button onclick="borrarLead('contactos', ${c.id})" class="btn-action btn-del">🗑️</button>
                    </td>
                </tr>
            `).join('');

            // Cargar Cotizaciones
            const resCotizaciones = await fetch("/api/cotizaciones", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const cotizaciones = await resCotizaciones.json();
            const tbodyCotizaciones = document.querySelector("#cotizaciones-table tbody");
            tbodyCotizaciones.innerHTML = cotizaciones.map(c => `
                <tr class="${c.estado === 'atendido' ? 'row-atendido' : ''}">
                    <td>${new Date(c.fecha).toLocaleString()}</td>
                    <td>${c.nombre}</td>
                    <td>${c.email}</td>
                    <td>${c.telefono || '-'}</td>
                    <td>${c.categoria}</td>
                    <td>${c.descripcion || '-'}</td>
                    <td><span class="badge ${c.estado === 'atendido' ? 'badge-ok' : 'badge-pending'}">${c.estado}</span></td>
                    <td>
                        <button onclick="toggleEstado('cotizaciones', ${c.id}, '${c.estado}')" class="btn-action btn-ok">✅</button>
                        <button onclick="borrarLead('cotizaciones', ${c.id})" class="btn-action btn-del">🗑️</button>
                    </td>
                </tr>
            `).join('');

            actualizarGrafico(cotizaciones);
            await cargarPedidos(token);
            await cargarCategorias(token);
            cargarProductos(token);
            cargarUsuarios(token);
            cargarHistorial(token);
            cargarResenas(token);

        } catch (error) {
            console.error("Error al cargar datos", error);
            alert("Error al cargar los datos. Revisa la consola.");
        }
    }

    async function cargarPedidos(token) {
        const resPedidos = await fetch("/api/pedidos", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const pedidos = await resPedidos.json();
        
        graficarPedidos(pedidos);

        const tbodyPedidos = document.querySelector("#pedidos-table tbody");
        if (!tbodyPedidos) return;

        tbodyPedidos.innerHTML = pedidos.map(p => {
            const total = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.monto || 0);
            const metodo = formatMetodoPago(p.metodo_pago);
            const badgeClass = p.estado === 'aprobado' ? 'badge-ok' : 'badge-pending';
            return `
                <tr class="${p.estado === 'aprobado' ? 'row-atendido' : ''}">
                    <td>${new Date(p.fecha).toLocaleString()}</td>
                    <td>${p.referencia}</td>
                    <td>${p.nombre}<br><small>${p.email}</small></td>
                    <td>${p.telefono || '-'}</td>
                    <td>${metodo}</td>
                    <td>${total}</td>
                    <td><span class="badge ${badgeClass}">${p.estado}</span></td>
                    <td>
                        <button onclick="actualizarEstadoPedido(${p.id}, 'aprobado')" class="btn-action btn-ok">OK</button>
                        <button onclick="actualizarEstadoPedido(${p.id}, 'rechazado')" class="btn-action btn-del">No</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.actualizarEstadoPedido = async function(id, nuevoEstado) {
        if(!confirm(`¿Cambiar estado del pedido a ${nuevoEstado}?`)) return;
        const token = localStorage.getItem("admin_token");
        try {
            const res = await fetch(`/api/pedidos/${id}/estado`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (res.ok) {
                cargarPedidos(token);
            } else {
                alert("Error al actualizar el estado del pedido.");
            }
        } catch (error) {
            console.error("Error cambiando estado del pedido:", error);
        }
    };

    function formatMetodoPago(method) {
        const labels = {
            nequi: 'Nequi',
            daviplata: 'Daviplata',
            bancolombia: 'Bancolombia'
        };
        return labels[String(method || '').toLowerCase()] || 'Manual';
    }

    function actualizarGrafico(cotizaciones) {
        const counts = {};
        cotizaciones.forEach(c => {
            counts[c.categoria] = (counts[c.categoria] || 0) + 1;
        });

        const ctx = document.getElementById('cotizacionesChart').getContext('2d');
        if (chartInstance) chartInstance.destroy();
        
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: 'Cotizaciones',
                    data: Object.values(counts),
                    backgroundColor: ['#F97316', '#0F172A', '#94A3B8', '#38bdf8', '#fbbf24']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function graficarProductos(productos) {
        const counts = {};
        productos.forEach(p => {
            counts[p.categoria] = (counts[p.categoria] || 0) + 1;
        });
        const ctx = document.getElementById('productosChart');
        if(!ctx) return;
        if (productosChart) productosChart.destroy();
        productosChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: 'Productos',
                    data: Object.values(counts),
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function graficarPedidos(pedidos) {
        const counts = {};
        pedidos.forEach(p => {
            counts[p.estado] = (counts[p.estado] || 0) + 1;
        });
        const ctx = document.getElementById('pedidosChart');
        if(!ctx) return;
        if (pedidosChart) pedidosChart.destroy();
        pedidosChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    data: Object.values(counts),
                    backgroundColor: ['#fef9c3', '#dcfce7', '#fee2e2'] 
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function graficarContactos(contactos) {
        const counts = { atendido: 0, pendiente: 0 };
        contactos.forEach(c => {
            if (counts[c.estado] !== undefined) counts[c.estado]++;
        });
        const ctx = document.getElementById('contactosChart');
        if(!ctx) return;
        if (contactosChart) contactosChart.destroy();
        contactosChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Atendidos', 'Pendientes'],
                datasets: [{
                    data: [counts.atendido, counts.pendiente],
                    backgroundColor: ['#3b82f6', '#94a3b8']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    let listadoProductos = [];

    // --- Helper Functions for Variants ---
    function crearFilaVariante(containerId, nombre = '', precio = '') {
        const container = document.getElementById(containerId);
        const row = document.createElement("div");
        row.className = "variant-row";
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        row.style.marginTop = "5px";
        
        row.innerHTML = `
            <input type="text" placeholder="Ej. 250 G" value="${nombre}" required style="flex: 2; padding: 6px 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 0.85rem;">
            <input type="text" placeholder="Ej. $12.900" value="${precio}" required style="flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 0.85rem;">
            <button type="button" class="btn-remove-variant" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 10px; border-radius:5px; cursor:pointer; font-weight:bold; font-size: 0.85rem;">✕</button>
        `;
        
        row.querySelector(".btn-remove-variant").addEventListener("click", () => row.remove());
        container.appendChild(row);
    }

    function obtenerVariantes(containerId) {
        const container = document.getElementById(containerId);
        const rows = container.querySelectorAll(".variant-row");
        const list = [];
        rows.forEach(row => {
            const inputs = row.querySelectorAll("input");
            const nombre = inputs[0].value.trim();
            const precio = inputs[1].value.trim();
            if (nombre) {
                list.push({ nombre, precio });
            }
        });
        return JSON.stringify(list);
    }

    // Bind event listeners for adding variant rows
    document.getElementById("add-variant-row-btn").addEventListener("click", () => {
        crearFilaVariante("add-prod-variants-container");
    });
    document.getElementById("edit-variant-row-btn").addEventListener("click", () => {
        crearFilaVariante("edit-prod-variants-container");
    });

    async function cargarProductos(token) {
        const res = await fetch("/api/productos");
        listadoProductos = await res.json();
        
        let totalConVariantes = 0;
        listadoProductos.forEach(p => {
            try {
                const vars = JSON.parse(p.variantes || '[]');
                totalConVariantes += vars.length > 0 ? vars.length : 1;
            } catch(e) {
                totalConVariantes += 1;
            }
        });
        const statTotal = document.getElementById("stat-productos-total");
        if (statTotal) statTotal.textContent = totalConVariantes;

        graficarProductos(listadoProductos);
        
        const tbody = document.querySelector("#productos-table tbody");
        tbody.innerHTML = listadoProductos.map(p => {
            let infoPrecio = p.precio || '-';
            try {
                const vars = JSON.parse(p.variantes || '[]');
                if (vars.length > 0) {
                    infoPrecio = `<span style="font-weight:600;">Varias</span><br><small style="color:#64748b; font-size: 0.75rem;">${vars.map(v => `${v.nombre}: ${v.precio}`).join(', ')}</small>`;
                }
            } catch(e) {}

            return `
            <tr>
                <td><img src="${p.imagen_url}" width="50" style="border-radius:5px; height:50px; object-fit:cover;"></td>
                <td>${p.titulo}</td>
                <td>${p.categoria}</td>
                <td>${infoPrecio}</td>
                <td>
                    <button onclick="abrirEditarProducto(${p.id})" style="background:var(--secondary); color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer; margin-right:5px;">Editar</button>
                    <button onclick="borrarProducto(${p.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Borrar</button>
                </td>
            </tr>
        `;}).join('');
    }

    document.getElementById("add-product-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("admin_token");
        
        const formData = new FormData();
        formData.append("titulo", document.getElementById("prod-titulo").value);
        formData.append("descripcion", document.getElementById("prod-desc").value);
        formData.append("categoria", document.getElementById("prod-cat").value);
        formData.append("precio", document.getElementById("prod-precio").value);
        formData.append("variantes", obtenerVariantes("add-prod-variants-container"));
        formData.append("imagen", document.getElementById("prod-img").files[0]);

        try {
            const res = await fetch("/api/productos", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if(res.ok) {
                alert("Producto subido correctamente");
                document.getElementById("add-product-form").reset();
                document.getElementById("add-prod-variants-container").innerHTML = "";
                cargarProductos(token);
            } else {
                alert("Error al subir el producto");
            }
        } catch (error) {
            console.error(error);
        }
    });

    window.borrarProducto = async function(id) {
        if(!confirm("¿Seguro que quieres borrar este producto?")) return;
        const token = localStorage.getItem("admin_token");
        await fetch(`/api/productos/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        cargarProductos(token);
    };

    // Modal Edit handlers
    const editModal = document.getElementById("edit-modal");
    const editForm = document.getElementById("edit-product-form");
    const closeModalBtn = document.getElementById("close-modal");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");

    window.abrirEditarProducto = function(id) {
        const p = listadoProductos.find(prod => prod.id === id);
        if (!p) return;

        document.getElementById("edit-prod-id").value = p.id;
        document.getElementById("edit-prod-titulo").value = p.titulo;
        document.getElementById("edit-prod-desc").value = p.descripcion;
        document.getElementById("edit-prod-cat").value = p.categoria;
        document.getElementById("edit-prod-precio").value = p.precio || '';
        
        // Cargar variantes actuales
        const container = document.getElementById("edit-prod-variants-container");
        container.innerHTML = "";
        try {
            const vars = JSON.parse(p.variantes || '[]');
            vars.forEach(v => {
                crearFilaVariante("edit-prod-variants-container", v.nombre, v.precio);
            });
        } catch(e) {
            console.error("Error al parsear variantes", e);
        }

        const previewImg = document.getElementById("edit-prod-preview");
        if (p.imagen_url) {
            previewImg.src = `${p.imagen_url}`;
            previewImg.style.display = "block";
        } else {
            previewImg.style.display = "none";
        }
        
        // Reset file input
        document.getElementById("edit-prod-img").value = '';

        editModal.style.display = "flex";
    };

    function cerrarModal() {
        editModal.style.display = "none";
        editForm.reset();
        document.getElementById("edit-prod-variants-container").innerHTML = "";
    }

    closeModalBtn.addEventListener("click", cerrarModal);
    cancelEditBtn.addEventListener("click", cerrarModal);

    editModal.addEventListener("click", (e) => {
        if (e.target === editModal) {
            cerrarModal();
        }
    });

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("admin_token");
        const id = document.getElementById("edit-prod-id").value;

        const formData = new FormData();
        formData.append("titulo", document.getElementById("edit-prod-titulo").value);
        formData.append("descripcion", document.getElementById("edit-prod-desc").value);
        formData.append("categoria", document.getElementById("edit-prod-cat").value);
        formData.append("precio", document.getElementById("edit-prod-precio").value);
        formData.append("variantes", obtenerVariantes("edit-prod-variants-container"));
        
        const fileInput = document.getElementById("edit-prod-img");
        if (fileInput.files[0]) {
            formData.append("imagen", fileInput.files[0]);
        }

        try {
            const res = await fetch(`/api/productos/${id}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                alert("Producto actualizado correctamente");
                cerrarModal();
                cargarProductos(token);
            } else {
                const data = await res.json();
                alert("Error al actualizar producto: " + (data.error || "Desconocido"));
            }
        } catch (error) {
            console.error("Error actualizando producto:", error);
            alert("Error de conexión");
        }
    });

    // ================= LEADS MANAGEMENT =================

    window.toggleEstado = async function(tipo, id, estadoActual) {
        const token = localStorage.getItem("admin_token");
        const nuevoEstado = estadoActual === 'atendido' ? 'pendiente' : 'atendido';
        await fetch(`/api/${tipo}/${id}/estado`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        cargarDatos();
    };

    window.actualizarEstadoPedido = async function(id, estado) {
        const token = localStorage.getItem("admin_token");
        await fetch(`/api/pedidos/${id}/estado`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ estado })
        });
        cargarDatos();
    };

    window.borrarLead = async function(tipo, id) {
        if(!confirm("¿Borrar permanentemente este registro?")) return;
        const token = localStorage.getItem("admin_token");
        await fetch(`/api/${tipo}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        cargarDatos();
    };

    // ================= EXPORTAR CSV =================

    window.exportarCSV = function(tableId, nombreArchivo) {
        const table = document.getElementById(tableId);
        if (!table) return;
        const rows = table.querySelectorAll("tr");
        const csvLines = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll("th, td");
            // Excluir las últimas dos celdas (Estado visual y Acciones)
            const data = Array.from(cells).slice(0, -2).map(cell => {
                let text = cell.innerText.replace(/"/g, '""');
                return `"${text}"`;
            });
            csvLines.push(data.join(','));
        });
        const blob = new Blob(["\uFEFF" + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
        a.href = url;
        a.download = `${nombreArchivo}_${fecha}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ================= CATEGORÍAS =================
    async function cargarCategorias(token) {
        try {
            const res = await fetch("/api/categorias");
            const categorias = await res.json();
            
            // Llenar tabla
            const tbody = document.querySelector("#categorias-table tbody");
            if (tbody) {
                tbody.innerHTML = categorias.map(c => `
                    <tr>
                        <td>${c.id}</td>
                        <td>${c.nombre}</td>
                        <td>${c.slug}</td>
                        <td>
                            <button onclick="borrarCategoria(${c.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Borrar</button>
                        </td>
                    </tr>
                `).join('');
            }

            // Llenar selectores
            const selectProd = document.getElementById("prod-cat");
            const selectEdit = document.getElementById("edit-prod-cat");
            const optionsHtml = '<option value="">Selecciona Categoría...</option>' + 
                categorias.map(c => `<option value="${c.slug}">${c.nombre}</option>`).join('');
            
            if(selectProd) selectProd.innerHTML = optionsHtml;
            if(selectEdit) selectEdit.innerHTML = optionsHtml;
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    }

    document.getElementById("add-categoria-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("admin_token");
        const nombre = document.getElementById("cat-nombre").value;
        try {
            const res = await fetch("/api/categorias", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ nombre })
            });
            if(res.ok) {
                document.getElementById("add-categoria-form").reset();
                cargarCategorias(token);
            } else {
                alert("Error al añadir categoría");
            }
        } catch(error) { console.error(error); }
    });

    window.borrarCategoria = async function(id) {
        if(!confirm("¿Borrar esta categoría?")) return;
        const token = localStorage.getItem("admin_token");
        await fetch(`/api/categorias/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        cargarCategorias(token);
    };

    // ================= USUARIOS =================
    async function cargarUsuarios(token) {
        try {
            const res = await fetch("/api/usuarios", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const usuarios = await res.json();
            
            const statUsuarios = document.getElementById("stat-usuarios");
            if (statUsuarios) statUsuarios.textContent = usuarios.length;
            
            const tbody = document.querySelector("#usuarios-table tbody");
            if (tbody) {
                tbody.innerHTML = usuarios.map(u => `
                    <tr>
                        <td>${u.nombre}</td>
                        <td>${u.email}</td>
                        <td><span class="badge" style="background:#e2e8f0; color:#334155;">${u.rol}</span></td>
                        <td>${new Date(u.fecha_creacion).toLocaleString()}</td>
                        <td>
                            <button onclick="borrarUsuario(${u.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Borrar</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    }

    document.getElementById("add-usuario-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("admin_token");
        const nombre = document.getElementById("usu-nombre").value;
        const email = document.getElementById("usu-email").value;
        const password = document.getElementById("usu-password").value;
        try {
            const res = await fetch("/api/usuarios", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email, password })
            });
            if(res.ok) {
                document.getElementById("add-usuario-form").reset();
                cargarUsuarios(token);
            } else {
                alert("Error al crear usuario");
            }
        } catch(error) { console.error(error); }
    });

    window.borrarUsuario = async function(id) {
        if(!confirm("¿Borrar este usuario?")) return;
        const token = localStorage.getItem("admin_token");
        await fetch(`/api/usuarios/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        cargarUsuarios(token);
    };

    // ================= HISTORIAL =================
    async function cargarHistorial(token) {
        try {
            const res = await fetch("/api/historial", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const historial = await res.json();
            const tbody = document.querySelector("#historial-table tbody");
            if (tbody) {
                tbody.innerHTML = historial.map(h => `
                    <tr>
                        <td>${new Date(h.fecha).toLocaleString()}</td>
                        <td>${h.usuario_nombre || 'Desconocido'}</td>
                        <td><span class="badge" style="background:#e0f2fe; color:#0369a1; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${h.accion}</span></td>
                        <td>${h.detalle}</td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    }

    // ================= RESEÑAS =================
    async function cargarResenas(token) {
        try {
            const res = await fetch("/api/admin/resenas", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const resenas = await res.json();
            const tbody = document.querySelector("#resenas-table tbody");
            if (tbody) {
                tbody.innerHTML = resenas.map(r => `
                    <tr class="${r.publicado ? 'row-atendido' : ''}">
                        <td>${new Date(r.fecha).toLocaleString()}</td>
                        <td>${r.referencia_pedido || '-'}</td>
                        <td>${r.nombre_cliente}</td>
                        <td>${r.calificacion} ⭐</td>
                        <td>${r.comentario || '<em>Sin comentarios</em>'}</td>
                        <td>
                            <label class="switch">
                                <input type="checkbox" onchange="togglePublicarResena(${r.id}, this.checked)" ${r.publicado ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                            <span style="font-size: 0.8rem; margin-left: 10px;">${r.publicado ? 'Sí' : 'No'}</span>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error("Error cargando reseñas:", error);
        }
    }

    window.togglePublicarResena = async function(id, isChecked) {
        const token = localStorage.getItem("admin_token");
        try {
            const res = await fetch(`/api/admin/resenas/${id}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ publicado: isChecked ? 1 : 0 })
            });
            if (res.ok) {
                showToast(isChecked ? "Reseña publicada" : "Reseña oculta");
                cargarResenas(token);
            } else {
                alert("Error al actualizar estado de la reseña.");
            }
        } catch (error) {
            console.error("Error cambiando estado de reseña:", error);
        }
    };

    // ================= FUNCIONES GLOBALES =================
    window.filterTable = function(tableId, query) {
        const table = document.getElementById(tableId);
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        const rows = tbody.querySelectorAll('tr');
        const q = query.toLowerCase().trim();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(q)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };

    window.showToast = function(message) {
        const toast = document.getElementById("toast");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    };
});
