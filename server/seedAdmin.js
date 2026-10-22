import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

// Parse CLI arguments if provided: e.g. node seedAdmin.js --email admin@domain.com --password "SecureAdmin123!" --name "Lead Admin"
const args = process.argv.slice(2);
let cliEmail = '', cliPassword = '', cliName = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--email' && args[i + 1]) cliEmail = args[++i];
  else if (args[i].startsWith('--email=')) cliEmail = args[i].split('=')[1];
  else if (args[i] === '--password' && args[i + 1]) cliPassword = args[++i];
  else if (args[i].startsWith('--password=')) cliPassword = args[i].split('=')[1];
  else if (args[i] === '--name' && args[i + 1]) cliName = args[++i];
  else if (args[i].startsWith('--name=')) cliName = args[i].split('=')[1];
}

const email = (cliEmail || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const password = cliPassword || process.env.ADMIN_INITIAL_PASSWORD || '';
const name = cliName || process.env.ADMIN_NAME || 'Security Administrator';

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Error: Provide a valid administrator email address via ADMIN_EMAIL in server/.env or --email <email>');
  process.exit(1);
}

if (!password || password.length < 8) {
  console.error('Error: Administrator password must be at least 8 characters long via ADMIN_INITIAL_PASSWORD in server/.env or --password <password>');
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/netsentinel';

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected to MongoDB at ${mongoUri}`);

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.active = true;
    await existing.save();
    console.log(`\nAdministrator account successfully UPDATED:`);
    console.log(`  Name:  ${existing.name}`);
    console.log(`  Email: ${existing.email}`);
    console.log(`  Role:  ${existing.role}`);
    console.log(`\nYou can now log in at: http://localhost:5173/admin/login`);
  } else {
    const created = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      active: true
    });
    console.log(`\nAdministrator account successfully CREATED:`);
    console.log(`  Name:  ${created.name}`);
    console.log(`  Email: ${created.email}`);
    console.log(`  Role:  ${created.role}`);
    console.log(`\nYou can now log in at: http://localhost:5173/admin/login`);
  }
} catch (err) {
  console.error('Failed to seed administrator account:', err.message);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}

