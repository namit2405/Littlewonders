const router = require('express').Router();
const Enrolment = require('../models/Enrolment');
const auth = require('../middleware/auth');

// POST /api/enrolments  — public
router.post('/', async (req, res) => {
  try {
    const { childName, childDob, program, startDate, parentName, parentPhone, parentEmail, message } = req.body;
    if (!childName || !childDob || !program || !startDate || !parentName || !parentPhone || !parentEmail) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }
    await Enrolment.create({ childName, childDob, program, startDate, parentName, parentPhone, parentEmail, message });
    res.status(201).json({ message: 'Enrolment submitted! We will contact you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error, please try again.' });
  }
});

// GET /api/enrolments  — admin only
router.get('/', auth, async (req, res) => {
  try {
    const enrolments = await Enrolment.find().sort({ createdAt: -1 });
    res.json(enrolments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/enrolments/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const enrolment = await Enrolment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(enrolment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/enrolments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Enrolment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
