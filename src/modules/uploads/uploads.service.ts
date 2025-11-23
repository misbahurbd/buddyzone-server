import { Injectable } from '@nestjs/common';
import {
  CloudinaryService,
  UploadOptions,
} from '../../infrastructure/cloudinary/cloudinary.service';
import { UploadResult } from '../../infrastructure/cloudinary/cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadFile(
    file: Express.Multer.File,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    return this.cloudinaryService.uploadFile(file, options);
  }

  async uploadFiles(
    files: Express.Multer.File[],
    options?: UploadOptions,
  ): Promise<UploadResult[]> {
    return this.cloudinaryService.uploadFiles(files, options);
  }

  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<void> {
    return this.cloudinaryService.deleteFile(publicId, resourceType);
  }

  async deleteFiles(
    publicIds: string[],
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<void> {
    return this.cloudinaryService.deleteFiles(publicIds, resourceType);
  }

  generateUploadSignature(folder?: string) {
    return this.cloudinaryService.generateUploadSignature(folder);
  }
}
