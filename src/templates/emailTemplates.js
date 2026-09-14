/**
 * Maira Jewels - Luxury Email Template Engine
 * Ultra-responsive, bulletproof HTML email layouts tailored for luxury fine jewellery clients.
 */

const baseEmailWrapper = (content, previewText = '') => {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Maira Jewels</title>
    <!--[if mso]>
    <style>
      * { font-family: 'Georgia', serif !important; }
    </style>
    <![endif]-->
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0f0e0d;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #e5dfd5;
            -webkit-font-smoothing: antialiased;
        }
        table { border-collapse: collapse; }
        img { border: 0; outline: none; text-decoration: none; }
        a { text-decoration: none; }
        .gold-btn {
            display: inline-block;
            background: linear-gradient(135deg, #dfba73 0%, #c5a059 50%, #a8843c 100%);
            color: #0d0d0c !important;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 14px 32px;
            border-radius: 4px;
            text-align: center;
        }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .stack-column { display: block !important; width: 100% !important; }
            .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0e0d;">
    <!-- Hidden Preview Text -->
    <div style="display: none; font-size: 1px; color: #0f0e0d; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${previewText}
    </div>

    <!-- Main Table Container -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f0e0d; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 15px;">
                
                <!-- Email Card Frame -->
                <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #171614; border: 1px solid #2e2b26; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
                    
                    <!-- Header with Gold Accent -->
                    <tr>
                        <td align="center" style="padding: 35px 30px 25px; background-color: #131210; border-bottom: 1px solid #2e2b26;">
                            <div style="font-size: 11px; letter-spacing: 4px; color: #c5a059; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">Fine Luxury Jewellery</div>
                            <div style="font-family: 'Georgia', serif; font-size: 28px; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; font-weight: 400;">
                                M A I R A
                            </div>
                            <div style="font-size: 10px; letter-spacing: 5px; color: #a19a8e; text-transform: uppercase; margin-top: 4px;">J E W E L S</div>
                            <div style="width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #c5a059, transparent); margin: 16px auto 0;"></div>
                        </td>
                    </tr>

                    <!-- Main Dynamic Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 35px 40px;">
                            ${content}
                        </td>
                    </tr>

                    <!-- Luxury Footer -->
                    <tr>
                        <td align="center" style="padding: 30px 30px 35px; background-color: #100f0e; border-top: 1px solid #262420; font-size: 12px; color: #8a8377; line-height: 1.8;">
                            <div style="color: #c5a059; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">MAIRA JEWELS CONCIERGE</div>
                            <div>Cape Town & Johannesburg, South Africa</div>
                            <div>Email: <a href="mailto:mairajewels.za@gmail.com" style="color: #c5a059;">mairajewels.za@gmail.com</a> | Web: <a href="https://www.mairajewels.co.za" style="color: #c5a059;">www.mairajewels.co.za</a></div>
                            <div style="margin-top: 15px; font-size: 11px; color: #5c574f;">
                                © ${new Date().getFullYear()} Maira Jewels. All rights reserved. Handcrafted with bespoke passion.
                            </div>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>`;
};

/**
 * 1. Welcome Greeting Email
 */
const getWelcomeEmailHtml = ({ name, email, customerId }) => {
    const displayName = name ? name.split(' ')[0] : 'Valued Client';
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background: #26221a; border: 1px solid #c5a059; color: #dfba73; font-size: 22px; margin-bottom: 15px;">
                ✨
            </div>
            <h1 style="font-family: 'Georgia', serif; font-size: 26px; color: #ffffff; margin: 0 0 10px; font-weight: 400; letter-spacing: 0.5px;">
                Welcome to Maira Jewels
            </h1>
            <p style="font-size: 14px; color: #c5a059; letter-spacing: 1px; text-transform: uppercase; margin: 0;">
                Your Personal Invitation to Luxury
            </p>
        </div>

        <div style="font-size: 15px; line-height: 1.7; color: #d6cfc3;">
            <p style="margin-top: 0;">Dear <strong>${displayName}</strong>,</p>
            <p>
                It is our absolute pleasure to welcome you to the private inner circle of <strong>Maira Jewels</strong>. 
                Your personal client account has been created successfully.
            </p>

            ${customerId ? `
            <div style="background-color: #1f1d19; border: 1px solid #363229; border-radius: 6px; padding: 16px 20px; margin: 24px 0; text-align: center;">
                <span style="font-size: 12px; letter-spacing: 1.5px; color: #9e9587; text-transform: uppercase;">Your Private Client ID</span>
                <div style="font-family: monospace; font-size: 18px; color: #dfba73; font-weight: 700; margin-top: 4px; letter-spacing: 2px;">${customerId}</div>
            </div>` : ''}

            <p>
                Each creation in our atelier is meticulously shaped by master artisans, combining certified natural gemstones, 18K/24K solid gold, and timeless platinum.
            </p>

            <div style="margin: 28px 0; border-left: 2px solid #c5a059; padding-left: 18px;">
                <div style="color: #ffffff; font-weight: 600; margin-bottom: 4px;">Exclusive Client Privileges:</div>
                <ul style="margin: 6px 0 0; padding-left: 18px; color: #b8b0a2; font-size: 14px;">
                    <li>Priority access to limited high-jewellery releases</li>
                    <li>Complimentary insured worldwide delivery</li>
                    <li>Lifetime authenticity guarantee & valuation certificates</li>
                    <li>Bespoke custom jewellery consultations</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 35px 0 20px;">
                <a href="https://www.mairajewels.co.za" class="gold-btn">
                    Explore The Collection
                </a>
            </div>

            <p style="font-size: 13px; color: #9c9486; margin-top: 30px; text-align: center;">
                If you ever require private styling guidance or bespoke resizing, our dedicated concierge team is at your complete disposal.
            </p>
        </div>
    `;

    return baseEmailWrapper(content, `Welcome to Maira Jewels, ${displayName}. Your personal journey into luxury fine jewellery begins here.`);
};

/**
 * 2. Order Confirmation Email
 */
const getOrderConfirmationHtml = (order) => {
    const customerName = order.customer?.name || 'Valued Customer';
    const orderNumber = order.orderNumber || order._id || 'MJ-ORDER';
    const items = order.items || [];
    const total = order.total || order.totalAmount || 0;
    const formattedTotal = typeof total === 'number'
        ? `R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : total;

    const shipping = order.shippingAddress || {};
    const street = typeof shipping === 'string' ? shipping : `${shipping.street || ''} ${shipping.city || ''} ${shipping.province || ''} ${shipping.postalCode || ''}`.trim();

    const itemsHtml = items.map(item => {
        const itemImage = item.image || item.img || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80';
        const itemPrice = typeof item.price === 'number'
            ? `R ${item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : item.price;
        const specs = [item.size || item.sizes, item.color || item.colour, item.metal, item.gem].filter(Boolean).join(' • ');

        return `
        <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #292621; vertical-align: middle;" width="70">
                <img src="${itemImage}" alt="${item.name}" width="60" height="60" style="border-radius: 6px; object-fit: cover; border: 1px solid #363229; display: block;" onerror="this.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80';" />
            </td>
            <td style="padding: 16px 15px; border-bottom: 1px solid #292621; vertical-align: middle;">
                <div style="font-weight: 600; font-size: 14px; color: #ffffff;">${item.name}</div>
                ${specs ? `<div style="font-size: 12px; color: #9c9486; margin-top: 3px;">${specs}</div>` : ''}
                <div style="font-size: 12px; color: #c5a059; margin-top: 3px;">Qty: ${item.quantity || 1}</div>
            </td>
            <td align="right" style="padding: 16px 0; border-bottom: 1px solid #292621; vertical-align: middle; font-weight: 700; font-size: 14px; color: #dfba73;">
                ${itemPrice}
            </td>
        </tr>`;
    }).join('');

    const content = `
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #26221a; border: 1px solid #c5a059; color: #dfba73; font-size: 20px; margin-bottom: 12px;">
                💎
            </div>
            <h1 style="font-family: 'Georgia', serif; font-size: 24px; color: #ffffff; margin: 0 0 6px; font-weight: 400;">
                Order Confirmed
            </h1>
            <div style="font-size: 13px; color: #c5a059; letter-spacing: 1px;">
                ORDER #${orderNumber}
            </div>
        </div>

        <div style="font-size: 14px; color: #d6cfc3; line-height: 1.6;">
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Thank you for choosing Maira Jewels. Your acquisition has been safely received and is now transitioning to our quality curation atelier.</p>
        </div>

        <!-- Items Table -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 10px;">
            <thead>
                <tr>
                    <th colspan="2" align="left" style="font-size: 11px; letter-spacing: 1px; color: #8a8377; text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid #363229;">Item Details</th>
                    <th align="right" style="font-size: 11px; letter-spacing: 1px; color: #8a8377; text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid #363229;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <!-- Totals Breakdown -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px; font-size: 13px; color: #b8b0a2;">
            <tr>
                <td style="padding: 6px 0;">Subtotal:</td>
                <td align="right" style="color: #ffffff;">${formattedTotal}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0;">Insured Express Delivery:</td>
                <td align="right" style="color: #27ae60; font-weight: 600;">Complimentary</td>
            </tr>
            <tr>
                <td style="padding: 12px 0 6px; font-size: 16px; font-weight: 700; color: #ffffff; border-top: 1px solid #363229;">Grand Total:</td>
                <td align="right" style="padding: 12px 0 6px; font-size: 18px; font-weight: 700; color: #dfba73; border-top: 1px solid #363229;">${formattedTotal}</td>
            </tr>
        </table>

        <!-- Shipping & Details Box -->
        <div style="background-color: #1a1815; border: 1px solid #2e2b26; border-radius: 6px; padding: 18px; margin: 25px 0;">
            <div style="font-size: 11px; letter-spacing: 1.5px; color: #c5a059; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">Delivery Address</div>
            <div style="font-size: 13px; color: #d6cfc3; line-height: 1.5;">${street || 'Standard Courier Address'}</div>
            <div style="margin-top: 12px; font-size: 12px; color: #8a8377;">
                Payment Method: <span style="color: #ffffff;">${order.paymentMethod || 'Credit Card / Electronic Funds'}</span> | Status: <span style="color: #27ae60; font-weight: 600;">${order.paymentStatus || 'Verified'}</span>
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0 10px;">
            <a href="https://www.mairajewels.co.za/orders" class="gold-btn">
                View Order Details
            </a>
        </div>
    `;

    return baseEmailWrapper(content, `Order #${orderNumber} confirmed. Thank you for your purchase from Maira Jewels.`);
};

/**
 * 3. Payment Confirmation / Receipt Email
 */
const getPaymentConfirmationHtml = (payment, order = {}) => {
    const customerName = payment.customerName || order.customer?.name || 'Valued Customer';
    const amount = payment.amount || order.totalAmount || 0;
    const formattedAmount = typeof amount === 'number'
        ? `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : amount;
    const txnId = payment.transactionId || `TXN-${Date.now()}`;
    const orderNumber = payment.orderNumber || order.orderNumber || 'MJ-ORDER';
    const method = payment.method || order.paymentMethod || 'Credit Card / EFT';

    const content = `
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #142a1b; border: 1px solid #27ae60; color: #2ecc71; font-size: 20px; margin-bottom: 12px;">
                ✓
            </div>
            <h1 style="font-family: 'Georgia', serif; font-size: 24px; color: #ffffff; margin: 0 0 6px; font-weight: 400;">
                Payment Received & Verified
            </h1>
            <div style="font-size: 13px; color: #2ecc71; letter-spacing: 1px; font-weight: 600;">
                TRANSACTION CONFIRMED
            </div>
        </div>

        <div style="font-size: 14px; color: #d6cfc3; line-height: 1.6;">
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>We have successfully processed and verified your payment for order <strong>#${orderNumber}</strong>. Please retain this email for your financial records.</p>
        </div>

        <!-- Receipt Summary Box -->
        <div style="background-color: #1a1815; border: 1px solid #2e2b26; border-radius: 6px; padding: 22px; margin: 25px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 2;">
                <tr>
                    <td style="color: #8a8377;">Amount Paid:</td>
                    <td align="right" style="color: #dfba73; font-size: 17px; font-weight: 700;">${formattedAmount}</td>
                </tr>
                <tr>
                    <td style="color: #8a8377;">Transaction ID:</td>
                    <td align="right" style="color: #ffffff; font-family: monospace; font-size: 13px;">${txnId}</td>
                </tr>
                <tr>
                    <td style="color: #8a8377;">Order Reference:</td>
                    <td align="right" style="color: #ffffff; font-weight: 600;">#${orderNumber}</td>
                </tr>
                <tr>
                    <td style="color: #8a8377;">Payment Method:</td>
                    <td align="right" style="color: #ffffff;">${method}</td>
                </tr>
                <tr>
                    <td style="color: #8a8377;">Date & Time:</td>
                    <td align="right" style="color: #ffffff;">${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                    <td style="color: #8a8377;">Status:</td>
                    <td align="right" style="color: #2ecc71; font-weight: 700;">Paid in Full (ZAR)</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin: 30px 0 10px;">
            <a href="https://www.mairajewels.co.za/account" class="gold-btn">
                View Client Portal
            </a>
        </div>
    `;

    return baseEmailWrapper(content, `Payment Receipt: ${formattedAmount} for Order #${orderNumber} at Maira Jewels.`);
};

/**
 * 4. Order Status Update Email
 */
const getOrderStatusUpdateHtml = (order, oldStatus, newStatus) => {
    const customerName = order.customer?.name || 'Valued Customer';
    const orderNumber = order.orderNumber || order._id || 'MJ-ORDER';
    const tracking = order.trackingNumber || 'Available upon carrier dispatch';
    const statusFormatted = (newStatus || order.orderStatus || 'Processing').toUpperCase();

    let statusBadgeColor = '#c5a059';
    let statusMessage = 'Your bespoke piece is being carefully prepared by our master jewellers.';
    let icon = '📦';

    if (/shipped|dispatched|transit/i.test(newStatus)) {
        statusBadgeColor = '#3498db';
        statusMessage = 'Your fine jewellery parcel has been dispatched in our secure, discreet tamper-proof packaging.';
        icon = '🚚';
    } else if (/delivered|completed/i.test(newStatus)) {
        statusBadgeColor = '#2ecc71';
        statusMessage = 'Your parcel has arrived safely at its destination. We hope you cherish this precious heirloom.';
        icon = '✨';
    } else if (/cancelled/i.test(newStatus)) {
        statusBadgeColor = '#e74c3c';
        statusMessage = 'Your order status has been updated to Cancelled. Any associated refund will be processed immediately.';
        icon = 'ℹ️';
    }

    const content = `
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #26221a; border: 1px solid ${statusBadgeColor}; color: ${statusBadgeColor}; font-size: 20px; margin-bottom: 12px;">
                ${icon}
            </div>
            <h1 style="font-family: 'Georgia', serif; font-size: 24px; color: #ffffff; margin: 0 0 6px; font-weight: 400;">
                Order Status Update
            </h1>
            <div style="display: inline-block; background-color: #1f1d19; border: 1px solid ${statusBadgeColor}; color: ${statusBadgeColor}; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 20px; margin-top: 6px;">
                ${statusFormatted}
            </div>
        </div>

        <div style="font-size: 14px; color: #d6cfc3; line-height: 1.6;">
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>${statusMessage}</p>
        </div>

        <!-- Tracking & Status Details Card -->
        <div style="background-color: #1a1815; border: 1px solid #2e2b26; border-radius: 6px; padding: 20px; margin: 25px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 2;">
                <tr>
                    <td style="color: #8a8377;">Order Number:</td>
                    <td align="right" style="color: #ffffff; font-weight: 700;">#${orderNumber}</td>
                </tr>
                <tr>
                    <td style="color: #8a8377;">Current Status:</td>
                    <td align="right" style="color: ${statusBadgeColor}; font-weight: 700;">${statusFormatted}</td>
                </tr>
                <tr>
                    <td style="color: #8a8377;">Tracking Number:</td>
                    <td align="right" style="color: #dfba73; font-family: monospace;">${tracking}</td>
                </tr>
                <tr>
                    <td style="color: #8a8377;">Carrier:</td>
                    <td align="right" style="color: #ffffff;">The Courier Guy / RAM Hand-to-Hand</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin: 30px 0 10px;">
            <a href="https://www.mairajewels.co.za/orders" class="gold-btn">
                Track Shipment Live
            </a>
        </div>
    `;

    return baseEmailWrapper(content, `Status Update: Order #${orderNumber} is now ${statusFormatted} - Maira Jewels.`);
};

module.exports = {
    getWelcomeEmailHtml,
    getOrderConfirmationHtml,
    getPaymentConfirmationHtml,
    getOrderStatusUpdateHtml
};
