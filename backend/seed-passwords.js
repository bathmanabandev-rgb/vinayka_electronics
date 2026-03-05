const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function seedDatabase() {
  try {
    console.log('🔄 Generating password hashes...\n');

    // Generate hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);

    console.log('✅ Hashes generated successfully\n');

    // Update admin password
    await pool.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [adminHash, 'admin']
    );
    console.log('✅ Admin password updated');

    // Update staff password
    await pool.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [staffHash, 'staff1']
    );
    console.log('✅ Staff password updated');

    console.log('\n✨ Database seeding complete!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Staff: staff1 / staff123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
