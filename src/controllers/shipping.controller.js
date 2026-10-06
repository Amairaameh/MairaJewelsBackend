const Order = require('../models/Order.model');
const Shipment = require('../models/Shipment.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const tcg = require('../services/shipping.service');
const { sendOrderStatusUpdateEmail } = require('../services/email.service');

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS – Maira Jewels warehouse / collection address
// ─────────────────────────────────────────────────────────────────────────────
const MAIRA_COLLECTION_ADDRESS = {
    type: 'business',
    company: 'Maira Jewels',
    street_address: '56 Clove Drive',
    local_area: 'Zakariyya Park',
    city: 'Johannesburg',
    zone: 'Gauteng',
    country: 'ZA',
    code: '1813'
};

const MAIRA_COLLECTION_CONTACT = {
    name: 'Maira Jewels Dispatch',
    mobile_number: '0787059998',
    email: process.env.COMPANY_EMAIL || ''
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map an Order's shippingAddress to TCG delivery_address format.
 */
const mapOrderAddressToTCG = (addr) => ({
    type: 'residential',
    company: addr.company || '',
    street_address: addr.street || addr.address || '',
    local_area: addr.apartment || addr.suburb || addr.localArea || '',
    city: addr.city || '',
    zone: addr.province || addr.state || addr.zone || '',
    country: 'ZA',
    code: addr.postalCode || addr.zip || addr.code || '',
    lat: addr.lat || undefined,
    lng: addr.lng || undefined
});

/**
 * Map TCG tracking events to our internal format.
 */
const mapTrackingEvents = (events = []) =>
    events.map(e => ({
        id: e.id,
        date: e.date,
        status: e.status,
        message: e.message || '',
        location: e.location || '',
        source: e.source || '',
        parcelId: e.parcel_id || 0
    }));

/**
 * Map a TCG status to an Order orderStatus value.
 */
const tcgStatusToOrderStatus = (tcgStatus) => {
    const map = {
        'submitted': 'Dispatched',
        'collection-assigned': 'Dispatched',
        'collected': 'Shipped',
        'at-hub': 'In Transit',
        'in-transit': 'In Transit',
        'at-destination-hub': 'In Transit',
        'out-for-delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'returned-to-sender': 'On Hold'
    };
    return map[tcgStatus] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET SHIPPING RATES
// POST /api/v1/shipping/rates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get shipping rates for a delivery address + parcel dimensions
 * @route   POST /api/v1/shipping/rates
 * @access  Public (used on checkout)
 */
exports.getShippingRates = async (req, res, next) => {
    try {
        const {
            deliveryAddress,
            parcels,
            declaredValue,
            collectionMinDate,
            deliveryMinDate
        } = req.body;

        if (!deliveryAddress) throw new ApiError(400, 'deliveryAddress is required');
        if (!parcels || !parcels.length) throw new ApiError(400, 'parcels array is required');

        const rates = await tcg.getRates({
            collectionAddress: MAIRA_COLLECTION_ADDRESS,
            deliveryAddress,
            parcels,
            declaredValue: declaredValue || 0,
            collectionMinDate,
            deliveryMinDate
        });

        return res.status(200).json(
            new ApiResponse(200, rates, 'Shipping rates fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET OPT-IN RATES
// POST /api/v1/shipping/rates/opt-in
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get optional add-on rates (gift wrap, early bird, etc.)
 * @route   POST /api/v1/shipping/rates/opt-in
 * @access  Public
 */
exports.getOptInRates = async (req, res, next) => {
    try {
        const { deliveryAddress } = req.body;
        if (!deliveryAddress) throw new ApiError(400, 'deliveryAddress is required');

        const rates = await tcg.getOptInRates({
            collectionAddress: MAIRA_COLLECTION_ADDRESS,
            deliveryAddress
        });

        return res.status(200).json(
            new ApiResponse(200, rates, 'Opt-in rates fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET PICKUP POINTS (PUDO / LOCKERS)
// GET /api/v1/shipping/pickup-points
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Find nearest PUDO/locker/counter pickup points by lat/lng
 * @route   GET /api/v1/shipping/pickup-points
 * @access  Public
 * @query   lat, lng, type (locker|counter|point)
 */
exports.getPickupPoints = async (req, res, next) => {
    try {
        const { lat, lng, type, search, limit } = req.query;

        // Use supplied coords if available, otherwise default to South Africa national hub (JHB) center
        const hasCoords = lat !== undefined && lng !== undefined && !isNaN(Number(lat)) && !isNaN(Number(lng));
        const parsedLat = hasCoords ? Number(lat) : -26.2041;
        const parsedLng = hasCoords ? Number(lng) : 28.0473;

        let points = [];
        try {
            points = await tcg.getPickupPoints({
                lat: parsedLat,
                lng: parsedLng,
                type: type || null,
                search: search || null,
                limit: limit ? Number(limit) : 40,
                orderClosest: hasCoords
            });
        } catch (apiErr) {
            console.warn('[Shipping Controller] TCG getPickupPoints error or unconfigured API key:', apiErr.message);
            points = [];
        }

        return res.status(200).json(
            new ApiResponse(200, points || [], 'Pickup points fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET PICKUP POINT RATES
// POST /api/v1/shipping/pickup-points/rates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get rates for a specific locker/counter pickup point
 * @route   POST /api/v1/shipping/pickup-points/rates
 * @access  Public
 */
exports.getPickupPointRates = async (req, res, next) => {
    try {
        const { deliveryPickupPointId, parcels, collectionMinDate, deliveryMinDate } = req.body;
        if (!deliveryPickupPointId) throw new ApiError(400, 'deliveryPickupPointId is required');
        if (!parcels || !parcels.length) throw new ApiError(400, 'parcels array is required');

        const rates = await tcg.getPickupPointRates({
            collectionAddress: MAIRA_COLLECTION_ADDRESS,
            deliveryPickupPointId,
            parcels,
            collectionMinDate,
            deliveryMinDate
        });

        return res.status(200).json(
            new ApiResponse(200, rates, 'Pickup point rates fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. CREATE SHIPMENT FOR AN ORDER
// POST /api/v1/shipping/orders/:orderId/shipment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Create a TCG shipment for a given Maira order
 * @route   POST /api/v1/shipping/orders/:orderId/shipment
 * @access  Private/Admin
 *
 * Body accepts optional overrides:
 *   serviceLevelCode, declaredValue, parcels, collectionMinDate,
 *   deliveryPickupPointId, optInRates, optInTimeBasedRates, notes
 */
exports.createShipmentForOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const {
            serviceLevelCode = 'ECO',
            declaredValue,
            parcels,
            collectionMinDate,
            deliveryPickupPointId,
            optInRates = [],
            optInTimeBasedRates = [],
            notes = ''
        } = req.body;

        // 1. Load the order
        const order = await Order.findById(orderId);
        if (!order) throw new ApiError(404, 'Order not found');

        // 2. Check if a shipment already exists
        const existing = await Shipment.findOne({ order: orderId, tcgStatus: { $ne: 'cancelled' } });
        if (existing) {
            throw new ApiError(409, `A shipment already exists for this order (${existing.trackingReference}). Cancel it first to create a new one.`);
        }

        // 3. Map order shipping address to TCG format
        const deliveryAddress = mapOrderAddressToTCG(order.shippingAddress || {});
        const deliveryContact = {
            name: order.customer?.name || '',
            mobile_number: order.customer?.phone || '',
            email: order.customer?.email || ''
        };

        // 4. Default parcel dimensions (can be overridden in request body)
        const tcgParcels = (parcels || [
            {
                submitted_length_cm: 20,
                submitted_width_cm: 20,
                submitted_height_cm: 10,
                submitted_weight_kg: 1,
                parcel_description: 'Maira Jewels Order'
            }
        ]).map(p => ({
            submitted_length_cm: p.submitted_length_cm || p.submittedLengthCm || 20,
            submitted_width_cm: p.submitted_width_cm || p.submittedWidthCm || 20,
            submitted_height_cm: p.submitted_height_cm || p.submittedHeightCm || 10,
            submitted_weight_kg: p.submitted_weight_kg || p.submittedWeightKg || 1,
            parcel_description: p.parcel_description || p.parcelDescription || 'Jewellery'
        }));

        // 5. Create the TCG shipment (pickup point vs door-to-door)
        let tcgResponse;
        const isPickupPoint = !!(deliveryPickupPointId || order.shippingMethod?.toLowerCase().includes('pudo') || order.shippingMethod?.toLowerCase().includes('locker'));

        const commonParams = {
            collectionAddress: MAIRA_COLLECTION_ADDRESS,
            collectionContact: MAIRA_COLLECTION_CONTACT,
            deliveryContact,
            parcels: tcgParcels,
            serviceLevelCode,
            declaredValue: declaredValue ?? order.totalAmount ?? 0,
            collectionMinDate: collectionMinDate || new Date().toISOString(),
            customerReference: order.orderNumber
        };

        if (isPickupPoint && deliveryPickupPointId) {
            tcgResponse = await tcg.createPickupPointShipment({
                ...commonParams,
                deliveryPickupPointId
            });
        } else {
            tcgResponse = await tcg.createShipment({
                ...commonParams,
                deliveryAddress,
                optInRates,
                optInTimeBasedRates
            });
        }

        // 6. Persist shipment record
        const shipment = await Shipment.create({
            order: order._id,
            orderNumber: order.orderNumber,
            tcgShipmentId: tcgResponse.id,
            trackingReference: tcgResponse.custom_tracking_reference || tcgResponse.tracking_reference || '',
            shortTrackingReference: tcgResponse.short_tracking_reference || '',
            customTrackingReference: tcgResponse.custom_tracking_reference || '',
            serviceLevelCode: tcgResponse.service_level_code || serviceLevelCode,
            serviceLevelName: tcgResponse.service_level_name || '',
            rate: tcgResponse.rate || 0,
            tcgStatus: tcgResponse.status || 'submitted',
            collectionAddress: {
                company: MAIRA_COLLECTION_ADDRESS.company,
                streetAddress: MAIRA_COLLECTION_ADDRESS.street_address,
                localArea: MAIRA_COLLECTION_ADDRESS.local_area,
                city: MAIRA_COLLECTION_ADDRESS.city,
                zone: MAIRA_COLLECTION_ADDRESS.zone,
                country: MAIRA_COLLECTION_ADDRESS.country,
                code: MAIRA_COLLECTION_ADDRESS.code,
                type: MAIRA_COLLECTION_ADDRESS.type
            },
            deliveryAddress: {
                company: deliveryAddress.company,
                streetAddress: deliveryAddress.street_address,
                localArea: deliveryAddress.local_area,
                city: deliveryAddress.city,
                zone: deliveryAddress.zone,
                country: deliveryAddress.country,
                code: deliveryAddress.code,
                type: deliveryAddress.type
            },
            deliveryPickupPointId: deliveryPickupPointId || null,
            parcels: tcgParcels.map(p => ({
                submittedLengthCm: p.submitted_length_cm,
                submittedWidthCm: p.submitted_width_cm,
                submittedHeightCm: p.submitted_height_cm,
                submittedWeightKg: p.submitted_weight_kg,
                parcelDescription: p.parcel_description
            })),
            declaredValue: declaredValue ?? order.totalAmount ?? 0,
            estimatedCollection: tcgResponse.estimated_collection || null,
            estimatedDeliveryFrom: tcgResponse.estimated_delivery_from || null,
            estimatedDeliveryTo: tcgResponse.estimated_delivery_to || null,
            tcgRaw: tcgResponse,
            notes
        });

        // 7. Update order with tracking info
        await Order.findByIdAndUpdate(orderId, {
            trackingNumber: shipment.trackingReference || shipment.shortTrackingReference,
            orderStatus: 'Dispatched',
            carrier: 'The Courier Guy'
        });

        return res.status(201).json(
            new ApiResponse(201, { shipment, tcgResponse }, 'Shipment created successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET SHIPMENT BY ORDER
// GET /api/v1/shipping/orders/:orderId/shipment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get the shipment record for an order
 * @route   GET /api/v1/shipping/orders/:orderId/shipment
 * @access  Private/Admin
 */
exports.getShipmentByOrder = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ order: req.params.orderId });
        if (!shipment) throw new ApiError(404, 'No shipment found for this order');

        return res.status(200).json(
            new ApiResponse(200, { shipment }, 'Shipment fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. TRACK SHIPMENT
// GET /api/v1/shipping/track/:trackingRef
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Track a shipment (real-time from TCG)
 * @route   GET /api/v1/shipping/track/:trackingRef
 * @access  Public (customers can use this)
 */
exports.trackShipment = async (req, res, next) => {
    try {
        const { trackingRef } = req.params;
        if (!trackingRef) throw new ApiError(400, 'trackingRef is required');

        const tcgData = await tcg.trackShipment(trackingRef);

        // Also update our local shipment record
        const shipment = await Shipment.findOne({
            $or: [
                { trackingReference: trackingRef },
                { shortTrackingReference: trackingRef },
                { customTrackingReference: trackingRef }
            ]
        });

        if (shipment && tcgData) {
            const prevStatus = shipment.tcgStatus;
            const newStatus = tcgData.status || prevStatus;
            shipment.tcgStatus = newStatus;
            shipment.trackingEvents = mapTrackingEvents(tcgData.tracking_events);
            if (newStatus === 'delivered') {
                shipment.deliveredAt = new Date();
            }
            await shipment.save();

            // Sync order status
            const orderStatus = tcgStatusToOrderStatus(newStatus);
            if (orderStatus && newStatus !== prevStatus) {
                const updatedOrder = await Order.findByIdAndUpdate(
                    shipment.order,
                    { orderStatus },
                    { new: true }
                );
                // Email customer about the status change
                if (updatedOrder) {
                    sendOrderStatusUpdateEmail(updatedOrder, prevStatus, orderStatus)
                        .catch(err => console.error('[Shipping Email Error]:', err.message));
                }
            }
        }

        return res.status(200).json(
            new ApiResponse(200, { tracking: tcgData, shipment }, 'Tracking data fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. GET WAYBILL LABEL PDF
// GET /api/v1/shipping/:shipmentId/label
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get a signed PDF waybill label URL for a shipment
 * @route   GET /api/v1/shipping/:shipmentId/label
 * @access  Private/Admin
 */
exports.getShipmentLabel = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId);
        if (!shipment) throw new ApiError(404, 'Shipment not found');
        if (!shipment.tcgShipmentId) throw new ApiError(400, 'Shipment has no TCG ID yet');

        const labelData = await tcg.getShipmentLabel(shipment.tcgShipmentId);

        // Cache label URL (expires 24h)
        shipment.labelUrl = labelData.url || labelData;
        shipment.labelExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await shipment.save();

        return res.status(200).json(
            new ApiResponse(200, { labelUrl: shipment.labelUrl }, 'Label URL fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. GET STICKER LABEL PDF
// GET /api/v1/shipping/:shipmentId/label/stickers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get a signed sticker label PDF URL
 * @route   GET /api/v1/shipping/:shipmentId/label/stickers
 * @access  Private/Admin
 */
exports.getShipmentStickerLabel = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId);
        if (!shipment) throw new ApiError(404, 'Shipment not found');
        if (!shipment.tcgShipmentId) throw new ApiError(400, 'Shipment has no TCG ID yet');

        const labelData = await tcg.getShipmentStickerLabel(shipment.tcgShipmentId);

        return res.status(200).json(
            new ApiResponse(200, { labelUrl: labelData.url || labelData }, 'Sticker label URL fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. CANCEL SHIPMENT
// POST /api/v1/shipping/:shipmentId/cancel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Cancel a TCG shipment
 * @route   POST /api/v1/shipping/:shipmentId/cancel
 * @access  Private/Admin
 */
exports.cancelShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId);
        if (!shipment) throw new ApiError(404, 'Shipment not found');

        const trackingRef = shipment.trackingReference || shipment.shortTrackingReference;
        if (!trackingRef) throw new ApiError(400, 'Shipment has no tracking reference to cancel');

        const tcgResponse = await tcg.cancelShipment(trackingRef);

        shipment.tcgStatus = 'cancelled';
        await shipment.save();

        return res.status(200).json(
            new ApiResponse(200, { tcgResponse }, 'Shipment cancelled successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. GET POD IMAGES
// GET /api/v1/shipping/track/:trackingRef/pod/images
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get proof-of-delivery images for a delivered shipment
 * @route   GET /api/v1/shipping/track/:trackingRef/pod/images
 * @access  Private/Admin
 */
exports.getPodImages = async (req, res, next) => {
    try {
        const { trackingRef } = req.params;
        const includeDigitalPod = req.query.include_digital_pod === 'true';
        const data = await tcg.getPodImages(trackingRef, includeDigitalPod);

        return res.status(200).json(
            new ApiResponse(200, data, 'POD images fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. GET DIGITAL POD
// GET /api/v1/shipping/track/:trackingRef/pod/digital
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get digital proof-of-delivery PDF URL
 * @route   GET /api/v1/shipping/track/:trackingRef/pod/digital
 * @access  Private/Admin
 */
exports.getDigitalPod = async (req, res, next) => {
    try {
        const { trackingRef } = req.params;
        const data = await tcg.getDigitalPod(trackingRef);

        return res.status(200).json(
            new ApiResponse(200, data, 'Digital POD fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. LIST ALL SHIPMENTS (Admin)
// GET /api/v1/shipping/shipments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    List all Maira shipment records (local DB)
 * @route   GET /api/v1/shipping/shipments
 * @access  Private/Admin
 * @query   page, limit, status, orderNumber
 */
exports.listShipments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) filter.tcgStatus = req.query.status;
        if (req.query.orderNumber) filter.orderNumber = req.query.orderNumber;

        const [shipments, total] = await Promise.all([
            Shipment.find(filter).populate('order', 'orderNumber customer orderStatus').sort('-createdAt').skip(skip).limit(limit),
            Shipment.countDocuments(filter)
        ]);

        return res.status(200).json(
            new ApiResponse(200, {
                shipments,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            }, 'Shipments fetched successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. SYNC SHIPMENT STATUS FROM TCG (Admin / Webhook handler)
// POST /api/v1/shipping/:shipmentId/sync
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Manually sync a shipment's status from TCG
 * @route   POST /api/v1/shipping/:shipmentId/sync
 * @access  Private/Admin
 */
exports.syncShipmentStatus = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId);
        if (!shipment) throw new ApiError(404, 'Shipment not found');

        const trackingRef = shipment.trackingReference || shipment.shortTrackingReference;
        if (!trackingRef) throw new ApiError(400, 'No tracking reference on shipment');

        const tcgData = await tcg.trackShipment(trackingRef);
        const newStatus = tcgData.status || shipment.tcgStatus;

        const prevStatus = shipment.tcgStatus;
        shipment.tcgStatus = newStatus;
        shipment.trackingEvents = mapTrackingEvents(tcgData.tracking_events || []);
        if (newStatus === 'delivered') shipment.deliveredAt = new Date();
        if (tcgData.estimated_delivery_from) shipment.estimatedDeliveryFrom = tcgData.estimated_delivery_from;
        if (tcgData.estimated_delivery_to) shipment.estimatedDeliveryTo = tcgData.estimated_delivery_to;
        await shipment.save();

        const orderStatus = tcgStatusToOrderStatus(newStatus);
        if (orderStatus && newStatus !== prevStatus) {
            const updatedOrder = await Order.findByIdAndUpdate(
                shipment.order,
                { orderStatus, trackingNumber: trackingRef },
                { new: true }
            );
            // Email customer about the status change
            if (updatedOrder) {
                sendOrderStatusUpdateEmail(updatedOrder, prevStatus, orderStatus)
                    .catch(err => console.error('[Shipping Sync Email Error]:', err.message));
            }
        }

        return res.status(200).json(
            new ApiResponse(200, { shipment, tcgStatus: newStatus }, 'Shipment status synced successfully')
        );
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 15. TCG WEBHOOK HANDLER
// POST /api/v1/shipping/webhook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Handle TCG webhook events (tracking updates, address changes, etc.)
 * @route   POST /api/v1/shipping/webhook
 * @access  Public (webhook, verify with secret if needed)
 */
exports.handleWebhook = async (req, res, next) => {
    try {
        const payload = req.body;

        // Identify the tracking reference from the payload
        const trackingRef =
            payload.custom_tracking_reference ||
            payload.shipment_custom_tracking_reference ||
            payload.shipment_tracking_reference ||
            null;

        if (!trackingRef) {
            return res.status(200).json({ received: true });
        }

        const shipment = await Shipment.findOne({
            $or: [
                { trackingReference: trackingRef },
                { customTrackingReference: trackingRef }
            ]
        });

        if (shipment) {
            const prevStatus = shipment.tcgStatus;
            const newStatus = payload.status || payload.update_type || prevStatus;

            if (payload.tracking_events) {
                shipment.trackingEvents = mapTrackingEvents(payload.tracking_events);
            }
            if (newStatus && newStatus !== prevStatus) {
                shipment.tcgStatus = newStatus;
            }
            if (newStatus === 'delivered') shipment.deliveredAt = new Date();
            await shipment.save();

            const orderStatus = tcgStatusToOrderStatus(newStatus);
            if (orderStatus && newStatus !== prevStatus) {
                const updatedOrder = await Order.findByIdAndUpdate(
                    shipment.order,
                    { orderStatus },
                    { new: true }
                );
                // Email customer when TCG webhook fires a status change
                if (updatedOrder) {
                    sendOrderStatusUpdateEmail(updatedOrder, prevStatus, orderStatus)
                        .catch(err => console.error('[Webhook Email Error]:', err.message));
                }
            }
        }

        // Always acknowledge webhook
        return res.status(200).json({ received: true });
    } catch (err) {
        // Always 200 for webhooks to prevent retries
        console.error('TCG Webhook error:', err.message);
        return res.status(200).json({ received: true, error: err.message });
    }
};
