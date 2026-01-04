import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverDocument } from '../../entities/driver-document.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { User } from '../../entities/user.entity';
import { UserRole, DocumentStatus } from '@waka/shared';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DriverDocument)
    private driverDocumentRepository: Repository<DriverDocument>,
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(firebaseUser: FirebaseUser, dto: CreateDocumentDto): Promise<DocumentResponseDto> {
    const driverProfile = await this.getDriverProfile(firebaseUser);

    const document = this.driverDocumentRepository.create({
      driverProfileId: driverProfile.id,
      docType: dto.docType,
      fileUrl: dto.fileUrl,
      status: DocumentStatus.PENDING,
    });

    const saved = await this.driverDocumentRepository.save(document);

    return {
      id: saved.id,
      driverProfileId: saved.driverProfileId,
      docType: saved.docType,
      fileUrl: saved.fileUrl,
      status: saved.status,
      reviewedByUserId: saved.reviewedByUserId,
      reviewedAt: saved.reviewedAt,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async findAll(firebaseUser: FirebaseUser): Promise<DocumentResponseDto[]> {
    const driverProfile = await this.getDriverProfile(firebaseUser);

    const documents = await this.driverDocumentRepository.find({
      where: { driverProfileId: driverProfile.id },
      order: { createdAt: 'DESC' },
    });

    return documents.map((doc) => ({
      id: doc.id,
      driverProfileId: doc.driverProfileId,
      docType: doc.docType,
      fileUrl: doc.fileUrl,
      status: doc.status,
      reviewedByUserId: doc.reviewedByUserId,
      reviewedAt: doc.reviewedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async update(
    firebaseUser: FirebaseUser,
    id: string,
    dto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const driverProfile = await this.getDriverProfile(firebaseUser);

    const document = await this.driverDocumentRepository.findOne({
      where: { id, driverProfileId: driverProfile.id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.status !== DocumentStatus.PENDING) {
      throw new BadRequestException('Can only update pending documents');
    }

    if (dto.fileUrl !== undefined) {
      document.fileUrl = dto.fileUrl;
    }

    const saved = await this.driverDocumentRepository.save(document);

    return {
      id: saved.id,
      driverProfileId: saved.driverProfileId,
      docType: saved.docType,
      fileUrl: saved.fileUrl,
      status: saved.status,
      reviewedByUserId: saved.reviewedByUserId,
      reviewedAt: saved.reviewedAt,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  private async getDriverProfile(firebaseUser: FirebaseUser): Promise<DriverProfile> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
      relations: ['driverProfile'],
    });

    if (!user || user.role !== UserRole.DRIVER) {
      throw new ForbiddenException('User is not a driver');
    }

    if (!user.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    return user.driverProfile;
  }
}

