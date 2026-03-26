/**
 * Script: Upload assets to Cloudflare R2
 * 
 * This script uploads all assets from client/public/assets to R2 bucket.
 * Usage: npx tsx scripts/upload-to-r2.ts
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Validate environment
const requiredEnvVars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_ENDPOINT'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing environment variable: ${envVar}`);
        process.exit(1);
    }
}

// Initialize S3 client for R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const ASSETS_DIR = join(process.cwd(), 'client', 'public', 'assets');

// MIME type mapping
const mimeTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
};

function getMimeType(filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

// Recursively get all files in directory
function getAllFiles(dir: string, files: string[] = []): string[] {
    const items = readdirSync(dir);

    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            getAllFiles(fullPath, files);
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

async function uploadFile(filePath: string, key: string): Promise<boolean> {
    try {
        const fileContent = readFileSync(filePath);
        const contentType = getMimeType(filePath);

        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000', // 1 year cache
        }));

        console.log(`✅ Uploaded: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to upload ${key}:`, error);
        return false;
    }
}

async function testConnection(): Promise<boolean> {
    try {
        console.log('🔍 Testing R2 connection...');
        await s3Client.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            MaxKeys: 1,
        }));
        console.log('✅ R2 connection successful!');
        return true;
    } catch (error) {
        console.error('❌ R2 connection failed:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting R2 Upload Script');
    console.log(`📦 Bucket: ${BUCKET_NAME}`);
    console.log(`📁 Assets Dir: ${ASSETS_DIR}`);
    console.log('');

    // Test connection first
    const connected = await testConnection();
    if (!connected) {
        process.exit(1);
    }

    // Get all files
    console.log('\n📋 Scanning files...');
    const files = getAllFiles(ASSETS_DIR);
    console.log(`Found ${files.length} files to upload`);

    // Calculate total size
    let totalSize = 0;
    for (const file of files) {
        totalSize += statSync(file).size;
    }
    console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

    // Upload files
    let success = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Key format: cofinanciame/aviano/video.mp4 (tenant/project/file)
        const key = `cofinanciame/${relative(ASSETS_DIR, file)}`;

        const uploaded = await uploadFile(file, key);
        if (uploaded) {
            success++;
        } else {
            failed++;
        }

        // Progress
        if ((i + 1) % 10 === 0) {
            console.log(`\n📊 Progress: ${i + 1}/${files.length} (${Math.round((i + 1) / files.length * 100)}%)\n`);
        }
    }

    console.log('\n🎉 Upload Complete!');
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`\n🌐 Assets will be available at: ${process.env.R2_PUBLIC_URL}/cofinanciame/`);
}

main().catch(console.error);
