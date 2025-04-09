// scripts/create-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const { hash } = require('bcrypt');

// Check for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set.');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'apostolicdominionglobal@gmail.com';
const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'Adn2025@';

if (password === 'admin123') {
  console.warn('\nWARNING: Using default password. This is not secure for production.\n');
}

// Define User schema similar to your application's User model
const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true,
    enum: ['Admin', 'Pastor', 'ClusterLead', 'SmallGroupLead', 'PublicityLead', 'MediaLead', 'TechnicalLead', 'Member']
  },
  permissions: [{ 
    type: String 
  }],
  lastLogin: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await hash(this.passwordHash, 10);
  }
  next();
});

// Connect to database
async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Check if model exists or create it
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if an Admin user already exists
    const existingAdmin = await User.findOne({ role: 'Admin' });

    if (existingAdmin) {
      console.log(`Admin user already exists with email: ${existingAdmin.email}`);
      console.log('If you need to create a new admin user, please remove the existing one first.');
    } else {
      // Create new admin user
      const admin = new User({
        email,
        passwordHash: password, // Will be hashed by pre-save hook
        role: 'Admin',
        permissions: ['*'] // All permissions
      });

      await admin.save();
      
      console.log('\n======================================================');
      console.log('Admin user created successfully!');
      console.log('======================================================');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Role: Admin');
      console.log('======================================================\n');
      console.log('Please login using these credentials and change the password immediately.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 11000) {
      console.error('A user with this email already exists but has a different role.');
    }
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

main();