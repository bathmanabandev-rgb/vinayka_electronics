const bcrypt = require('bcryptjs');

async function generateHashes() {
  const admin123 = await bcrypt.hash('admin123', 10);
  const staff123 = await bcrypt.hash('staff123', 10);
  
  console.log('\n✅ Password Hashes Generated:\n');
  console.log('For admin123:', admin123);
  console.log('For staff123:', staff123);
  
  console.log('\n📝 SQL UPDATE Statements:\n');
  console.log(`UPDATE users SET password = '${admin123}' WHERE username = 'admin';`);
  console.log(`UPDATE users SET password = '${staff123}' WHERE username = 'staff1';\n`);
}

generateHashes();
