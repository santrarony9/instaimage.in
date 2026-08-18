import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        // Generate a unique filename using timestamp and a random string
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Only allow image and video files
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm)$/)) {
        return cb(new BadRequestException('Only image and video files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid file type');
    }
    // Return the public URL path
    return {
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
