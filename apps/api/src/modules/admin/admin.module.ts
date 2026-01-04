import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RolesGuard } from '../../guards/roles.guard';
import { DriverDocument } from '../../entities/driver-document.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverDocument, User])],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
  exports: [AdminService],
})
export class AdminModule {}

