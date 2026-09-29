import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Types } from 'mongoose';
import { Role } from '@app/auth';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ServicesService {
  constructor(
    private readonly servicesRepository: ServicesRepository,
    private readonly settingsService: SettingsService,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    const data: any = { ...createServiceDto };
    
    // Auto-generate professional SKU like SRV-A5F9B2
    if (!data.sku) {
      const crypto = require('crypto');
      const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
      data.sku = `SRV-${randomStr}`;
    }
    
    if (data.creatorId) data.creatorId = new Types.ObjectId(data.creatorId);
    if (data.categoryId) data.categoryId = new Types.ObjectId(data.categoryId);
    return this.servicesRepository.create(data);
  }

  async findAll() {
    return this.servicesRepository.model
      .find({ isApproved: { $ne: false }, isActive: true })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
  }

  // Admin: return ALL services (approved + pending)
  async findAllAdmin() {
    return this.servicesRepository.model.find({}).lean();
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

  async update(id: string, updateServiceDto: UpdateServiceDto, userId: string, role: string) {
    const service = await this.servicesRepository.findOne({ _id: id });
    if (!service) throw new NotFoundException('Service not found');

    if (role !== Role.ADMIN) {
      if (!service.creatorId || service.creatorId.toString() !== userId) {
        throw new ForbiddenException('You are not authorized to update this service');
      }
    }

    const data: any = { ...updateServiceDto };
    if (data.categoryId) data.categoryId = new Types.ObjectId(data.categoryId);
    return this.servicesRepository.findOneAndUpdate({ _id: id }, data);
  }

  async remove(id: string, userId: string, role: string) {
    const service = await this.servicesRepository.findOne({ _id: id });
    if (!service) throw new NotFoundException('Service not found');

    if (role !== Role.ADMIN) {
      if (!service.creatorId || service.creatorId.toString() !== userId) {
        throw new ForbiddenException('You are not authorized to delete this service');
      }
    }

    return this.servicesRepository.findOneAndDelete({ _id: id });
  }

  async generateAiDescription(data: {
    name: string;
    basePrice?: number;
    category?: string;
    tags?: string;
    roughNotes?: string;
  }) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY is not configured in the backend environment.',
      );
    }
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let customInstructions = await this.settingsService.getSetting('aiPrompt');
    if (!customInstructions) {
      customInstructions = `You are an expert SEO copywriter and marketer for a professional photography and videography platform called InstaImage.
Write a highly professional, engaging, and SEO-friendly description.
Focus on the value proposition, the experience, and why the customer should book this.
Incorporate any provided tags naturally for SEO.
If rough notes are provided, flesh them out into professional sentences.
Do NOT include formatting like "Paragraph 1:". Keep it punchy and conversion-focused.
CRITICAL: Output the response as a bulleted list of the main features/benefits, as customers prefer easily scannable bullet points over long paragraphs.`;
    }

    const prompt = `
${customInstructions}

--- DATA TO USE ---
Service Name: ${data.name}
Category: ${data.category || 'N/A'}
Base Price: ₹${data.basePrice || 'N/A'}
Tags: ${data.tags || 'N/A'}
Rough Notes / Current Description: ${data.roughNotes || 'None provided'}
`;

    try {
      const result = await model.generateContent(prompt);
      return { description: result.response.text().trim() };
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error('Failed to generate AI description');
    }
  }
}
