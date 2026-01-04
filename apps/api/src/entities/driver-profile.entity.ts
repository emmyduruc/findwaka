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
import { User } from './user.entity';
import { VehicleType } from '@findwaka/shared';
import { DriverDocument } from './driver-document.entity';
import { DriverPresence } from './driver-presence.entity';
import { Review } from './review.entity';

@Entity('driver_profiles')
@Index(['user_id'], { unique: true })
export class DriverProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.driverProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'vehicle_type',
    type: 'enum',
    enum: VehicleType,
  })
  vehicleType: VehicleType;

  @Column({ name: 'vehicle_brand', nullable: true })
  vehicleBrand: string;

  @Column({ name: 'vehicle_color', nullable: true })
  vehicleColor: string;

  @Column({ name: 'license_plate', nullable: true, unique: true })
  licensePlate: string;

  @Column({ name: 'community_home' })
  communityHome: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({
    name: 'average_rating',
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 0,
  })
  averageRating: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DriverDocument, (doc) => doc.driverProfile)
  documents: DriverDocument[];

  @OneToOne(() => DriverPresence, (presence) => presence.driverProfile)
  presence: DriverPresence;

  @OneToMany(() => Review, (review) => review.driverProfile)
  reviews: Review[];
}

