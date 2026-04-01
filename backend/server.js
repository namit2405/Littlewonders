require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://littlewonderselc.com.au',
    'https://www.littlewonderselc.com.au',
    'https://littlewonders-tau.vercel.app',
    'http://localhost:5000',
    'http://localhost:3000'
  ],
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve admin portal static files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Routes
app.use('/api/contact', require('./routes/contact'));
app.use('/api/enrolments', require('./routes/enrolments'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/site-images', require('./routes/siteImages').router);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
