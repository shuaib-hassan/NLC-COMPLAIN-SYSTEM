import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Get all departments
router.get('/', (req, res) => {
  try {
    const departments = db.prepare('SELECT * FROM departments ORDER BY name ASC').all();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
