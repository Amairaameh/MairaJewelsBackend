const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    toggleProductStatus,
    getProductStats
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public Product Queries
router.get('/', getProducts);
router.get('/stats', protect, authorize('admin', 'manager'), getProductStats);

// Bulk and Specific Admin Actions
router.post('/bulk-delete', protect, authorize('admin'), bulkDeleteProducts);

// Create Product (supports JSON or multipart form-data image files upload to R2)
router.post(
    '/',
    protect,
    authorize('admin', 'manager'),
    upload.array('images', 10),
    createProduct
);

// Single Product Operations (lookup by _id, customId, sku, or slug)
router.route('/:id')
    .get(getProductById)
    .put(
        protect,
        authorize('admin', 'manager'),
        upload.array('images', 10),
        updateProduct
    )
    .delete(
        protect,
        authorize('admin'),
        deleteProduct
    );

// Quick Status Toggle
router.patch('/:id/toggle', protect, authorize('admin', 'manager'), toggleProductStatus);

module.exports = router;
