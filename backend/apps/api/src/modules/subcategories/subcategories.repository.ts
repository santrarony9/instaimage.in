import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '@app/database';
import { Subcategory } from './schemas/subcategory.schema';

@Injectable()
export class SubcategoriesRepository extends AbstractRepository<Subcategory> {
  protected readonly logger = new Logger(SubcategoriesRepository.name);

  constructor(
    @InjectModel(Subcategory.name) subcategoryModel: Model<Subcategory>,
  ) {
    super(subcategoryModel);
  }
}
