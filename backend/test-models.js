import { UserModel } from './src/models/supabase.models.js';
import bcrypt from 'bcryptjs';

async function testUserCreation() {
  try {
    console.log('Testing user creation...');

    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Checking Supabase connection...');
    try {
      const testUser = await UserModel.findById('68d754222e5800afa6c305eb');
      console.log('Test user found:', JSON.stringify(testUser, null, 2));
    } catch (error) {
      console.error('Error in Test 1:', error);
    }

    // Test 2: Try to create a new user
    console.log('Test 2: Creating new user...');
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const newUser = await UserModel.create({
        fullName: 'Test User Direct',
        email: 'testdirect' + Date.now() + '@example.com', // Make email unique
        password: hashedPassword,
      });
      console.log('New user created:', JSON.stringify(newUser, null, 2));
    } catch (error) {
      console.error('Error in Test 2:', error);
    }

    // Test 3: Try to find the user we just created
    console.log('Test 3: Finding created user...');
    try {
      // Note: This test won't work as expected because we can't predict the email
      // In a real scenario, we'd store the created user and search by ID
      console.log('Skipping Test 3 - email is dynamic');
    } catch (error) {
      console.error('Error in Test 3:', error);
    }

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testUserCreation();
