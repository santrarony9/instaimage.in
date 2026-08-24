import { Controller, Post, Body, Req, UseGuards, Get, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles, Role, Public } from '@app/auth';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    return this.reviewsService.create(createReviewDto, req.user.sub);
  }

  @Public()
  @Get('service/:serviceId')
  getReviewsForService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.getReviewsForService(serviceId);
  }

  @Public()
  @Get('seller/:sellerId')
  getReviewsForSeller(@Param('sellerId') sellerId: string) {
    return this.reviewsService.getReviewsForSeller(sellerId);
  }
}
