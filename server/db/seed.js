/**
 * Seed the PostgreSQL database with demo data.
 * Run once: node server/db/seed.js
 * Requires DATABASE_URL env var to be set.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db     = require('./db');

async function seed() {
  console.log('🌱 Seeding database...');

  // ── Partners ──────────────────────────────────────────────
  const partnerCount = await db.get('SELECT COUNT(*) as c FROM partners');
  if (parseInt(partnerCount?.c) === 0) {
    const partners = [
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
    ];
    for (const [name, category, color, row_num, sort_order] of partners) {
      await db.query(
        'INSERT INTO partners (name, category, color, row_num, sort_order) VALUES (?, ?, ?, ?, ?)',
        [name, category, color, row_num, sort_order]
      );
    }
    console.log('✅ Seeded 14 partners');
  } else {
    console.log('⏭  Partners already seeded');
  }

  // ── Admin user ────────────────────────────────────────────
  const adminExists = await db.get("SELECT id FROM users WHERE email = 'admin@maeva.co.ke'");
  if (!adminExists) {
    const hash = await bcrypt.hash('password123', 10);
    await db.query(
      'INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?)',
      ['Maeva Admin', 'admin@maeva.co.ke', hash, 'admin', '+254700000000', 'Maeva Kenya']
    );
    console.log('✅ Admin created: admin@maeva.co.ke / password123');
  } else {
    console.log('⏭  Admin already exists');
  }

  // ── Demo users & listings ─────────────────────────────────
  const userCount = await db.get("SELECT COUNT(*) as c FROM users WHERE role != 'admin'");
  if (parseInt(userCount?.c) === 0) {
    const hash = await bcrypt.hash('password123', 10);

    const r1 = await db.get(
      'INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      ['Amani Properties', 'agent@maeva.co.ke', hash, 'realtor', '+254712345678', 'Amani Properties Ltd']
    );
    const r2 = await db.get(
      'INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      ['Grace Kamau', 'grace@maeva.co.ke', hash, 'realtor', '+254723456789', 'Grace Kamau Real Estate']
    );
    await db.query(
      'INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?)',
      ['John Mwangi', 'client@maeva.co.ke', hash, 'client', '+254734567890', null]
    );

    const uid1 = r1.id;
    const uid2 = r2.id;
    const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const listings = [
      [uid1,'3BR Modern House in Karen',"A stunning 3-bedroom home in serene Karen. Open-plan living, chef's kitchen, landscaped garden.",'House','sale',28000000,null,'Nairobi','Karen','Karen Road, off Ngong Road',3,3,2800,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop']),JSON.stringify(['Parking','Garden','Security','CCTV','Borehole']),1],
      [uid1,'2BR Apartment in Kilimani','Stylish 2-bedroom apartment in the heart of Kilimani. Balcony with city views.','Apartment','rent',95000,'monthly','Nairobi','Kilimani','Argwings Kodhek Road',2,2,1100,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop']),JSON.stringify(['Parking','Gym','Swimming Pool','Security','Generator','Lift/Elevator']),1],
      [uid2,'1 Acre Prime Land in Kitengela','Prime residential plot in Kitengela. Flat terrain, corner plot.','Land','sale',4500000,null,'Kajiado','Kitengela','Acacia Estate Road',null,null,1,'acres',JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&fit=crop']),JSON.stringify([]),1],
      [uid1,'Studio Apartment in Westlands','Fully furnished studio in Westlands. High-speed internet, 24hr security.','Studio','rent',42000,'monthly','Nairobi','Westlands','Waiyaki Way',0,1,450,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&fit=crop']),JSON.stringify(['WiFi','Security','Furnished','Water 24/7']),1],
      [uid2,'4BR Villa in Nyali','Breathtaking 4-bedroom villa near Nyali Beach. Private pool, tropical garden.','Villa','sale',55000000,null,'Mombasa','Nyali','Nyali Road',4,4,4500,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&fit=crop']),JSON.stringify(['Swimming Pool','Garden','Parking','Security','Borehole','Generator']),1],
      [uid1,'Commercial Space in Upper Hill','Grade A office space, 8th floor, Upper Hill. Open plan, ample parking.','Commercial','rent',200000,'monthly','Nairobi','Upperhill','Hospital Road',null,2,3000,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop']),JSON.stringify(['Parking','Security','CCTV','Generator','Lift/Elevator','WiFi']),0],
      [uid2,'Bedsitter in Ruaka','Affordable bedsitter in booming Ruaka town. Close to transport and shops.','Bedsitter','rent',18000,'monthly','Kiambu','Ruaka','Ruaka Town Road',0,1,300,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&fit=crop']),JSON.stringify(['Water 24/7','Security']),0],
      [uid2,'5BR Maisonette in Runda','Prestigious 5-bedroom maisonette in Runda. Swimming pool, DSQ, double garage.','House','sale',95000000,null,'Nairobi','Runda','Runda Close',5,5,6200,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop']),JSON.stringify(['Swimming Pool','Garden','Parking','Security','CCTV','Generator','Servant Quarter','Borehole','Gated Community']),1],
      [uid1,'3BR Townhouse in South C','Well-maintained 3-bedroom townhouse in quiet South C. Fitted kitchen.','Townhouse','sale',17500000,null,'Nairobi','South C','South C Estate',3,2,2000,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&fit=crop']),JSON.stringify(['Parking','Garden','Security']),0],
      [uid2,'2 Acres Land in Limuru','Fertile 2-acre plot in Limuru highlands. Scenic Rift Valley views.','Land','sale',7500000,null,'Kiambu','Limuru','Limuru-Tigoni Road',null,null,2,'acres',JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&fit=crop']),JSON.stringify([]),0],
      [uid1,'2BR Apartment in Kisumu Milimani','Modern 2-bedroom apartment in upmarket Milimani, Kisumu. Lake views.','Apartment','rent',55000,'monthly','Kisumu','Milimani','Milimani Road',2,2,950,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop']),JSON.stringify(['Parking','Security','Water 24/7']),0],
      [uid2,'4BR House in Lavington','Spacious all-ensuite 4-bedroom house. Mature garden, swimming pool, DSQ.','House','rent',280000,'monthly','Nairobi','Lavington','Lavington Green',4,5,4000,'sqft',JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&fit=crop']),JSON.stringify(['Swimming Pool','Garden','Parking','Security','CCTV','Generator','Servant Quarter','Borehole']),1],
    ];

    for (const [user_id, title, description, type, deal_type, price, price_period, county, area, address, bedrooms, bathrooms, size, size_unit, images, amenities, is_featured] of listings) {
      await db.query(`
        INSERT INTO listings
          (user_id, title, description, type, deal_type, price, price_period,
           county, area, address, bedrooms, bathrooms, size, size_unit,
           images, amenities, is_featured, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [user_id, title, description, type, deal_type, price, price_period,
          county, area, address, bedrooms, bathrooms, size, size_unit,
          images, amenities, is_featured, expires]);
    }
    console.log('✅ Seeded 3 demo users + 12 listings');
  } else {
    console.log('⏭  Demo users already seeded');
  }

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
