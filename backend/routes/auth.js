const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/seed  — run once to create the admin account, then remove or protect this route
router.post('/seed', async (req, res) => {
  try {
    const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (exists) return res.status(400).json({ error: 'Admin already exists' });
    await Admin.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    res.json({ message: 'Admin created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
