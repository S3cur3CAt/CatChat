import jwt from "jsonwebtoken";
import { UserModel } from "../models/supabase.models.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    let user = await UserModel.findById(decoded.userId);

    // Si no se encuentra el usuario por ID, intentar encontrar el usuario admin
    // Esto es una solución temporal para desarrollo
    if (!user) {
      console.log('User not found by ID, trying to find admin user...');
      user = await UserModel.findByEmail('caff2030@gmail.com');
      if (user) {
        console.log('Using admin user for authentication');
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
