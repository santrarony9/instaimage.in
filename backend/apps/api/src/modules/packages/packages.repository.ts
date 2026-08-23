import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '@app/database';
import { Package } from './schemas/package.schema';

@Injectable()
export class PackagesRepository extends AbstractRepository<Package> {
  protected readonly logger = new Logger(PackagesRepository.name);

  constructor(@InjectModel(Package.name) packageModel: Model<Package>) {
    super(packageModel);
  }
}
