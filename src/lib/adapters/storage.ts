import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'node:fs';
import path from 'node:path';

export interface StorageUploadResult {
  key: string;
  url: string;
  sizeBytes: number;
  isMock: boolean;
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '6c9035e2ddbac196ef20ce5bfd9469cd';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'toolcart-assets';
const publicBaseUrl = process.env.R2_PUBLIC_URL || 'https://assets.toolcart.co.uk';

export function isR2Configured(): boolean {
  if (!accountId || accountId.startsWith('mock_')) return false;
  if (!accessKeyId || accessKeyId.startsWith('mock_') || accessKeyId.length < 10) return false;
  if (!secretAccessKey || secretAccessKey.startsWith('mock_') || secretAccessKey.length < 10) return false;
  return true;
}

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Uploads a binary buffer or string to Cloudflare R2,
 * or falls back to local public directory when R2 is not configured.
 */
export async function uploadFile(
  buffer: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<StorageUploadResult> {
  const sanitizedKey = key.replace(/^\/+/, '');
  const sizeBytes = buffer.byteLength;

  if (isR2Configured()) {
    try {
      const client = getS3Client();
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: sanitizedKey,
          Body: buffer,
          ContentType: contentType,
        })
      );
      const url = `${publicBaseUrl.replace(/\/+$/, '')}/${sanitizedKey}`;
      return { key: sanitizedKey, url, sizeBytes, isMock: false };
    } catch (error) {
      console.warn('[R2 Storage] Upload failed, falling back to local storage:', error);
    }
  }

  // Local filesystem fallback
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const cleanKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');
  const targetPath = path.resolve(uploadDir, cleanKey);
  if (!targetPath.startsWith(uploadDir)) {
    throw new Error('Invalid path traversal asset key');
  }

  try {
    const parentDir = path.dirname(targetPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, Buffer.from(buffer));
    const urlKey = cleanKey.replace(/\\/g, '/');
    const url = `/uploads/${urlKey}`;
    return { key: urlKey, url, sizeBytes, isMock: true };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Invalid path traversal asset key') {
      throw err;
    }
    const urlKey = cleanKey.replace(/\\/g, '/');
    // Deterministic fallback if filesystem is read-only (e.g. edge runtime)
    return {
      key: urlKey,
      url: `/uploads/${urlKey}`,
      sizeBytes,
      isMock: true,
    };
  }
}

/**
 * Generates public URL for a given asset key.
 */
export function getPublicUrl(key: string): string {
  const sanitizedKey = key.replace(/^\/+/, '');
  if (isR2Configured()) {
    return `${publicBaseUrl.replace(/\/+$/, '')}/${sanitizedKey}`;
  }
  return `/uploads/${sanitizedKey}`;
}

/**
 * Deletes an asset by key from R2 or local filesystem fallback.
 */
export async function deleteFile(key: string): Promise<boolean> {
  const sanitizedKey = key.replace(/^\/+/, '');

  if (isR2Configured()) {
    try {
      const client = getS3Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: sanitizedKey,
        })
      );
      return true;
    } catch (err) {
      console.warn('[R2 Storage] Delete failed:', err);
      return false;
    }
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const cleanKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');
  const targetPath = path.resolve(uploadDir, cleanKey);
  if (!targetPath.startsWith(uploadDir)) {
    throw new Error('Invalid path traversal asset key');
  }

  try {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a presigned upload URL for direct browser-to-R2 uploads.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const sanitizedKey = key.replace(/^\/+/, '');
  if (!isR2Configured()) {
    return `/api/admin/media/mock-upload?key=${encodeURIComponent(sanitizedKey)}`;
  }
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: sanitizedKey,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
