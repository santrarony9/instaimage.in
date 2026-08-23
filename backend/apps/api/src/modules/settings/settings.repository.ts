import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '@app/database';
import { Setting } from './schemas/setting.schema';

@Injectable()
export class SettingsRepository extends AbstractRepository<Setting> {
  protected readonly logger = new Logger(SettingsRepository.name);

  constructor(@InjectModel(Setting.name) settingModel: Model<Setting>) {
    super(settingModel);
  }
}
