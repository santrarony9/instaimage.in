import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
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

  @Post()
  @Roles(Role.CUSTOMER)
  create(@Request() req: AuthenticatedRequest, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.sub, createBookingDto);
  }

  @Get('my-bookings')
  @Roles(Role.CUSTOMER)
  findMyBookings(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.getUserBookings(req.user.sub);
  }

  @Get('my-assignments')
  @Roles(Role.PHOTOGRAPHER)
  getPhotographerAssignments(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.getPhotographerAssignments(req.user.sub);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  findAllBookings() {
    return this.bookingsService.findAllBookings();
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.PHOTOGRAPHER)
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
  assignPhotographer(@Param('id') id: string, @Body('photographerId') photographerId: string) {
    return this.bookingsService.assignPhotographer(id, photographerId);
  }

  @Post(':id/surcharge')
  @Roles(Role.ADMIN)
  addSurcharge(
    @Param('id') id: string, 
    @Body() surcharge: { name: string; amount: number; reason?: string }
  ) {
    return this.bookingsService.addSurcharge(id, surcharge);
  }
}
