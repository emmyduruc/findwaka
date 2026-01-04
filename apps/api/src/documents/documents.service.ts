import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverDocument } from '../entities/driver-document.entity';
import { DriverProfile } from '../entities/driver-profile.entity';
import { User } from '../entities/user.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { RequestUser } from '../common/guards/auth.guard';
import { DocumentStatus } from '@findwaka/shared';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DriverDocument)
    private documentRepository: Repository<DriverDocument>,
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDriverProfile(user: RequestUser): Promise<DriverProfile> {
    const localUser = await this.userRepository.findOne({
      where: { firebaseUid: user.firebaseUid },
      relations: ['driverProfile'],
    });

    if (!localUser || !localUser.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    return localUser.driverProfile;
  }

  async create(user: RequestUser, dto: CreateDocumentDto): Promise<DriverDocument> {
    const profile = await this.getDriverProfile(user);

    const document = this.documentRepository.create({
      driverProfileId: profile.id,
      ...dto,
      status: DocumentStatus.PENDING,
    });

    return this.documentRepository.save(document);
  }

  async findAll(user: RequestUser): Promise<DriverDocument[]> {
    const profile = await this.getDriverProfile(user);

    return this.documentRepository.find({
      where: { driverProfileId: profile.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: RequestUser): Promise<DriverDocument> {
    const profile = await this.getDriverProfile(user);

    const document = await this.documentRepository.findOne({
      where: { id, driverProfileId: profile.id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(
    id: string,
    user: RequestUser,
    dto: UpdateDocumentDto,
  ): Promise<DriverDocument> {
    const document = await this.findOne(id, user);

    if (document.status !== DocumentStatus.PENDING) {
      throw new ForbiddenException('Cannot update approved or rejected document');
    }

    if (dto.fileUrl !== undefined) {
      document.fileUrl = dto.fileUrl;
    }

    return this.documentRepository.save(document);
  }

  async remove(id: string, user: RequestUser): Promise<void> {
    const document = await this.findOne(id, user);

    if (document.status !== DocumentStatus.PENDING) {
      throw new ForbiddenException('Cannot delete approved or rejected document');
    }

    await this.documentRepository.remove(document);
  }
}

