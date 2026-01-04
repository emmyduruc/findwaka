import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DriverProfile } from './driver-profile.entity';
import { User } from './user.entity';
import { DocumentType, DocumentStatus } from '@findwaka/shared';

@Entity('driver_documents')
export class DriverDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_profile_id' })
  driverProfileId: string;

  @ManyToOne(() => DriverProfile, (profile) => profile.documents)
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile: DriverProfile;

  @Column({
    name: 'doc_type',
    type: 'enum',
    enum: DocumentType,
  })
  docType: DocumentType;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ name: 'reviewed_by_user_id', nullable: true })
  reviewedByUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy: User;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

