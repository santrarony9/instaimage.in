import { IsString, IsNotEmpty, IsArray, IsNumber, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class WishlistItemDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsNumber()
  basePrice: number;
}

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WishlistItemDto)
  wishlist: WishlistItemDto[];

  @IsNumber()
  totalEstimatedPrice: number;
}

export class UpdateLeadStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  adminNotes?: string;
}
