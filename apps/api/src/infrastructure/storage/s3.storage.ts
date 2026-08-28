import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index.js';
import { IStorageService } from './storage.interface.js';
import { logger } from '../logging/logger.js';

export class S3StorageService implements IStorageService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = config.S3_BUCKET;
    this.client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: 'us-east-1', // MinIO uses us-east-1 default or any
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY,
        secretAccessKey: config.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });
      await this.client.send(command);
      return key;
    } catch (error) {
      logger.error({ error, key }, 'Error uploading file to S3');
      throw new Error('Failed to upload file');
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.client.send(command);
      if (!response.Body) throw new Error('No body in response');
      const array = await response.Body.transformToByteArray();
      return Buffer.from(array);
    } catch (error) {
      logger.error({ error, key }, 'Error downloading file from S3');
      throw new Error('Failed to download file');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
    } catch (error) {
      logger.error({ error, key }, 'Error deleting file from S3');
      throw new Error('Failed to delete file');
    }
  }

  async getSignedUrl(key: string, expiresIn: number): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      logger.error({ error, key }, 'Error generating signed URL');
      throw new Error('Failed to generate signed URL');
    }
  }
}
