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
@Index(['driver_profile_id', 'created_at'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_profile_id' })
  driverProfileId: string;

  @ManyToOne(() => DriverProfile, (profile) => profile.reviews)
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile: DriverProfile;

  @Column({ name: 'passenger_user_id' })
  passengerUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'passenger_user_id' })
  passenger: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

