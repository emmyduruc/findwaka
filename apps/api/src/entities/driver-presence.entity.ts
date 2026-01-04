import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DriverProfile } from './driver-profile.entity';

@Entity('driver_presence')
@Index(['driver_profile_id'], { unique: true })
@Index(['is_online'])
@Index(['last_seen_at'])
export class DriverPresence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_profile_id', unique: true })
  driverProfileId: string;

  @OneToOne(() => DriverProfile, (profile) => profile.presence)
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile: DriverProfile;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'last_seen_at', type: 'timestamp' })
  lastSeenAt: Date;

  @Column({ name: 'last_lat', type: 'double precision', nullable: true })
  lastLat: number;

  @Column({ name: 'last_lng', type: 'double precision', nullable: true })
  lastLng: number;

  @Column({ name: 'last_accuracy_m', type: 'double precision', nullable: true })
  lastAccuracyM: number;

  @Column({ name: 'last_heading', type: 'double precision', nullable: true })
  lastHeading: number;

  @Column({ name: 'last_speed_mps', type: 'double precision', nullable: true })
  lastSpeedMps: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

