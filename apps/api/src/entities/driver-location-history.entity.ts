import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DriverProfile } from './driver-profile.entity';

@Entity('driver_location_history')
@Index(['driverProfileId', 'recordedAt'])
export class DriverLocationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_profile_id', type: 'uuid' })
  driverProfileId: string;

  @ManyToOne(() => DriverProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile: DriverProfile;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lng: number;

  @Column({ name: 'accuracy_m', type: 'double precision', nullable: true })
  accuracyM: number | null;

  @Column({ type: 'double precision', nullable: true })
  heading: number | null;

  @Column({ name: 'speed_mps', type: 'double precision', nullable: true })
  speedMps: number | null;

  @Column({ name: 'recorded_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;
}

