const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require('nodemailer');

let transporter;

async function initMailer() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log("Servicio de correos (SMTP) inicializado.");
    } else {
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("Servicio de correos (Ethereal Generado) inicializado.");
    }
}

initMailer().catch((error) => {
    transporter = nodemailer.createTransport({ jsonTransport: true });
    console.warn("No se pudo inicializar Ethereal. Correos en modo local JSON:", error.message);
});

async function enviarNotificacionContacto(contacto) {
    try {
        let info = await transporter.sendMail({
            from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || "alexan321kass@gmail.com", // Correo del administrador de pruebas
            subject: "Nuevo Mensaje de Contacto",
            text: `Has recibido un nuevo mensaje de ${contacto.nombre} (${contacto.email}).\nTeléfono: ${contacto.telefono}\nMensaje: ${contacto.mensaje}`,
            html: `<h3>Nuevo Mensaje de Contacto</h3>
                   <p><strong>Nombre:</strong> ${contacto.nombre}</p>
                   <p><strong>Email:</strong> ${contacto.email}</p>
                   <p><strong>Teléfono:</strong> ${contacto.telefono}</p>
                   <p><strong>Mensaje:</strong> ${contacto.mensaje}</p>`,
        });
        console.log("Mensaje de Contacto Enviado. URL de prueba: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error enviando correo de contacto:", error);
    }
}

async function enviarNotificacionFeedback(feedback) {
    try {
        let info = await transporter.sendMail({
            from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || "alexan321kass@gmail.com",
            subject: `Nueva Queja o Sugerencia: ${feedback.categoria}`,
            text: `Has recibido un nuevo mensaje de ${feedback.nombre} (${feedback.email}).\nTeléfono: ${feedback.telefono}\nTipo de mensaje: ${feedback.categoria}\nDescripción: ${feedback.descripcion}`,
            html: `<h3>Nueva Queja o Sugerencia</h3>
                   <p><strong>Nombre:</strong> ${feedback.nombre}</p>
                   <p><strong>Email:</strong> ${feedback.email}</p>
                   <p><strong>Teléfono:</strong> ${feedback.telefono}</p>
                   <p><strong>Tipo de mensaje:</strong> ${feedback.categoria}</p>
                   <p><strong>Descripción:</strong> ${feedback.descripcion}</p>`,
        });
        console.log("Correo de Feedback Enviado. URL de prueba: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error enviando correo de feedback:", error);
    }
}

async function enviarConfirmacionFeedbackCliente(feedback) {
    try {
        await transporter.sendMail({
            from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,
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
                                Hemos recibido exitosamente tu mensaje calificado como 
                                <strong style="color: #F97316;">${feedback.categoria}</strong>. 
                                Apreciamos mucho que nos hayas compartido tu opinión. Un asesor de FOURZA se comunicará contigo si es necesario.
                            </p>
                            <div style="background: #f1f5f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">
                                    <strong>Tu mensaje en resumen:</strong><br>
                                    📌 <strong>Tipo:</strong> ${feedback.categoria}<br>
                                    📝 <strong>Descripción:</strong> ${feedback.descripcion || 'No especificada'}<br>
                                    📞 <strong>Teléfono de contacto:</strong> ${feedback.telefono || 'No especificado'}
                                </p>
                            </div>
                            <p style="color: #475569; font-size: 0.9rem; margin: 0 0 24px;">
                                Si tienes preguntas urgentes, también puedes contactarnos directamente por WhatsApp.
                            </p>
                             <a href="https://wa.me/573228194061" 
                               style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 600; font-size: 0.9rem;">
                                📲 Contactar por WhatsApp
                            </a>
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0;">
                                FOURZA S.A.S &bull; Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        console.log("Correo de confirmación enviado al cliente:", cotizacion.email);
    } catch (error) {
        console.error("Error enviando confirmación al cliente:", error);
    }
}

async function enviarConfirmacionPedido(pedido) {
    try {
        let productosList = '';
        try {
            const items = JSON.parse(pedido.productos);
            productosList = items.map(item => `<li>${item.titulo} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString('es-CO')} COP</li>`).join('');
        } catch (e) {
            productosList = `<li>Error cargando productos</li>`;
        }

        // Correo al cliente
        await transporter.sendMail({
            from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,
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
                                Tu pago por un valor de <strong style="color: #F97316;">$${(pedido.monto).toLocaleString('es-CO')} COP</strong> ha sido aprobado de manera exitosa.
                                Tu pedido con referencia <strong style="color: #0F172A;">${pedido.referencia}</strong> ya está siendo procesado por nuestro equipo.
                            </p>
                            <div style="background: #f1f5f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">
                                    <strong>Detalles del envío:</strong><br>
                                    📍 <strong>Dirección:</strong> ${pedido.direccion || 'No especificada'}<br>
                                    📞 <strong>Teléfono:</strong> ${pedido.telefono || 'No especificado'}<br>
                                    💳 <strong>Método de pago:</strong> ${pedido.metodo_pago || 'Pago manual'}<br>
                                    🛒 <strong>Productos:</strong>
                                    <ul style="margin: 5px 0 0 20px; padding: 0;">
                                        ${productosList}
                                    </ul>
                                </p>
                            </div>
                            <p style="color: #475569; font-size: 0.9rem; margin: 0 0 24px;">
                                Si tienes alguna duda, puedes contactar a tu asesor por WhatsApp.
                            </p>
                            <a href="https://wa.me/573228194061" 
                               style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 600; font-size: 0.9rem;">
                                📲 Contactar por WhatsApp
                            </a>
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0;">
                                FOURZA S.A.S &bull; Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        console.log("Correo de confirmación de pedido enviado al cliente:", pedido.email);

        // Correo al administrador
        await transporter.sendMail({
            from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || "alexan321kass@gmail.com",
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
                <p><strong>Referencia de pago:</strong> ${pedido.referencia}</p>
                <h4>Productos:</h4>
                <ul>
                    ${productosList}
                </ul>
            `
        });
        console.log("Notificación de pedido enviado al administrador.");
    } catch (error) {
        console.error("Error enviando confirmación de pedido:", error);
    }
}

async function enviarPedidoPendientePago(pedido) {
    try {
        let productosList = '';
        try {
            const items = JSON.parse(pedido.productos);
            productosList = items.map(item => {
                const precio = parseInt(String(item.precio).replace(/[^0-9]/g, '')) || 0;
                const cantidad = parseInt(item.cantidad) || 1;
                return `<li>${item.titulo} x ${cantidad} - $${(precio * cantidad).toLocaleString('es-CO')} COP</li>`;
            }).join('');
        } catch (e) {
            productosList = `<li>Error cargando productos</li>`;
        }

        const metodo = (pedido.metodo_pago || 'nequi').toUpperCase();

        await transporter.sendMail({
            from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,
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
                                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">
                                    <strong>Instrucciones de Pago:</strong><br>
                                    📌 <strong>Referencia:</strong> ${pedido.referencia}<br>
                                    💳 <strong>Método elegido:</strong> ${metodo}<br>
                                    <br>
                                    Realiza la transferencia desde tu cuenta al número +57 322 819 4061 y envíanos el pantallazo (comprobante) directamente a nuestro WhatsApp oficial para aprobar tu pedido de inmediato.
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

        await transporter.sendMail({
            from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || "alexan321kass@gmail.com",
            subject: `Nuevo pedido pendiente de pago: ${pedido.referencia}`,
            html: `
                <h3>Nuevo pedido pendiente de comprobante</h3>
                <p><strong>Referencia:</strong> ${pedido.referencia}</p>
                <p><strong>Cliente:</strong> ${pedido.nombre}</p>
                <p><strong>Email:</strong> ${pedido.email}</p>
                <p><strong>Telefono:</strong> ${pedido.telefono}</p>
                <p><strong>Direccion:</strong> ${pedido.direccion}</p>
                <p><strong>Monto:</strong> $${(pedido.monto).toLocaleString('es-CO')} COP</p>
                <p><strong>Metodo:</strong> ${metodo}</p>
                <h4>Productos</h4>
                <ul>${productosList}</ul>
            `
        });
        console.log("Notificacion de pedido pendiente enviada:", pedido.referencia);
    } catch (error) {
        console.error("Error enviando pedido pendiente de pago:", error);
    }
}

async function enviarNotificacionResena(datos) {
    try {
        let info = await transporter.sendMail({
            from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || "alexan321kass@gmail.com",
            subject: `Nueva Reseña de Cliente: ${datos.calificacion} Estrellas`,
            html: `<h3>Nueva Calificación de Experiencia de Compra</h3>
                   <p><strong>Referencia del Pedido:</strong> ${datos.referencia_pedido}</p>
                   <p><strong>Calificación:</strong> ${datos.calificacion} / 5 Estrellas</p>
                   <p><strong>Comentarios:</strong> ${datos.comentario || 'Ninguno'}</p>`
        });
        console.log("Notificación de reseña enviada. URL de prueba: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error enviando correo de reseña:", error);
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
