import express, { Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper function to process and save image
const processAndSaveImage = async (
  buffer: Buffer,
  userId: string,
  type: 'bottle' | 'swatch' | 'nail-art',
  polishId?: string
): Promise<string> => {
  const filename = `${uuidv4()}.jpg`;
  const userDir = path.join('uploads', 'users', userId);
  const typeDir = path.join(userDir, type);
  
  // Create directory structure if it doesn't exist
  const fs = require('fs').promises;
  await fs.mkdir(typeDir, { recursive: true });

  const fullPath = path.join(typeDir, filename);

  // Process image with sharp
  await sharp(buffer)
    .resize(800, 800, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 85,
      progressive: true 
    })
    .toFile(fullPath);

  // Create thumbnail
  const thumbnailPath = path.join(typeDir, `thumb_${filename}`);
  await sharp(buffer)
    .resize(200, 200, { 
      fit: 'cover' 
    })
    .jpeg({ 
      quality: 80 
    })
    .toFile(thumbnailPath);

  return `/uploads/users/${userId}/${type}/${filename}`;
};

// POST /api/upload/polish-image - Upload polish bottle or swatch image
router.post('/polish-image', upload.single('image'), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  const { type, polish_id } = req.body;
  
  if (!type || !['bottle', 'swatch'].includes(type)) {
    throw createError('Invalid image type. Must be "bottle" or "swatch"', 400);
  }

  try {
    const imageUrl = await processAndSaveImage(
      req.file.buffer,
      req.user!.id,
      type as 'bottle' | 'swatch',
      polish_id
    );

    res.json({
      success: true,
      data: {
        url: imageUrl,
        thumbnail_url: imageUrl.replace(/([^/]+)\.jpg$/, 'thumb_$1.jpg'),
        type
      }
    });
  } catch (error) {
    console.error('Image processing error:', error);
    throw createError('Failed to process image', 500);
  }
}));

// POST /api/upload/nail-art - Upload nail art image
router.post('/nail-art', upload.single('image'), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  try {
    const imageUrl = await processAndSaveImage(
      req.file.buffer,
      req.user!.id,
      'nail-art'
    );

    res.json({
      success: true,
      data: {
        url: imageUrl,
        thumbnail_url: imageUrl.replace(/([^/]+)\.jpg$/, 'thumb_$1.jpg')
      }
    });
  } catch (error) {
    console.error('Image processing error:', error);
    throw createError('Failed to process image', 500);
  }
}));

// POST /api/upload/multiple - Upload multiple images
router.post('/multiple', upload.array('images', 5), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw createError('No image files provided', 400);
  }

  const { type = 'nail-art' } = req.body;

  try {
    const uploadPromises = req.files.map(async (file) => {
      const imageUrl = await processAndSaveImage(
        file.buffer,
        req.user!.id,
        type as 'bottle' | 'swatch' | 'nail-art'
      );

      return {
        url: imageUrl,
        thumbnail_url: imageUrl.replace(/([^/]+)\.jpg$/, 'thumb_$1.jpg'),
        original_name: file.originalname
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Multiple image processing error:', error);
    throw createError('Failed to process images', 500);
  }
}));

// DELETE /api/upload/image - Delete an image
router.delete('/image', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { image_url } = req.body;

  if (!image_url) {
    throw createError('Image URL is required', 400);
  }

  // Verify the image belongs to the user
  if (!image_url.includes(`/users/${req.user!.id}/`)) {
    throw createError('Unauthorized to delete this image', 403);
  }

  try {
    const fs = require('fs').promises;
    const imagePath = path.join(process.cwd(), image_url);
    const thumbnailPath = imagePath.replace(/([^/]+)\.jpg$/, 'thumb_$1.jpg');

    // Delete main image and thumbnail
    await Promise.all([
      fs.unlink(imagePath).catch(() => {}), // Ignore errors if file doesn't exist
      fs.unlink(thumbnailPath).catch(() => {})
    ]);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    throw createError('Failed to delete image', 500);
  }
}));

// GET /api/upload/user-images - Get all images for user
router.get('/user-images', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type } = req.query;
  
  try {
    const fs = require('fs').promises;
    const userDir = path.join('uploads', 'users', req.user!.id);
    
    let images: any[] = [];
    
    if (type && ['bottle', 'swatch', 'nail-art'].includes(type as string)) {
      // Get images of specific type
      const typeDir = path.join(userDir, type as string);
      try {
        const files = await fs.readdir(typeDir);
        images = files
          .filter((file: string) => !file.startsWith('thumb_') && file.endsWith('.jpg'))
          .map((file: string) => ({
            url: `/uploads/users/${req.user!.id}/${type}/${file}`,
            thumbnail_url: `/uploads/users/${req.user!.id}/${type}/thumb_${file}`,
            type,
            filename: file
          }));
      } catch (error) {
        // Directory doesn't exist, return empty array
      }
    } else {
      // Get all images
      const types = ['bottle', 'swatch', 'nail-art'];
      for (const imageType of types) {
        const typeDir = path.join(userDir, imageType);
        try {
          const files = await fs.readdir(typeDir);
          const typeImages = files
            .filter((file: string) => !file.startsWith('thumb_') && file.endsWith('.jpg'))
            .map((file: string) => ({
              url: `/uploads/users/${req.user!.id}/${imageType}/${file}`,
              thumbnail_url: `/uploads/users/${req.user!.id}/${imageType}/thumb_${file}`,
              type: imageType,
              filename: file
            }));
          images.push(...typeImages);
        } catch (error) {
          // Directory doesn't exist, continue
        }
      }
    }

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error fetching user images:', error);
    throw createError('Failed to fetch images', 500);
  }
}));

export default router;