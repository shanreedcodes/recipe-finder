import 'dotenv/config';// Load environment variables from .env file
import express from 'express';

/// Create the Express app
const express = require('express');
const app = express();

// Use PORT from .env or default to 3001
const PORT = process.env.PORT || 3001;

// Basic GET route
app.get('/api/health', (req, res) => {
 try {
    res.status(200).json({
      ok: true,
      mode: SPOONACULAR_MODE,
      pointsToday: 0
    });
  } catch (err) {
    console.error('Error in /api/health:', err);
    res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
});


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});