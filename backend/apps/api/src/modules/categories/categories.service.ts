import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async findAll(query?: any) {
    const filter: any = { isActive: true };
    if (query?.isTrending === 'true') {
      filter.isTrending = true;
    }
    return this.categoryModel.find(filter).sort({ sortOrder: 1 }).exec();
  }

  async findAllAdmin() {
    return this.categoryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel
      .findOne({ slug, isActive: true })
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(createCategoryDto: any) {
    const created = new this.categoryModel(createCategoryDto);
    return created.save();
  }

  async update(id: string, updateCategoryDto: any) {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Category not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Category not found');
    return deleted;
  }
}
