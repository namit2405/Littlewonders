const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  publicId:  { type: String, required: true },   // Cloudinary public_id
  url:       { type: String, required: true },   // Cloudinary secure_url
  category:  { type: String, required: true, enum: ['nursery', 'toddlers', 'pre-kinder', 'kindergarten', 'kitchen', 'bush-garden', 'general'] },
  caption:   { type: String, trim: true },
  order:     { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
