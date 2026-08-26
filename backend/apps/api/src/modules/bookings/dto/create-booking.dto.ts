import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsMongoId,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class LocationDetailsDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsNotEmpty()
  @IsString()
  pincode: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  coordinates?: number[];
}

export class CreateBookingDto {
  @IsNotEmpty()
  @IsMongoId()
  serviceId: string;

  @IsNotEmpty()
  @IsString()
  pricingMode: 'fixed' | 'flexible';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonNames?: string[];

  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  location: LocationDetailsDto;

  @IsOptional()
  @IsMongoId()
  appliedCouponId?: string;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsString() // 'STRICT' or 'FLEXIBLE'
  timeFlexibility?: 'STRICT' | 'FLEXIBLE';

  @IsOptional()
  @IsNumber()
  extraHoursBooked?: number;

  @IsOptional()
  @IsBoolean()
  isExpressDelivery?: boolean;

  @IsOptional()
  @IsBoolean()
  applyWalletBalance?: boolean;
}
