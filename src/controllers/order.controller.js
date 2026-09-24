const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Payment = require('../models/Payment.model');
const Product = require('../models/Product.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const {
    sendOrderConfirmationEmail,
    sendPaymentConfirmationEmail,
    sendPaymentStatusEmail,
    sendOrderStatusUpdateEmail
} = require('../services/email.service');
const { parsePrice, formatPrice } = require('../utils/priceFormatter');
const { parseSizesStringToStock, formatSizesString, findSizeStockKey, toPlainObject } = require('../utils/inventoryHelper');

// Helper to locate product for an order item
const findProductForItem = async (item) => {
    if (!item) return null;
    const targetId = item.product || item.productId || item.id || item._id;
    if (targetId && typeof targetId === 'string' && targetId.match(/^[0-9a-fA-F]{24}$/)) {
        const prod = await Product.findById(targetId);
        if (prod) return prod;
    }
    if (targetId) {
        const prod = await Product.findOne({ customId: targetId.toString().toUpperCase() });
        if (prod) return prod;
    }
    if (item.name) {
        const prod = await Product.findOne({ name: { $regex: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        if (prod) return prod;
    }
    return null;
};

// South Africa Regional Validation Helpers
const isValidSouthAfricanPhone = (phone) => {
    if (!phone) return false;
    const cleaned = String(phone).replace(/[\s\-\(\)\.]/g, '');
    return /^(?:\+27|27|0)[1-9]\d{8}$/.test(cleaned);
};

const isValidSouthAfricanPostalCode = (code) => {
    if (!code) return false;
    const cleaned = String(code).trim();
    return /^\d{4}$/.test(cleaned);
};

const isSouthAfricaCountry = (country) => {
    if (!country) return true; // defaults to South Africa
    const c = String(country).trim().toLowerCase();
    return ['south africa', 'southafrica', 'za', 'rsa', 'zaf'].includes(c);
};

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MJ-${timestamp}-${random}`;
};

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Public / Protected (Optional token)
exports.createOrder = async (req, res, next) => {
    try {
        const {
            customer,
            shippingAddress,
            billingAddress,
            items,
            subtotal,
            shippingMethod = 'Pudo Locker',
            shippingFee = 60,
            discount = 0,
            total,
            totalAmount,
            paymentMethod = 'WhatsApp Payment',
            paymentStatus,
            status,
            orderStatus = 'Pending',
            agreements,
            notes
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new ApiError(400, 'Cannot place order with empty items'));
        }

        // 1. Strict Customer / Billing Details Validation
        if (!customer || !customer.name || !customer.name.trim()) {
            return next(new ApiError(400, 'Full name is required for billing'));
        }

        if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customer.email).trim())) {
            return next(new ApiError(400, 'A valid email address is required for order confirmation'));
        }

        if (!customer.phone || !String(customer.phone).trim()) {
            return next(new ApiError(400, 'Phone number is required for courier delivery updates'));
        }

        if (!isValidSouthAfricanPhone(customer.phone)) {
            return next(new ApiError(400, 'Please provide a valid South African phone number (e.g., 082 123 4567 or +27 82 123 4567)'));
        }

        // Normalize customer with optional billing & tax details
        const resolvedCustomer = {
            name: customer.name.trim(),
            email: customer.email.trim().toLowerCase(),
            phone: customer.phone.trim(),
            organization: customer.organization ? customer.organization.trim() : '',
            taxType: customer.taxType || 'Personal',
            vatNumber: customer.vatNumber ? customer.vatNumber.trim() : '',
            address: customer.address ? customer.address.trim() : ''
        };

        // Normalize shipping address dynamically from incoming payload
        let resolvedShippingAddress = {};
        if (typeof shippingAddress === 'string') {
            resolvedShippingAddress = {
                street: shippingAddress.trim(),
                address: shippingAddress.trim(),
                apartment: '',
                city: '',
                province: '',
                state: '',
                postalCode: '',
                zip: '',
                country: 'South Africa',
                deliveryMethod: shippingMethod || ''
            };
        } else if (shippingAddress && typeof shippingAddress === 'object') {
            const streetVal = (shippingAddress.street || shippingAddress.address || '').trim();
            const addressVal = (shippingAddress.address || shippingAddress.street || '').trim();
            const provVal = (shippingAddress.province || shippingAddress.state || '').trim();
            const stateVal = (shippingAddress.state || shippingAddress.province || '').trim();
            const postVal = (shippingAddress.postalCode || shippingAddress.zip || '').trim();
            const zipVal = (shippingAddress.zip || shippingAddress.postalCode || '').trim();
            const countryVal = (shippingAddress.country || 'South Africa').trim();

            resolvedShippingAddress = {
                street: streetVal,
                address: addressVal,
                apartment: (shippingAddress.apartment || '').trim(),
                city: (shippingAddress.city || '').trim(),
                province: provVal,
                state: stateVal,
                postalCode: postVal,
                zip: zipVal,
                country: countryVal,
                deliveryMethod: (shippingAddress.deliveryMethod || shippingMethod || '').trim()
            };
        } else if (customer?.address) {
            resolvedShippingAddress = {
                street: customer.address.trim(),
                address: customer.address.trim(),
                apartment: '',
                city: '',
                province: '',
                state: '',
                postalCode: '',
                zip: '',
                country: 'South Africa',
                deliveryMethod: shippingMethod || ''
            };
        }

        // Normalize billing address dynamically (uses billingAddress or inherits from shippingAddress/customer)
        let resolvedBillingAddress = {};
        if (typeof billingAddress === 'string') {
            resolvedBillingAddress = {
                street: billingAddress.trim(),
                address: billingAddress.trim(),
                apartment: '',
                city: '',
                province: '',
                state: '',
                postalCode: '',
                zip: '',
                country: 'South Africa'
            };
        } else if (billingAddress && typeof billingAddress === 'object') {
            const bStreet = (billingAddress.street || billingAddress.address || resolvedShippingAddress.street || '').trim();
            const bAddress = (billingAddress.address || billingAddress.street || resolvedShippingAddress.address || '').trim();
            const bProv = (billingAddress.province || billingAddress.state || resolvedShippingAddress.province || '').trim();
            const bState = (billingAddress.state || billingAddress.province || resolvedShippingAddress.state || '').trim();
            const bPost = (billingAddress.postalCode || billingAddress.zip || resolvedShippingAddress.postalCode || '').trim();
            const bZip = (billingAddress.zip || billingAddress.postalCode || resolvedShippingAddress.zip || '').trim();
            const bCountry = (billingAddress.country || resolvedShippingAddress.country || 'South Africa').trim();

            resolvedBillingAddress = {
                street: bStreet,
                address: bAddress,
                apartment: (billingAddress.apartment || resolvedShippingAddress.apartment || '').trim(),
                city: (billingAddress.city || resolvedShippingAddress.city || '').trim(),
                province: bProv,
                state: bState,
                postalCode: bPost,
                zip: bZip,
                country: bCountry
            };
        } else {
            resolvedBillingAddress = {
                street: resolvedShippingAddress.street || '',
                address: resolvedShippingAddress.address || '',
                apartment: resolvedShippingAddress.apartment || '',
                city: resolvedShippingAddress.city || '',
                province: resolvedShippingAddress.province || '',
                state: resolvedShippingAddress.state || '',
                postalCode: resolvedShippingAddress.postalCode || '',
                zip: resolvedShippingAddress.zip || '',
                country: resolvedShippingAddress.country || 'South Africa'
            };
        }

        // 2. Strict South Africa Address Validations
        const streetAddress = resolvedShippingAddress.street || resolvedBillingAddress.street || resolvedCustomer.address;
        if (!streetAddress || !streetAddress.trim()) {
            return next(new ApiError(400, 'Street address is required for billing and delivery'));
        }

        if (!resolvedShippingAddress.city && !resolvedBillingAddress.city) {
            return next(new ApiError(400, 'City / Town is required'));
        }

        if (resolvedShippingAddress.country && !isSouthAfricaCountry(resolvedShippingAddress.country)) {
            return next(new ApiError(400, 'We only accept orders and provide delivery within South Africa'));
        }

        if (resolvedBillingAddress.country && !isSouthAfricaCountry(resolvedBillingAddress.country)) {
            return next(new ApiError(400, 'Billing address must be within South Africa'));
        }

        const postalCodeToCheck = resolvedShippingAddress.postalCode || resolvedBillingAddress.postalCode;
        if (!postalCodeToCheck || !postalCodeToCheck.trim()) {
            return next(new ApiError(400, 'Postal code is required'));
        }

        if (!isValidSouthAfricanPostalCode(postalCodeToCheck)) {
            return next(new ApiError(400, 'Please provide a valid 4-digit South African postal code (e.g., 8001 or 2000)'));
        }

        // Normalize items array
        const normalizedItems = items.map(item => {
            const rawPrice = item.priceNum !== undefined && item.priceNum !== null ? item.priceNum : item.price;
            const numPrice = parsePrice(rawPrice);
            const strPrice = formatPrice(numPrice);

            return {
                ...item,
                name: item.name || 'Jewellery Item',
                price: strPrice,
                priceNum: numPrice,
                quantity: Math.max(1, Number(item.quantity) || 1),
                color: item.color || item.colour || '',
                colour: item.colour || item.color || '',
                size: item.size || item.sizes || '',
                sizes: item.sizes || item.size || '',
                specs: item.specs || '',
                image: item.image || item.img || ''
            };
        });

        // 1. Validate stock availability for all items before placing order
        const productsToDeduct = [];
        const runningStockByProduct = new Map();
        const runningStockBySize = new Map();

        for (const item of normalizedItems) {
            const qtyNeeded = item.quantity;
            const product = await findProductForItem(item);

            if (product) {
                const prodIdStr = product._id.toString();
                const currentStock = runningStockByProduct.has(prodIdStr)
                    ? runningStockByProduct.get(prodIdStr)
                    : (product.stock !== undefined
                        ? Number(product.stock)
                        : (product.countInStock !== undefined
                            ? Number(product.countInStock)
                            : (product.stockQty !== undefined ? Number(product.stockQty) : 0)));

                const itemSize = (item.size || item.sizes || '').trim();
                let productSizeStock = toPlainObject(product.sizeStock);

                if (Object.keys(productSizeStock).length === 0 && product.sizes) {
                    const parsed = parseSizesStringToStock(product.sizes);
                    if (parsed.hasExplicitQty) {
                        productSizeStock = parsed.sizeStock;
                    }
                }

                const matchedKey = itemSize ? findSizeStockKey(productSizeStock, itemSize) : null;

                if (matchedKey && productSizeStock[matchedKey] !== undefined) {
                    const sizeKeyMap = `${prodIdStr}_${matchedKey}`;
                    const availableSizeStock = runningStockBySize.has(sizeKeyMap)
                        ? runningStockBySize.get(sizeKeyMap)
                        : (Number(productSizeStock[matchedKey]) || 0);

                    if (availableSizeStock < qtyNeeded) {
                        return next(
                            new ApiError(
                                400,
                                `Insufficient stock for "${product.name}" in Size ${itemSize || matchedKey}. Required: ${qtyNeeded}, Available: ${availableSizeStock}`
                            )
                        );
                    }

                    runningStockBySize.set(sizeKeyMap, availableSizeStock - qtyNeeded);
                } else if (currentStock < qtyNeeded) {
                    return next(
                        new ApiError(
                            400,
                            `Insufficient stock for "${product.name}". Required: ${qtyNeeded}, Available: ${currentStock}`
                        )
                    );
                }

                runningStockByProduct.set(prodIdStr, currentStock - qtyNeeded);
                productsToDeduct.push({
                    productId: product._id,
                    qtyNeeded,
                    itemSize,
                    matchedKey
                });
            }
        }

        const calculatedSubtotal = subtotal !== undefined && subtotal !== null && !isNaN(parsePrice(subtotal)) && parsePrice(subtotal) > 0
            ? parsePrice(subtotal)
            : normalizedItems.reduce((acc, i) => acc + (i.priceNum * i.quantity), 0);
        const resolvedShippingFee = shippingFee !== undefined ? parsePrice(shippingFee) : 60;
        const resolvedDiscount = discount !== undefined ? parsePrice(discount) : 0;
        const resolvedTotalAmount = totalAmount !== undefined
            ? parsePrice(totalAmount)
            : (total !== undefined ? parsePrice(total) : (calculatedSubtotal + resolvedShippingFee - resolvedDiscount));

        const resolvedStatus = orderStatus || status || 'Pending';
        const orderNumber = generateOrderNumber();

        // Determine Payment Status
        let resolvedPaymentStatus = 'Pending';
        if (paymentStatus) {
            resolvedPaymentStatus = paymentStatus;
        } else if (paymentMethod === 'WhatsApp Payment' || paymentMethod === 'Cash on Delivery' || paymentMethod === 'EFT') {
            resolvedPaymentStatus = 'Pending';
        } else if (paymentMethod === 'Credit Card' || paymentMethod === 'PayFast') {
            resolvedPaymentStatus = 'Paid';
        }

        const resolvedAgreements = {
            termsAgreed: agreements?.termsAgreed !== undefined ? Boolean(agreements.termsAgreed) : true,
            conciergeAuthorized: agreements?.conciergeAuthorized !== undefined ? Boolean(agreements.conciergeAuthorized) : true
        };

        // Keep User profile contact & address updated
        if (req.user || resolvedCustomer.email) {
            User.findOneAndUpdate(
                req.user ? { _id: req.user.id } : { email: resolvedCustomer.email },
                { $set: { phone: resolvedCustomer.phone, address: resolvedShippingAddress } }
            ).catch(() => {});
        }

        const order = await Order.create({
            orderNumber,
            user: req.user ? req.user.id : null,
            customer: resolvedCustomer,
            shippingAddress: resolvedShippingAddress,
            billingAddress: resolvedBillingAddress,
            items: normalizedItems,
            shippingMethod: shippingMethod || 'Pudo Locker',
            shippingFee: resolvedShippingFee,
            subtotal: calculatedSubtotal,
            discount: resolvedDiscount,
            totalAmount: resolvedTotalAmount,
            paymentMethod: 'WhatsApp Manual Payment',
            paymentStatus: resolvedPaymentStatus,
            orderStatus: resolvedStatus,
            agreements: resolvedAgreements,
            notes: notes || ''
        });

        // 2. Accurately deduct stock from inventory
        for (const { productId, qtyNeeded, itemSize, matchedKey } of productsToDeduct) {
            const currentProd = await Product.findById(productId);
            if (!currentProd) continue;

            let currentSizeStock = toPlainObject(currentProd.sizeStock);

            if (Object.keys(currentSizeStock).length === 0 && currentProd.sizes) {
                const parsed = parseSizesStringToStock(currentProd.sizes);
                if (parsed.hasExplicitQty) {
                    currentSizeStock = parsed.sizeStock;
                }
            }

            const sizeKeyToDeduct = matchedKey || (itemSize ? findSizeStockKey(currentSizeStock, itemSize) : null);

            let updatePayload = {};
            if (sizeKeyToDeduct && currentSizeStock[sizeKeyToDeduct] !== undefined) {
                currentSizeStock[sizeKeyToDeduct] = Math.max(0, (Number(currentSizeStock[sizeKeyToDeduct]) || 0) - qtyNeeded);
                const newStock = Object.values(currentSizeStock).reduce((sum, q) => sum + (Number(q) || 0), 0);
                const updatedSizesString = formatSizesString(currentSizeStock);

                updatePayload = {
                    sizeStock: currentSizeStock,
                    sizes: updatedSizesString,
                    stock: newStock,
                    countInStock: newStock,
                    stockQty: newStock,
                    inStock: newStock > 0
                };
            } else {
                const currentStockVal = currentProd.stock !== undefined
                    ? Number(currentProd.stock)
                    : (currentProd.countInStock !== undefined
                        ? Number(currentProd.countInStock)
                        : (currentProd.stockQty !== undefined ? Number(currentProd.stockQty) : 0));
                const newStock = Math.max(0, currentStockVal - qtyNeeded);

                updatePayload = {
                    stock: newStock,
                    countInStock: newStock,
                    stockQty: newStock,
                    inStock: newStock > 0
                };
            }

            await Product.findByIdAndUpdate(currentProd._id, updatePayload);
        }

        // Automatically generate payment record
        const paymentRecord = await Payment.create({
            transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            order: order._id,
            orderNumber: order.orderNumber,
            customerName: customer.name,
            customerEmail: customer.email,
            amount: order.totalAmount,
            currency: 'ZAR',
            method: 'WhatsApp Manual Payment',
            status: order.paymentStatus
        });

        // Trigger Luxury Order Confirmation Email Asynchronously
        sendOrderConfirmationEmail(order).catch(err => console.error('[Order Confirmation Email Error]:', err.message));

        // Trigger Payment Confirmation Email if payment is verified/paid
        if (order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed') {
            sendPaymentConfirmationEmail(paymentRecord, order).catch(err => console.error('[Payment Confirmation Email Error]:', err.message));
        }

        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Order placed successfully',
            data: order,
            order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            $or: [
                { user: req.user.id },
                { 'customer.email': req.user.email }
            ]
        })
        .sort('-_id') // _id is always indexed — avoids 32MB in-memory sort limit
        .allowDiskUse(true); // belt-and-suspenders fallback

        res.status(200).json(
            new ApiResponse(200, { count: orders.length, orders, data: orders }, 'My orders retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
    try {
        const { status, paymentStatus, search, page = 1, limit = 50 } = req.query;

        let query = {};

        if (status && status !== 'All') {
            query.orderStatus = status;
        }

        if (paymentStatus && paymentStatus !== 'All') {
            query.paymentStatus = paymentStatus;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort('-_id') // _id is always indexed — avoids 32MB in-memory sort limit
            .skip(skip)
            .limit(limitNum)
            .allowDiskUse(true); // Prevents MongoDB sort memory crash for any field-based sort

        const formattedOrders = orders.map(order => ({
            ...order.toObject(),
            id: order.orderNumber || order._id,
            total: order.totalAmount,
            status: (order.orderStatus || 'processing').toLowerCase(),
            date: order.createdAt
        }));

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Orders retrieved',
            data: formattedOrders,
            count: formattedOrders.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            orders: formattedOrders
        });
    } catch (error) {
        next(error);
    }
};

// Helper to find order by _id or orderNumber
const findOrderByIdOrNumber = async (id) => {
    if (!id) return null;
    let order = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(id);
    }
    if (!order) {
        order = await Order.findOne({
            $or: [{ orderNumber: id }, { orderNumber: id.toUpperCase() }]
        });
    }
    return order;
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await findOrderByIdOrNumber(req.params.id);

        if (!order) {
            return next(new ApiError(404, `Order not found with id ${req.params.id}`));
        }

        // Authorize check if regular customer is trying to see someone else's order
        if (req.user && req.user.role === 'customer' && order.user && order.user.toString() !== req.user.id && order.customer.email !== req.user.email) {
            return next(new ApiError(403, 'Unauthorized to view this order'));
        }

        res.status(200).json(
            new ApiResponse(200, { order }, 'Order retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, status, trackingNumber, carrier, estimatedDelivery, paymentStatus, notes, sendEmail: shouldSendEmail = true } = req.body;

        const isPaymentStatusRoute = req.originalUrl && req.originalUrl.includes('payment-status');
        const paymentKeywords = ['paid', 'unpaid', 'failed', 'refund', 'refunded'];

        let resolvedPaymentStatus = paymentStatus;
        let resolvedOrderStatus = orderStatus;

        if (isPaymentStatusRoute) {
            resolvedPaymentStatus = paymentStatus || status;
        } else if (status) {
            if (paymentKeywords.includes(String(status).toLowerCase())) {
                resolvedPaymentStatus = resolvedPaymentStatus || status;
            } else {
                resolvedOrderStatus = resolvedOrderStatus || status;
            }
        }

        const updateData = {};
        if (resolvedOrderStatus) updateData.orderStatus = resolvedOrderStatus;
        if (resolvedPaymentStatus) updateData.paymentStatus = resolvedPaymentStatus;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (carrier !== undefined) updateData.carrier = carrier;
        if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery;
        if (notes !== undefined) updateData.notes = notes;

        let order = await findOrderByIdOrNumber(req.params.id);

        if (!order) {
            return next(new ApiError(404, `Order not found with id ${req.params.id}`));
        }

        // If order is being cancelled, restore stock to products
        const isCancelling = resolvedOrderStatus && resolvedOrderStatus.toLowerCase() === 'cancelled';
        const wasCancelled = order.orderStatus && order.orderStatus.toLowerCase() === 'cancelled';
        if (isCancelling && !wasCancelled && order.items && Array.isArray(order.items)) {
            for (const item of order.items) {
                const qtyToRestore = Math.max(1, Number(item.quantity) || 1);
                const product = await findProductForItem(item);
                if (product) {
                    const currentProd = await Product.findById(product._id);
                    if (!currentProd) continue;

                    let currentSizeStock = toPlainObject(currentProd.sizeStock);

                    if (Object.keys(currentSizeStock).length === 0 && currentProd.sizes) {
                        const parsed = parseSizesStringToStock(currentProd.sizes);
                        if (parsed.hasExplicitQty) {
                            currentSizeStock = parsed.sizeStock;
                        }
                    }

                    const itemSize = (item.size || item.sizes || '').trim();
                    const sizeKeyToRestore = itemSize ? findSizeStockKey(currentSizeStock, itemSize) : null;

                    let updatePayload = {};
                    if (sizeKeyToRestore && currentSizeStock[sizeKeyToRestore] !== undefined) {
                        currentSizeStock[sizeKeyToRestore] = (Number(currentSizeStock[sizeKeyToRestore]) || 0) + qtyToRestore;
                        const newStock = Object.values(currentSizeStock).reduce((sum, q) => sum + (Number(q) || 0), 0);
                        const updatedSizesString = formatSizesString(currentSizeStock);

                        updatePayload = {
                            sizeStock: currentSizeStock,
                            sizes: updatedSizesString,
                            stock: newStock,
                            countInStock: newStock,
                            stockQty: newStock,
                            inStock: newStock > 0
                        };
                    } else {
                        const currentStockVal = currentProd.stock !== undefined
                            ? Number(currentProd.stock)
                            : (currentProd.countInStock !== undefined
                                ? Number(currentProd.countInStock)
                                : (currentProd.stockQty !== undefined ? Number(currentProd.stockQty) : 0));
                        const newStock = currentStockVal + qtyToRestore;

                        updatePayload = {
                            stock: newStock,
                            countInStock: newStock,
                            stockQty: newStock,
                            inStock: newStock > 0
                        };
                    }

                    await Product.findByIdAndUpdate(currentProd._id, updatePayload);
                }
            }
        }

        const oldOrderStatus = order.orderStatus;
        const oldPaymentStatus = order.paymentStatus;

        order = await Order.findByIdAndUpdate(order._id, updateData, {
            returnDocument: 'after',
            runValidators: true
        });

        // Keep payment record synced if paymentStatus changed
        if (resolvedPaymentStatus) {
            await Payment.updateMany({ orderNumber: order.orderNumber }, { status: resolvedPaymentStatus });
        }

        // Trigger Order Status Update Email if order status updated or tracking added
        if (shouldSendEmail && (resolvedOrderStatus || trackingNumber !== undefined)) {
            sendOrderStatusUpdateEmail(order, oldOrderStatus, resolvedOrderStatus || order.orderStatus).catch(err => {
                console.error('[Order Status Update Email Error]:', err.message);
            });
        }

        // Trigger Payment Status Email if payment status changed
        if (shouldSendEmail && resolvedPaymentStatus && resolvedPaymentStatus.toLowerCase() !== String(oldPaymentStatus || '').toLowerCase()) {
            const latestPayment = await Payment.findOne({ orderNumber: order.orderNumber }) || {
                transactionId: `TXN-${Date.now()}`,
                amount: order.totalAmount,
                orderNumber: order.orderNumber,
                method: order.paymentMethod,
                status: resolvedPaymentStatus
            };
            sendPaymentStatusEmail(latestPayment, order, resolvedPaymentStatus).catch(err => {
                console.error('[Payment Status Update Email Error]:', err.message);
            });
        }

        res.status(200).json(
            new ApiResponse(200, { order }, 'Order status updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/v1/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await findOrderByIdOrNumber(req.params.id);

        if (!order) {
            return next(new ApiError(404, `Order not found with id ${req.params.id}`));
        }

        await Order.findByIdAndDelete(order._id);

        res.status(200).json(
            new ApiResponse(200, {}, 'Order deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

