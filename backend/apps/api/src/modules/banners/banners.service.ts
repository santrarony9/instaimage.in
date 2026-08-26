import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner } from './schemas/banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private readonly bannerModel: Model<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const createdBanner = new this.bannerModel(createBannerDto);
    return createdBanner.save();
  }

  async findAll(activeOnly: boolean = false): Promise<Banner[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.bannerModel
      .find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate('services')
      .exec();
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerModel
      .findById(id)
      .populate('services')
      .exec();
    if (!banner) {
      throw new NotFoundException(`Banner #${id} not found`);
    }
    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const existingBanner = await this.bannerModel
      .findByIdAndUpdate(id, updateBannerDto, { new: true })
      .exec();

    if (!existingBanner) {
      throw new NotFoundException(`Banner #${id} not found`);
    }
    return existingBanner;
  }

  async remove(id: string): Promise<Banner> {
    const deletedBanner = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!deletedBanner) {
      throw new NotFoundException(`Banner #${id} not found`);
    }
    return deletedBanner;
  }
}
