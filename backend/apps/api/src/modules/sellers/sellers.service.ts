import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seller } from './schemas/seller.schema';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectModel(Seller.name) private readonly SellerModel: Model<Seller>,
  ) {}

  async create(createSellerDto: CreateSellerDto): Promise<Seller> {
    const createdSeller = new this.SellerModel(createSellerDto);
    return createdSeller.save();
  }

  async findAll(): Promise<Seller[]> {
    return this.SellerModel.find().exec();
  }

  async findOne(id: string): Promise<Seller> {
    const Seller = await this.SellerModel.findById(id).exec();
    if (!Seller) {
      throw new NotFoundException(`Seller with ID ${id} not found`);
    }
    return Seller;
  }

  async findByUserId(userId: string): Promise<Seller | null> {
    return this.SellerModel.findOne({ userId }).exec();
  }

  async update(id: string, updateSellerDto: UpdateSellerDto): Promise<Seller> {
    const existingSeller = await this.SellerModel.findByIdAndUpdate(
      id,
      updateSellerDto,
      { new: true },
    ).exec();
    if (!existingSeller) {
      throw new NotFoundException(`Seller with ID ${id} not found`);
    }
    return existingSeller;
  }

  async remove(id: string): Promise<Seller> {
    const deletedSeller = await this.SellerModel.findByIdAndDelete(id).exec();
    if (!deletedSeller) {
      throw new NotFoundException(`Seller with ID ${id} not found`);
    }
    return deletedSeller;
  }
}
