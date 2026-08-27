import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request as ExpressRequest } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard, RolesGuard, Roles, Role, Public } from '@app/auth';
import { BookingStatus } from './schemas/booking.schema';

interface AuthenticatedRequest extends ExpressRequest {
  user: { sub: string; role: string; email: string };
}

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('calculate-price')
  @Public()
  calculatePrice(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.calculateFullPrice(createBookingDto);
  }

  @Post()
  @Roles(Role.CUSTOMER)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(req.user.sub, createBookingDto);
  }

  @Get('my-bookings')
  @Roles(Role.CUSTOMER)
  findMyBookings(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.getUserBookings(req.user.sub);
  }

  @Get('my-assignments')
  @Roles(Role.SELLER)
  getsellerAssignments(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.getsellerAssignments(req.user.sub);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  findAllBookings() {
    return this.bookingsService.findAllBookings();
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.SELLER)
  findOne(@Param('id') id: string) {
    return this.bookingsService.getBookingById(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
    return this.bookingsService.updateBookingStatus(id, status);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  assignseller(@Param('id') id: string, @Body('sellerId') sellerId: string) {
    return this.bookingsService.assignseller(id, sellerId);
  }

  @Patch(':id/payout')
  @Roles(Role.ADMIN)
  markPayoutPaid(@Param('id') id: string) {
    return this.bookingsService.markPayoutPaid(id);
  }

  @Patch(':id/seller-status')
  @Roles(Role.SELLER)
  updatesellerStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
  ) {
    return this.bookingsService.updatesellerStatus(id, req.user.sub, status);
  }

  @Patch(':id/delivery-link')
  @Roles(Role.SELLER, Role.ADMIN)
  updateDeliveryLink(
    @Param('id') id: string,
    @Body('deliveryLink') deliveryLink: string,
  ) {
    return this.bookingsService.updateDeliveryLink(id, deliveryLink);
  }

  @Post(':id/surcharge')
  @Roles(Role.ADMIN)
  addSurcharge(
    @Param('id') id: string,
    @Body() surcharge: { name: string; amount: number; reason?: string },
  ) {
    return this.bookingsService.addSurcharge(id, surcharge);
  }

  @Post(':id/gallery')
  @Roles(Role.SELLER, Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|zip|pdf|rar)$/)) {
          return cb(new BadRequestException('Invalid file type!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  async uploadToGallery(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.bookingsService.uploadToGallery(id, req.user.sub, file);
  }

  @Delete(':id/gallery/:imageId')
  @Roles(Role.SELLER, Role.ADMIN)
  async deleteFromGallery(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.bookingsService.deleteFromGallery(id, req.user.sub, imageId);
  }
}
