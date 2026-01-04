import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DriverDocument } from '../entities/driver-document.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverDocument, User])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

