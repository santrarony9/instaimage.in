import { Injectable, NotFoundException } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getSetting(key: string) {
    const setting = await this.settingsRepository.model.findOne({ key });
    if (!setting) {
      return null;
    }
    return setting.value;
  }

  async getAllSettings() {
    const settings = await this.settingsRepository.model.find({});
    return settings.reduce((acc: Record<string, any>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }

  async setSetting(key: string, value: any, description?: string) {
    const existing = await this.settingsRepository.model.findOne({ key });
    if (existing) {
      return this.settingsRepository.model.findOneAndUpdate(
        { key },
        { value, ...(description && { description }) },
        { new: true },
      );
    } else {
      return this.settingsRepository.model.create({ key, value, description });
    }
  }
}
