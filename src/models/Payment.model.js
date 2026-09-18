const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    orderNumber: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'ZAR'
    },
    method: {
        type: String,
        enum: [
            'WhatsApp Payment', 'WhatsApp Manual Payment', 'WhatsApp', 'Manual Payment',
            'PayFast', 'PayFast (Credit/Debit Card)', 'Credit Card', 'Debit Card',
            'Instant EFT', 'PayFlex', 'Bank Transfer', 'Cash on Delivery'
        ],
        default: 'WhatsApp Payment'
    },
    status: {
        type: String,
        enum: [
            'Pending', 'Paid', 'Failed', 'Refunded', 'Refund', 'Unpaid', 'Completed', 'Cancelled', 'Canceled',
            'pending', 'paid', 'failed', 'refunded', 'refund', 'unpaid', 'completed', 'cancelled', 'canceled'
        ],
        default: 'Pending'
    },
    gatewayResponse: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

PaymentSchema.index({ orderNumber: 1 });
PaymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
