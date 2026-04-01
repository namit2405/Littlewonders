const mongoose = require('mongoose');

const enrolmentSchema = new mongoose.Schema({
  childName:   { type: String, required: true, trim: true },
  childDob:    { type: Date, required: true },
  program:     { type: String, required: true, enum: ['nursery', 'toddlers', 'pre-kinder', 'kindergarten'] },
  startDate:   { type: Date, required: true },
  parentName:  { type: String, required: true, trim: true },
  parentPhone: { type: String, required: true, trim: true },
  parentEmail: { type: String, required: true, trim: true, lowercase: true },
  message:     { type: String, trim: true },
  status:      { type: String, enum: ['new', 'contacted', 'enrolled', 'declined'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Enrolment', enrolmentSchema);
