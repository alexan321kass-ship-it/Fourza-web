const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER || 'alexan321kass@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'ikjscqxceoajwuzc';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alexan321kass@gmail.com';
const SMTP_FROM = `"FOURZA S.A.S" <${SMTP_USER}>`;

// Crear transporter con Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

transporter.verify((err, success) => {
    if (err) {
        console.error("⚠️ Error conectando al servicio SMTP de Gmail:", err.message);
    } else {
        console.log(`✅ Servicio de correos FOURZA conectado a Gmail (${SMTP_USER})`);
    }
});

// 1. Notificación y confirmación de contacto
async function enviarNotificacionContacto(contacto) {
    // Correo al Administrador
    try {
        const infoAdmin = await transporter.sendMail({
            from: SMTP_FROM,
            to: ADMIN_EMAIL,
            subject: `📩 Nuevo Mensaje de Contacto: ${contacto.nombre}`,
            text: `Has recibido un nuevo mensaje de ${contacto.nombre} (${contacto.email}).\nTeléfono: ${contacto.telefono || 'No especificado'}\nMensaje: ${contacto.mensaje || 'Sin mensaje'}`,
            html: `
                <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 30px;">
                    <div style="max-width: 560px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
                        <h2 style="color: #0F172A; margin-top:0;">Nuevo Mensaje de Contacto</h2>
                        <hr style="border:none; border-top:1px solid #e2e8f0; margin:15px 0;">
                        <p><strong>Nombre:</strong> ${contacto.nombre}</p>
                        <p><strong>Email:</strong> <a href="mailto:${contacto.email}">${contacto.email}</a></p>
                        <p><strong>Teléfono:</strong> ${contacto.telefono || 'No especificado'}</p>
                        <p><strong>Mensaje:</strong></p>
                        <div style="background:#f1f5f9; padding:15px; border-radius:8px; color:#334155; white-space:pre-wrap;">${contacto.mensaje || 'Sin mensaje adicional'}</div>
                    </div>
                </div>
            `,
        });
        console.log(`[MAILER] Notificación de contacto enviada al admin (${ADMIN_EMAIL}): ${infoAdmin.messageId}`);
    } catch (error) {
        console.error("[MAILER] Error enviando correo de contacto al admin:", error.message);
    }

    // Correo de Confirmación al Cliente
    if (contacto.email) {
        try {
            const infoCliente = await transporter.sendMail({
                from: SMTP_FROM,
                to: contacto.email,
                subject: `✅ Hemos recibido tu mensaje – FOURZA S.A.S`,
                html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
                        <div style="max-width: 560px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                            <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 40px; text-align: center;">
                                <h1 style="color: #F97316; font-size: 1.8rem; margin: 0 0 4px; letter-spacing:1px;">FOURZA</h1>
                                <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">Comercialización y Distribución</p>
                            </div>
                            <div style="padding: 36px 40px;">
                                <h2 style="color: #0F172A; font-size: 1.3rem; margin: 0 0 12px;">¡Hola, ${contacto.nombre}! 👋</h2>
                                <p style="color: #475569; line-height: 1.7; margin: 0 0 20px;">
                                    Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje y uno de nuestros asesores comerciales se comunicará contigo a la brevedad.
                                </p>
                                <div style="background: #f1f5f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                                    <p style="margin: 0; font-size: 0.9rem; color: #64748b; line-height:1.6;">
                                        <strong>Resumen de tu solicitud:</strong><br>
                                        📞 <strong>Teléfono registrado:</strong> ${contacto.telefono || 'No especificado'}<br>
                                        📝 <strong>Mensaje:</strong> ${contacto.mensaje || 'Sin comentarios adicionales'}
                                    </p>
                                </div>
                                <p style="color: #475569; font-size: 0.9rem; margin: 0 0 24px;">
                                    ¿Necesitas una respuesta inmediata? Escríbenos directamente a nuestra línea oficial de WhatsApp.
                                </p>
                                <div style="text-align: center;">
                                    <a href="https://wa.me/573228194061?text=Hola%20FOURZA,%20acabo%20de%20escribirles%20desde%20la%20p%C3%A1gina%20web" 
                                       style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 600; font-size: 0.9rem;">
                                        📲 Contactar por WhatsApp
                                    </a>
                                </div>
                            </div>
                            <div style="border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
                                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0;">
                                    FOURZA S.A.S &bull; Correo automático de confirmación.
                                </p>
                            </div>
                        </div>
                    </div>
                `,
            });
            console.log(`[MAILER] Confirmación de contacto enviada al cliente (${contacto.email}): ${infoCliente.messageId}`);
        } catch (error) {
            console.error("[MAILER] Error enviando confirmación al cliente:", error.message);
        }
    }
}

// 2. Feedback / PQRS Notificación al Admin
async function enviarNotificacionFeedback(feedback) {
    try {
        let info = await transporter.sendMail({
            from: SMTP_FROM,
            to: ADMIN_EMAIL,
            subject: `🚨 Nueva Queja o Sugerencia: ${feedback.categoria}`,
            text: `Has recibido un nuevo mensaje de ${feedback.nombre} (${feedback.email}).\nTeléfono: ${feedback.telefono}\nTipo: ${feedback.categoria}\nDescripción: ${feedback.descripcion}`,
            html: `
                <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 30px;">
                    <div style="max-width: 560px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
                        <h3 style="color: #0F172A; margin-top:0;">Nueva Solicitud: ${feedback.categoria}</h3>
                        <p><strong>Nombre:</strong> ${feedback.nombre}</p>
                        <p><strong>Email:</strong> <a href="mailto:${feedback.email}">${feedback.email}</a></p>
                        <p><strong>Teléfono:</strong> ${feedback.telefono || 'No especificado'}</p>
                        <p><strong>Tipo:</strong> ${feedback.categoria}</p>
                        <p><strong>Descripción:</strong></p>
                        <div style="background:#f1f5f9; padding:15px; border-radius:8px; color:#334155;">${feedback.descripcion || 'Sin descripción'}</div>
                    </div>
                </div>
            `,
        });
        console.log(`[MAILER] Correo de Feedback enviado al admin: ${info.messageId}`);
    } catch (error) {
        console.error("[MAILER] Error enviando correo de feedback:", error.message);
    }
}

// 3. Feedback / PQRS Confirmación al Cliente
async function enviarConfirmacionFeedbackCliente(feedback) {
    try {
        const info = await transporter.sendMail({
            from: SMTP_FROM,
            to: feedback.email,
            subject: `✅ Hemos recibido tu mensaje – FOURZA`,
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
                    <div style="max-width: 560px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 40px; text-align: center;">
                            <h1 style="color: #F97316; font-size: 1.8rem; margin: 0 0 4px;">FOURZA</h1>
                            <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">Comercialización y Distribución</p>
                        </div>
                        <div style="padding: 36px 40px;">
                            <h2 style="color: #0F172A; font-size: 1.3rem; margin: 0 0 12px;">¡Hola, ${feedback.nombre}! 👋</h2>
                            <p style="color: #475569; line-height: 1.7; margin: 0 0 20px;">
                                Hemos recibido exitosamente tu mensaje clasificado como 
                                <strong style="color: #F97316;">${feedback.categoria}</strong>. 
                                Apreciamos mucho que nos compartas tu opinión. Un asesor de FOURZA se comunicará contigo si es necesario.
                            </p>
                            <div style="background: #f1f5f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">
                                    <strong>Resumen:</strong><br>
                                    📌 <strong>Tipo:</strong> ${feedback.categoria}<br>
                                    📝 <strong>Descripción:</strong> ${feedback.descripcion || 'No especificada'}<br>
                                    📞 <strong>Teléfono de contacto:</strong> ${feedback.telefono || 'No especificado'}
                                </p>
                            </div>
                            <p style="color: #475569; font-size: 0.9rem; margin: 0 0 24px;">
                                Si tienes preguntas urgentes, también puedes contactarnos directamente por WhatsApp.
                            </p>
                            <div style="text-align: center;">
                                <a href="https://wa.me/573228194061" 
                                   style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 600; font-size: 0.9rem;">
                                    📲 Contactar por WhatsApp
                                </a>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0;">
                                FOURZA S.A.S &bull; Correo automático.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        console.log(`[MAILER] Confirmación de feedback enviada al cliente (${feedback.email}): ${info.messageId}`);
    } catch (error) {
        console.error("[MAILER] Error enviando confirmación al cliente:", error.message);
    }
}

// 4. Confirmación de Pedido Aprobado / Pagado
async function enviarConfirmacionPedido(pedido) {
    try {
        let productosList = '';
        try {
            const items = typeof pedido.productos === 'string' ? JSON.parse(pedido.productos) : pedido.productos;
            productosList = items.map(item => `<li>${item.titulo} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString('es-CO')} COP</li>`).join('');
        } catch (e) {
            productosList = `<li>Productos del pedido</li>`;
        }

        // Correo al cliente
        const infoCli = await transporter.sendMail({
            from: SMTP_FROM,
            to: pedido.email,
            subject: `✅ ¡Pago Exitoso! Tu pedido ${pedido.referencia} está en camino – FOURZA`,
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
                    <div style="max-width: 560px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 40px; text-align: center;">
                            <h1 style="color: #F97316; font-size: 1.8rem; margin: 0 0 4px;">FOURZA</h1>
                            <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">Comercialización y Distribución</p>
                        </div>
                        <div style="padding: 36px 40px;">
                            <h2 style="color: #0F172A; font-size: 1.3rem; margin: 0 0 12px;">¡Hola, ${pedido.nombre}! 👋</h2>
                            <p style="color: #475569; line-height: 1.7; margin: 0 0 20px;">
                                Tu pago por un valor de <strong style="color: #F97316;">$${(pedido.monto).toLocaleString('es-CO')} COP</strong> ha sido aprobado con éxito.
                                Tu pedido con referencia <strong style="color: #0F172A;">${pedido.referencia}</strong> ya está siendo preparado para despacho.
                            </p>
                            <div style="background: #f1f5f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">
                                    <strong>Detalles del envío:</strong><br>
                                    📍 <strong>Dirección:</strong> ${pedido.direccion || 'No especificada'}<br>
                                    📞 <strong>Teléfono:</strong> ${pedido.telefono || 'No especificado'}<br>
                                    💳 <strong>Método:</strong> ${pedido.metodo_pago || 'Pago manual'}<br>
                                    🛒 <strong>Productos:</strong>
                                    <ul style="margin: 5px 0 0 20px; padding: 0;">
                                        ${productosList}
                                    </ul>
                                </p>
                            </div>
                            <p style="color: #475569; font-size: 0.9rem; margin: 0 0 24px;">
                                Si tienes alguna duda, puedes contactar a tu asesor por WhatsApp.
                            </p>
                            <div style="text-align:center;">
                                <a href="https://wa.me/573228194061" 
                                   style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 600; font-size: 0.9rem;">
                                    📲 Contactar por WhatsApp
                                </a>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0;">
                                FOURZA S.A.S &bull; Este es un correo automático.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        console.log(`[MAILER] Confirmación de pedido pagado enviada al cliente (${pedido.email}): ${infoCli.messageId}`);

        // Correo al administrador
        const infoAdmin = await transporter.sendMail({
            from: SMTP_FROM,
            to: ADMIN_EMAIL,
            subject: `🚨 ¡Nuevo Pedido Pagado! Referencia: ${pedido.referencia}`,
            html: `
                <h3>Nuevo Pedido Pagado con Éxito</h3>
                <p><strong>Referencia:</strong> ${pedido.referencia}</p>
                <p><strong>Nombre del Cliente:</strong> ${pedido.nombre}</p>
                <p><strong>Email:</strong> ${pedido.email}</p>
                <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
                <p><strong>Dirección:</strong> ${pedido.direccion}</p>
                <p><strong>Monto Pagado:</strong> $${(pedido.monto).toLocaleString('es-CO')} COP</p>
                <p><strong>Método de pago:</strong> ${pedido.metodo_pago}</p>
                <h4>Productos:</h4>
                <ul>${productosList}</ul>
            `
        });
        console.log(`[MAILER] Notificación de pedido pagado enviada al administrador: ${infoAdmin.messageId}`);
    } catch (error) {
        console.error("[MAILER] Error enviando confirmación de pedido pagado:", error.message);
    }
}

// 5. Pedido Pendiente de Pago
async function enviarPedidoPendientePago(pedido) {
    try {
        let productosList = '';
        try {
            const items = typeof pedido.productos === 'string' ? JSON.parse(pedido.productos) : pedido.productos;
            productosList = items.map(item => {
                const precio = parseInt(String(item.precio).replace(/[^0-9]/g, '')) || 0;
                const cantidad = parseInt(item.cantidad) || 1;
                return `<li>${item.titulo} x ${cantidad} - $${(precio * cantidad).toLocaleString('es-CO')} COP</li>`;
            }).join('');
        } catch (e) {
            productosList = `<li>Productos del pedido</li>`;
        }

        const metodo = (pedido.metodo_pago || 'nequi').toUpperCase();

        // Al cliente
        const infoCli = await transporter.sendMail({
            from: SMTP_FROM,
            to: pedido.email,
            subject: `⏳ Resumen de tu pedido ${pedido.referencia} - Pago pendiente FOURZA`,
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
                    <div style="max-width: 560px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 40px; text-align: center;">
                            <h1 style="color: #F97316; font-size: 1.8rem; margin: 0 0 4px;">FOURZA</h1>
                            <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">Comercialización y Distribución</p>
                        </div>
                        <div style="padding: 36px 40px;">
                            <h2 style="color: #0F172A; font-size: 1.3rem; margin: 0 0 12px;">¡Hola, ${pedido.nombre}! 👋</h2>
                            <p style="color: #475569; line-height: 1.7; margin: 0 0 20px;">
                                Hemos registrado tu pedido por un valor de <strong style="color: #F97316;">$${(pedido.monto).toLocaleString('es-CO')} COP</strong>. 
                                Para que podamos comenzar a prepararlo, solo falta que realices el pago y nos envíes el comprobante.
                            </p>
                            <div style="background: #f1f5f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.6;">
                                    <strong>Instrucciones de Pago:</strong><br>
                                    📌 <strong>Referencia:</strong> ${pedido.referencia}<br>
                                    💳 <strong>Método elegido:</strong> ${metodo}<br><br>
                                    Realiza la transferencia desde tu cuenta al número <strong>+57 322 819 4061</strong> y envíanos el comprobante por WhatsApp para aprobar tu pedido de inmediato.
                                </p>
                            </div>
                            <p style="color: #475569; font-size: 0.9rem; margin: 0 0 24px;">
                                <strong>Tus Productos:</strong>
                                <ul style="margin: 5px 0 0 20px; padding: 0; color: #475569;">${productosList}</ul>
                            </p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://wa.me/573228194061?text=Hola,%20acabo%20de%20hacer%20el%20pedido%20${pedido.referencia}%20y%20aqu%C3%AD%20est%C3%A1%20mi%20comprobante%20de%20pago" 
                                   style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 600; font-size: 0.9rem;">
                                    📲 Enviar Comprobante por WhatsApp
                                </a>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0;">
                                FOURZA S.A.S &bull; Este es un correo automático de nuestro sistema.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        console.log(`[MAILER] Pedido pendiente enviado al cliente (${pedido.email}): ${infoCli.messageId}`);

        // Al admin
        const infoAdmin = await transporter.sendMail({
            from: SMTP_FROM,
            to: ADMIN_EMAIL,
            subject: `🔔 Nuevo pedido pendiente de pago: ${pedido.referencia}`,
            html: `
                <h3>Nuevo pedido pendiente de comprobante</h3>
                <p><strong>Referencia:</strong> ${pedido.referencia}</p>
                <p><strong>Cliente:</strong> ${pedido.nombre}</p>
                <p><strong>Email:</strong> ${pedido.email}</p>
                <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
                <p><strong>Dirección:</strong> ${pedido.direccion}</p>
                <p><strong>Monto:</strong> $${(pedido.monto).toLocaleString('es-CO')} COP</p>
                <p><strong>Método:</strong> ${metodo}</p>
                <h4>Productos:</h4>
                <ul>${productosList}</ul>
            `
        });
        console.log(`[MAILER] Notificación de pedido pendiente enviada al admin: ${infoAdmin.messageId}`);
    } catch (error) {
        console.error("[MAILER] Error enviando pedido pendiente de pago:", error.message);
    }
}

// 6. Notificación de Reseña
async function enviarNotificacionResena(datos) {
    try {
        let info = await transporter.sendMail({
            from: SMTP_FROM,
            to: ADMIN_EMAIL,
            subject: `⭐ Nueva Reseña de Cliente: ${datos.calificacion} Estrellas`,
            html: `
                <h3>Nueva Calificación de Experiencia de Compra</h3>
                <p><strong>Referencia del Pedido:</strong> ${datos.referencia_pedido}</p>
                <p><strong>Cliente:</strong> ${datos.nombre_cliente || 'Anónimo'}</p>
                <p><strong>Calificación:</strong> ${datos.calificacion} / 5 Estrellas</p>
                <p><strong>Comentarios:</strong> ${datos.comentario || 'Ninguno'}</p>
            `
        });
        console.log(`[MAILER] Notificación de reseña enviada al admin: ${info.messageId}`);
    } catch (error) {
        console.error("[MAILER] Error enviando correo de reseña:", error.message);
    }
}

module.exports = {
    enviarNotificacionContacto,
    enviarNotificacionFeedback,
    enviarConfirmacionFeedbackCliente,
    enviarConfirmacionPedido,
    enviarPedidoPendientePago,
    enviarNotificacionResena
};
