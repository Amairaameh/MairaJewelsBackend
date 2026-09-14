const multer = require('multer');
const ApiError = require('../utils/apiError');

// Use memory storage for direct in-memory streaming / upload to Cloudflare R2
const storage = multer.memoryStorage();

// File filter (accept images only)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/gif',
        'image/svg+xml'
    ];

    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file format. Only JPEG, PNG, WEBP, AVIF, and GIF image files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB default
        files: 10 // Maximum 10 files per request
    },
    fileFilter: fileFilter
});

module.exports = upload;
