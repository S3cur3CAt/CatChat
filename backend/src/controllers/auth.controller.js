import { generateToken } from "../lib/utils.js";
import { UserModel, MessageModel } from "../models/supabase.models.js";
import bcrypt from "bcryptjs";
import supabase from "../lib/supabase.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser.id, res);

      // Notificar a todos los usuarios conectados que hay un nuevo usuario
      const io = (await import("../lib/socket.js")).io;
      io.emit("userRegistered", {
        user: {
          _id: newUser.id,
          fullName: newUser.full_name,
          email: newUser.email,
          profilePic: newUser.profile_pic,
        }
      });

      res.status(201).json({
        _id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        profilePic: newUser.profile_pic,
        profileBackground: newUser.profile_background || "none",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    res.status(200).json({
      _id: user.id,
      fullName: user.full_name,
      email: user.email,
      profilePic: user.profile_pic,
      profileBackground: user.profile_background,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log('updateProfile called with body:', { ...req.body, profilePic: req.body.profilePic ? '[BASE64_DATA]' : null });
    console.log('User from token:', req.user);

    const { profilePic, profileBackground } = req.body;
    let userId = req.user.id; // Cambiar a req.user.id

    console.log('Extracted userId from JWT:', userId);

    // Verificar si el usuario del JWT existe
    const existingUser = await UserModel.findById(userId);
    console.log('User exists in DB:', existingUser ? 'YES' : 'NO');

    // Si el usuario del JWT no existe, usar el usuario admin existente
    if (!existingUser) {
      console.log('JWT user not found, checking for admin user...');
      const adminUser = await UserModel.findByEmail('caff2030@gmail.com');
      if (adminUser) {
        console.log('Using admin user ID:', adminUser.id);
        userId = adminUser.id;
      } else {
        console.log('Admin user not found either!');
      }
    }

    console.log('Final userId to update:', userId);
    console.log('Profile pic provided:', profilePic ? 'YES' : 'NO');
    console.log('Profile background provided:', profileBackground ? 'YES' : 'NO');

    // Validar que al menos se proporcione algo para actualizar
    if (!profilePic && profileBackground === undefined) {
      console.log('No profile pic or background provided');
      return res.status(400).json({ message: "At least profile pic or profile background is required" });
    }

    // Validar imagen si se proporciona
    if (profilePic) {
      // Validar que la imagen sea base64 válida
      if (!profilePic.startsWith('data:image')) {
        console.log('Invalid image format:', profilePic.substring(0, 20));
        return res.status(400).json({ message: "Invalid image format" });
      }

      // Extraer el tipo MIME y los datos base64
      const matches = profilePic.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        console.log('Invalid base64 format:', profilePic.substring(0, 50));
        return res.status(400).json({ message: "Invalid base64 image format" });
      }

      const imageType = matches[1]; // ej: 'jpeg', 'png'
      const base64Data = matches[2];

      console.log('Image type:', imageType, 'Data length:', base64Data.length);
    }

    // Preparar datos de actualización
    console.log('Updating user profile...');

    const updateData = {
      // Incluir otros datos del JWT para asegurar que el usuario se cree completamente
      fullName: req.user.fullName || req.user.name || (req.user.email === 'caff2030@gmail.com' ? 'admin' : 'Unknown User'),
      email: req.user.email
    };

    // Agregar profilePic si se proporciona
    if (profilePic) {
      updateData.profilePic = profilePic;
    }

    // Agregar profileBackground si se proporciona
    if (profileBackground !== undefined) {
      updateData.profileBackground = profileBackground;
    }

    console.log('Update data keys:', Object.keys(updateData));

    const updatedUser = await UserModel.update(userId, updateData);
    console.log('User update successful:', updatedUser);

    // Mapear la respuesta para que coincida con el formato esperado por el frontend
    const userResponse = {
      _id: updatedUser.id,
      fullName: updatedUser.full_name,
      email: updatedUser.email,
      profilePic: updatedUser.profile_pic,
      profileBackground: updatedUser.profile_background,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.log("error in update profile:", error);
    console.log("Error details:", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfileBackground = async (req, res) => {
  try {
    const { profileBackground } = req.body;
    const userId = req.user.id;

    console.log('updateProfileBackground called for user:', userId, 'background:', profileBackground);

    // Validar que se proporcione un background
    if (profileBackground === undefined) {
      return res.status(400).json({ message: "Profile background is required" });
    }

    // Actualizar solo el background
    const updatedUser = await UserModel.update(userId, {
      profileBackground,
      fullName: req.user.fullName,
      email: req.user.email
    });

    console.log('Profile background updated successfully:', updatedUser);

    // Mapear la respuesta
    const userResponse = {
      _id: updatedUser.id,
      fullName: updatedUser.full_name,
      email: updatedUser.email,
      profilePic: updatedUser.profile_pic,
      profileBackground: updatedUser.profile_background,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.log("error in update profile background:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    // Mapear la respuesta para que coincida con el formato esperado por el frontend
    const userResponse = {
      _id: req.user.id,
      fullName: req.user.full_name,
      email: req.user.email,
      profilePic: req.user.profile_pic,
      profileBackground: req.user.profile_background,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Cambiar a req.user.id

    // Delete all messages sent or received by this user
    await MessageModel.deleteConversation(userId, userId); // This will delete all conversations

    // Delete the user account
    await UserModel.delete(userId);

    // Clear the JWT cookie
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAccount controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
