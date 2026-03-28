import express from 'express';
import db from '../db/database.js';
import { authenticate, authorizeAdminOrManager, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Generate unique tracking number
const generateTrackingNumber = () => {
  return 'NLC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Submit Anonymous Complaint
router.post('/anonymous', (req, res) => {
  const { title, description, category, department_id, location, priority, media_url, media_type } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  const tracking_number = generateTrackingNumber();
  const dept_id = department_id ? parseInt(department_id) : null;

  try {
    db.prepare(`
      INSERT INTO complaints (tracking_number, title, description, category, department_id, location, priority, media_url, media_type, is_anonymous)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(tracking_number, title, description, category, dept_id, location || null, priority || 'medium', media_url || null, media_type || null);

    res.status(201).json({ tracking_number, message: 'Complaint submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Track Complaint
router.get('/track/:tracking_number', (req, res) => {
  const { tracking_number } = req.params;

  try {
    const complaint = db.prepare(`
      SELECT c.*, d.name as department_name 
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.tracking_number = ?
    `).get(tracking_number) as any;

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Hide admin notes from public tracking
    const { admin_notes, ...publicComplaint } = complaint;
    res.json(publicComplaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit Authenticated Complaint
router.post('/', authenticate, (req: AuthRequest, res) => {
  const { title, description, category, department_id, location, priority, media_url, media_type } = req.body;
  const user_id = req.user?.id;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  const tracking_number = generateTrackingNumber();
  const dept_id = department_id ? parseInt(department_id) : null;

  try {
    db.prepare(`
      INSERT INTO complaints (tracking_number, user_id, title, description, category, department_id, location, priority, media_url, media_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tracking_number, user_id, title, description, category, dept_id, location || null, priority || 'medium', media_url || null, media_type || null);

    res.status(201).json({ tracking_number, message: 'Complaint submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get My Complaints
router.get('/my', authenticate, (req: AuthRequest, res) => {
  const user_id = req.user?.id;

  try {
    const complaints = db.prepare(`
      SELECT c.*, d.name as department_name 
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `).all(user_id);

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin/Manager: Get All Complaints
router.get('/admin/all', authenticate, authorizeAdminOrManager, (req: AuthRequest, res) => {
  const { role, department_id } = req.user!;

  try {
    let query = `
      SELECT c.*, d.name as department_name, u.name as user_name, u.email as user_email
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.user_id = u.id
    `;
    let params: any[] = [];

    if (role === 'department_manager' && department_id) {
      query += ' WHERE c.department_id = ?';
      params.push(department_id);
    }

    query += ' ORDER BY c.updated_at DESC';

    const complaints = db.prepare(query).all(...params);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin/Manager: Get Stats
router.get('/admin/stats/overview', authenticate, authorizeAdminOrManager, (req: AuthRequest, res) => {
  console.log('[DEBUG STATS] Stats endpoint hit, user:', req.user?.email, 'role:', req.user?.role);
  const { role, department_id } = req.user!;

  try {
    let whereClause = '';
    let params: any[] = [];

    if (role === 'department_manager' && department_id) {
      whereClause = ' WHERE department_id = ?';
      params.push(department_id);
    }

    const total = db.prepare(`SELECT COUNT(*) as count FROM complaints ${whereClause}`).get(...params) as any;
    const pending = db.prepare(`SELECT COUNT(*) as count FROM complaints WHERE status = 'pending' ${whereClause ? 'AND department_id = ?' : ''}`).get(...(whereClause ? [department_id] : [])) as any;
    const inProgress = db.prepare(`SELECT COUNT(*) as count FROM complaints WHERE status = 'in-progress' ${whereClause ? 'AND department_id = ?' : ''}`).get(...(whereClause ? [department_id] : [])) as any;
    const resolved = db.prepare(`SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved' ${whereClause ? 'AND department_id = ?' : ''}`).get(...(whereClause ? [department_id] : [])) as any;

    const byCategoryQuery = `SELECT category as name, COUNT(*) as value FROM complaints ${whereClause} GROUP BY category`;
    const byCategory = db.prepare(byCategoryQuery).all(...params);
    
    const byStatus = [
      { name: 'Pending', value: pending.count },
      { name: 'In Progress', value: inProgress.count },
      { name: 'Resolved', value: resolved.count }
    ];

    const result = {
      summary: {
        total: total.count,
        pending: pending.count,
        inProgress: inProgress.count,
        resolved: resolved.count
      },
      byCategory,
      byStatus
    };
    console.log('[DEBUG STATS] Stats generated:', result.summary);
    res.json(result);
  } catch (err) {
    console.error('[DEBUG STATS] Error generating stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin/Manager: Get Single Complaint
router.get('/admin/:id', authenticate, authorizeAdminOrManager, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { role, department_id } = req.user!;

  try {
    const complaint = db.prepare(`
      SELECT c.*, d.name as department_name, u.name as user_name, u.email as user_email
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(id) as any;

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if manager is from the same department
    if (role === 'department_manager' && complaint.department_id !== department_id) {
      return res.status(403).json({ message: 'Access denied. You can only view complaints from your department.' });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin/Manager: Update Status
router.patch('/admin/:id/status', authenticate, authorizeAdminOrManager, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, admin_notes, resolution_notes, priority } = req.body;
  const { role, department_id } = req.user!;

  try {
    const complaint = db.prepare('SELECT department_id FROM complaints WHERE id = ?').get(id) as any;
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (role === 'department_manager' && complaint.department_id !== department_id) {
      return res.status(403).json({ message: 'Access denied. You can only manage complaints from your department.' });
    }

    db.prepare(`
      UPDATE complaints 
      SET status = COALESCE(?, status), 
          admin_notes = COALESCE(?, admin_notes),
          resolution_notes = COALESCE(?, resolution_notes),
          priority = COALESCE(?, priority),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, admin_notes, resolution_notes, priority, id);

    res.json({ message: 'Complaint updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
