import express from "express";
import { signup, login, logout, updateProfile, checkAuth, deleteAccount, updateProfileBackground } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working!" });
});

router.get("/test-user", async (req, res) => {
  try {
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash('password123', salt);
    
    const { UserModel } = await import('../models/supabase.models.js');
    const newUser = await UserModel.create({
      fullName: 'Test Endpoint User',
      email: 'endpoint' + Date.now() + '@test.com',
      password: hashedPassword,
    });
    
    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error in test-user endpoint:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

router.post("/signup-test", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    console.log('Signup test:', { fullName, email, password: '***' });
    
    // Check if user already exists
    const { UserModel } = await import('../models/supabase.models.js');
    const existingUser = await UserModel.findByEmail(email);
    console.log('Existing user check result:', existingUser);
    
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash(password, salt);

    const newUser = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
    });
    console.log('User created:', newUser);

    // Don't generate token, just return success
    res.status(201).json({
      _id: newUser.id,
      fullName: newUser.full_name,
      email: newUser.email,
      profilePic: newUser.profile_pic,
    });
  } catch (error) {
    console.error('Error in signup-test:', error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-profile-background", protectRoute, updateProfileBackground);
router.get("/check", protectRoute, checkAuth);
router.delete("/delete-account", protectRoute, deleteAccount);

export default router;
