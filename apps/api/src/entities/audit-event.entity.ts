import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audit_events')
@Index(['userId'])
@Index(['eventType'])
@Index(['createdAt'])
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType: string;

  @Column({ name: 'payload_json', type: 'jsonb', nullable: true })
  payloadJson: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

