import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  @IsNotEmpty()
  bookingId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  reviewText?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tipAmount?: number;
}
