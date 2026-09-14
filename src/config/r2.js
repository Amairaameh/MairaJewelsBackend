const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { S3Client } = require('@aws-sdk/client-s3');

// Cloudflare R2 is S3-compatible object storage
const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'mairajewels';
const publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/$/, '');

if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error('[Cloudflare R2 Error] Missing Cloudflare R2 credentials in .env file!');
    console.error('Expected: CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY');
}

// Build exact R2 S3 endpoint
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || `https://${accountId || 'missing-account-id'}.r2.cloudflarestorage.com`;

const r2Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || ''
    }
});

module.exports = {
    r2Client,
    bucketName,
    publicUrl,
    endpoint,
    accountId
};
