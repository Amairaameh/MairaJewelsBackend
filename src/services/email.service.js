const nodemailer = require('nodemailer');
const {
    getOrderStatusUpdateHtml,
    getOrderStatusUpdateText,
    getOrderConfirmationHtml,
    getOrderConfirmationText,
    getPaymentConfirmationHtml,
    getPaymentConfirmationText,
    getPaymentStatusEmailHtml,
    getPaymentStatusEmailText,
    getWelcomeEmailHtml,
    getWelcomeEmailText
} = require('../templates/emailTemplates');

const emailUser = process.env.EMAIL_USER || 'mairajewels.za@gmail.com';
const emailPass = (process.env.EMAIL_PASS || 'wdlzrfoofihkqhsy').replace(/\s+/g, '');
const companyName = process.env.COMPANY_NAME || 'Maira Jewels';
const emailFrom = process.env.EMAIL_FROM || `"${companyName}" <${emailUser}>`;

// Create Nodemailer Transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: emailUser,
        pass: emailPass
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * High-Deliverability Email Dispatcher (SPF/DKIM/SpamAssassin compliant)
 */
const sendEmail = async ({ to, subject, html, text }) => {
    if (!to) {
        console.warn('[Email Service Warning] No recipient email specified.');
        return false;
    }

    try {
        const mailOptions = {
            from: emailFrom,
            to,
            replyTo: emailUser,
            subject,
            html,
            text: text || subject,
            headers: {
                'X-Mailer': 'Maira Jewels E-Commerce System',
                'X-Auto-Response-Suppress': 'OOF, AutoReply',
                'Precedence': 'bulk',
                'List-Unsubscribe': `<mailto:${emailUser}?subject=Unsubscribe>`
            }
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Email dispatched successfully to ${to} [Subject: "${subject}", MessageId: ${info.messageId}]`);
        return info;
    } catch (error) {
        console.error(`[Email Service Error] Failed sending email to ${to}:`, error.message);
        return false;
    }
};

/**
 * 1. Send Welcome / Greeting Email upon Registration
 */
const sendWelcomeEmail = async (user) => {
    if (!user || !user.email) return false;
    
    const html = getWelcomeEmailHtml(user);
    const text = getWelcomeEmailText(user);

    return sendEmail({
        to: user.email,
        subject: `Welcome to Maira Jewels - Your Private Luxury Invitation`,
        html,
        text
    });
};

/**
 * 2. Send Order Confirmation Email (Upon Checkout)
 */
const sendOrderConfirmationEmail = async (order) => {
    const to = order?.customer?.email || order?.user?.email;
    if (!to) return false;

    const orderNum = order.orderNumber || order._id || 'MJ-ORDER';
    const html = getOrderConfirmationHtml(order);
    const text = getOrderConfirmationText(order);

    const clientRes = await sendEmail({
        to,
        subject: `Order Confirmation #${orderNum} - Maira Jewels`,
        html,
        text
    });

    // Notify boutique owner of new incoming order
    if (emailUser && emailUser.toLowerCase() !== to.toLowerCase()) {
        sendEmail({
            to: emailUser,
            subject: `[NEW ORDER] #${orderNum} - ${order?.customer?.name || 'Customer'} (${order?.totalAmount ? `R ${order.totalAmount}` : ''})`,
            html,
            text
        }).catch(err => console.error('[Owner Order Notification Email Error]:', err.message));
    }

    return clientRes;
};

/**
 * 3. Send Payment Status Email (Paid, Unpaid, Failed, Refunded)
 */
const sendPaymentStatusEmail = async (payment, order = {}, targetStatus = '') => {
    const to = payment?.customerEmail || order?.customer?.email || order?.user?.email;
    if (!to) return false;

    const orderNum = payment?.orderNumber || order?.orderNumber || 'MJ-ORDER';
    const statusClean = (targetStatus || payment?.status || order?.paymentStatus || 'Pending').trim();
    const s = statusClean.toLowerCase();

    let subject = `Payment Status Update: Order #${orderNum} (${statusClean}) - Maira Jewels`;
    if (s.includes('paid') || s.includes('complete')) {
        subject = `Official Payment Receipt: Order #${orderNum} - Maira Jewels`;
    } else if (s.includes('fail')) {
        subject = `Action Required: Payment Unsuccessful for Order #${orderNum} - Maira Jewels`;
    } else if (s.includes('refund')) {
        subject = `Refund Processed: Order #${orderNum} - Maira Jewels`;
    } else if (s.includes('unpaid') || s.includes('pending')) {
        subject = `Payment Pending: Order #${orderNum} - Complete via WhatsApp`;
    }

    const html = getPaymentStatusEmailHtml(payment, order, statusClean);
    const text = getPaymentStatusEmailText(payment, order, statusClean);

    return sendEmail({
        to,
        subject,
        html,
        text
    });
};

const sendPaymentConfirmationEmail = async (payment, order) => {
    return sendPaymentStatusEmail(payment, order, 'Paid');
};

/**
 * 4. Send Order Status Update Email (Admin updates status)
 */
const sendOrderStatusUpdateEmail = async (order, oldStatus, newStatus) => {
    const to = order?.customer?.email || order?.user?.email;
    if (!to) return false;

    const orderNum = order.orderNumber || order._id || 'MJ-ORDER';
    const statusResolved = (newStatus || order.orderStatus || 'Updated').trim();
    const s = statusResolved.toLowerCase();

    // Clean, professional, high-deliverability subject line
    let subject = `Order Update: #${orderNum} is now ${statusResolved} - Maira Jewels`;
    if (s.includes('ship') || s.includes('dispatch') || s.includes('transit')) {
        subject = `Your Maira Jewels order #${orderNum} has shipped`;
    } else if (s.includes('out for delivery')) {
        subject = `Out for Delivery: Your Maira Jewels order #${orderNum}`;
    } else if (s.includes('deliver') || s.includes('complete')) {
        subject = `Delivered: Your Maira Jewels order #${orderNum}`;
    } else if (s.includes('process') || s.includes('craft') || s.includes('product') || s.includes('atelier')) {
        subject = `Order Update: #${orderNum} is in atelier crafting - Maira Jewels`;
    } else if (s.includes('cancel')) {
        subject = `Order Update: Order #${orderNum} has been cancelled - Maira Jewels`;
    }

    const html = getOrderStatusUpdateHtml(order, oldStatus, statusResolved);
    const text = getOrderStatusUpdateText(order, oldStatus, statusResolved);

    return sendEmail({
        to,
        subject,
        html,
        text
    });
};

module.exports = {
    transporter,
    sendEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendPaymentStatusEmail,
    sendOrderStatusUpdateEmail
};
