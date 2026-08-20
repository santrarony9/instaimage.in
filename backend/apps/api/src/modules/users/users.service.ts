import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(user: Partial<User>): Promise<User> {
    return this.usersRepository.create(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.usersRepository.find({ email });
    return users.length > 0 ? users[0] : null;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findAll(search?: string) {
    const filter: any = { isDeleted: false };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    return this.usersRepository.model
      .find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateRole(id: string, role: string) {
    if (!['ADMIN', 'CUSTOMER', 'PHOTOGRAPHER'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersRepository.findOneAndUpdate({ _id: id }, { role });
  }
}
