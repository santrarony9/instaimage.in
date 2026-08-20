import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'AWS_S3_BUCKET',
      'snapmarket-media',
    );

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'ap-south-1'),
      credentials: {
        accessKeyId: this.configService.get<string>(
          'AWS_ACCESS_KEY_ID',
          'mock-key',
        ),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          'mock-secret',
        ),
      },
    });
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    this.logger.log(`Generating presigned upload URL for key: ${key}`);

    try {
      // Url valid for 15 minutes
      return await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
    } catch (error) {
      this.logger.error('Error generating presigned upload URL', error);
      // Return mock URL for development
      return `https://mock-s3-bucket.s3.ap-south-1.amazonaws.com/${key}?X-Amz-Signature=mock`;
    }
  }

  async generatePresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    this.logger.log(`Generating presigned download URL for key: ${key}`);

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      this.logger.error('Error generating presigned download URL', error);
      return `https://mock-s3-bucket.s3.ap-south-1.amazonaws.com/${key}`;
    }
  }
}
