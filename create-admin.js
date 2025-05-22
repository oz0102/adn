// // // scripts/create-admin.js

// // require('dotenv').config();
// // const mongoose = require('mongoose');
// // const { hash } = require('bcrypt');

// // // Check for MongoDB URI
// // const MONGODB_URI = process.env.MONGODB_URI;
// // if (!MONGODB_URI) {
// //   console.error('MONGODB_URI environment variable is not set.');
// //   process.exit(1);
// // }

// // // Parse command line arguments
// // const args = process.argv.slice(2);
// // const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'hi@adnglobal.org';
// // const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'Adn2025@';
// // const force = args.includes('--force');

// // if (password === 'Adn2025@') {
// //   console.warn('\nWARNING: Using default password. This is not secure for production.\n');
// // }

// // // Define User schema similar to your application's User model
// // const UserSchema = new mongoose.Schema({
// //   email: { 
// //     type: String, 
// //     required: true, 
// //     unique: true,
// //     trim: true,
// //     lowercase: true
// //   },
// //   passwordHash: { 
// //     type: String, 
// //     required: true 
// //   },
// //   role: { 
// //     type: String, 
// //     required: true,
// //     enum: ['Admin', 'Pastor', 'ClusterLead', 'SmallGroupLead', 'PublicityLead', 'MediaLead', 'TechnicalLead', 'Member']
// //   },
// //   permissions: [{ 
// //     type: String 
// //   }],
// //   lastLogin: { 
// //     type: Date 
// //   }
// // }, { 
// //   timestamps: true 
// // });

// // // Pre-save hook to hash password
// // UserSchema.pre('save', async function(next) {
// //   if (this.isModified('passwordHash')) {
// //     this.passwordHash = await hash(this.passwordHash, 10);
// //   }
// //   next();
// // });

// // // Connect to database
// // async function main() {
// //   try {
// //     console.log('Connecting to MongoDB...');
// //     await mongoose.connect(MONGODB_URI);
// //     console.log('Connected to MongoDB successfully');

// //     // Check if model exists or create it
// //     const User = mongoose.models.User || mongoose.model('User', UserSchema);

// //     // Check if a user with this email already exists
// //     const existingUser = await User.findOne({ email });

// //     if (existingUser) {
// //       console.log(`A user with email ${email} already exists with role: ${existingUser.role}`);
      
// //       if (force) {
// //         console.log('Updating existing user to Admin role...');
// //         existingUser.role = 'Admin';
// //         existingUser.permissions = ['*'];
        
// //         if (args.find(arg => arg.startsWith('--password='))) {
// //           existingUser.passwordHash = password;
// //         }
        
// //         await existingUser.save();
        
// //         console.log('\n======================================================');
// //         console.log('User updated to Admin successfully!');
// //         console.log('======================================================');
// //         console.log('Email:', email);
// //         if (args.find(arg => arg.startsWith('--password='))) {
// //           console.log('Password:', password);
// //         } else {
// //           console.log('Password: [unchanged]');
// //         }
// //         console.log('Role: Admin');
// //         console.log('======================================================\n');
// //       } else {
// //         console.log('Use --force to update this user to Admin role');
// //       }
// //     } else {
// //       // Create new admin user
// //       const admin = new User({
// //         email,
// //         passwordHash: password, // Will be hashed by pre-save hook
// //         role: 'Admin',
// //         permissions: ['*'] // All permissions
// //       });

// //       await admin.save();
      
// //       console.log('\n======================================================');
// //       console.log('Admin user created successfully!');
// //       console.log('======================================================');
// //       console.log('Email:', email);
// //       console.log('Password:', password);
// //       console.log('Role: Admin');
// //       console.log('======================================================\n');
// //       console.log('Please login using these credentials and change the password immediately.');
// //     }
// //   } catch (error) {
// //     console.error('Error:', error.message);
// //     if (error.code === 11000) {
// //       console.error('A user with this email already exists but has a different role.');
// //     }
// //   } finally {
// //     // Close the database connection
// //     await mongoose.disconnect();
// //     console.log('Disconnected from MongoDB');
// //     process.exit(0);
// //   }
// // }

// // main();

// // Run this script directly:
// // node create-admin.js --email=admin@example.com --password=Password123 --force

// require('dotenv').config();
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // Check for MongoDB URI
// const MONGODB_URI = process.env.MONGODB_URI;
// if (!MONGODB_URI) {
//   console.error('MONGODB_URI environment variable is not set.');
//   process.exit(1);
// }

// // Parse command line arguments
// const args = process.argv.slice(2);
// const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'admin@test.com';
// const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'Password123';
// const force = args.includes('--force');

// // Connect to database
// mongoose.connect(MONGODB_URI)
//   .then(async () => {
//     console.log('Connected to MongoDB successfully');
    
//     // Define a simple user schema
//     const UserSchema = new mongoose.Schema({
//       email: String,
//       passwordHash: String,
//       role: String,
//       permissions: [String],
//       lastLogin: Date
//     }, { timestamps: true });
    
//     // Create the model
//     const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
//     // Check if user exists
//     const existingUser = await User.findOne({ email });
    
//     if (existingUser) {
//       console.log(`User with email ${email} already exists. Updating password...`);
      
//       // Hash the password manually to ensure it's done correctly
//       const saltRounds = 10;
//       const hash = await bcrypt.hash(password, saltRounds);
      
//       // Update user with new password hash
//       existingUser.passwordHash = hash;
//       await existingUser.save();
      
//       console.log('User password updated successfully!');
//     } else {
//       // Create new user with hashed password
//       const saltRounds = 10;
//       const hash = await bcrypt.hash(password, saltRounds);
      
//       const newUser = new User({
//         email,
//         passwordHash: hash,
//         role: 'Admin',
//         permissions: ['*']
//       });
      
//       await newUser.save();
//       console.log('New admin user created successfully!');
//     }
    
//     console.log('Email:', email);
//     console.log('Password:', password);
//     console.log('Role: Admin');
    
//     // Close the connection
//     await mongoose.disconnect();
//     console.log('Disconnected from MongoDB');
//   })
//   .catch(err => {
//     console.error('Error:', err);
//     process.exit(1);
//   });

//create-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Used for the pre-save hook if model is defined in this script

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
// const force = args.includes('--force'); // --force argument is parsed but not currently used in the script's logic

// Connect to database
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');

    let User;
    // Attempt to use the existing User model if it's already registered
    // This would typically be the model defined in User.ts if the app has initialized it
    if (mongoose.models.User) {
      User = mongoose.model('User');
      console.log('Using existing User model from mongoose.models.User.');
    } else {
      // Define a User model compatible with User.ts as a fallback
      // This is useful if the script is run standalone before the main app initializes models
      console.log('User model not found in mongoose.models. Defining a compatible User model for this script.');

      const AssignedRoleSchemaInternal = new mongoose.Schema({
        role: {
          type: String,
          required: true,
          // Enum values should match those in your User.ts IAssignedRole definition
          enum: ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER", "MEMBER_ADMIN", "REGULAR_MEMBER"]
        },
        centerId: { type: mongoose.Schema.Types.ObjectId, ref: "Center" },
        clusterId: { type: mongoose.Schema.Types.ObjectId, ref: "Cluster" },
        smallGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "SmallGroup" }
      }, { _id: false });

      const UserSchemaInternal = new mongoose.Schema(
        {
          email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
          },
          passwordHash: { // This field will store the hashed password
            type: String,
            required: true
          },
          assignedRoles: [{ type: AssignedRoleSchemaInternal, default: [] }],
          lastLogin: {
            type: Date
          }
        },
        {
          timestamps: true // Adds createdAt and updatedAt timestamps
        }
      );

      // Pre-save hook to hash password, mirroring the logic in User.ts
      // This ensures password gets hashed if this script defines the model
      UserSchemaInternal.pre("save", async function(next) {
        // 'this' refers to the document being saved
        if (this.isModified("passwordHash")) {
          try {
            // The value of this.passwordHash is temporarily the plain password here.
            // It will be replaced by its hash.
            this.passwordHash = await bcrypt.hash(String(this.passwordHash), 10);
          } catch (error) {
            // Pass any bcrypt error to the Mongoose save operation
            return next(error);
          }
        }
        next();
      });

      User = mongoose.model('User', UserSchemaInternal);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User with email ${email} already exists. Updating password and ensuring HQ_ADMIN role...`);

      // Set plain password; pre-save hook (from User.ts or this script's fallback) will hash it.
      existingUser.passwordHash = password;
      // Set/overwrite assignedRoles to make this user an HQ_ADMIN
      existingUser.assignedRoles = [{ role: 'HQ_ADMIN' }];
      // Any other fields like centerId, clusterId, smallGroupId default to undefined for HQ_ADMIN if not specified.

      // Mongoose's `isModified` check in the pre-save hook will detect the change to passwordHash
      // (since plain password will differ from a stored hash, or from an old plain password if that was the case).
      await existingUser.save();
      console.log('User password updated and role set to HQ_ADMIN successfully!');
    } else {
      // Create new user
      const newUser = new User({
        email,
        passwordHash: password, // Set plain password; pre-save hook will hash it.
        assignedRoles: [{ role: 'HQ_ADMIN' }]
      });

      await newUser.save();
      console.log('New HQ_ADMIN user created successfully!');
    }

    console.log('\n--- Admin User Details ---');
    console.log('Email:', email);
    console.log('Password (as provided to script):', password); // This is the input password, not the stored hash
    console.log('Assigned Role: HQ_ADMIN');
    console.log('--------------------------');

    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('Error during script execution:', err);
    // Attempt to close the connection if it was opened, then exit
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) { // 1: connected, 2: connecting
      mongoose.disconnect()
        .catch(disconnectErr => console.error('Error disconnecting MongoDB after script error:', disconnectErr))
        .finally(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });