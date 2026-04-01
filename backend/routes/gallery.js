const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const GalleryImage = require('../models/GalleryImage');
const auth = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: `little-wonders/${req.body.category || 'general'}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
  })
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// GET /api/gallery?category=nursery  — public
router.get('/', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const images = await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gallery  — admin only, upload image
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const image = await GalleryImage.create({
      publicId: req.file.filename,
      url:      req.file.path,
      category: req.body.category || 'general',
      caption:  req.body.caption || '',
      order:    req.body.order ? parseInt(req.body.order) : 0
    });
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gallery/:id  — admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Not found' });
    await cloudinary.uploader.destroy(image.publicId);
    await image.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
