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
    return this.servicesRepository.model
      .find({ isApproved: true, isActive: true })
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

  async generateAiDescription(data: { name: string; basePrice?: number; category?: string; tags?: string; roughNotes?: string }) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in the backend environment.');
    }
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `
You are an expert SEO copywriter and marketer for a professional photography and videography platform called InstaImage.
Write a highly professional, engaging, and SEO-friendly description for the following service:

Service Name: ${data.name}
Category: ${data.category || 'N/A'}
Base Price: ₹${data.basePrice || 'N/A'}
Tags: ${data.tags || 'N/A'}
Rough Notes / Current Description: ${data.roughNotes || 'None provided'}

Instructions:
1. Write 2-3 short, engaging paragraphs.
2. Focus on the value proposition, the experience, and why the customer should book this.
3. Incorporate the tags naturally for SEO.
4. If rough notes are provided, flesh them out into professional sentences.
5. Do NOT include formatting like "Paragraph 1:", just write the text directly. Do not include markdown headers.
6. Keep it punchy and conversion-focused.
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
