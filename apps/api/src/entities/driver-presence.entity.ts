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
@Index(['driverProfileId'], { unique: true })
@Index(['isOnline'])
@Index(['lastSeenAt'])
export class DriverPresence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_profile_id', type: 'uuid', unique: true })
  driverProfileId: string;

  @OneToOne(() => DriverProfile, (profile) => profile.presence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile: DriverProfile;

  @Column({ name: 'is_online', type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ name: 'last_seen_at', type: 'timestamp' })
  lastSeenAt: Date;

  @Column({ name: 'last_lat', type: 'double precision', nullable: true })
  lastLat: number | null;

  @Column({ name: 'last_lng', type: 'double precision', nullable: true })
  lastLng: number | null;

  @Column({ name: 'last_accuracy_m', type: 'double precision', nullable: true })
  lastAccuracyM: number | null;

  @Column({ name: 'last_heading', type: 'double precision', nullable: true })
  lastHeading: number | null;

  @Column({ name: 'last_speed_mps', type: 'double precision', nullable: true })
  lastSpeedMps: number | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

