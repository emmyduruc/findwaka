import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverDocument } from '../../entities/driver-document.entity';
import { User } from '../../entities/user.entity';
import { UserRole, DocumentStatus } from '@waka/shared';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { DocumentActionResponseDto } from './dto/document-action.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(DriverDocument)
    private driverDocumentRepository: Repository<DriverDocument>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getPendingDocuments(firebaseUser: FirebaseUser): Promise<DriverDocument[]> {
    await this.ensureAdmin(firebaseUser);

    return this.driverDocumentRepository.find({
      where: { status: DocumentStatus.PENDING },
      relations: ['driverProfile', 'driverProfile.user'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveDocument(
    firebaseUser: FirebaseUser,
    documentId: string,
  ): Promise<DocumentActionResponseDto> {
    await this.ensureAdmin(firebaseUser);

    const document = await this.driverDocumentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = DocumentStatus.APPROVED;
    document.reviewedByUserId = firebaseUser.localUserId!;
    document.reviewedAt = new Date();

    const saved = await this.driverDocumentRepository.save(document);

    return {
      id: saved.id,
      status: saved.status,
      reviewedByUserId: saved.reviewedByUserId!,
      reviewedAt: saved.reviewedAt!,
    };
  }

  async rejectDocument(
    firebaseUser: FirebaseUser,
    documentId: string,
  ): Promise<DocumentActionResponseDto> {
    await this.ensureAdmin(firebaseUser);

    const document = await this.driverDocumentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = DocumentStatus.REJECTED;
    document.reviewedByUserId = firebaseUser.localUserId!;
    document.reviewedAt = new Date();

    const saved = await this.driverDocumentRepository.save(document);

    return {
      id: saved.id,
      status: saved.status,
      reviewedByUserId: saved.reviewedByUserId!,
      reviewedAt: saved.reviewedAt!,
    };
  }

  private async ensureAdmin(firebaseUser: FirebaseUser): Promise<void> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }
}

