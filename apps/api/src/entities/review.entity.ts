import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DriverProfile } from './driver-profile.entity';
import { User } from './user.entity';

@Entity('reviews')
@Index(['driverProfileId', 'createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_profile_id', type: 'uuid' })
  driverProfileId: string;

  @ManyToOne(() => DriverProfile, (profile) => profile.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile: DriverProfile;

  @Column({ name: 'passenger_user_id', type: 'uuid' })
  passengerUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'passenger_user_id' })
  passengerUser: User;

  @Column({ name: 'rating', type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

