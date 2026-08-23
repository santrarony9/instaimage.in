import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateSellerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsNotEmpty()
  bankDetails: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sellerType?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  commissionRate?: number;
}
