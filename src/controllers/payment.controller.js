const Payment = require('../models/Payment.model');
const Order = require('../models/Order.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { sendPaymentStatusEmail, sendPaymentConfirmationEmail } = require('../services/email.service');

// @desc    Get all payment records
// @route   GET /api/v1/payments
// @access  Private/Admin
exports.getPayments = async (req, res, next) => {
    try {
        const { status, method, search, page = 1, limit = 50 } = req.query;

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
        const payments = await Payment.find(query)
            .sort('-_id') // _id is always indexed — avoids 32MB in-memory sort limit
            .skip(skip)
            .limit(limitNum)
            .allowDiskUse(true); // Prevents MongoDB sort memory crash

        res.status(200).json(
            new ApiResponse(200, {
                total,
                count: payments.length,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                payments
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

