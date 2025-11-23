import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  maxFiles?: number;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly maxFiles: number;

  constructor(options: FileValidationOptions = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    this.allowedMimeTypes = options.allowedMimeTypes || [
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
    ];
    this.maxFiles = options.maxFiles || 10;
  }

  transform(
    value: Express.Multer.File | Express.Multer.File[],
  ): Express.Multer.File | Express.Multer.File[] {
    if (!value) {
      throw new BadRequestException('No files provided');
    }

    const files = Array.isArray(value) ? value : [value];

    if (files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > this.maxFiles) {
      throw new BadRequestException(
        `Maximum ${this.maxFiles} files allowed. Received ${files.length} files.`,
      );
    }

    for (const file of files) {
      this.validateFile(file);
    }

    return Array.isArray(value) ? files : files[0];
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Invalid file');
    }

    // Check file size
    if (file.size > this.maxSize) {
      const maxSizeMB = (this.maxSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File "${file.originalname}" exceeds maximum size of ${maxSizeMB}MB`,
      );
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Check if file has buffer
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(`File "${file.originalname}" is empty`);
    }
  }
}
