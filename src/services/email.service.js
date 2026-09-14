const nodemailer = require('nodemailer');
const {
    getWelcomeEmailHtml,
    getOrderConfirmationHtml,
    getPaymentConfirmationHtml,
    getOrderStatusUpdateHtml
} = require('../templates/emailTemplates');

const emailUser = process.env.EMAIL_USER || 'mairajewels.za@gmail.com';
const emailPass = (process.env.EMAIL_PASS || 'wdlzrfoofihkqhsy').replace(/\s+/g, '');
const emailFrom = process.env.EMAIL_FROM || `"Maira Jewels Luxury" <${emailUser}>`;

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
 * Generic Mail Dispatcher
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
            subject,
            html,
            text: text || subject
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Email sent successfully to ${to} [MessageId: ${info.messageId}]`);
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
    const html = getWelcomeEmailHtml({
        name: user.name,
        email: user.email,
        customerId: user.customerId
    });

    return sendEmail({
        to: user.email,
        subject: '✨ Welcome to Maira Jewels | Your Private Invitation to Luxury',
        html
    });
};

/**
 * 2. Send Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (order) => {
    const to = order?.customer?.email || order?.user?.email;
    if (!to) return false;

    const html = getOrderConfirmationHtml(order);
    return sendEmail({
        to,
        subject: `💎 Order Confirmed: #${order.orderNumber || 'MJ-ORDER'} | Maira Jewels`,
        html
    });
};

/**
 * 3. Send Payment Confirmation / Receipt Email
 */
const sendPaymentConfirmationEmail = async (payment, order) => {
    const to = payment?.customerEmail || order?.customer?.email || order?.user?.email;
    if (!to) return false;

    const html = getPaymentConfirmationHtml(payment, order);
    return sendEmail({
        to,
        subject: `✓ Payment Verified: Order #${payment.orderNumber || order?.orderNumber || 'MJ-ORDER'} | Maira Jewels`,
        html
    });
};

/**
 * 4. Send Order Status Update Email
 */
const sendOrderStatusUpdateEmail = async (order, oldStatus, newStatus) => {
    const to = order?.customer?.email || order?.user?.email;
    if (!to) return false;

    const html = getOrderStatusUpdateHtml(order, oldStatus, newStatus);
    const statusUpper = (newStatus || order.orderStatus || 'Updated').toUpperCase();

    return sendEmail({
        to,
        subject: `📦 Order Update: #${order.orderNumber} is now ${statusUpper} | Maira Jewels`,
        html
    });
};

module.exports = {
    transporter,
    sendEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendOrderStatusUpdateEmail
};
