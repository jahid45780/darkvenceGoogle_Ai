import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/index.ts';
import { db } from '../../db/store.ts';

// Initialize Cloudinary if credentials are provided
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
  });
}

export const uploadsController = {
  uploadImage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { image, name, folder } = req.body;

      if (!image || typeof image !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PAYLOAD', message: 'Image base64 data string or URL is required.' }
        });
        return;
      }

      // Check format
      const isDataUrl = image.startsWith('data:image/');
      const isHttpUrl = image.startsWith('http://') || image.startsWith('https://');

      if (!isDataUrl && !isHttpUrl) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_FORMAT', message: 'Only image files (JPEG, PNG, WebP, SVG) are allowed.' }
        });
        return;
      }

      let finalUrl = image;
      let publicId = `dv_asset_${Date.now()}`;
      let format = 'png';
      let bytes = 120000;

      // If Cloudinary credentials are valid, upload to Cloudinary
      if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
        try {
          const uploadResult = await cloudinary.uploader.upload(image, {
            folder: folder || 'darkvence_assets',
            resource_type: 'image'
          });
          finalUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
          format = uploadResult.format;
          bytes = uploadResult.bytes;
        } catch (cloudErr: any) {
          console.warn('[Cloudinary upload warning - using local disk fallback]:', cloudErr?.message || cloudErr);
        }
      }

      // If local fallback needed for data URL
      if (finalUrl === image && isDataUrl) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (!matches) {
            res.status(400).json({
              success: false,
              error: { code: 'INVALID_FORMAT', message: 'Only image files (JPEG, PNG, WebP, SVG) are allowed.' }
            });
            return;
          }

          let ext = matches[1].toLowerCase();
          if (ext === 'svg+xml') ext = 'svg';
          if (ext === 'jpeg') ext = 'jpg';

          const validExts = ['jpg', 'png', 'webp', 'svg'];
          if (!validExts.includes(ext)) {
            res.status(400).json({
              success: false,
              error: { code: 'INVALID_FORMAT', message: 'Only image files (JPEG, PNG, WebP, SVG) are allowed.' }
            });
            return;
          }

          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Enforce 5MB maximum limit
          if (buffer.length > 5 * 1024 * 1024) {
            res.status(400).json({
              success: false,
              error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds maximum limit of 5MB.' }
            });
            return;
          }

          bytes = buffer.length;
          format = ext === 'jpg' ? 'jpeg' : ext;

          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const fileName = `dv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, buffer);
          finalUrl = `/uploads/${fileName}`;
          publicId = fileName;
        } catch (diskErr) {
          console.error('[Upload to disk failed, keeping raw data URI]:', diskErr);
        }
      }



      const validFormat = (['jpeg', 'png', 'webp', 'svg'].includes(format.toLowerCase()) ? format.toLowerCase() : 'png') as 'jpeg' | 'png' | 'webp' | 'svg';

      // Also register into Media Library
      const mediaItem = db.createMedia({
        name: name || 'Uploaded Agency Asset',
        url: finalUrl,
        publicId,
        sizeBytes: bytes,
        dimensions: { width: 1920, height: 1080 },
        format: validFormat,
        altText: name || 'Agency Asset'
      });

      res.status(201).json({
        success: true,
        data: {
          assetId: mediaItem.id,
          publicId,
          name: mediaItem.name,
          url: finalUrl
        },
        message: 'Image uploaded and registered successfully.'
      });
    } catch (err: any) {
      console.error('[Upload error]:', err);
      res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: err.message || 'Image processing failed.' }
      });
    }
  }
};
