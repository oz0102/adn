// // scripts/create-admin.js

// require('dotenv').config();
// const mongoose = require('mongoose');
// const { hash } = require('bcrypt');

// // Check for MongoDB URI
// const MONGODB_URI = process.env.MONGODB_URI;
// if (!MONGODB_URI) {
//   console.error('MONGODB_URI environment variable is not set.');
//   process.exit(1);
// }

// // Parse command line arguments
// const args = process.argv.slice(2);
// const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'hi@adnglobal.org';
// const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'Adn2025@';
// const force = args.includes('--force');

// if (password === 'Adn2025@') {
//   console.warn('\nWARNING: Using default password. This is not secure for production.\n');
// }

// // Define User schema similar to your application's User model
// const UserSchema = new mongoose.Schema({
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true,
//     trim: true,
//     lowercase: true
//   },
//   passwordHash: { 
//     type: String, 
//     required: true 
//   },
//   role: { 
//     type: String, 
//     required: true,
//     enum: ['Admin', 'Pastor', 'ClusterLead', 'SmallGroupLead', 'PublicityLead', 'MediaLead', 'TechnicalLead', 'Member']
//   },
//   permissions: [{ 
//     type: String 
//   }],
//   lastLogin: { 
//     type: Date 
//   }
// }, { 
//   timestamps: true 
// });

// // Pre-save hook to hash password
// UserSchema.pre('save', async function(next) {
//   if (this.isModified('passwordHash')) {
//     this.passwordHash = await hash(this.passwordHash, 10);
//   }
//   next();
// });

// // Connect to database
// async function main() {
//   try {
//     console.log('Connecting to MongoDB...');
//     await mongoose.connect(MONGODB_URI);
//     console.log('Connected to MongoDB successfully');

//     // Check if model exists or create it
//     const User = mongoose.models.User || mongoose.model('User', UserSchema);

//     // Check if a user with this email already exists
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       console.log(`A user with email ${email} already exists with role: ${existingUser.role}`);
      
//       if (force) {
//         console.log('Updating existing user to Admin role...');
//         existingUser.role = 'Admin';
//         existingUser.permissions = ['*'];
        
//         if (args.find(arg => arg.startsWith('--password='))) {
//           existingUser.passwordHash = password;
//         }
        
//         await existingUser.save();
        
//         console.log('\n======================================================');
//         console.log('User updated to Admin successfully!');
//         console.log('======================================================');
//         console.log('Email:', email);
//         if (args.find(arg => arg.startsWith('--password='))) {
//           console.log('Password:', password);
//         } else {
//           console.log('Password: [unchanged]');
//         }
//         console.log('Role: Admin');
//         console.log('======================================================\n');
//       } else {
//         console.log('Use --force to update this user to Admin role');
//       }
//     } else {
//       // Create new admin user
//       const admin = new User({
//         email,
//         passwordHash: password, // Will be hashed by pre-save hook
//         role: 'Admin',
//         permissions: ['*'] // All permissions
//       });

//       await admin.save();
      
//       console.log('\n======================================================');
//       console.log('Admin user created successfully!');
//       console.log('======================================================');
//       console.log('Email:', email);
//       console.log('Password:', password);
//       console.log('Role: Admin');
//       console.log('======================================================\n');
//       console.log('Please login using these credentials and change the password immediately.');
//     }
//   } catch (error) {
//     console.error('Error:', error.message);
//     if (error.code === 11000) {
//       console.error('A user with this email already exists but has a different role.');
//     }
//   } finally {
//     // Close the database connection
//     await mongoose.disconnect();
//     console.log('Disconnected from MongoDB');
//     process.exit(0);
//   }
// }

// main();

// Run this script directly:
// node create-admin.js --email=admin@example.com --password=Password123 --force

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Check for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set.');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'admin@test.com';
const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'Password123';
const force = args.includes('--force');

// Connect to database
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Define a simple user schema
    const UserSchema = new mongoose.Schema({
      email: String,
      passwordHash: String,
      role: String,
      permissions: [String],
      lastLogin: Date
    }, { timestamps: true });
    
    // Create the model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`User with email ${email} already exists. Updating password...`);
      
      // Hash the password manually to ensure it's done correctly
      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      
      // Update user with new password hash
      existingUser.passwordHash = hash;
      await existingUser.save();
      
      console.log('User password updated successfully!');
    } else {
      // Create new user with hashed password
      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      
      const newUser = new User({
        email,
        passwordHash: hash,
        role: 'Admin',
        permissions: ['*']
      });
      
      await newUser.save();
      console.log('New admin user created successfully!');
    }
    
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: Admin');
    
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });