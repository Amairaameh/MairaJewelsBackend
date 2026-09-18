/**
 * Maira Jewels - Amazon-Style Minimal, Professional, Premium & Luxury Email Templates
 * Engineered for maximum inbox deliverability (SPF/DKIM/SpamAssassin compliant), 
 * bulletproof cross-client rendering (Gmail, Apple Mail, Outlook, Mobile), 
 * and an ultra-refined luxury e-commerce aesthetic.
 */

const COMPANY_NAME = process.env.COMPANY_NAME || 'Maira Jewels';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'mairajewels.za@gmail.com';
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+27 83 922 8383';
const CLIENT_URL = process.env.CLIENT_URL || 'https://www.mairajewels.co.za';

const { parsePrice, formatPrice } = require('../utils/priceFormatter');

// Base HTML Wrapper for all Luxury Emails
const baseEmailWrapper = (content, previewText = '', title = 'Maira Jewels') => {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${title}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td, a { font-family: 'Segoe UI', Arial, sans-serif !important; }
    </style>
    <![endif]-->
    <style type="text/css">
        /* Client-specific Resets */
        #outlook a { padding: 0; }
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f7f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

        /* Amazon-Style Luxury Classes */
        .btn-gold {
            display: inline-block;
            background-color: #1a1918;
            background: linear-gradient(135deg, #2a2825 0%, #171615 100%);
            color: #ffffff !important;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-align: center;
            text-decoration: none;
            padding: 13px 30px;
            border-radius: 6px;
            border: 1px solid #c5a059;
            box-shadow: 0 2px 5px rgba(0,0,0,0.12);
        }
        .btn-gold:hover {
            background-color: #c5a059 !important;
            color: #111111 !important;
        }
        .btn-secondary {
            display: inline-block;
            background-color: #ffffff;
            color: #1a1918 !important;
            font-size: 13px;
            font-weight: 600;
            text-align: center;
            text-decoration: none;
            padding: 11px 24px;
            border-radius: 6px;
            border: 1px solid #d5cfc5;
        }

        /* Responsive Layout */
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; border-radius: 0 !important; }
            .mobile-p-20 { padding-left: 18px !important; padding-right: 18px !important; }
            .col-split { display: block !important; width: 100% !important; margin-bottom: 16px !important; }
            .step-text { font-size: 10px !important; }
            .header-date { text-align: left !important; margin-top: 8px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f6f4; -webkit-font-smoothing: antialiased;">
    <!-- Hidden Preheader text for inbox preview (prevents showing unwanted text snippets) -->
    <div style="display: none; font-size: 1px; color: #f7f6f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
        ${previewText}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <!-- Outer Wrapper Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f6f4; width: 100%; margin: 0; padding: 25px 0 40px;">
        <tr>
            <td align="center" style="padding: 0 10px;">
                
                <!-- Main Email Card Frame (Amazon Minimalist x Luxury Jewellery Style) -->
                <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; border: 1px solid #e5e1d8; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);">
                    
                    <!-- Clean Brand Header Bar -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #121110; border-bottom: 2px solid #c5a059;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="vertical-align: middle;">
                                        <div style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 20px; font-weight: 700; letter-spacing: 3.5px; color: #ffffff; text-transform: uppercase;">
                                            MAIRA <span style="color: #c5a059; font-weight: 300;">JEWELS</span>
                                        </div>
                                        <div style="font-size: 9px; letter-spacing: 2px; color: #b0a89a; text-transform: uppercase; margin-top: 3px;">
                                            Fine Luxury Jewellery &bull; South Africa
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Dynamic Content -->
                    <tr>
                        <td class="mobile-p-20" style="padding: 32px 36px 28px;">
                            ${content}
                        </td>
                    </tr>

                    <!-- Trust & Guarantee Banner -->
                    <tr>
                        <td style="padding: 16px 36px; background-color: #faf9f6; border-top: 1px solid #eeebe3; border-bottom: 1px solid #eeebe3;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 11px; color: #6e675f; text-align: center;">
                                <tr>
                                    <td align="center" style="padding: 4px 8px;">
                                        <span style="color: #c5a059; font-weight: 700;">✓</span> 100% Certified Authentic
                                    </td>
                                    <td align="center" style="padding: 4px 8px;">
                                        <span style="color: #c5a059; font-weight: 700;">✓</span> Fully Insured Transit
                                    </td>
                                    <td align="center" style="padding: 4px 8px;">
                                        <span style="color: #c5a059; font-weight: 700;">✓</span> Lifetime Atelier Care
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Amazon-Style Luxury Footer -->
                    <tr>
                        <td style="padding: 28px 36px; background-color: #1a1918; color: #9c9488; font-size: 12px; line-height: 1.7; text-align: center;">
                            <div style="font-size: 13px; font-weight: 600; color: #dfba73; letter-spacing: 0.5px; margin-bottom: 8px;">
                                MAIRA JEWELS CLIENT CONCIERGE
                            </div>
                            <div style="color: #c0b8ac;">
                                Need assistance with your order? Our concierge is here to help.<br />
                                Email: <a href="mailto:${COMPANY_EMAIL}" style="color: #dfba73; text-decoration: underline;">${COMPANY_EMAIL}</a> &nbsp;|&nbsp; 
                                WhatsApp/Call: <a href="tel:${COMPANY_PHONE.replace(/\s+/g, '')}" style="color: #dfba73; text-decoration: none;">${COMPANY_PHONE}</a>
                            </div>
                            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #2e2c29; font-size: 11px; color: #787167;">
                                Maira Jewels (Pty) Ltd &bull; Cape Town &amp; Johannesburg, South Africa<br />
                                This email was sent regarding your order at <a href="${CLIENT_URL}" style="color: #9c9488; text-decoration: underline;">mairajewels.co.za</a>.<br />
                                &copy; ${new Date().getFullYear()} Maira Jewels. All rights reserved. Handcrafted fine jewellery.
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

// Render Amazon-Style 4-Step Progress Tracker
const renderAmazonProgressTracker = (currentStatus = '') => {
    const s = currentStatus.toLowerCase();
    
    // Step definitions: 1: Placed/Confirmed, 2: In Atelier/Processing, 3: Dispatched/Shipped, 4: Delivered
    let activeStep = 1;
    if (s.includes('cancel')) {
        return `
        <div style="background-color: #fdf2f2; border: 1px solid #f8b4b4; border-radius: 6px; padding: 14px 18px; margin: 20px 0 24px; text-align: center;">
            <span style="color: #9b1c1c; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Order Status: Cancelled</span>
            <div style="font-size: 12px; color: #771d1d; margin-top: 4px;">This order has been cancelled. Any charged amount will be credited back to your account.</div>
        </div>`;
    }

    if (s.includes('deliver') || s.includes('complete')) {
        activeStep = 4;
    } else if (s.includes('ship') || s.includes('dispatch') || s.includes('transit') || s.includes('out for delivery')) {
        activeStep = 3;
    } else if (s.includes('process') || s.includes('product') || s.includes('craft') || s.includes('atelier')) {
        activeStep = 2;
    } else {
        activeStep = 1; // Pending / Placed / Confirmed
    }

    const steps = [
        { num: 1, label: 'Confirmed' },
        { num: 2, label: 'In Atelier' },
        { num: 3, label: 'Dispatched' },
        { num: 4, label: 'Delivered' }
    ];

    const stepCols = steps.map((step, idx) => {
        const isDone = step.num <= activeStep;
        const isCurrent = step.num === activeStep;
        
        const circleBg = isDone ? '#1a1918' : '#ffffff';
        const circleBorder = isDone ? '#c5a059' : '#d8d3cb';
        const circleColor = isDone ? '#dfba73' : '#a0998f';
        const labelColor = isCurrent ? '#111111' : (isDone ? '#444444' : '#999999');
        const labelWeight = isCurrent ? '700' : '500';

        return `
        <td align="center" style="width: 25%; vertical-align: top;">
            <div style="width: 26px; height: 26px; line-height: 24px; border-radius: 50%; background-color: ${circleBg}; border: 2px solid ${circleBorder}; color: ${circleColor}; font-size: 11px; font-weight: 700; margin: 0 auto 6px; box-sizing: border-box;">
                ${isDone && step.num < activeStep ? '✓' : step.num}
            </div>
            <div class="step-text" style="font-size: 11px; font-weight: ${labelWeight}; color: ${labelColor}; text-transform: uppercase; letter-spacing: 0.5px;">
                ${step.label}
            </div>
        </td>`;
    }).join('');

    return `
    <div style="background-color: #faf9f6; border: 1px solid #ede8df; border-radius: 8px; padding: 18px 14px 16px; margin: 22px 0 26px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8c8275; font-weight: 600; text-align: center; margin-bottom: 14px;">
            Order Progress
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                ${stepCols}
            </tr>
        </table>
    </div>`;
};

// Render Items Table
const renderItemsTable = (items = []) => {
    if (!items || items.length === 0) return '';

    const rows = items.map(item => {
        const itemImage = item.image || item.img || 'https://pub-c66a025ea8f54c12bf64eb08f291b7e4.r2.dev/placeholder-jewel.jpg';
        const itemPrice = formatPrice(item.priceNum || item.price);
        const specs = [item.size || item.sizes, item.color || item.colour, item.metal, item.gem].filter(Boolean).join(' &bull; ');

        return `
        <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #f0ebe1; vertical-align: middle;" width="64">
                <img src="${itemImage}" alt="${item.name || 'Jewellery'}" width="58" height="58" style="width: 58px; height: 58px; border-radius: 6px; object-fit: cover; border: 1px solid #e5e0d6; display: block;" onerror="this.style.display='none';" />
            </td>
            <td style="padding: 14px 14px; border-bottom: 1px solid #f0ebe1; vertical-align: middle;">
                <div style="font-weight: 600; font-size: 14px; color: #1a1918; line-height: 1.3;">${item.name || 'Bespoke Jewellery Item'}</div>
                ${specs ? `<div style="font-size: 12px; color: #7c7468; margin-top: 3px;">${specs}</div>` : ''}
                <div style="font-size: 12px; color: #8c8275; margin-top: 3px;">Qty: <strong style="color: #1a1918;">${item.quantity || 1}</strong></div>
            </td>
            <td align="right" style="padding: 14px 0; border-bottom: 1px solid #f0ebe1; vertical-align: middle; font-weight: 700; font-size: 14px; color: #1a1918; white-space: nowrap;">
                ${itemPrice}
            </td>
        </tr>`;
    }).join('');

    return `
    <div style="margin-top: 24px;">
        <div style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #1a1918; text-transform: uppercase; padding-bottom: 8px; border-bottom: 2px solid #1a1918;">
            Items Ordered
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>`;
};

// Render Order Summary Box (Amazon x Luxury Style)
const renderOrderSummaryBox = (order) => {
    const shipping = order.shippingAddress || {};
    const shippingStreet = shipping.street || shipping.address || '';
    const shippingApt = shipping.apartment || '';
    const shippingCity = shipping.city || '';
    const shippingProv = shipping.province || shipping.state || '';
    const shippingPost = shipping.postalCode || shipping.zip || '';
    const shippingCountry = shipping.country || 'South Africa';

    const billing = order.billingAddress || {};
    const billingStreet = billing.street || billing.address || shippingStreet || '';
    const billingApt = billing.apartment || (billingStreet === shippingStreet ? shippingApt : '');
    const billingCity = billing.city || shippingCity || '';
    const billingProv = billing.province || billing.state || shippingProv || '';
    const billingPost = billing.postalCode || billing.zip || shippingPost || '';
    const billingCountry = billing.country || shippingCountry || 'South Africa';

    const subtotal = formatPrice(order.subtotal || order.totalAmount || order.total || 0);
    const shippingMethod = order.shippingMethod || 'Pudo Locker';
    const shippingFeeVal = Number(order.shippingFee !== undefined ? order.shippingFee : 60);
    const shippingFeeStr = shippingFeeVal > 0 ? formatPrice(shippingFeeVal) : 'Complimentary';
    const discount = order.discount && order.discount > 0 ? `- ${formatPrice(order.discount)}` : null;
    const grandTotal = formatPrice(order.totalAmount || order.total || order.subtotal || 0);

    return `
    <!-- Addresses Grid -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; border-collapse: collapse;">
        <tr>
            <td width="48%" class="col-split" style="vertical-align: top; padding-right: 8px;">
                <div style="background: #fdfcfb; border: 1px solid #ece8e1; border-radius: 6px; padding: 14px;">
                    <strong style="font-size: 13px; color: #1c1510; display: block; margin-bottom: 6px;">📦 Delivery Address</strong>
                    <div style="font-size: 12px; color: #4a453e; line-height: 1.5;">
                        ${order.customer?.name ? `<strong>${order.customer.name}</strong><br>` : ''}
                        ${shippingStreet ? `${shippingStreet}<br>` : ''}
                        ${shippingApt ? `${shippingApt}<br>` : ''}
                        ${shippingCity ? `${shippingCity}${shippingProv ? `, ${shippingProv}` : ''} ${shippingPost}<br>` : ''}
                        ${shippingCountry}
                        ${order.customer?.phone ? `<div style="margin-top: 6px; color: #7c7468;">Tel: ${order.customer.phone}</div>` : ''}
                    </div>
                </div>
            </td>
            <td width="48%" class="col-split" style="vertical-align: top; padding-left: 8px;">
                <div style="background: #fdfcfb; border: 1px solid #ece8e1; border-radius: 6px; padding: 14px;">
                    <strong style="font-size: 13px; color: #1c1510; display: block; margin-bottom: 6px;">🏠 Billing Address</strong>
                    <div style="font-size: 12px; color: #4a453e; line-height: 1.5;">
                        ${order.customer?.name ? `<strong>${order.customer.name}</strong><br>` : ''}
                        ${order.customer?.organization ? `<span style="color: #6b6357;">${order.customer.organization}</span><br>` : ''}
                        ${billingStreet ? `${billingStreet}<br>` : ''}
                        ${billingApt ? `${billingApt}<br>` : ''}
                        ${billingCity ? `${billingCity}${billingProv ? `, ${billingProv}` : ''} ${billingPost}<br>` : ''}
                        ${billingCountry}
                        ${order.customer?.vatNumber ? `<div style="margin-top: 6px; color: #7c7468; font-size: 11px;">VAT: ${order.customer.vatNumber} (${order.customer.taxType || 'Personal'})</div>` : ''}
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Shipping Method Badge -->
    <div style="background: #f7f9fa; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 15px 0;">
        <span style="font-size: 13px; color: #334155;"><strong>Shipping Method:</strong> ${shippingMethod} (1 to 3 business days) &mdash; ${shippingFeeStr}</span>
    </div>

    <!-- Financial Summary -->
    <div style="background: #faf8f5; border: 1px solid #ece8e1; border-radius: 6px; padding: 16px 18px; margin-top: 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #555047; line-height: 1.8;">
            <tr>
                <td style="padding: 4px 0; color: #6b6357;">Subtotal</td>
                <td align="right" style="padding: 4px 0; color: #1c1510; font-weight: 600;">${subtotal}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0; color: #6b6357;">Shipping (${shippingMethod})</td>
                <td align="right" style="padding: 4px 0; color: #1c1510; font-weight: 600;">${shippingFeeStr}</td>
            </tr>
            ${discount ? `
            <tr>
                <td style="padding: 4px 0; color: #c5a059;">Privilege Discount</td>
                <td align="right" style="padding: 4px 0; color: #c5a059; font-weight: 600;">${discount}</td>
            </tr>` : ''}
            <tr style="border-top: 1px solid #c8a97e;">
                <td style="padding: 8px 0; color: #1c1510; font-size: 15px; font-weight: bold;">Total Amount</td>
                <td align="right" style="padding: 8px 0; color: #b08850; font-size: 16px; font-weight: bold;">${grandTotal}</td>
            </tr>
        </table>
        <div style="font-size: 11px; color: #7c7468; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e8e3d8;">
            Payment Method: <strong style="color: #1c1510;">WhatsApp Manual Payment</strong> &bull; Status: <span style="color: ${order.paymentStatus === 'Paid' ? '#16a34a' : '#d97706'}; font-weight: 600;">${order.paymentStatus || 'Pending'}</span>
        </div>
    </div>`;
};

/**
 * 1. ORDER STATUS UPDATE EMAIL (HTML & TEXT)
 * Dispatched dynamically whenever admin updates the order status.
 */
const getOrderStatusUpdateHtml = (order, oldStatus = '', newStatus = '') => {
    const customerName = order.customer?.name ? order.customer.name.split(' ')[0] : 'Valued Client';
    const orderNumber = order.orderNumber || order._id || 'MJ-ORDER';
    const tracking = order.trackingNumber || '';
    const carrier = order.carrier || 'The Courier Guy / RAM Hand-to-Hand';
    const statusClean = (newStatus || order.orderStatus || 'Processing').trim();
    const s = statusClean.toLowerCase();

    // Dynamic contextual message & status hero title
    let heroTitle = `Order Update: ${statusClean}`;
    let heroBadgeBg = '#1a1918';
    let heroBadgeColor = '#dfba73';
    let heroDescription = `Your order status has been updated to <strong>${statusClean}</strong>.`;
    let actionBtnText = 'View Order Details';
    let actionBtnUrl = `${CLIENT_URL}/account?order=${orderNumber}`;

    if (s.includes('shipped') || s.includes('dispatch') || s.includes('transit')) {
        heroTitle = 'Your order is on the way!';
        heroBadgeBg = '#1e3a8a';
        heroBadgeColor = '#93c5fd';
        heroDescription = `Exciting news! Your bespoke jewellery parcel has been dispatched in our secure, tamper-evident luxury packaging and is en route to you.`;
        actionBtnText = tracking ? 'Track Your Package' : 'View Order Details';
    } else if (s.includes('out for delivery')) {
        heroTitle = 'Out for delivery today';
        heroBadgeBg = '#065f46';
        heroBadgeColor = '#a7f3d0';
        heroDescription = `Your courier is out for delivery today. Please ensure an authorized recipient is available at your delivery address.`;
        actionBtnText = 'Track Live Delivery';
    } else if (s.includes('delivered') || s.includes('complete')) {
        heroTitle = 'Delivered — Enjoy your jewellery';
        heroBadgeBg = '#14532d';
        heroBadgeColor = '#86efac';
        heroDescription = `Your Maira Jewels package has been safely delivered. We hope this exquisite piece brings you endless brilliance and lasting memories.`;
        actionBtnText = 'View Order & Care Guide';
    } else if (s.includes('process') || s.includes('product') || s.includes('craft') || s.includes('atelier')) {
        heroTitle = 'Your order is in crafting';
        heroBadgeBg = '#1a1918';
        heroBadgeColor = '#dfba73';
        heroDescription = `Our master jewellers are currently assembling, polishing, and quality-certifying your fine jewellery pieces in our atelier.`;
    } else if (s.includes('confirm')) {
        heroTitle = 'Order confirmed & verified';
        heroBadgeBg = '#1a1918';
        heroBadgeColor = '#dfba73';
        heroDescription = `Your order and payment have been verified. It is now scheduled for crafting and dispatch.`;
    } else if (s.includes('cancel')) {
        heroTitle = 'Order Cancelled';
        heroBadgeBg = '#7f1d1d';
        heroBadgeColor = '#fecaca';
        heroDescription = `Your order #${orderNumber} has been marked as Cancelled. If any payment was captured, a full refund will be credited to your original payment method.`;
        actionBtnText = 'Contact Support Concierge';
        actionBtnUrl = `mailto:${COMPANY_EMAIL}?subject=Inquiry%20Order%20%23${orderNumber}`;
    }

    const content = `
        <!-- Hero Status Headline -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
            <tr>
                <td>
                    <div style="display: inline-block; background-color: ${heroBadgeBg}; color: ${heroBadgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px;">
                        ${statusClean}
                    </div>
                    <h1 style="font-family: 'Georgia', serif; font-size: 24px; color: #1a1918; margin: 0 0 8px; font-weight: 700; line-height: 1.3;">
                        ${heroTitle}
                    </h1>
                    <div style="font-size: 13px; color: #7c7468;">
                        Order <strong style="color: #1a1918;">#${orderNumber}</strong> &bull; Placed on ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </td>
            </tr>
        </table>

        <!-- Greeting & Context -->
        <div style="font-size: 14px; line-height: 1.6; color: #3d3a35;">
            <p style="margin: 0 0 14px;">Dear <strong>${customerName}</strong>,</p>
            <p style="margin: 0 0 16px;">${heroDescription}</p>
        </div>

        <!-- Amazon-Style Progress Bar -->
        ${renderAmazonProgressTracker(statusClean)}

        <!-- Tracking Notice Box (if tracking number provided) -->
        ${tracking ? `
        <div style="background-color: #f4f8fd; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="left">
                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1e40af;">Tracking Number</div>
                        <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #1e3a8a; margin-top: 4px; letter-spacing: 1px;">${tracking}</div>
                        <div style="font-size: 12px; color: #3b82f6; margin-top: 2px;">Carrier: ${carrier}</div>
                    </td>
                </tr>
            </table>
        </div>` : ''}

        <!-- Primary Call to Action Button -->
        <div style="text-align: center; margin: 28px 0;">
            <a href="${actionBtnUrl}" class="btn-gold">
                ${actionBtnText}
            </a>
        </div>

        <!-- Ordered Items Summary -->
        ${renderItemsTable(order.items)}

        <!-- Order Summary & Address Cards -->
        ${renderOrderSummaryBox(order)}

        <!-- Luxury Care Note -->
        <div style="margin-top: 28px; padding: 16px 20px; background-color: #fdfbf7; border-left: 3px solid #c5a059; border-radius: 0 6px 6px 0; font-size: 13px; color: #6b6357; line-height: 1.6;">
            <strong>Maira Jewels Authenticity Assurance:</strong> Every piece is certified for authenticity, handcrafted with conflict-free gemstones and solid precious metals. Need bespoke sizing adjustments? Our concierge is at your service.
        </div>
    `;

    return baseEmailWrapper(content, `Update on your Maira Jewels order #${orderNumber}: ${heroTitle}`, `Order Update #${orderNumber} | Maira Jewels`);
};

// Plain text alternative for Order Status Update
const getOrderStatusUpdateText = (order, oldStatus = '', newStatus = '') => {
    const customerName = order.customer?.name || 'Valued Client';
    const orderNumber = order.orderNumber || order._id || 'MJ-ORDER';
    const statusClean = (newStatus || order.orderStatus || 'Processing').toUpperCase();
    const tracking = order.trackingNumber || 'Available upon courier handover';
    const carrier = order.carrier || 'The Courier Guy / RAM Hand-to-Hand';
    const total = formatPrice(order.totalAmount || order.total || 0);

    let itemsText = '';
    if (order.items && order.items.length > 0) {
        itemsText = order.items.map(i => ` - ${i.name || 'Jewellery Item'} (Qty: ${i.quantity || 1}) - ${formatPrice(i.priceNum || i.price)}`).join('\n');
    }

    return `
===================================================================
MAIRA JEWELS - ORDER STATUS UPDATE
===================================================================

Dear ${customerName},

Your order status has been updated.

ORDER NUMBER: #${orderNumber}
STATUS:       ${statusClean}
CARRIER:      ${carrier}
TRACKING:     ${tracking}

-------------------------------------------------------------------
ORDERED ITEMS:
-------------------------------------------------------------------
${itemsText}

TOTAL AMOUNT: ${total}

-------------------------------------------------------------------
DELIVERY & BILLING ADDRESS:
-------------------------------------------------------------------
${order.customer?.name || ''}
${order.customer?.organization ? `Company: ${order.customer.organization}\n` : ''}${order.customer?.vatNumber ? `VAT/Tax ID: ${order.customer.vatNumber} (${order.customer?.taxType || 'Personal'})\n` : ''}${typeof order.shippingAddress === 'string' ? order.shippingAddress : (order.shippingAddress?.street || order.shippingAddress?.address || '')}
${typeof order.shippingAddress === 'object' && order.shippingAddress?.apartment ? `${order.shippingAddress.apartment}\n` : ''}${order.shippingAddress?.city || ''}${order.shippingAddress?.province || order.shippingAddress?.state ? `, ${order.shippingAddress?.province || order.shippingAddress?.state}` : ''} ${order.shippingAddress?.postalCode || order.shippingAddress?.zip || ''}
${order.shippingAddress?.country || ''}

Track your order anytime at: ${CLIENT_URL}/account?order=${orderNumber}

If you have any questions, our concierge is at your disposal:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}

Thank you for choosing Maira Jewels.
===================================================================
`;
};

// Build comprehensive WhatsApp order verification payload
const buildWhatsAppOrderMessage = (order) => {
    const orderNum = order.orderNumber || order._id || 'MJ-ORDER';
    const customerName = order.customer?.name || 'Valued Client';
    const customerPhone = order.customer?.phone || '';
    const customerEmail = order.customer?.email || '';

    const itemsText = (order.items || []).map((item, idx) => {
        const specs = [item.size || item.sizes, item.color || item.colour, item.metal, item.gem].filter(Boolean).join(' | ');
        const priceStr = formatPrice(item.priceNum || item.price);
        return `${idx + 1}. *${item.name || 'Jewellery Item'}*\n   Qty: ${item.quantity || 1}${specs ? ` (${specs})` : ''}\n   Price: ${priceStr}`;
    }).join('\n\n');

    const subtotalStr = formatPrice(order.subtotal || order.totalAmount || 0);
    const shippingMethod = order.shippingMethod || 'Pudo Locker';
    const shippingFeeVal = Number(order.shippingFee !== undefined ? order.shippingFee : 60);
    const shippingFeeStr = shippingFeeVal > 0 ? formatPrice(shippingFeeVal) : 'Complimentary';
    const discountStr = order.discount && order.discount > 0 ? formatPrice(order.discount) : null;
    const grandTotalStr = formatPrice(order.totalAmount || order.total || order.subtotal || 0);

    const shipping = order.shippingAddress || {};
    const street = shipping.street || shipping.address || '';
    const apt = shipping.apartment || '';
    const city = shipping.city || '';
    const prov = shipping.province || shipping.state || '';
    const postal = shipping.postalCode || shipping.zip || '';
    const country = shipping.country || 'South Africa';
    const addressStr = [street, apt, city, prov, postal, country].filter(Boolean).join(', ');

    return (
`*✦ NEW ORDER CONFIRMATION & PAYMENT ✦*
*Order Number:* #${orderNum}

*👤 Customer Details:*
• Name: ${customerName}
• Phone: ${customerPhone}
• Email: ${customerEmail}

*📦 Ordered Items:*
${itemsText}

*💰 Financial Summary:*
• Subtotal: ${subtotalStr}
• Shipping (${shippingMethod}): ${shippingFeeStr}${discountStr ? `\n• Privilege Discount: - ${discountStr}` : ''}
• *Total Payable:* ${grandTotalStr}

*📍 Delivery Address:*
${addressStr}

----------------------------------------
_Hi Maira Jewels Team, I placed this order on your website and would like to complete my payment. Please share your official banking / payment details to proceed._`
    );
};

const getWhatsAppOrderUrl = (order) => {
    const rawMsg = buildWhatsAppOrderMessage(order);
    return `https://api.whatsapp.com/send?phone=27839228383&text=${encodeURIComponent(rawMsg)}`;
};

/**
 * 2. ORDER CONFIRMATION EMAIL (HTML & TEXT)
 * Dispatched immediately upon checkout placement.
 */
const getOrderConfirmationHtml = (order) => {
    const customerName = order.customer?.name ? order.customer.name.split(' ')[0] : 'Valued Client';
    const orderNumber = order.orderNumber || order._id || 'MJ-ORDER';
    const whatsappUrl = getWhatsAppOrderUrl(order);

    const content = `
        <!-- Order Notice -->
        <div style="background: #faf8f5; border-left: 4px solid #c8a97e; padding: 14px 16px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 6px; font-size: 16px; color: #1c1510;">Order Received &mdash; #${orderNumber}</h3>
            <p style="margin: 0; font-size: 13px; color: #6b6357; line-height: 1.5;">
                Thank you for your order! Your items are reserved. Please complete payment via WhatsApp Concierge to confirm dispatch.
            </p>
        </div>

        <div style="font-size: 14px; line-height: 1.6; color: #3d3a35;">
            <p style="margin: 0 0 14px;">Dear <strong>${customerName}</strong>,</p>
            <p style="margin: 0 0 16px;">
                We are delighted to confirm that your fine jewellery acquisition has been safely received. 
                Our master artisans are preparing your pieces with the utmost precision.
            </p>
        </div>

        <!-- Progress Bar -->
        ${renderAmazonProgressTracker('Confirmed')}

        <!-- Ordered Items Summary -->
        ${renderItemsTable(order.items)}

        <!-- Summary & Delivery / Billing Address Cards -->
        ${renderOrderSummaryBox(order)}

        <!-- WhatsApp Payment CTA Button -->
        <div style="text-align: center; margin: 30px 0 15px;">
            <a href="${whatsappUrl}" 
               style="background: #25D366; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);">
                💬 Complete Payment on WhatsApp (+27 83 922 8383)
            </a>
        </div>

        <div style="margin-top: 24px; padding: 16px 20px; background-color: #fdfbf7; border-left: 3px solid #c5a059; border-radius: 0 6px 6px 0; font-size: 13px; color: #6b6357; line-height: 1.6;">
            <strong>Next Steps:</strong> Click the button above to send your pre-filled order summary directly to our WhatsApp concierge (+27 83 922 8383). Once payment is confirmed, we will dispatch your insured package with active parcel tracking updates.
        </div>
    `;

    return baseEmailWrapper(content, `Order Received: #${orderNumber}. Thank you for shopping with Maira Jewels.`, `Order Confirmation #${orderNumber} | Maira Jewels`);
};

const getOrderConfirmationText = (order) => {
    const customerName = order.customer?.name || 'Valued Client';
    const orderNumber = order.orderNumber || order._id || 'MJ-ORDER';
    const total = formatPrice(order.totalAmount || order.total || 0);
    const subtotal = formatPrice(order.subtotal || 0);
    const shippingMethod = order.shippingMethod || 'Pudo Locker';
    const shippingFee = formatPrice(order.shippingFee !== undefined ? order.shippingFee : 60);

    const shipping = order.shippingAddress || {};
    const billing = order.billingAddress || {};

    let itemsText = '';
    if (order.items && order.items.length > 0) {
        itemsText = order.items.map(i => {
            const specs = [i.size || i.sizes, i.color || i.colour].filter(Boolean).join(', ');
            return ` - ${i.name || 'Jewellery Item'} (Qty: ${i.quantity || 1}${specs ? `, ${specs}` : ''}) - ${formatPrice(i.priceNum || i.price)}`;
        }).join('\n');
    }

    const whatsappUrl = getWhatsAppOrderUrl(order);

    return `
===================================================================
MAIRA JEWELS - ORDER RECEIVED & CONFIRMATION
===================================================================

Dear ${customerName},

Thank you for your order! Your items are reserved. 
Please complete payment via WhatsApp Concierge to confirm dispatch.

ORDER NUMBER:    #${orderNumber}
STATUS:          ORDER RECEIVED & RESERVED
SHIPPING METHOD: ${shippingMethod} (1 to 3 business days)
DATE:            ${new Date().toLocaleDateString('en-ZA')}

-------------------------------------------------------------------
ORDERED ITEMS:
-------------------------------------------------------------------
${itemsText}

-------------------------------------------------------------------
FINANCIAL SUMMARY:
-------------------------------------------------------------------
Subtotal:        ${subtotal}
Shipping Fee:    ${shippingFee} (${shippingMethod})
Total Amount:    ${total}
Payment Method:  WhatsApp Manual Payment

-------------------------------------------------------------------
DELIVERY ADDRESS:
-------------------------------------------------------------------
${order.customer?.name || ''}
${shipping.street || shipping.address || ''}
${shipping.apartment ? `${shipping.apartment}\n` : ''}${shipping.city || ''}${shipping.province || shipping.state ? `, ${shipping.province || shipping.state}` : ''} ${shipping.postalCode || shipping.zip || ''}
${shipping.country || 'South Africa'}
${order.customer?.phone ? `Tel: ${order.customer.phone}\n` : ''}

-------------------------------------------------------------------
BILLING ADDRESS:
-------------------------------------------------------------------
${order.customer?.name || ''}
${order.customer?.organization ? `Company: ${order.customer.organization}\n` : ''}${billing.street || billing.address || shipping.street || ''}
${billing.apartment ? `${billing.apartment}\n` : ''}${billing.city || shipping.city || ''}${billing.province || billing.state ? `, ${billing.province || billing.state}` : ''} ${billing.postalCode || billing.zip || ''}
${billing.country || 'South Africa'}

-------------------------------------------------------------------
COMPLETE PAYMENT VIA WHATSAPP (ONE-CLICK ORDER SUMMARY):
-------------------------------------------------------------------
${whatsappUrl}

If you require any custom adjustments or assistance:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}
===================================================================
`;
};

/**
 * 3. PAYMENT STATUS EMAIL (HTML & TEXT)
 * Dispatched dynamically whenever payment status changes: Paid, Unpaid, Failed, Refunded.
 */
const getPaymentStatusEmailHtml = (payment, order = {}, targetStatus = '') => {
    const customerName = payment.customerName || order.customer?.name ? (payment.customerName || order.customer?.name).split(' ')[0] : 'Valued Client';
    const orderNumber = payment.orderNumber || order.orderNumber || 'MJ-ORDER';
    const txnId = payment.transactionId || `TXN-${Date.now()}`;
    const amount = formatPrice(payment.amount || order.totalAmount || 0);
    const method = 'WhatsApp Manual Payment';
    const rawStatus = (targetStatus || payment.status || order.paymentStatus || 'Pending').trim();
    const s = rawStatus.toLowerCase();
    const whatsappUrl = getWhatsAppOrderUrl(order);

    let heroTitle = 'Official Payment Receipt';
    let heroBadgeBg = '#14532d';
    let heroBadgeColor = '#86efac';
    let heroBadgeText = 'Payment Verified';
    let heroDesc = `We have successfully received and verified your payment. This email serves as your official tax invoice and payment receipt. Your bespoke jewellery is now proceeding to atelier crafting and dispatch.`;
    let statusText = 'Paid in Full (ZAR)';
    let statusTextColor = '#16a34a';
    let showWhatsAppButton = false;
    let actionBtnText = 'View Account & Orders';
    let actionBtnUrl = `${CLIENT_URL}/account`;

    if (s.includes('fail')) {
        heroTitle = 'Payment Action Required';
        heroBadgeBg = '#7f1d1d';
        heroBadgeColor = '#fecaca';
        heroBadgeText = 'Payment Unsuccessful';
        heroDesc = `We were unable to verify or process your payment for order <strong>#${orderNumber}</strong>. Your items remain reserved temporarily. Please complete payment or contact our concierge via WhatsApp to ensure your pieces are held.`;
        statusText = 'Payment Failed / Incomplete';
        statusTextColor = '#dc2626';
        showWhatsAppButton = true;
    } else if (s.includes('refund')) {
        heroTitle = 'Official Refund Confirmation';
        heroBadgeBg = '#581c87';
        heroBadgeColor = '#e9d5ff';
        heroBadgeText = 'Refund Processed';
        heroDesc = `A full refund of <strong>${amount}</strong> for order <strong>#${orderNumber}</strong> has been successfully processed. The credited amount should reflect in your account within standard banking clearance periods (typically 2 to 5 business days).`;
        statusText = 'Refunded in Full (ZAR)';
        statusTextColor = '#9333ea';
        actionBtnText = 'Contact Support Concierge';
        actionBtnUrl = `mailto:${COMPANY_EMAIL}?subject=Inquiry%20Regarding%20Refund%20Order%20%23${orderNumber}`;
    } else if (s.includes('unpaid') || s.includes('pending')) {
        heroTitle = 'Payment Pending — Order Reserved';
        heroBadgeBg = '#78350f';
        heroBadgeColor = '#fde68a';
        heroBadgeText = 'Payment Pending';
        heroDesc = `Thank you for your fine jewellery order <strong>#${orderNumber}</strong>. Your acquisition is currently reserved. Please complete your manual payment via WhatsApp Concierge so our atelier team can verify and schedule dispatch.`;
        statusText = 'Pending WhatsApp Verification';
        statusTextColor = '#d97706';
        showWhatsAppButton = true;
    }

    const content = `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
            <tr>
                <td>
                    <div style="display: inline-block; background-color: ${heroBadgeBg}; color: ${heroBadgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px;">
                        ${heroBadgeText}
                    </div>
                    <h1 style="font-family: 'Georgia', serif; font-size: 24px; color: #1a1918; margin: 0 0 8px; font-weight: 700; line-height: 1.3;">
                        ${heroTitle}
                    </h1>
                    <div style="font-size: 13px; color: #7c7468;">
                        Order <strong style="color: #1a1918;">#${orderNumber}</strong> &bull; Transaction ID: <span style="font-family: monospace;">${txnId}</span>
                    </div>
                </td>
            </tr>
        </table>

        <div style="font-size: 14px; line-height: 1.6; color: #3d3a35;">
            <p style="margin: 0 0 14px;">Dear <strong>${customerName}</strong>,</p>
            <p style="margin: 0 0 16px;">${heroDesc}</p>
        </div>

        <!-- Receipt / Financial Breakdown Card -->
        <div style="background-color: #faf9f6; border: 1px solid #ede8df; border-radius: 6px; padding: 20px; margin: 22px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 2;">
                <tr>
                    <td style="color: #7c7468;">Amount:</td>
                    <td align="right" style="color: #1a1918; font-size: 16px; font-weight: 700;">${amount}</td>
                </tr>
                <tr>
                    <td style="color: #7c7468;">Transaction Reference:</td>
                    <td align="right" style="color: #1a1918; font-family: monospace; font-size: 12px;">${txnId}</td>
                </tr>
                <tr>
                    <td style="color: #7c7468;">Order Reference:</td>
                    <td align="right" style="color: #1a1918; font-weight: 600;">#${orderNumber}</td>
                </tr>
                <tr>
                    <td style="color: #7c7468;">Payment Method:</td>
                    <td align="right" style="color: #1a1918;">${method}</td>
                </tr>
                <tr>
                    <td style="color: #7c7468;">Date &amp; Time:</td>
                    <td align="right" style="color: #1a1918;">${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                    <td style="padding-top: 8px; border-top: 1px solid #e5e0d6; color: #7c7468; font-weight: 600;">Payment Status:</td>
                    <td align="right" style="padding-top: 8px; border-top: 1px solid #e5e0d6; color: ${statusTextColor}; font-weight: 700;">${statusText}</td>
                </tr>
            </table>
        </div>

        <!-- Ordered Items summary if available -->
        ${order.items && order.items.length > 0 ? renderItemsTable(order.items) : ''}

        ${showWhatsAppButton ? `
        <!-- WhatsApp CTA for Unpaid/Failed Payment -->
        <div style="text-align: center; margin: 28px 0 16px;">
            <a href="${whatsappUrl}" 
               style="background: #25D366; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);">
                💬 Complete Payment on WhatsApp (+27 83 922 8383)
            </a>
            <div style="font-size: 12px; color: #7c7468; margin-top: 8px;">Clicking will open WhatsApp with your pre-filled order summary</div>
        </div>
        ` : `
        <!-- Standard Action Button -->
        <div style="text-align: center; margin: 28px 0 16px;">
            <a href="${actionBtnUrl}" class="btn-gold">
                ${actionBtnText}
            </a>
        </div>
        `}

        <div style="margin-top: 24px; padding: 14px 18px; background-color: #fdfbf7; border-left: 3px solid #c5a059; border-radius: 0 6px 6px 0; font-size: 12px; color: #6b6357; line-height: 1.6;">
            <strong>Client Concierge Notice:</strong> For immediate banking assistance, proof of payment submissions, or bespoke jewellery inquiries, connect with our concierge team anytime at <a href="mailto:${COMPANY_EMAIL}" style="color: #b08850;">${COMPANY_EMAIL}</a> or <a href="tel:${COMPANY_PHONE.replace(/\s+/g, '')}" style="color: #b08850;">${COMPANY_PHONE}</a>.
        </div>
    `;

    return baseEmailWrapper(content, `${heroBadgeText}: Order #${orderNumber} (${amount}) | Maira Jewels`, `${heroBadgeText} #${orderNumber} | Maira Jewels`);
};

const getPaymentStatusEmailText = (payment, order = {}, targetStatus = '') => {
    const customerName = payment.customerName || order.customer?.name || 'Valued Client';
    const orderNumber = payment.orderNumber || order.orderNumber || 'MJ-ORDER';
    const txnId = payment.transactionId || `TXN-${Date.now()}`;
    const amount = formatPrice(payment.amount || order.totalAmount || 0);
    const method = 'WhatsApp Manual Payment';
    const rawStatus = (targetStatus || payment.status || order.paymentStatus || 'Pending').toUpperCase();
    const whatsappUrl = getWhatsAppOrderUrl(order);

    return `
===================================================================
MAIRA JEWELS - PAYMENT STATUS UPDATE
===================================================================

Dear ${customerName},

Your payment status for Order #${orderNumber} has been updated.

ORDER NUMBER:        #${orderNumber}
TRANSACTION ID:      ${txnId}
AMOUNT:              ${amount}
PAYMENT METHOD:      ${method}
PAYMENT STATUS:      ${rawStatus}
DATE:                ${new Date().toLocaleDateString('en-ZA')}

-------------------------------------------------------------------
WHATSAPP CONCIERGE & PAYMENT:
-------------------------------------------------------------------
${whatsappUrl}

Client Portal: ${CLIENT_URL}/account

Concierge Support:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}
===================================================================
`;
};

// Aliases for backwards-compatibility
const getPaymentConfirmationHtml = (payment, order) => getPaymentStatusEmailHtml(payment, order, 'Paid');
const getPaymentConfirmationText = (payment, order) => getPaymentStatusEmailText(payment, order, 'Paid');

/**
 * 4. WELCOME GREETING EMAIL (HTML & TEXT)
 */
const getWelcomeEmailHtml = ({ name, email, customerId }) => {
    const displayName = name ? name.split(' ')[0] : 'Valued Client';

    const content = `
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #1a1918; border: 1px solid #c5a059; color: #dfba73; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px;">
                Exclusive Invitation
            </div>
            <h1 style="font-family: 'Georgia', serif; font-size: 24px; color: #1a1918; margin: 0 0 8px; font-weight: 700;">
                Welcome to Maira Jewels
            </h1>
            <div style="font-size: 13px; color: #7c7468; letter-spacing: 0.5px;">
                Your gateway to South Africa's finest bespoke fine jewellery
            </div>
        </div>

        <div style="font-size: 14px; line-height: 1.7; color: #3d3a35;">
            <p>Dear <strong>${displayName}</strong>,</p>
            <p>
                It is our distinct honor to welcome you to <strong>Maira Jewels</strong>. 
                Your private client account has been created successfully.
            </p>

            ${customerId ? `
            <div style="background-color: #faf9f6; border: 1px solid #ede8df; border-radius: 6px; padding: 14px 18px; margin: 20px 0; text-align: center;">
                <span style="font-size: 11px; letter-spacing: 1.5px; color: #8c8275; text-transform: uppercase;">Private Client ID</span>
                <div style="font-family: monospace; font-size: 16px; color: #1a1918; font-weight: 700; margin-top: 4px; letter-spacing: 2px;">${customerId}</div>
            </div>` : ''}

            <div style="margin: 22px 0; border-left: 2px solid #c5a059; padding-left: 16px;">
                <div style="color: #1a1918; font-weight: 700; margin-bottom: 6px; font-size: 13px;">Your Exclusive Client Privileges:</div>
                <ul style="margin: 0; padding-left: 18px; color: #5c554b; font-size: 13px; line-height: 1.8;">
                    <li>Priority access to limited high-jewellery releases</li>
                    <li>Complimentary insured nationwide delivery</li>
                    <li>Certificate of authenticity & lifetime valuation guarantee</li>
                    <li>Direct access to bespoke jewellery artisans</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 28px 0 16px;">
                <a href="${CLIENT_URL}" class="btn-gold">
                    Explore The Boutique
                </a>
            </div>
        </div>
    `;

    return baseEmailWrapper(content, `Welcome to Maira Jewels, ${displayName}. Your personal invitation to luxury fine jewellery.`, `Welcome to Maira Jewels | Private Client Invitation`);
};

const getWelcomeEmailText = ({ name, email, customerId }) => {
    const displayName = name || 'Valued Client';
    return `
===================================================================
WELCOME TO MAIRA JEWELS
===================================================================

Dear ${displayName},

Welcome to Maira Jewels. Your private client account is ready.
${customerId ? `Client ID: ${customerId}\n` : ''}
Explore our latest handcrafted jewellery pieces at: ${CLIENT_URL}

Client Privileges:
 - Certified natural gemstones & solid gold
 - Complimentary insured delivery
 - Lifetime authenticity guarantee

Concierge Contact:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}
===================================================================
`;
};

module.exports = {
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
};
