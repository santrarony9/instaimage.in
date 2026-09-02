import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './schemas/lead.schema';
import { CreateLeadDto, UpdateLeadStatusDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(@InjectModel(Lead.name) private leadModel: Model<Lead>) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const createdLead = new this.leadModel(createLeadDto);
    return createdLead.save();
  }

  async findAll(): Promise<Lead[]> {
    return this.leadModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, updateLeadStatusDto: UpdateLeadStatusDto): Promise<Lead> {
    const updated = await this.leadModel.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: updateLeadStatusDto.status,
          ...(updateLeadStatusDto.adminNotes && { adminNotes: updateLeadStatusDto.adminNotes })
        }
      },
      { new: true }
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Lead #${id} not found`);
    }
    return updated;
  }
}
