import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole, VehicleType } from '@waka/shared';
import { User } from './user.entity';
import { DriverDocument } from './driver-document.entity';
import { DriverPresence } from './driver-presence.entity';
import { Review } from './review.entity';

@Entity('driver_profiles')
@Index(['userId'], { unique: true })
@Index(['licensePlate'], { unique: true, where: '"license_plate" IS NOT NULL' })
export class DriverProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'vehicle_type',
    type: 'enum',
    enum: VehicleType,
  })
  vehicleType: VehicleType;

  @Column({ name: 'vehicle_brand', type: 'varchar', nullable: true })
  vehicleBrand: string | null;

  @Column({ name: 'vehicle_color', type: 'varchar', nullable: true })
  vehicleColor: string | null;

  @Column({ name: 'license_plate', type: 'varchar', nullable: true, unique: true })
  licensePlate: string | null;

  @Column({ name: 'community_home', type: 'varchar' })
  communityHome: string;

  @Column({ nullable: true, type: 'text' })
  bio: string | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({
    name: 'average_rating',
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 0,
  })
  averageRating: number;

  @Column({ name: 'rating_count', type: 'int', default: 0 })
  ratingCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DriverDocument, (doc) => doc.driverProfile, { cascade: true })
  documents: DriverDocument[];

  @OneToOne(() => DriverPresence, (presence) => presence.driverProfile, { cascade: true })
  presence?: DriverPresence;

  @OneToMany(() => Review, (review) => review.driverProfile)
  reviews: Review[];
}

