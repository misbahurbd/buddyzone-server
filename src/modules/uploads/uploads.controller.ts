import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiConsumes,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { UploadFileDto } from './dto/upload-response.dto';
import { ApiSuccessResponse } from '../../common/decorators/api-success-response.decorator';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { DeleteFileDto } from './dto/delete-file.dto';

@Controller('uploads')
@UseGuards(AuthenticatedGuard)
@ApiCookieAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('files')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload multiple files',
    description:
      'Upload one or more files to Cloudinary. Supports images, videos, and documents. Maximum 10 files, 10MB per file.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of files to upload (max 10 files, 10MB each)',
        },
      },
      required: ['files'],
    },
  })
  @ApiSuccessResponse({
    status: 201,
    description: 'Files uploaded successfully',
    type: UploadFileDto,
    isArray: true,
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles(
      new FileValidationPipe({
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'video/mp4',
          'video/mpeg',
          'video/quicktime',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<{ message: string; data: UploadFileDto[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadResults = await this.uploadsService.uploadFiles(files);

    const fileDtos = uploadResults.map((result) => ({
      publicId: result.publicId,
      url: result.url,
      secureUrl: result.secureUrl,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resourceType,
      bytes: result.bytes,
      createdAt: result.createdAt,
    }));

    return {
      message: `Successfully uploaded ${files.length} file(s)`,
      data: fileDtos,
    };
  }

  @Post('file')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload a single file',
    description:
      'Upload a single file to Cloudinary. Supports images, videos, and documents. Maximum 10MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 10MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiSuccessResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadFileDto,
  })
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadFile(
    @UploadedFiles(
      new FileValidationPipe({
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 1,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'video/mp4',
          'video/mpeg',
          'video/quicktime',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<{ message: string; data: UploadFileDto }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file provided');
    }

    if (files.length > 1) {
      throw new BadRequestException('Only one file is allowed');
    }

    const uploadResult = await this.uploadsService.uploadFile(files[0]);

    const fileDto: UploadFileDto = {
      publicId: uploadResult.publicId,
      url: uploadResult.url,
      secureUrl: uploadResult.secureUrl,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      resourceType: uploadResult.resourceType,
      bytes: uploadResult.bytes,
      createdAt: uploadResult.createdAt,
    };

    return {
      message: 'File uploaded successfully',
      data: fileDto,
    };
  }

  @Delete('file')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a file',
    description: 'Delete a file from Cloudinary by its public ID',
  })
  @ApiSuccessResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  async deleteFile(
    @Body() deleteFileDto: DeleteFileDto,
  ): Promise<{ message: string }> {
    const { publicId, resourceType = 'image' } = deleteFileDto;
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    await this.uploadsService.deleteFile(publicId, resourceType);

    return {
      message: 'File deleted successfully',
    };
  }
}
