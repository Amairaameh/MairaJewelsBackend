const path = require('path');
const { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { r2Client, bucketName, publicUrl } = require('../config/r2');
const ApiError = require('../utils/apiError');

/**
 * Extracts R2 object key from a full URL or relative path
 * @param {string} urlOrKey 
 * @returns {string|null}
 */
const extractKeyFromUrl = (urlOrKey) => {
    if (!urlOrKey || typeof urlOrKey !== 'string') return null;

    // If it's already a relative key without http
    if (!urlOrKey.startsWith('http://') && !urlOrKey.startsWith('https://')) {
        return urlOrKey.replace(/^\/+/, '');
    }

    try {
        const parsed = new URL(urlOrKey);
        // pathname starts with '/' -> e.g. /products/maira-123.jpg
        return parsed.pathname.replace(/^\/+/, '');
    } catch (e) {
        return null;
    }
};

/**
 * Upload single buffer to Cloudflare R2
 * @param {Object} params
 * @param {Buffer} params.buffer - File buffer
 * @param {string} params.originalname - Original file name
 * @param {string} params.mimetype - MIME type
 * @param {string} [params.folder='products'] - Target folder in bucket
 * @returns {Promise<{ key: string, url: string, size: number, mimetype: string, filename: string }>}
 */
const uploadFileToR2 = async ({ buffer, originalname, mimetype, folder = 'products' }) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new ApiError(400, 'Invalid file buffer provided for R2 upload');
    }

    const ext = (path.extname(originalname || '') || '.jpg').toLowerCase();
    const sanitizedBase = path
        .basename(originalname || 'image', ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `maira-${sanitizedBase ? sanitizedBase + '-' : ''}${uniqueSuffix}${ext}`;
    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype || 'application/octet-stream',
        // Set aggressive edge caching for lightning fast instant loading
        CacheControl: 'public, max-age=31536000, immutable'
    });

    await r2Client.send(command);

    const fileUrl = publicUrl ? `${publicUrl}/${key}` : `/${key}`;

    return {
        key,
        filename,
        url: fileUrl,
        size: buffer.length,
        mimetype: mimetype || 'application/octet-stream'
    };
};

/**
 * Upload multiple files to Cloudflare R2
 * @param {Array<Express.Multer.File>} files 
 * @param {string} [folder='products'] 
 * @returns {Promise<Array<{ key: string, url: string, size: number, mimetype: string, filename: string }>>}
 */
const uploadMultipleFilesToR2 = async (files = [], folder = 'products') => {
    if (!Array.isArray(files) || files.length === 0) {
        return [];
    }

    const uploadPromises = files.map(file =>
        uploadFileToR2({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            folder
        })
    );

    return Promise.all(uploadPromises);
};

/**
 * Delete a file from Cloudflare R2
 * @param {string} urlOrKey 
 * @returns {Promise<boolean>}
 */
const deleteFileFromR2 = async (urlOrKey) => {
    const key = extractKeyFromUrl(urlOrKey);
    if (!key) return false;

    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
        });
        await r2Client.send(command);
        return true;
    } catch (error) {
        console.error(`[R2 Service] Failed to delete object ${key}:`, error.message);
        return false;
    }
};

/**
 * Delete multiple files from Cloudflare R2
 * @param {Array<string>} urlsOrKeys 
 * @returns {Promise<number>} count of deleted files
 */
const deleteMultipleFilesFromR2 = async (urlsOrKeys = []) => {
    if (!Array.isArray(urlsOrKeys) || urlsOrKeys.length === 0) {
        return 0;
    }

    const validKeys = urlsOrKeys
        .map(extractKeyFromUrl)
        .filter(Boolean);

    if (validKeys.length === 0) return 0;

    try {
        if (validKeys.length === 1) {
            await deleteFileFromR2(validKeys[0]);
            return 1;
        }

        const command = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
                Objects: validKeys.map(Key => ({ Key })),
                Quiet: true
            }
        });
        await r2Client.send(command);
        return validKeys.length;
    } catch (error) {
        console.error('[R2 Service] Failed batch deletion:', error.message);
        return 0;
    }
};

module.exports = {
    uploadFileToR2,
    uploadMultipleFilesToR2,
    deleteFileFromR2,
    deleteMultipleFilesFromR2,
    extractKeyFromUrl
};
