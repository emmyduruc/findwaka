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
@Index(['driver_profile_id', 'recorded_at'])
export class DriverLocationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_profile_id' })
  driverProfileId: string;

  @ManyToOne(() => DriverProfile)
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile: DriverProfile;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lng: number;

  @Column({ name: 'accuracy_m', type: 'double precision', nullable: true })
  accuracyM: number;

  @Column({ type: 'double precision', nullable: true })
  heading: number;

  @Column({ name: 'speed_mps', type: 'double precision', nullable: true })
  speedMps: number;

  @Column({ name: 'recorded_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;
}

