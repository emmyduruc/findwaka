import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverDocument } from '../entities/driver-document.entity';
import { User } from '../entities/user.entity';
import { DocumentStatus } from '@findwaka/shared';
import { RequestUser } from '../common/guards/auth.guard';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(DriverDocument)
    private documentRepository: Repository<DriverDocument>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getPendingDocuments(): Promise<DriverDocument[]> {
    return this.documentRepository.find({
      where: { status: DocumentStatus.PENDING },
      relations: ['driverProfile', 'driverProfile.user'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveDocument(
    id: string,
    adminUser: RequestUser,
  ): Promise<DriverDocument> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['driverProfile'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const localAdmin = await this.userRepository.findOne({
      where: { firebaseUid: adminUser.firebaseUid },
    });

    document.status = DocumentStatus.APPROVED;
    document.reviewedByUserId = localAdmin.id;
    document.reviewedAt = new Date();

    return this.documentRepository.save(document);
  }

  async rejectDocument(
    id: string,
    adminUser: RequestUser,
  ): Promise<DriverDocument> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['driverProfile'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const localAdmin = await this.userRepository.findOne({
      where: { firebaseUid: adminUser.firebaseUid },
    });

    document.status = DocumentStatus.REJECTED;
    document.reviewedByUserId = localAdmin.id;
    document.reviewedAt = new Date();

    return this.documentRepository.save(document);
  }
}

