// Uses Node.js built-in SQLite (node:sqlite) — available since Node.js 22.5, no compilation needed.
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new DatabaseSync(path.join(dbDir, 'maeva.db'));

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client',
    phone TEXT,
    company TEXT,
    is_active INTEGER DEFAULT 1,
    reset_token TEXT,
    reset_expires TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    deal_type TEXT NOT NULL,
    price REAL NOT NULL,
    price_period TEXT,
    county TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    size REAL,
    size_unit TEXT DEFAULT 'sqft',
    images TEXT DEFAULT '[]',
    amenities TEXT DEFAULT '[]',
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    views INTEGER DEFAULT 0,
    lat REAL,
    lng REAL,
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, listing_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id)
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (listing_id) REFERENCES listings(id)
  );

  CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#1A56DB',
    row_num INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General Inquiry',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    admin_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewer_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    listing_id INTEGER,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(reviewer_id, listing_id)
  );

  CREATE TABLE IF NOT EXISTS saved_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL DEFAULT 'My Search',
    filters TEXT NOT NULL,
    notify_email INTEGER DEFAULT 1,
    last_notified_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    old_price REAL NOT NULL,
    new_price REAL NOT NULL,
    changed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS viewings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    viewer_name TEXT NOT NULL,
    viewer_email TEXT NOT NULL,
    viewer_phone TEXT,
    preferred_date TEXT NOT NULL,
    preferred_time TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id)
  );
`);

// Safe migrations for existing databases (columns added after initial release)
[
  'ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1',
  'ALTER TABLE users ADD COLUMN reset_token TEXT',
  'ALTER TABLE users ADD COLUMN reset_expires TEXT',
  'ALTER TABLE listings ADD COLUMN lat REAL',
  'ALTER TABLE listings ADD COLUMN lng REAL',
  'ALTER TABLE listings ADD COLUMN expires_at TEXT',
  'ALTER TABLE listings ADD COLUMN accept_enquiries INTEGER DEFAULT 1',
  'ALTER TABLE listings ADD COLUMN featured_requested INTEGER DEFAULT 0',
  'ALTER TABLE listings ADD COLUMN badge TEXT',
  'ALTER TABLE listings ADD COLUMN featured_until TEXT',
  'ALTER TABLE listings ADD COLUMN featured_rank INTEGER DEFAULT 0',
  'ALTER TABLE users    ADD COLUMN avatar TEXT',
  'ALTER TABLE partners ADD COLUMN logo_url TEXT',
  'ALTER TABLE users    ADD COLUMN agency_description TEXT',
  "ALTER TABLE users    ADD COLUMN agency_status TEXT DEFAULT 'active'",
  // Property availability status
  "ALTER TABLE listings ADD COLUMN status TEXT DEFAULT 'available'",
  // Lead management on enquiries
  "ALTER TABLE enquiries ADD COLUMN lead_status TEXT DEFAULT 'new'",
  'ALTER TABLE enquiries ADD COLUMN notes TEXT',
  // Floor plans + title deed
  "ALTER TABLE listings ADD COLUMN floor_plans TEXT DEFAULT '[]'",
  'ALTER TABLE listings ADD COLUMN title_deed_number TEXT',
].forEach(sql => { try { db.exec(sql); } catch (_) {} });

// Seed default partners once
const partnerCount = db.prepare('SELECT COUNT(*) as c FROM partners').get().c;
if (partnerCount === 0) {
  const insP = db.prepare('INSERT INTO partners (name, category, color, row_num, sort_order) VALUES (?, ?, ?, ?, ?)');
  [
    ['KCB Group',    'Banking',          '#007A3D', 1, 1],
    ['Equity Bank',  'Banking',          '#C8102E', 1, 2],
    ['HF Group',     'Housing Finance',  '#1B3A6B', 1, 3],
    ['NCBA Bank',    'Banking',          '#005B7F', 1, 4],
    ['Co-op Bank',   'Banking',          '#7B0323', 1, 5],
    ['Stanbic Bank', 'Banking',          '#1E3A6E', 1, 6],
    ['ABSA Kenya',   'Banking',          '#E32222', 1, 7],
    ['StanChart',    'Banking',          '#0A9A6E', 2, 1],
    ['I&M Bank',     'Banking',          '#F47920', 2, 2],
    ['M-Pesa',       'FinTech',          '#00A651', 2, 3],
    ['Knight Frank', 'Real Estate',      '#2C2C2C', 2, 4],
    ['Hass Consult', 'Real Estate',      '#B45309', 2, 5],
    ['KPDA',         'Industry Body',    '#1A56DB', 2, 6],
    ['ISK Kenya',    'Professional Body','#0F766E', 2, 7],
  ].forEach(([name, category, color, row_num, sort_order]) => {
    insP.run(name, category, color, row_num, sort_order);
  });
  console.log('✅ Default partners seeded (14 institutions)');
}

// Always ensure admin account exists (idempotent)
const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@maeva.co.ke'").get();
if (!adminExists) {
  const adminHash = bcrypt.hashSync('password123', 10);
  db.prepare('INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?)')
    .run('Maeva Admin', 'admin@maeva.co.ke', adminHash, 'admin', '+254700000000', 'Maeva Kenya');
  console.log('✅ Admin account created: admin@maeva.co.ke / password123');
}

// Seed demo data on first run
const userCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role != 'admin'").get().c;
if (userCount === 0) {
  const hash = bcrypt.hashSync('password123', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const r1 = insertUser.run('Amani Properties', 'agent@maeva.co.ke', hash, 'realtor', '+254712345678', 'Amani Properties Ltd');
  const r2 = insertUser.run('Grace Kamau', 'grace@maeva.co.ke', hash, 'realtor', '+254723456789', 'Grace Kamau Real Estate');
  insertUser.run('John Mwangi', 'client@maeva.co.ke', hash, 'client', '+254734567890', null);

  const uid1 = Number(r1.lastInsertRowid);
  const uid2 = Number(r2.lastInsertRowid);

  const ins = db.prepare(`INSERT INTO listings
    (user_id, title, description, type, deal_type, price, price_period, county, area, address, bedrooms, bathrooms, size, size_unit, images, amenities, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const seed = [
    [uid1,'3BR Modern House in Karen','A stunning 3-bedroom home in serene Karen. Open-plan living, chef\'s kitchen, landscaped garden. Perfect for families.','House','sale',28000000,null,'Nairobi','Karen','Karen Road, off Ngong Road',3,3,2800,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop']),JSON.stringify(['Parking','Garden','Security','CCTV','Borehole']),1],
    [uid1,'2BR Apartment in Kilimani','Stylish 2-bedroom apartment in the heart of Kilimani. Balcony with city views. Walking distance to Junction Mall.','Apartment','rent',95000,'monthly','Nairobi','Kilimani','Argwings Kodhek Road',2,2,1100,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop']),JSON.stringify(['Parking','Gym','Swimming Pool','Security','Generator','Lift/Elevator']),1],
    [uid2,'1 Acre Prime Land in Kitengela','Prime residential plot in developing Kitengela. Flat terrain, corner plot, road access on two sides. Title deed ready.','Land','sale',4500000,null,'Kajiado','Kitengela','Acacia Estate Road',null,null,1,'acres',JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&fit=crop']),JSON.stringify([]),1],
    [uid1,'Studio Apartment in Westlands','Fully furnished studio in Westlands. High-speed internet, 24hr security, near Sarit Centre and Westgate Mall.','Studio','rent',42000,'monthly','Nairobi','Westlands','Waiyaki Way',0,1,450,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&fit=crop']),JSON.stringify(['WiFi','Security','Furnished','Water 24/7']),1],
    [uid2,'4BR Villa in Nyali','Breathtaking 4-bedroom villa near Nyali Beach. Private pool, tropical garden, Swahili coastal design elements.','Villa','sale',55000000,null,'Mombasa','Nyali','Nyali Road',4,4,4500,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&fit=crop']),JSON.stringify(['Swimming Pool','Garden','Parking','Security','Borehole','Generator']),1],
    [uid1,'Commercial Space in Upper Hill','Grade A office space, 8th floor, modern building in Upper Hill. Open plan, ample parking for tenants and clients.','Commercial','rent',200000,'monthly','Nairobi','Upperhill','Hospital Road',null,2,3000,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop']),JSON.stringify(['Parking','Security','CCTV','Generator','Lift/Elevator','WiFi']),0],
    [uid2,'Bedsitter in Ruaka','Affordable bedsitter in booming Ruaka town. Close to transport, shops, restaurants. Ideal for students.','Bedsitter','rent',18000,'monthly','Kiambu','Ruaka','Ruaka Town Road',0,1,300,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&fit=crop']),JSON.stringify(['Water 24/7','Security']),0],
    [uid2,'5BR Maisonette in Runda','Prestigious 5-bedroom maisonette in exclusive Runda. Expansive compound, swimming pool, DSQ, double garage.','House','sale',95000000,null,'Nairobi','Runda','Runda Close',5,5,6200,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop']),JSON.stringify(['Swimming Pool','Garden','Parking','Security','CCTV','Generator','Servant Quarter','Borehole','Gated Community']),1],
    [uid1,'3BR Townhouse in South C','Well-maintained 3-bedroom townhouse in quiet South C. Fitted kitchen, small garden, near Nyayo Stadium.','Townhouse','sale',17500000,null,'Nairobi','South C','South C Estate',3,2,2000,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&fit=crop']),JSON.stringify(['Parking','Garden','Security']),0],
    [uid2,'2 Acres Land in Limuru','Fertile 2-acre plot in Limuru highlands. Red volcanic soil, reliable rainfall. Scenic Rift Valley views.','Land','sale',7500000,null,'Kiambu','Limuru','Limuru-Tigoni Road',null,null,2,'acres',JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&fit=crop']),JSON.stringify([]),0],
    [uid1,'2BR Apartment in Kisumu Milimani','Modern 2-bedroom apartment in upmarket Milimani, Kisumu. Lake views, proximity to government offices.','Apartment','rent',55000,'monthly','Kisumu','Milimani','Milimani Road',2,2,950,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop']),JSON.stringify(['Parking','Security','Water 24/7']),0],
    [uid2,'4BR House in Lavington','Spacious all-ensuite 4-bedroom house. Mature garden, swimming pool, DSQ, 24hr security.','House','rent',280000,'monthly','Nairobi','Lavington','Lavington Green',4,5,4000,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&fit=crop']),JSON.stringify(['Swimming Pool','Garden','Parking','Security','CCTV','Generator','Servant Quarter','Borehole']),1],
  ];

  for (const row of seed) ins.run(...row);
  console.log('✅ Database seeded with 12 demo listings');
}

module.exports = db;
