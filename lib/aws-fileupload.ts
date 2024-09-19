import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: "../.env.local" });

// Ensure environment variables are defined
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const bucket = process.env.AWS_S3_BUCKET;

if (!region || !accessKeyId || !secretAccessKey || !bucket) {
  throw new Error('Missing required environment variables for AWS S3 configuration');
}

// Configure AWS SDK v3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const uploadFilesToS3 = async (file: File): Promise<string> => {
  try {
    const fileContent = await file.arrayBuffer();
    const buffer = Buffer.from(fileContent);

    const currentDate = new Date().toISOString().split('T')[0];
    const key = `${currentDate}_${file.name}`;

    const params = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return publicUrl;
  } catch (err: any) {
    throw new Error(`Error uploading file to S3: ${err.message}`);
  }
};
