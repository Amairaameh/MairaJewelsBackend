const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { uploadFileToR2, uploadMultipleFilesToR2, deleteFileFromR2 } = require('../services/r2.service');

// @desc    Upload single file to Cloudflare R2
// @route   POST /api/v1/upload/single
// @access  Private/Admin
exports.uploadSingle = async (req, res, next) => {
    try {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
        if (!file) {
            return next(new ApiError(400, 'Please select a valid image file to upload'));
        }

        const folder = req.body.folder || 'products';
        const result = await uploadFileToR2({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            folder
        });

        res.status(200).json(
            new ApiResponse(200, {
                filename: result.filename,
                key: result.key,
                url: result.url,
                size: result.size,
                mimetype: result.mimetype
            }, 'Image uploaded to Cloudflare R2 successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Upload multiple files (gallery) to Cloudflare R2
// @route   POST /api/v1/upload/multiple
// @access  Private/Admin
exports.uploadMultiple = async (req, res, next) => {
    try {
        const rawFiles = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
        if (!rawFiles || rawFiles.length === 0) {
            return next(new ApiError(400, 'Please select image files to upload'));
        }

        // Deduplicate files in case frontend appended duplicate FormData fields or triggered duplicate events
        const uniqueFiles = [];
        const seen = new Set();
        for (const file of rawFiles) {
            const fileKey = `${file.originalname}_${file.size}`;
            if (!seen.has(fileKey)) {
                seen.add(fileKey);
                uniqueFiles.push(file);
            }
        }

        const folder = req.body.folder || 'products';
        const results = await uploadMultipleFilesToR2(uniqueFiles, folder);

        res.status(200).json(
            new ApiResponse(200, {
                count: results.length,
                files: results
            }, 'Images uploaded to Cloudflare R2 successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete file from Cloudflare R2
// @route   DELETE /api/v1/upload
// @access  Private/Admin
exports.deleteUpload = async (req, res, next) => {
    try {
        const { url, key } = req.body;
        const target = url || key;

        if (!target) {
            return next(new ApiError(400, 'Please provide the file url or key to delete'));
        }

        const deleted = await deleteFileFromR2(target);

        res.status(200).json(
            new ApiResponse(200, { deleted, target }, 'File deletion processed')
        );
    } catch (error) {
        next(error);
    }
};
