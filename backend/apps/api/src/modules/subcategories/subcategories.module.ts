import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubcategoriesService } from './subcategories.service';
import { SubcategoriesController } from './subcategories.controller';
import { Subcategory, SubcategorySchema } from './schemas/subcategory.schema';
import { SubcategoriesRepository } from './subcategories.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subcategory.name, schema: SubcategorySchema },
    ]),
  ],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService, SubcategoriesRepository],
  exports: [SubcategoriesService, SubcategoriesRepository],
})
export class SubcategoriesModule {}
