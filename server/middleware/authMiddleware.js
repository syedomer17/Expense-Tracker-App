import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";

const jwtSecret = env.JWT_SECRET;

const generateAccessToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: "1d" });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: "7d" });
};

export const protect = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // ✅ Try verifying access token first
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, jwtSecret);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(404).json({ message: "User not found" });
        return next();
      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          res.clearCookie("accessToken");
          res.clearCookie("refreshToken");
          return res.status(401).json({ message: "Unauthorized: Invalid access token" });
        }
        // if expired, try refresh
      }
    }

    // ✅ If access expired, try refresh token
    if (refreshToken) {
      try {
        const decodedRefresh = jwt.verify(refreshToken, jwtSecret);

        // Issue new tokens
        const newAccessToken = generateAccessToken(decodedRefresh.id);
        const newRefreshToken = generateRefreshToken(decodedRefresh.id); // rotate refresh token too

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        req.user = await User.findById(decodedRefresh.id).select("-password");
        if (!req.user) return res.status(404).json({ message: "User not found" });

        return next();
      } catch (err) {
        // Refresh token expired/invalid → logout
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(401).json({ message: "Session expired. Please login again." });
      }
    }

    return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Protect middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
