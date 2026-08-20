import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateServiceZoneDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  pincodes: string[];

  @IsNumber()
  @IsNotEmpty()
  deliveryCharge: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
