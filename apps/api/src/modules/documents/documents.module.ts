import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { RolesGuard } from '../../guards/roles.guard';
import { DriverDocument } from '../../entities/driver-document.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverDocument, DriverProfile, User])],
  controllers: [DocumentsController],
  providers: [DocumentsService, RolesGuard],
  exports: [DocumentsService],
})
export class DocumentsModule {}

