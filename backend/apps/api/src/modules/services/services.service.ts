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

  // Public-facing: only return approved & active services
  async findAll() {
    return this.servicesRepository.find({ isApproved: true, isActive: true });
  }

  // Admin: return ALL services (approved + pending)
  async findAllAdmin() {
    return this.servicesRepository.find({});
  }

  // Admin: return only pending (unapproved) services
  async findPending() {
    return this.servicesRepository.find({ isApproved: false });
  }

  async findByCreator(creatorId: string) {
    return this.servicesRepository.find({ creatorId });
  }

  async findOne(idOrSlug: string) {
    if (Types.ObjectId.isValid(idOrSlug)) {
      const service = await this.servicesRepository.findOne({ _id: idOrSlug });
      if (service) return service;
    }
    return this.servicesRepository.findOne({ slug: idOrSlug });
  }

  // Admin: approve a service
  async approveService(id: string) {
    return this.servicesRepository.findOneAndUpdate(
      { _id: id },
      { isApproved: true },
    );
  }

  // Admin: reject (delete or mark inactive)
  async rejectService(id: string) {
    return this.servicesRepository.findOneAndUpdate(
      { _id: id },
      { isApproved: false, isActive: false },
    );
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const data: any = { ...updateServiceDto };
    if (data.categoryId) data.categoryId = new Types.ObjectId(data.categoryId);
    return this.servicesRepository.findOneAndUpdate(
      { _id: id },
      data,
    );
  }

  async remove(id: string) {
    return this.servicesRepository.findOneAndDelete({ _id: id });
  }
}
