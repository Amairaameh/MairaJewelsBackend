const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const inquiryRoutes = require('./inquiry.routes');
const faqRoutes = require('./faq.routes');
const settingRoutes = require('./setting.routes');
const dashboardRoutes = require('./dashboard.routes');
const uploadRoutes = require('./upload.routes');

// Healthcheck
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'online',
        service: 'Maira Jewels E-Commerce & Admin API',
        timestamp: new Date().toISOString()
    });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/contacts', inquiryRoutes);
router.use('/faqs', faqRoutes);
router.use('/settings', settingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);

const { protect, authorize } = require('../middlewares/auth.middleware');
const User = require('../models/User.model');
const Order = require('../models/Order.model');

// @route GET /api/v1/customers & /api/v1/users
// @access Private/Admin
const getCustomersHandler = async (req, res, next) => {
    try {
        const [users, orders] = await Promise.all([
            User.find({ role: 'customer' }).sort('createdAt'),
            Order.find().sort('-createdAt').lean()
        ]);

        const customerMap = new Map();
        let seq = 1;
        const usedIds = new Set();

        // 1. Process registered users first
        for (const user of users) {
            const emailKey = (user.email || '').toLowerCase().trim();
            if (!emailKey) continue;

            let custId = user.customerId;
            if (!custId || !custId.startsWith('CUST-') || usedIds.has(custId)) {
                custId = 'CUST-' + String(seq).padStart(3, '0');
                while (usedIds.has(custId)) {
                    seq++;
                    custId = 'CUST-' + String(seq).padStart(3, '0');
                }
                user.customerId = custId;
                await User.findByIdAndUpdate(user._id, { customerId: custId }).catch(() => {});
            }
            usedIds.add(custId);
            seq++;

            customerMap.set(emailKey, {
                id: custId,
                _id: user._id,
                customerId: custId,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                createdAt: user.createdAt,
                role: user.role
            });
        }

        // 2. Enrich and add customers from orders
        for (const order of orders) {
            const cust = order.customer || {};
            const emailKey = (cust.email || order.customerEmail || (order.user && order.user.email) || '').toLowerCase().trim();
            if (!emailKey) continue;

            const shipAddr = order.shippingAddress || {};
            const orderPhone = (cust.phone || order.customerPhone || shipAddr.phone || order.phone || '').trim();

            if (customerMap.has(emailKey)) {
                const existing = customerMap.get(emailKey);
                if ((!existing.phone || existing.phone === '—') && orderPhone) {
                    existing.phone = orderPhone;
                }
                const hasFullStreet = existing.address && typeof existing.address === 'object' && existing.address.street;
                if (!hasFullStreet && (shipAddr.street || shipAddr.address)) {
                    existing.address = shipAddr;
                }
            } else {
                let custId = 'CUST-' + String(seq).padStart(3, '0');
                while (usedIds.has(custId)) {
                    seq++;
                    custId = 'CUST-' + String(seq).padStart(3, '0');
                }
                usedIds.add(custId);
                seq++;

                customerMap.set(emailKey, {
                    id: custId,
                    _id: order._id,
                    customerId: custId,
                    name: cust.name || order.customerName || 'Anonymous Customer',
                    email: cust.email || emailKey,
                    phone: orderPhone,
                    address: shipAddr.street ? shipAddr : (cust.address || ''),
                    createdAt: order.createdAt || new Date().toISOString()
                });
            }
        }

        const customers = Array.from(customerMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            success: true,
            statusCode: 200,
            data: { count: customers.length, customers, users: customers },
            message: 'Customers retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

router.get('/customers', protect, authorize('admin', 'manager'), getCustomersHandler);
router.get('/users', protect, authorize('admin', 'manager'), getCustomersHandler);

module.exports = router;
