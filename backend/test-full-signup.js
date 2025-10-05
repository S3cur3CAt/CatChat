// Script independiente para probar el registro completo
import { UserModel } from './src/models/supabase.models.js';
import { generateToken } from './src/lib/utils.js';
import bcrypt from 'bcryptjs';

async function testFullSignup() {
  try {
    console.log('=== TESTING FULL SIGNUP PROCESS ===');

    const email = 'fulltest' + Date.now() + '@example.com';
    const password = 'password123';
    const fullName = 'Full Test User';

    console.log('1. Checking if user already exists...');
    const existingUser = await UserModel.findByEmail(email);
    console.log('Existing user check result:', existingUser);

    if (existingUser) {
      console.log('User already exists, skipping creation');
      return;
    }

    console.log('2. Hashing password...');
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated:', salt ? 'OK' : 'NULL');
    
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed, length:', hashedPassword ? hashedPassword.length : 'NULL');
    console.log('Password hashed successfully');

    console.log('3. Creating user...');
    const userData = {
      fullName,
      email,
      password: hashedPassword,
    };
    console.log('User data to create:', {
      ...userData,
      password: '***'
    });

    const newUser = await UserModel.create(userData);
    console.log('4. User created successfully:', JSON.stringify(newUser, null, 2));

    console.log('5. Testing findById...');
    const foundUser = await UserModel.findById(newUser.id);
    console.log('User found by ID:', JSON.stringify(foundUser, null, 2));

    console.log('6. Testing JWT generation...');
    // Mock response object for JWT testing
    const mockRes = {
      cookie: (name, value, options) => {
        console.log('Cookie set:', { name, value: value.substring(0, 20) + '...', options });
        return mockRes;
      }
    };

    const token = generateToken(newUser.id, mockRes);
    console.log('JWT token generated successfully, length:', token.length);

    console.log('✅ FULL SIGNUP TEST COMPLETED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ ERROR IN FULL SIGNUP TEST:', error);
    console.error('Stack trace:', error.stack);
  }
}

testFullSignup();
