import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Delete,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Public, Roles, Role } from '@app/auth';
import { Service } from '../services/schemas/service.schema';
import { Banner } from '../banners/schemas/banner.schema';

@Controller('uploads')
export class UploadsController {
  private s3: S3Client;

  constructor(
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Banner.name) private readonly bannerModel: Model<Banner>,
  ) {
    this.s3 = new S3Client({
      endpoint:
        process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com',
      region: process.env.B2_REGION || 'eu-central-003',
      credentials: {
        accessKeyId: process.env.B2_KEY_ID || 'f87ad6faa8b3',
        secretAccessKey:
          process.env.B2_APPLICATION_KEY ||
          '0031697847c74883ae60204a0d5fd410f394a59adf',
      },
    });
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|zip|pdf|rar)$/)
        ) {
          return cb(new BadRequestException('Invalid file type!'), false);
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

    let fileBuffer = file.buffer;
    let mimeType = file.mimetype;
    let fileExt = extname(file.originalname);

    // Optimize images (exclude gifs as sharp animated webp can sometimes be tricky or large)
    if (mimeType.startsWith('image/') && !mimeType.includes('gif')) {
      try {
        fileBuffer = await sharp(file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();
        mimeType = 'image/webp';
        fileExt = '.webp';
      } catch (err) {
        console.error(
          'Sharp optimization failed, falling back to original:',
          err,
        );
      }
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${fileExt}`;
    const bucketName = process.env.B2_BUCKET_NAME || 'instaimage-bucket';

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: fileBuffer,
          ContentType: mimeType,
        }),
      );

      // Construct public URL
      const endpoint =
        process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com';
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

  @Public()
  @Get('gallery')
  async getGallery() {
    try {
      // Fetch all services and banners
      const services = await this.serviceModel.find({}).lean();
      const banners = await this.bannerModel.find({}).lean();

      const imagesSet = new Set<string>();

      // Extract from services
      for (const s of services) {
        if (s.coverImage) imagesSet.add(s.coverImage);
        if (s.images && Array.isArray(s.images)) {
          s.images.forEach((img) => imagesSet.add(img));
        }
      }

      // Extract from banners
      for (const b of banners) {
        if (b.backgroundImage) imagesSet.add(b.backgroundImage);
      }

      const images = Array.from(imagesSet).filter(Boolean);

      return { success: true, data: images };
    } catch (e) {
      console.error('Failed to list gallery from DB:', e);
      return { success: false, data: [] };
    }
  }

  @Roles(Role.ADMIN)
  @Delete('gallery')
  async deleteFromGallery(@Body('url') url: string) {
    if (!url) throw new BadRequestException('URL is required');
    try {
      // 1. Delete from B2
      const bucketName = process.env.B2_BUCKET_NAME || 'instaimage-bucket';
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];

      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      await this.s3
        .send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: filename,
          }),
        )
        .catch((e) => console.error('B2 delete error (might not exist):', e));

      // 2. Remove from Services
      await this.serviceModel.updateMany(
        { coverImage: url },
        { $unset: { coverImage: '' } },
      );
      await this.serviceModel.updateMany(
        { images: url },
        { $pull: { images: url } },
      );

      // 3. Remove from Banners
      await this.bannerModel.updateMany(
        { backgroundImage: url },
        { $unset: { backgroundImage: '' } },
      );

      return {
        success: true,
        message: 'Image deleted from storage and all listings',
      };
    } catch (e) {
      console.error('Failed to delete image:', e);
      throw new BadRequestException('Failed to delete image');
    }
  }

  @Public()
  @Get('fix-old-images')
  async fixOldImages() {
    console.log('Starting legacy image compression job...');
    const services = await this.serviceModel.find({});
    let count = 0;
    const bucketName = process.env.B2_BUCKET_NAME || 'instaimage-bucket';
    const endpoint =
      process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com';

    for (const service of services) {
      let changed = false;

      // 1. Process coverImage
      if (service.coverImage && !service.coverImage.endsWith('.webp')) {
        console.log(`Processing cover image: ${service.coverImage}`);
        try {
          let fetchUrl = service.coverImage;
          if (fetchUrl.startsWith('/')) {
            fetchUrl = `https://api.instaimage.in${fetchUrl}`;
          }
          const response = await fetch(fetchUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const optimizedBuffer = await sharp(buffer)
              .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 80, effort: 4 })
              .toBuffer();

            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = `cover-${uniqueSuffix}.webp`;

            await this.s3.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: filename,
                Body: optimizedBuffer,
                ContentType: 'image/webp',
              }),
            );

            service.coverImage = `${endpoint}/${bucketName}/${filename}`;
            changed = true;
            count++;
          }
        } catch (e) {
          console.error(
            `Error processing cover image ${service.coverImage}:`,
            e,
          );
        }
      }

      // 2. Process images array
      if (service.images && service.images.length > 0) {
        const newImages = [];

        for (const imgUrl of service.images) {
          // Check if it's already a webp
          if (imgUrl.endsWith('.webp')) {
            newImages.push(imgUrl);
            continue;
          }

          console.log(`Processing image: ${imgUrl}`);
          try {
            // Handle relative URLs
            let fetchUrl = imgUrl;
            if (imgUrl.startsWith('/')) {
              fetchUrl = `https://api.instaimage.in${imgUrl}`;
            }

            // Fetch the image
            const response = await fetch(fetchUrl);
            if (!response.ok) {
              console.error(`Failed to fetch ${fetchUrl}`);
              newImages.push(imgUrl);
              continue;
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Compress
            const optimizedBuffer = await sharp(buffer)
              .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 80, effort: 4 })
              .toBuffer();

            // Upload to B2
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = `${uniqueSuffix}.webp`;

            await this.s3.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: filename,
                Body: optimizedBuffer,
                ContentType: 'image/webp',
              }),
            );

            const fileUrl = `${endpoint}/${bucketName}/${filename}`;
            newImages.push(fileUrl);
            changed = true;
            count++;
            console.log(`Successfully converted to ${fileUrl}`);
          } catch (e) {
            console.error(`Error processing ${imgUrl}:`, e);
            newImages.push(imgUrl);
          }
        }
        service.images = newImages;
      }

      if (changed) {
        await (service as any).save();
      }
    }

    // Also fix Banner backgrounds if needed
    const banners = await this.bannerModel.find({});
    for (const banner of banners) {
      const bg = banner.backgroundImage;
      if (bg && typeof bg === 'string' && !bg.endsWith('.webp')) {
        console.log(`Processing banner image: ${bg}`);
        try {
          let fetchUrl = bg;
          if (fetchUrl.startsWith('/')) {
            fetchUrl = `https://api.instaimage.in${fetchUrl}`;
          }
          const response = await fetch(fetchUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const optimizedBuffer = await sharp(buffer)
              .resize(2000, 1000, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 80, effort: 4 })
              .toBuffer();

            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = `banner-${uniqueSuffix}.webp`;

            await this.s3.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: filename,
                Body: optimizedBuffer,
                ContentType: 'image/webp',
              }),
            );

            banner.backgroundImage = `${endpoint}/${bucketName}/${filename}`;
            await (banner as any).save();
            count++;
          }
        } catch (e) {
          console.error(`Error processing banner ${banner._id}:`, e);
        }
      }
    }

    return {
      success: true,
      message: `Compressed and updated ${count} total images`,
    };
  }
}
