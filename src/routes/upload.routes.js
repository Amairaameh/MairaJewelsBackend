const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { uploadSingle, uploadMultiple, deleteUpload } = require('../controllers/upload.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/single', protect, authorize('admin', 'manager'), upload.single('image'), uploadSingle);
router.post('/multiple', protect, authorize('admin', 'manager'), upload.array('images', 10), uploadMultiple);
router.delete('/', protect, authorize('admin', 'manager'), deleteUpload);

module.exports = router;
