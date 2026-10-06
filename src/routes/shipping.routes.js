const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    getShippingRates,
    getOptInRates,
    getPickupPoints,
    getPickupPointRates,
    createShipmentForOrder,
    getShipmentByOrder,
    trackShipment,
    getShipmentLabel,
    getShipmentStickerLabel,
    cancelShipment,
    getPodImages,
    getDigitalPod,
    listShipments,
    syncShipmentStatus,
    handleWebhook
} = require('../controllers/shipping.controller');

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/shipping/rates
 * @desc    Get shipping rates for a delivery address + parcel dimensions
 * @access  Public (used during checkout)
 */
router.post('/rates', getShippingRates);

/**
 * @route   POST /api/v1/shipping/rates/opt-in
 * @desc    Get optional add-on rates (gift wrap, early bird delivery)
 * @access  Public
 */
router.post('/rates/opt-in', getOptInRates);

/**
 * @route   GET /api/v1/shipping/pickup-points
 * @desc    Find nearest PUDO / locker / counter pickup points
 * @query   lat, lng, type (locker|counter|point)
 * @access  Public (used on checkout map)
 */
router.get('/pickup-points', getPickupPoints);

/**
 * @route   POST /api/v1/shipping/pickup-points/rates
 * @desc    Get rates for a specific locker/counter pickup point
 * @access  Public
 */
router.post('/pickup-points/rates', getPickupPointRates);

/**
 * @route   GET /api/v1/shipping/track/:trackingRef
 * @desc    Real-time shipment tracking (customers & admins)
 * @access  Public
 */
router.get('/track/:trackingRef', trackShipment);

/**
 * @route   GET /api/v1/shipping/track/:trackingRef/pod/images
 * @desc    Get proof-of-delivery images
 * @access  Public
 */
router.get('/track/:trackingRef/pod/images', getPodImages);

/**
 * @route   GET /api/v1/shipping/track/:trackingRef/pod/digital
 * @desc    Get digital proof-of-delivery PDF
 * @access  Public
 */
router.get('/track/:trackingRef/pod/digital', getDigitalPod);

/**
 * @route   POST /api/v1/shipping/webhook
 * @desc    Handle TCG webhook tracking events
 * @access  Public (webhook endpoint, should be IP-whitelisted at proxy level)
 */
router.post('/webhook', handleWebhook);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/shipping/shipments
 * @desc    List all shipments (admin dashboard)
 * @access  Private/Admin
 */
router.get('/shipments', protect, authorize('admin', 'manager'), listShipments);

/**
 * @route   POST /api/v1/shipping/orders/:orderId/shipment
 * @desc    Create a TCG shipment for an order
 * @access  Private/Admin
 */
router.post('/orders/:orderId/shipment', protect, authorize('admin', 'manager'), createShipmentForOrder);

/**
 * @route   GET /api/v1/shipping/orders/:orderId/shipment
 * @desc    Get the shipment record for an order
 * @access  Private/Admin
 */
router.get('/orders/:orderId/shipment', protect, authorize('admin', 'manager'), getShipmentByOrder);

/**
 * @route   GET /api/v1/shipping/:shipmentId/label
 * @desc    Get signed waybill PDF label URL
 * @access  Private/Admin
 */
router.get('/:shipmentId/label', protect, authorize('admin', 'manager'), getShipmentLabel);

/**
 * @route   GET /api/v1/shipping/:shipmentId/label/stickers
 * @desc    Get signed sticker label PDF URL
 * @access  Private/Admin
 */
router.get('/:shipmentId/label/stickers', protect, authorize('admin', 'manager'), getShipmentStickerLabel);

/**
 * @route   POST /api/v1/shipping/:shipmentId/cancel
 * @desc    Cancel a TCG shipment
 * @access  Private/Admin
 */
router.post('/:shipmentId/cancel', protect, authorize('admin', 'manager'), cancelShipment);

/**
 * @route   POST /api/v1/shipping/:shipmentId/sync
 * @desc    Manually sync shipment status from TCG
 * @access  Private/Admin
 */
router.post('/:shipmentId/sync', protect, authorize('admin', 'manager'), syncShipmentStatus);

module.exports = router;
