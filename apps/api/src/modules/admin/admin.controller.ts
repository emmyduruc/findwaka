import { Controller, Get, Patch, Param, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../guards/roles.guard';
import { UserRole } from '@waka/shared';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { DocumentActionResponseDto } from './dto/document-action.dto';
import { DriverDocument } from '../../entities/driver-document.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(@Inject(AdminService) private readonly adminService: AdminService) {}

  @Get('drivers/pending-docs')
  @ApiOperation({ summary: 'Get pending driver documents' })
  @ApiResponse({ status: 200, type: [DriverDocument] })
  async getPendingDocuments(@CurrentUser() firebaseUser: FirebaseUser): Promise<DriverDocument[]> {
    return this.adminService.getPendingDocuments(firebaseUser);
  }

  @Patch('documents/:id/approve')
  @ApiOperation({ summary: 'Approve document' })
  @ApiResponse({ status: 200, type: DocumentActionResponseDto })
  async approveDocument(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id') id: string,
  ): Promise<DocumentActionResponseDto> {
    return this.adminService.approveDocument(firebaseUser, id);
  }

  @Patch('documents/:id/reject')
  @ApiOperation({ summary: 'Reject document' })
  @ApiResponse({ status: 200, type: DocumentActionResponseDto })
  async rejectDocument(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id') id: string,
  ): Promise<DocumentActionResponseDto> {
    return this.adminService.rejectDocument(firebaseUser, id);
  }
}

