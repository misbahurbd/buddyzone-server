import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EnvVariables } from 'src/common/validators/env-validator';

export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: Array<Record<string, unknown>>;
  publicId?: string;
  overwrite?: boolean;
  invalidate?: boolean;
}

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format: string;
  resourceType: string;
  bytes: number;
  createdAt: string;
}

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService<EnvVariables>) {}

  onModuleInit() {
    try {
      const config = {
        cloud_name: this.configService.getOrThrow<string>(
          'CLOUDINARY_CLOUD_NAME',
        ),
        api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
        api_secret: this.configService.getOrThrow<string>(
          'CLOUDINARY_API_SECRET',
        ),
        secure: true,
      };

      cloudinary.config(config);
      this.logger.log('Cloudinary configured successfully');
    } catch (error) {
      this.logger.error('Failed to configure Cloudinary', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const defaultFolder = this.configService.get<string>('CLOUDINARY_FOLDER');
    const folder = options.folder || defaultFolder;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: options.resourceType || 'auto',
          transformation: options.transformation,
          public_id: options.publicId,
          overwrite: options.overwrite || false,
          invalidate: options.invalidate || true,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary upload returned no result'));
            return;
          }

          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
            createdAt: result.created_at,
          });
        },
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      bufferStream.pipe(uploadStream);
    });
  }

  async uploadFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {},
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .destroy(
          publicId,
          {
            resource_type: resourceType,
            invalidate: true,
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              reject(new Error(`Cloudinary delete failed: ${error?.message}`));
              return;
            }

            if (result?.result !== 'ok' && result?.result !== 'not found') {
              reject(new Error(`Cloudinary delete failed: ${result?.result}`));
              return;
            }

            resolve();
          },
        )
        .catch((err: Error) => {
          reject(new Error(`Cloudinary delete failed: ${err?.message || err}`));
        });
    });
  }

  async deleteFiles(
    publicIds: string[],
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<void> {
    const deletePromises = publicIds.map((publicId) =>
      this.deleteFile(publicId, resourceType),
    );
    await Promise.allSettled(deletePromises);
  }

  generateUploadSignature(folder?: string): {
    signature: string;
    timestamp: number;
    folder: string;
  } {
    const defaultFolder =
      this.configService.get<string>('CLOUDINARY_FOLDER') || 'buddyzone';
    const uploadFolder = folder || defaultFolder;
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: uploadFolder,
      },
      this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    );

    return {
      signature,
      timestamp,
      folder: uploadFolder,
    };
  }
}
