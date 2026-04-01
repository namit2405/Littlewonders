const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const SiteImage = require('../models/SiteImage');
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'little-wonders/site-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }]
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Static image list — all images in images1/
const STATIC_IMAGES = [
  "1.webp","10.webp","15.webp","2.webp","4.webp","5.webp","6.webp","7.webp",
  "aaa.webp","bush.jpg","bushgarden.webp","chef.webp","chefinspired.webp","chi.webp",
  "families.webp","g1.webp","g10.webp","g11.webp","g12.webp","g13.webp","g14.webp",
  "g15.webp","g16.webp","g2.webp","g3.webp","g4.webp","g5.webp","g7.webp","g8.webp",
  "g9.webp","gallery.webp","gallery14.webp","gallery15.webp","gallery16.webp",
  "gallery20.webp","gallery3.webp","h (1).webp","hero.webp","hero1.webp","hh.webp",
  "hhh.webp","hj.webp","homegallery.webp","homegallery2.webp","jj.webp","kinder.webp",
  "kindergarten.webp","kitchen.webp","kitchen2.webp","kitchen3.webp","kitchen4.webp",
  "kitchen5.webp","kitchen6.webp","kitchen78.webp","kitchen99.webp","kk.webp","kkk.webp",
  "lll.webp","nursery.webp","ourkindergrarten2.webp","ourprograms_converted.webp",
  "pp.webp","prekinder1.webp","toddlers.webp","toddlers1.webp","tt.webp","ttt.webp",
  "view.webp","vvv.webp"
];

// GET /api/site-images — returns all static images with replacement info
router.get('/', auth, async (req, res) => {
  try {
    const replacements = await SiteImage.find();
    const replacementMap = {};
    replacements.forEach(r => { replacementMap[r.filename] = r; });

    const images = STATIC_IMAGES.map(filename => ({
      filename,
      originalUrl: `/images1/${filename}`,
      cloudinaryUrl: replacementMap[filename]?.cloudinaryUrl || null,
      replacedAt: replacementMap[filename]?.replacedAt || null
    }));

    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/site-images/:filename — replace a static image
router.post('/:filename', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const { filename } = req.params;

    // Delete old Cloudinary image if exists
    const existing = await SiteImage.findOne({ filename });
    if (existing?.cloudinaryId) {
      await cloudinary.uploader.destroy(existing.cloudinaryId);
    }

    const updated = await SiteImage.findOneAndUpdate(
      { filename },
      {
        filename,
        originalUrl: `/images1/${filename}`,
        cloudinaryUrl: req.file.path,
        cloudinaryId: req.file.filename,
        replacedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/site-images/:filename — revert to original
router.delete('/:filename', auth, async (req, res) => {
  try {
    const existing = await SiteImage.findOne({ filename: req.params.filename });
    if (existing?.cloudinaryId) {
      await cloudinary.uploader.destroy(existing.cloudinaryId);
    }
    await SiteImage.deleteOne({ filename: req.params.filename });
    res.json({ message: 'Reverted to original' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, STATIC_IMAGES };
