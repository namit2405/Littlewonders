const router = require('express').Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const { sendContactEmail } = require('../utils/mailer');

// POST /api/contact  — public
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }
    await Contact.create({ name, phone, email, subject, message });
    // Send notification email (non-blocking)
    sendContactEmail({ name, phone, email, subject, message })
      .catch(err => console.error('Contact email error:', err));
    res.status(201).json({ message: 'Thank you! We will be in touch soon.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error, please try again.' });
  }
});

// GET /api/contact  — admin only
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/contact/:id/read  — mark as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/contact/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
