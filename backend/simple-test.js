// Test simple de creación de usuario
import { UserModel } from './src/models/supabase.models.js';
import bcrypt from 'bcryptjs';

async function simpleTest() {
  try {
    console.log('Testing simple user creation...');

    const email = 'simple' + Date.now() + '@test.com';
    const hashedPassword = await bcrypt.hash('password123', await bcrypt.genSalt(10));

    console.log('Creating user...');
    const result = await UserModel.create({
      fullName: 'Simple Test',
      email: email,
      password: hashedPassword,
    });

    console.log('SUCCESS! User created:', result.id);

  } catch (error) {
    console.error('FAILED:', error.message);
    console.error('Code:', error.code);
  }
}

simpleTest();
