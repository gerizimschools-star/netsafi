import bcrypt from "bcryptjs";
import { get, run, query } from "./database-unified";

async function fixAdminPassword() {
  try {
    console.log('Checking database tables...');

    // First check what tables exist
    const tables = await query(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    console.log('Available tables:', tables.map(t => t.name));

    // Check if admin user exists
    const admin = await get('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    console.log('Current admin user:', admin ? 'exists' : 'not found');
    
    if (admin) {
      // Hash the password "admin123"
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      // Update the password
      await run(`
        UPDATE admin_users 
        SET password_hash = ?, 
            two_factor_enabled = 0,
            two_factor_mandatory = 1
        WHERE username = 'admin'
      `, [passwordHash]);
      
      console.log('✅ Admin password updated successfully!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   2FA mandatory: true');
    }
    
    // Also try to create user "administrator" in case that's what's expected
    const administrator = await get('SELECT * FROM admin_users WHERE username = ?', ['administrator']);

    if (!administrator) {
      const adminPasswordHash = await bcrypt.hash('demo1234', 10);

      await run(`
        INSERT INTO admin_users (
          id, username, email, password_hash, first_name, last_name, role, status,
          email_verified, two_factor_enabled, two_factor_mandatory
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'admin-administrator-001',
        'administrator',
        'administrator@netsafi.com',
        adminPasswordHash,
        'Administrator',
        'User',
        'super_admin',
        'active',
        1,
        0,
        1
      ]);

      console.log('✅ Administrator user created successfully!');
      console.log('   Username: administrator');
      console.log('   Password: demo1234');
      console.log('   2FA mandatory: true');
    } else {
      console.log('Administrator user already exists');
    }
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  }
}

fixAdminPassword();
