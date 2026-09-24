const Payment = require('../models/Payment.model');
const Order = require('../models/Order.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { sendPaymentStatusEmail, sendPaymentConfirmationEmail } = require('../services/email.service');

// Helper to format unique payment ID: PAY + last 3 digits of phone + sequence
function formatPaymentId(phone, seq = 1, fallbackSeed = '') {
    const cleanDigits = String(phone || '').replace(/[^0-9]/g, '');
    let phonePart = '';
    if (cleanDigits.length >= 3) {
        phonePart = cleanDigits.slice(-3);
    } else {
        const seedDigits = String(fallbackSeed || '').replace(/[^0-9]/g, '');
        if (seedDigits.length >= 3) {
            phonePart = seedDigits.slice(-3);
        } else {
            phonePart = '789';
        }
    }
    const seqStr = String(seq || 1).padStart(3, '0');
    return 'PAY' + phonePart + seqStr;
}

// @desc    Get all payment records
// @route   GET /api/v1/payments
// @access  Private/Admin
exports.getPayments = async (req, res, next) => {
    try {
        const { status, method, search, page = 1, limit = 100 } = req.query;

        let query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        if (method && method !== 'All') {
            query.method = method;
        }
        if (search) {
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { orderNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await Payment.countDocuments(query);
        const [payments, orders] = await Promise.all([
            Payment.find(query).sort('createdAt').skip(skip).limit(limitNum).lean(),
            Order.find().lean()
        ]);

        const orderMap = new Map();
        orders.forEach(o => {
            if (o.orderNumber) orderMap.set(o.orderNumber, o);
            if (o._id) orderMap.set(String(o._id), o);
        });

        const formattedPayments = payments.map((p, idx) => {
            const matchedOrder = orderMap.get(p.orderNumber) || (p.order ? orderMap.get(String(p.order)) : null);
            const phone = p.phone || matchedOrder?.customer?.phone || matchedOrder?.shippingAddress?.phone || '';
            const paymentId = formatPaymentId(phone, idx + 1, p.orderNumber);

            return {
                ...p,
                id: paymentId,
                paymentId: paymentId,
                displayId: paymentId,
                orderNumber: p.orderNumber || matchedOrder?.orderNumber || 'N/A',
                orderId: p.orderNumber || matchedOrder?.orderNumber || 'N/A',
                method: 'WhatsApp Manual Payment',
                paymentMethod: 'WhatsApp Manual Payment',
                phone: phone,
                customerName: p.customerName || matchedOrder?.customer?.name || 'Customer'
            };
        });

        res.status(200).json(
            new ApiResponse(200, {
                total,
                count: formattedPayments.length,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                payments: formattedPayments
            }, 'Payment records retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update payment status
// @route   PATCH /api/v1/payments/:id/status
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after', runValidators: true }
        );

        if (!payment) {
            return next(new ApiError(404, `Payment not found with id ${req.params.id}`));
        }

        // Keep Order record paymentStatus synchronized
        const order = await Order.findOneAndUpdate(
            { orderNumber: payment.orderNumber },
            { paymentStatus: status },
            { returnDocument: 'after' }
        );

        // Trigger payment status notification email (Paid, Unpaid, Failed, Refunded)
        sendPaymentStatusEmail(payment, order || {}, status).catch(err => {
            console.error('[Payment Status Update Email Error]:', err.message);
        });

        res.status(200).json(
            new ApiResponse(200, { payment }, 'Payment status updated successfully')
        );
    } catch (error) {
        next(error);
    }
};
