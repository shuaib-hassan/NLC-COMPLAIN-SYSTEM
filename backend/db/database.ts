import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'cms.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
export function initDb() {
  // Departments table first (referenced by users)
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'citizen',
      department_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments (id)
    )
  `);

  // Migration: Add department_id to users if it doesn't exist
  const userTableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
  const hasUserDeptId = userTableInfo.some(col => col.name === 'department_id');
  if (!hasUserDeptId) {
    try {
      db.exec("ALTER TABLE users ADD COLUMN department_id INTEGER REFERENCES departments(id)");
      console.log('Added department_id column to users table.');
    } catch (err) {
      console.error('Failed to add department_id column to users:', err);
    }
  }

  // Migration: Add email verification fields
  const hasVerificationToken = userTableInfo.some(col => col.name === 'verification_token');
  const hasVerified = userTableInfo.some(col => col.name === 'email_verified');
  if (!hasVerificationToken) {
    try {
      db.exec("ALTER TABLE users ADD COLUMN verification_token TEXT");
      console.log('Added verification_token column to users table.');
    } catch (err) {
      console.error('Failed to add verification_token column:', err);
    }
  }
  if (!hasVerified) {
    try {
      db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0");
      console.log('Added email_verified column to users table.');
    } catch (err) {
      console.error('Failed to add email_verified column:', err);
    }
  }

  // Complaints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      department_id INTEGER,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      location TEXT,
      is_anonymous BOOLEAN DEFAULT 0,
      media_url TEXT,
      media_type TEXT,
      admin_notes TEXT,
      resolution_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (department_id) REFERENCES departments (id)
    )
  `);

  // Migration: Add department_id to complaints if it doesn't exist
  const complaintTableInfo = db.prepare("PRAGMA table_info(complaints)").all() as any[];
  const hasComplaintDeptId = complaintTableInfo.some(col => col.name === 'department_id');
  if (!hasComplaintDeptId) {
    try {
      db.exec("ALTER TABLE complaints ADD COLUMN department_id INTEGER REFERENCES departments(id)");
      console.log('Added department_id column to complaints table.');
    } catch (err) {
      console.error('Failed to add department_id column to complaints:', err);
    }
  }

  // Seed departments
  const depts = [
    'Land Administration',
    'Valuation and Taxation',
    'Survey and Mapping',
    'Physical Planning',
    'Legal Affairs',
    'Human Resources',
    'Finance and Accounts',
    'ICT'
  ];

  const insertDept = db.prepare('INSERT OR IGNORE INTO departments (name) VALUES (?)');
  depts.forEach(dept => insertDept.run(dept));

  // Seed default admin
  const adminEmail = 'ken.kimathi@landcommission.go.ke';
  const adminCheck = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  
  if (!adminCheck) {
    const hashedPassword = bcrypt.hashSync('Admin@2026', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run('Ken Kimathi', adminEmail, hashedPassword, 'admin');
    console.log('Default admin seeded.');
  }

  // Seed a department manager for Land Administration
  const managerEmail = 'manager.land@landcommission.go.ke';
  const managerCheck = db.prepare('SELECT id FROM users WHERE email = ?').get(managerEmail);
  if (!managerCheck) {
    const landDept = db.prepare('SELECT id FROM departments WHERE name = ?').get('Land Administration') as any;
    if (landDept) {
      const hashedPassword = bcrypt.hashSync('Manager@2026', 10);
      db.prepare('INSERT INTO users (name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)')
        .run('Land Manager', managerEmail, hashedPassword, 'department_manager', landDept.id);
      console.log('Department manager seeded.');
    }
  }
}

export default db;
