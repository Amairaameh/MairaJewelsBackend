const mongoose = require('mongoose');

/**
 * Shipment Model
 * Stores The Courier Guy (TCG) shipment data linked to a Maira order.
 * Each order can have at most one active shipment at a time.
 */
const ShipmentSchema = new mongoose.Schema({
    // Link to the Maira order
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        required: true,
        index: true
    },

    // TCG identifiers
    tcgShipmentId: {
        type: Number,
        default: null,
        index: true
    },
    trackingReference: {
        type: String,
        default: '',
        index: true
    },
    shortTrackingReference: {
        type: String,
        default: ''
    },
    customTrackingReference: {
        type: String,
        default: ''
    },

    // Service level chosen (e.g. ECO, OVN, D2LS-ECO)
    serviceLevelCode: {
        type: String,
        default: 'ECO'
    },
    serviceLevelName: {
        type: String,
        default: ''
    },

    // Shipment rate (ZAR)
    rate: {
        type: Number,
        default: 0
    },

    // Current TCG shipment status
    tcgStatus: {
        type: String,
        default: 'pending',
        enum: [
            'pending', 'submitted', 'collection-assigned', 'collection-unassigned',
            'collection-rejected', 'collection-exception', 'collection-failed-attempt',
            'collected', 'awaiting-dropoff', 'at-hub', 'on-hold', 'on-hold-internal',
            'returned-to-hub', 'manifested', 'ready-for-dispatch', 'in-transit',
            'at-destination-hub', 'delivery-assigned', 'delivery-unassigned',
            'delivery-rejected', 'out-for-delivery', 'delivery-exception',
            'delivery-failed-attempt', 'ready-for-pickup', 'delivered',
            'returned-to-sender', 'undeliverable', 'cancelled', 'floor-check'
        ]
    },

    // Collection address (Maira warehouse)
    collectionAddress: {
        company: { type: String, default: 'Maira Jewels' },
        streetAddress: { type: String, default: '' },
        localArea: { type: String, default: '' },
        city: { type: String, default: '' },
        zone: { type: String, default: '' },
        country: { type: String, default: 'ZA' },
        code: { type: String, default: '' },
        type: { type: String, default: 'business' },
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    },

    // Delivery address (customer)
    deliveryAddress: {
        company: { type: String, default: '' },
        streetAddress: { type: String, default: '' },
        localArea: { type: String, default: '' },
        city: { type: String, default: '' },
        zone: { type: String, default: '' },
        country: { type: String, default: 'ZA' },
        code: { type: String, default: '' },
        type: { type: String, default: 'residential' },
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    },

    // Pickup point (for locker/PUDO deliveries)
    deliveryPickupPointId: { type: String, default: null },
    pickupPointType: {
        type: String,
        enum: ['locker', 'counter', 'point', null],
        default: null
    },

    // Parcel details
    parcels: [{
        submittedLengthCm: { type: Number, default: 20 },
        submittedWidthCm: { type: Number, default: 20 },
        submittedHeightCm: { type: Number, default: 10 },
        submittedWeightKg: { type: Number, default: 1 },
        parcelDescription: { type: String, default: 'Jewellery' },
        trackingReference: { type: String, default: '' }
    }],

    // Insurance / declared value
    declaredValue: { type: Number, default: 0 },

    // Shipping label PDF URL (signed S3 URL, expires in 24h)
    labelUrl: { type: String, default: '' },
    labelExpiresAt: { type: Date, default: null },

    // Collection / delivery scheduling
    collectionMinDate: { type: Date, default: null },
    collectionAfter: { type: String, default: '08:00' },
    collectionBefore: { type: String, default: '16:00' },
    deliveryMinDate: { type: Date, default: null },
    deliveryAfter: { type: String, default: '08:00' },
    deliveryBefore: { type: String, default: '17:00' },

    // Estimated delivery window from TCG
    estimatedCollection: { type: Date, default: null },
    estimatedDeliveryFrom: { type: Date, default: null },
    estimatedDeliveryTo: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },

    // Tracking events snapshot from TCG
    trackingEvents: [{
        id: Number,
        date: Date,
        status: String,
        message: String,
        location: String,
        source: String,
        parcelId: Number
    }],

    // Raw TCG API response (for debugging)
    tcgRaw: { type: mongoose.Schema.Types.Mixed, default: null },

    // Admin notes
    notes: { type: String, default: '' }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Human-friendly status label
ShipmentSchema.virtual('statusLabel').get(function () {
    const map = {
        'pending': 'Pending Submission',
        'submitted': 'Submitted',
        'collection-assigned': 'Driver Assigned for Collection',
        'collected': 'Collected',
        'at-hub': 'At Hub',
        'in-transit': 'In Transit',
        'at-destination-hub': 'At Destination Hub',
        'out-for-delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'returned-to-sender': 'Returned to Sender',
        'delivery-failed-attempt': 'Delivery Attempt Failed',
        'ready-for-pickup': 'Ready for Pickup'
    };
    return map[this.tcgStatus] || this.tcgStatus;
});

module.exports = mongoose.model('Shipment', ShipmentSchema);
