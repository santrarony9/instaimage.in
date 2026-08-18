import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsMongoId, IsArray } from 'class-validator';

export class CreatePackageDto {
  @IsMongoId()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  durationMinutes: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  allowExtraHours?: boolean;

  @IsNumber()
  @IsOptional()
  extraHourRate?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  videoUrl?: string;
}
