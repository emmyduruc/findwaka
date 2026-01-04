import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('conversations')
@Index(['participant1Id', 'participant2Id'])
@Index(['participant1Id'])
@Index(['participant2Id'])
@Index(['updatedAt'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'participant1_id', type: 'uuid' })
  participant1Id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant1_id' })
  participant1: User;

  @Column({ name: 'participant2_id', type: 'uuid' })
  participant2Id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant2_id' })
  participant2: User;

  @Column({ name: 'last_message_id', type: 'uuid', nullable: true })
  lastMessageId: string | null;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Message', 'conversation', { cascade: true })
  messages: any[];
}
