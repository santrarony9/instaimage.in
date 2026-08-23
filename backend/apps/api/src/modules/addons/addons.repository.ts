import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '@app/database';
import { Addon } from './schemas/addon.schema';

@Injectable()
export class AddonsRepository extends AbstractRepository<Addon> {
  protected readonly logger = new Logger(AddonsRepository.name);

  constructor(@InjectModel(Addon.name) addonModel: Model<Addon>) {
    super(addonModel);
  }
}
