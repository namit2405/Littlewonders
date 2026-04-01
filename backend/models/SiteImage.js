const mongoose = require('mongoose');

// Tracks Cloudinary replacements for static site images
const siteImageSchema = new mongoose.Schema({
  filename:   { type: String, required: true, unique: true }, // e.g. "hero.webp"
  originalUrl: { type: String, required: true },              // original /images1/hero.webp
  cloudinaryUrl: { type: String },                            // replacement URL from Cloudinary
  cloudinaryId:  { type: String },                            // for deletion
  replacedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('SiteImage', siteImageSchema);
