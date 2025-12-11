import { S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = accountId
  ? `https://${accountId}.r2.cloudflarestorage.com`
  : undefined;

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn('[R2] Missing credentials: R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY');
}

export const r2 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

export function getPublicBaseUrl() {
  // Expected: https://<account>.r2.cloudflarestorage.com/<bucket>
  // Provided by env: R2_PUBLIC_URL
  const base = process.env.R2_PUBLIC_URL;
  if (!base) {
    console.warn('[R2] Missing R2_PUBLIC_URL for public assets');
  }
  return base?.replace(/\/$/, '') || '';
}
