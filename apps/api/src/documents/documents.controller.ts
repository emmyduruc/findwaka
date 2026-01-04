import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RequestUser } from '../common/guards/auth.guard';
import { UserRole } from '@findwaka/shared';
import { DriverDocument } from '../entities/driver-document.entity';

@ApiTags('Documents')
@Controller('drivers/me/documents')
@UseGuards(AuthGuard, RoleGuard)
@Roles(UserRole.DRIVER)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add driver document' })
  @ApiResponse({ type: DriverDocument })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateDocumentDto,
  ): Promise<DriverDocument> {
    return this.documentsService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all driver documents' })
  @ApiResponse({ type: [DriverDocument] })
  async findAll(@CurrentUser() user: RequestUser): Promise<DriverDocument[]> {
    return this.documentsService.findAll(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update driver document' })
  @ApiResponse({ type: DriverDocument })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateDocumentDto,
  ): Promise<DriverDocument> {
    return this.documentsService.update(id, user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete driver document' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    return this.documentsService.remove(id, user);
  }
}

