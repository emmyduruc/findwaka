import { Controller, Get, Post, Patch, Param, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../guards/roles.guard';
import { UserRole } from '@waka/shared';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';

@ApiTags('documents')
@Controller('drivers/me/documents')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@ApiBearerAuth()
export class DocumentsController {
  constructor(@Inject(DocumentsService) private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create driver document' })
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  async create(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.create(firebaseUser, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all driver documents' })
  @ApiResponse({ status: 200, type: [DocumentResponseDto] })
  async findAll(@CurrentUser() firebaseUser: FirebaseUser): Promise<DocumentResponseDto[]> {
    return this.documentsService.findAll(firebaseUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update driver document' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  async update(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.update(firebaseUser, id, dto);
  }
}

