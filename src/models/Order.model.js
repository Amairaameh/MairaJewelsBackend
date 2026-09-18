const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street: { type: String, default: '' },
    apartment: { type: String, default: '' },
    city: { type: String, default: '' },
    province: { type: String, default: '' }, // e.g. Gauteng, Western Cape
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'South Africa' },
    // Backwards-compatibility aliases
    address: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    deliveryMethod: { type: String, default: '' }
}, { _id: false });

const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    id: { type: String }, // Legacy item id support (e.g. item-1)
    name: { type: String, required: true },
    price: { type: mongoose.Schema.Types.Mixed, required: true },
    priceNum: { type: Number },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    color: { type: String, default: '' },
    colour: { type: String, default: '' },
    size: { type: String, default: '' },
    sizes: { type: String, default: '' },
    image: { type: String, default: '' },
    specs: { type: String, default: '' }
});

const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        organization: { type: String, default: '' },
        taxType: { type: String, default: 'Personal' },
        vatNumber: { type: String, default: '' },
        address: { type: String, default: '' }
    },
    // Separate Delivery & Billing Addresses
    shippingAddress: {
        type: addressSchema,
        default: () => ({})
    },
    billingAddress: {
        type: addressSchema,
        default: () => ({})
    },
    items: [OrderItemSchema],
    // Shipping method details
    shippingMethod: { 
        type: String, 
        enum: ['Pudo Locker', 'Courier Guy Home', 'Standard Delivery', 'Courier Guy', 'Complimentary Luxury Delivery', 'Pudo', 'Locker Delivery', 'Door to Door Courier'],
        default: 'Pudo Locker'
    },
    shippingFee: { 
        type: Number, 
        default: 60 
    },
    // Financial totals
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'WhatsApp Payment'
    },
    paymentStatus: {
        type: String,
        enum: [
            'Pending', 'Paid', 'Failed', 'Refunded', 'Refund', 'Unpaid', 'Completed', 'Cancelled', 'Canceled',
            'pending', 'paid', 'failed', 'refunded', 'refund', 'unpaid', 'completed', 'cancelled', 'canceled'
        ],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: [
            'Pending', 'Confirmed', 'Processing', 'In Atelier', 'Dispatched', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled', 'Canceled', 'Refunded', 'Failed', 'On Hold',
            'pending', 'confirmed', 'processing', 'in atelier', 'dispatched', 'shipped', 'in transit', 'out for delivery', 'delivered', 'completed', 'cancelled', 'canceled', 'refunded', 'failed', 'on hold'
        ],
        default: 'Pending'
    },
    agreements: {
        termsAgreed: { type: Boolean, default: true },
        conciergeAuthorized: { type: Boolean, default: true }
    },
    carrier: {
        type: String,
        default: 'The Courier Guy / RAM Hand-to-Hand'
    },
    estimatedDelivery: {
        type: String,
        default: ''
    },
    trackingNumber: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field aliases
OrderSchema.virtual('total')
    .get(function() { return this.totalAmount; })
    .set(function(v) { this.totalAmount = Number(v); });

OrderSchema.virtual('status')
    .get(function() { return this.orderStatus || 'Pending'; })
    .set(function(v) { this.orderStatus = v; });

// Indexes for order lookup and filtering
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ orderStatus: 1, paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
