import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RequestUser } from '../common/guards/auth.guard';
import { UserRole } from '@findwaka/shared';
import { DriverDocument } from '../entities/driver-document.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(RoleGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('drivers/pending-docs')
  @ApiOperation({ summary: 'Get pending driver documents' })
  @ApiResponse({ type: [DriverDocument] })
  async getPendingDocuments(): Promise<DriverDocument[]> {
    return this.adminService.getPendingDocuments();
  }

  @Patch('documents/:id/approve')
  @ApiOperation({ summary: 'Approve driver document' })
  @ApiResponse({ type: DriverDocument })
  async approveDocument(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<DriverDocument> {
    return this.adminService.approveDocument(id, user);
  }

  @Patch('documents/:id/reject')
  @ApiOperation({ summary: 'Reject driver document' })
  @ApiResponse({ type: DriverDocument })
  async rejectDocument(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<DriverDocument> {
    return this.adminService.rejectDocument(id, user);
  }
}

