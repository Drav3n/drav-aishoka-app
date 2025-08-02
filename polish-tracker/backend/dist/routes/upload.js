"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
const processAndSaveImage = async (buffer, userId, type, polishId) => {
    const filename = `${(0, uuid_1.v4)()}.jpg`;
    const userDir = path_1.default.join('uploads', 'users', userId);
    const typeDir = path_1.default.join(userDir, type);
    const fs = require('fs').promises;
    await fs.mkdir(typeDir, { recursive: true });
    const fullPath = path_1.default.join(typeDir, filename);
    await (0, sharp_1.default)(buffer)
        .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
    })
        .jpeg({
        quality: 85,
        progressive: true
    })
        .toFile(fullPath);
    const thumbnailPath = path_1.default.join(typeDir, `thumb_${filename}`);
    await (0, sharp_1.default)(buffer)
        .resize(200, 200, {
        fit: 'cover'
    })
        .jpeg({
        quality: 80
    })
        .toFile(thumbnailPath);
    return `/uploads/users/${userId}/${type}/${filename}`;
};
router.post('/polish-image', upload.single('image'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw (0, errorHandler_1.createError)('No image file provided', 400);
    }
    const { type, polish_id } = req.body;
    if (!type || !['bottle', 'swatch'].includes(type)) {
        throw (0, errorHandler_1.createError)('Invalid image type. Must be "bottle" or "swatch"', 400);
    }
    try {
        const imageUrl = await processAndSaveImage(req.file.buffer, req.user.id, type, polish_id);
        res.json({
            success: true,
            data: {
                url: imageUrl,
                thumbnail_url: imageUrl.replace(/([^/]+)\.jpg$/, 'thumb_$1.jpg'),
                type
            }
        });
    }
    catch (error) {
        console.error('Image processing error:', error);
        throw (0, errorHandler_1.createError)('Failed to process image', 500);
    }
}));
router.post('/nail-art', upload.single('image'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw (0, errorHandler_1.createError)('No image file provided', 400);
    }
    try {
        const imageUrl = await processAndSaveImage(req.file.buffer, req.user.id, 'nail-art');
        res.json({
            success: true,
            data: {
                url: imageUrl,
                thumbnail_url: imageUrl.replace(/([^/]+)\.jpg$/, 'thumb_$1.jpg')
            }
        });
    }
    catch (error) {
        console.error('Image processing error:', error);
        throw (0, errorHandler_1.createError)('Failed to process image', 500);
    }
}));
router.post('/multiple', upload.array('images', 5), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw (0, errorHandler_1.createError)('No image files provided', 400);
    }
    const { type = 'nail-art' } = req.body;
    try {
        const uploadPromises = req.files.map(async (file) => {
            const imageUrl = await processAndSaveImage(file.buffer, req.user.id, type);
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
    }
    catch (error) {
        console.error('Multiple image processing error:', error);
        throw (0, errorHandler_1.createError)('Failed to process images', 500);
    }
}));
router.delete('/image', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { image_url } = req.body;
    if (!image_url) {
        throw (0, errorHandler_1.createError)('Image URL is required', 400);
    }
    if (!image_url.includes(`/users/${req.user.id}/`)) {
        throw (0, errorHandler_1.createError)('Unauthorized to delete this image', 403);
    }
    try {
        const fs = require('fs').promises;
        const imagePath = path_1.default.join(process.cwd(), image_url);
        const thumbnailPath = imagePath.replace(/([^/]+)\.jpg$/, 'thumb_$1.jpg');
        await Promise.all([
            fs.unlink(imagePath).catch(() => { }),
            fs.unlink(thumbnailPath).catch(() => { })
        ]);
        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        console.error('Image deletion error:', error);
        throw (0, errorHandler_1.createError)('Failed to delete image', 500);
    }
}));
router.get('/user-images', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { type } = req.query;
    try {
        const fs = require('fs').promises;
        const userDir = path_1.default.join('uploads', 'users', req.user.id);
        let images = [];
        if (type && ['bottle', 'swatch', 'nail-art'].includes(type)) {
            const typeDir = path_1.default.join(userDir, type);
            try {
                const files = await fs.readdir(typeDir);
                images = files
                    .filter((file) => !file.startsWith('thumb_') && file.endsWith('.jpg'))
                    .map((file) => ({
                    url: `/uploads/users/${req.user.id}/${type}/${file}`,
                    thumbnail_url: `/uploads/users/${req.user.id}/${type}/thumb_${file}`,
                    type,
                    filename: file
                }));
            }
            catch (error) {
            }
        }
        else {
            const types = ['bottle', 'swatch', 'nail-art'];
            for (const imageType of types) {
                const typeDir = path_1.default.join(userDir, imageType);
                try {
                    const files = await fs.readdir(typeDir);
                    const typeImages = files
                        .filter((file) => !file.startsWith('thumb_') && file.endsWith('.jpg'))
                        .map((file) => ({
                        url: `/uploads/users/${req.user.id}/${imageType}/${file}`,
                        thumbnail_url: `/uploads/users/${req.user.id}/${imageType}/thumb_${file}`,
                        type: imageType,
                        filename: file
                    }));
                    images.push(...typeImages);
                }
                catch (error) {
                }
            }
        }
        res.json({
            success: true,
            data: images
        });
    }
    catch (error) {
        console.error('Error fetching user images:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch images', 500);
    }
}));
exports.default = router;
//# sourceMappingURL=upload.js.map