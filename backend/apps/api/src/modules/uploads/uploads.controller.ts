import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Controller('uploads')
export class UploadsController {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com',
      region: process.env.B2_REGION || 'eu-central-003',
      credentials: {
        accessKeyId: process.env.B2_KEY_ID || 'f87ad6faa8b3',
        secretAccessKey: process.env.B2_APPLICATION_KEY || '0031697847c74883ae60204a0d5fd410f394a59adf',
      },
    });
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|zip|pdf|rar)$/)) {
          return cb(
            new BadRequestException('Invalid file type!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid file type');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extname(file.originalname)}`;
    const bucketName = process.env.B2_BUCKET_NAME || 'instaimage-bucket';

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      // Construct public URL
      const endpoint = process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com';
      const fileUrl = `${endpoint}/${bucketName}/${filename}`;

      return {
        url: fileUrl,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      console.error('B2 Upload Error:', error);
      throw new BadRequestException('Failed to upload file to Backblaze B2');
    }
  }
}
