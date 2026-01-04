import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { UserRole } from '@waka/shared';
import { PassengerProfile } from './passenger-profile.entity';
import { DriverProfile } from './driver-profile.entity';

@Entity('users')
@Index(['firebaseUid'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'firebase_uid', type: 'varchar', unique: true })
  firebaseUid: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ name: 'display_name', type: 'varchar' })
  displayName: string;

  @Column({ name: 'photo_url', type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ name: 'push_notification_token', type: 'varchar', nullable: true })
  pushNotificationToken: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => PassengerProfile, (profile) => profile.user, { cascade: true })
  passengerProfile?: PassengerProfile;

  @OneToOne(() => DriverProfile, (profile) => profile.user, { cascade: true })
  driverProfile?: DriverProfile;
}

