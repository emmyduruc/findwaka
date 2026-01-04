import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DocumentType, DocumentStatus } from '@waka/shared';
import { DriverProfile } from './driver-profile.entity';
import { User } from './user.entity';

@Entity('driver_documents')
export class DriverDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_profile_id', type: 'uuid' })
  driverProfileId: string;

  @ManyToOne(() => DriverProfile, (profile) => profile.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile: DriverProfile;

  @Column({
    name: 'doc_type',
    type: 'enum',
    enum: DocumentType,
  })
  docType: DocumentType;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ name: 'reviewed_by_user_id', type: 'uuid', nullable: true })
  reviewedByUserId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

