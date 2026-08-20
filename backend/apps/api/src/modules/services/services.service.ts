import { Injectable } from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

import { Types } from 'mongoose';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async create(createServiceDto: CreateServiceDto) {
    const data: any = { ...createServiceDto };
    if (data.creatorId) data.creatorId = new Types.ObjectId(data.creatorId);
    if (data.categoryId) data.categoryId = new Types.ObjectId(data.categoryId);
    return this.servicesRepository.create(data);
  }

  async findAll() {
    return this.servicesRepository.find({});
  }

  async findByCreator(creatorId: string) {
    return this.servicesRepository.find({ creatorId });
  }

  async findOne(id: string) {
    return this.servicesRepository.findOne({ _id: id });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    return this.servicesRepository.findOneAndUpdate(
      { _id: id },
      updateServiceDto,
    );
  }

  async remove(id: string) {
    return this.servicesRepository.findOneAndDelete({ _id: id });
  }
}
