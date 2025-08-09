#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'netsafi.db');

async function createTestAdmin() {
  console.log('Creating test admin user with proper password...');

  const db = new sqlite3.Database(dbPath);

  try {
    // Hash the password "admin123"
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Update the default admin user with proper password hash
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE admin_users 
        SET password_hash = ?, 
            two_factor_enabled = FALSE,
            two_factor_mandatory = TRUE
        WHERE username = 'admin'
      `, [passwordHash], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Default admin user updated successfully!');
          console.log('   Username: admin');
          console.log('   Password: admin123');
          console.log('   2FA: Enabled (mandatory)');
          resolve();
        }
      });
    });

    // Create a test reseller user
    const resellerPasswordHash = await bcrypt.hash('reseller123', 10);
    const resellerId = 'reseller-test-001';

    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO resellers (
          id, business_name, contact_name, email, phone, password_hash,
          tier, status, verification_status, address, city, country,
          two_factor_enabled, two_factor_mandatory
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        resellerId,
        'Test Reseller Business',
        'John Doe',
        'reseller@test.com',
        '+1234567890',
        resellerPasswordHash,
        'silver',
        'active',
        'verified',
        '123 Business St',
        'Tech City',
        'US',
        false,
        true
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Test reseller user created successfully!');
          console.log('   Email: reseller@test.com');
          console.log('   Password: reseller123');
          console.log('   2FA: Enabled (mandatory)');
          resolve();
        }
      });
    });

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    db.close();
  }
}

createTestAdmin();
