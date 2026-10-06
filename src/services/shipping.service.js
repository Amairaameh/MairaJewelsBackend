const axios = require('axios');

/**
 * TCG (The Courier Guy) API Service
 * Wraps the TCG REST API endpoints used by Maira Jewels.
 * Base URL: https://api.portal.thecourierguy.co.za
 *
 * Auth: Bearer token set in TCG_API_KEY environment variable.
 */

const TCG_BASE_URL = process.env.TCG_API_URL || 'https://api.portal.thecourierguy.co.za';
const TCG_API_KEY = process.env.TCG_API_KEY || '';

/**
 * Create a pre-configured Axios instance for TCG API calls.
 */
const tcgClient = () =>
    axios.create({
        baseURL: TCG_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TCG_API_KEY}`
        }
    });

// ─────────────────────────────────────────────────────────────────────────────
// RATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get shipping rates for a collection → delivery route.
 * @param {Object} params
 * @param {Object} params.collectionAddress
 * @param {Object} params.deliveryAddress
 * @param {Array}  params.parcels
 * @param {Number} [params.declaredValue]
 * @param {String} [params.collectionMinDate]
 * @param {String} [params.deliveryMinDate]
 */
exports.getRates = async (params) => {
    const client = tcgClient();
    const { data } = await client.post('/rates', {
        collection_address: params.collectionAddress,
        delivery_address: params.deliveryAddress,
        parcels: params.parcels,
        declared_value: params.declaredValue || 0,
        collection_min_date: params.collectionMinDate || new Date().toISOString().split('T')[0],
        delivery_min_date: params.deliveryMinDate || new Date().toISOString().split('T')[0]
    });
    return data;
};

/**
 * Get available opt-in rates (e.g. gift wrap, early bird delivery)
 * for a given collection/delivery address pair.
 */
exports.getOptInRates = async ({ collectionAddress, deliveryAddress }) => {
    const client = tcgClient();
    const { data } = await client.post('/rates/opt-in', {
        collection_address: collectionAddress,
        delivery_address: deliveryAddress
    });
    return data;
};

/**
 * Get pickup point rates (for locker/counter delivery).
 */
exports.getPickupPointRates = async (params) => {
    const client = tcgClient();
    const { data } = await client.post('/rates', {
        collection_address: params.collectionAddress,
        delivery_pickup_point_id: params.deliveryPickupPointId,
        parcels: params.parcels,
        collection_min_date: params.collectionMinDate || new Date().toISOString().split('T')[0],
        delivery_min_date: params.deliveryMinDate || new Date().toISOString().split('T')[0]
    });
    return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PICKUP POINTS (PUDO / Lockers / Counters)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search for pickup points near a lat/lng location.
 * @param {Number} lat
 * @param {Number} lng
 * @param {String} [type] - 'locker' | 'counter' | 'point'
 */
exports.getPickupPoints = async ({ lat, lng, type = null, search = null, limit = 50, orderClosest = true }) => {
    const client = tcgClient();
    const params = {};
    if (lat !== undefined && lat !== null && !isNaN(Number(lat))) params.lat = Number(lat);
    if (lng !== undefined && lng !== null && !isNaN(Number(lng))) params.lng = Number(lng);
    if (type) params.type = type;
    if (search) params.search = search;
    if (limit) params.limit = Number(limit);
    if (params.lat !== undefined) params.order_closest = orderClosest;

    const { data } = await client.get('/pickup-points', { params });
    return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// SHIPMENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a door-to-door shipment.
 */
exports.createShipment = async (params) => {
    const client = tcgClient();
    const { data } = await client.post('/shipments', {
        collection_address: params.collectionAddress,
        collection_contact: params.collectionContact,
        delivery_address: params.deliveryAddress,
        delivery_contact: params.deliveryContact,
        parcels: params.parcels,
        service_level_code: params.serviceLevelCode || 'ECO',
        opt_in_rates: params.optInRates || [],
        opt_in_time_based_rates: params.optInTimeBasedRates || [],
        special_instructions_collection: params.specialInstructionsCollection || '',
        special_instructions_delivery: params.specialInstructionsDelivery || '',
        declared_value: params.declaredValue || 0,
        collection_min_date: params.collectionMinDate || new Date().toISOString(),
        collection_after: params.collectionAfter || '08:00',
        collection_before: params.collectionBefore || '16:00',
        delivery_min_date: params.deliveryMinDate || new Date().toISOString(),
        delivery_after: params.deliveryAfter || '08:00',
        delivery_before: params.deliveryBefore || '17:00',
        customer_reference_name: 'Order no.',
        customer_reference: params.customerReference || '',
        mute_notifications: params.muteNotifications || false
    });
    return data;
};

/**
 * Create a pickup-point (locker/counter) shipment.
 */
exports.createPickupPointShipment = async (params) => {
    const client = tcgClient();
    const { data } = await client.post('/shipments', {
        collection_address: params.collectionAddress,
        collection_contact: params.collectionContact,
        delivery_pickup_point_id: params.deliveryPickupPointId,
        delivery_contact: params.deliveryContact,
        parcels: params.parcels,
        service_level_code: params.serviceLevelCode,
        special_instructions_collection: params.specialInstructionsCollection || '',
        special_instructions_delivery: params.specialInstructionsDelivery || '',
        collection_min_date: params.collectionMinDate || new Date().toISOString(),
        collection_after: params.collectionAfter || '08:00',
        collection_before: params.collectionBefore || '16:00',
        delivery_min_date: params.deliveryMinDate || new Date().toISOString(),
        delivery_after: params.deliveryAfter || '08:00',
        delivery_before: params.deliveryBefore || '17:00',
        customer_reference_name: 'Order no.',
        customer_reference: params.customerReference || '',
        mute_notifications: params.muteNotifications || false
    });
    return data;
};

/**
 * Get shipments list or a specific shipment by tracking reference.
 */
exports.getShipments = async ({ trackingReference, status, startDate, endDate, limit, offset } = {}) => {
    const client = tcgClient();
    const params = {};
    if (trackingReference) params.tracking_reference = trackingReference;
    if (status) params.status = JSON.stringify(status); // e.g. ["collected","delivered"]
    if (startDate && endDate) {
        params.date_filter = 'time_created';
        params.start_date = startDate;
        params.end_date = endDate;
    }
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    const { data } = await client.get('/shipments', { params });
    return data;
};

/**
 * Get a waybill label PDF URL for a shipment.
 */
exports.getShipmentLabel = async (shipmentId) => {
    const client = tcgClient();
    const { data } = await client.get('/shipments/label', { params: { id: shipmentId } });
    return data;
};

/**
 * Get a sticker label PDF URL for a shipment.
 */
exports.getShipmentStickerLabel = async (shipmentId) => {
    const client = tcgClient();
    const { data } = await client.get('/shipments/label/stickers', { params: { id: shipmentId } });
    return data;
};

/**
 * Cancel a shipment by tracking reference.
 */
exports.cancelShipment = async (trackingReference) => {
    const client = tcgClient();
    const { data } = await client.post('/shipments/cancel', { tracking_reference: trackingReference });
    return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// TRACKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track a shipment by tracking reference.
 * Returns status + array of tracking events.
 */
exports.trackShipment = async (trackingReference) => {
    const client = tcgClient();
    const { data } = await client.get('/tracking/shipments', {
        params: { tracking_reference: trackingReference }
    });
    return data;
};

/**
 * Get POD (Proof of Delivery) images for a shipment.
 */
exports.getPodImages = async (trackingReference, includeDigitalPod = false) => {
    const client = tcgClient();
    const { data } = await client.get('/shipments/pod/images', {
        params: { tracking_reference: trackingReference, include_digital_pod: includeDigitalPod }
    });
    return data;
};

/**
 * Get all POD events for a shipment.
 */
exports.getAllPodEvents = async (trackingReference, includeDigitalPod = false) => {
    const client = tcgClient();
    const { data } = await client.get('/shipments/pod', {
        params: { tracking_reference: trackingReference, include_digital_pod: includeDigitalPod }
    });
    return data;
};

/**
 * Get a digital POD for a shipment.
 */
exports.getDigitalPod = async (trackingReference) => {
    const client = tcgClient();
    const { data } = await client.get('/shipments/digital-pod', {
        params: { tracking_reference: trackingReference }
    });
    return data;
};

/**
 * Get a signed S3 download URL for a POD image/file.
 */
exports.getS3SignedUrl = async (fileNames, folder = 'shipment-images') => {
    const client = tcgClient();
    const { data } = await client.get('/s3-url/download', {
        params: {
            file_name: JSON.stringify(fileNames),
            folder
        }
    });
    return data;
};
