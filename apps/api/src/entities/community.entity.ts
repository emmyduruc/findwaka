import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('communities')
@Index(['state', 'lga', 'name'], { unique: true })
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  state: string;

  @Column()
  lga: string;

  @Column()
  name: string;

  @Column({ name: 'center_lat', type: 'double precision', nullable: true })
  centerLat: number;

  @Column({ name: 'center_lng', type: 'double precision', nullable: true })
  centerLng: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

