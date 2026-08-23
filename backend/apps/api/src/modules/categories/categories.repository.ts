import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '@app/database';
import { Category } from './schemas/category.schema';
import { Injectable as InjectableDec } from '@nestjs/common';

@InjectableDec()
export class CategoriesRepository extends AbstractRepository<Category> {
  protected readonly logger = new Logger(CategoriesRepository.name);

  constructor(@InjectModel(Category.name) categoryModel: Model<Category>) {
    super(categoryModel);
  }
}
