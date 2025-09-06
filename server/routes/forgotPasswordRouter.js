import express from "express";
import {
  request_otp,
  verify_otp,
  reset_password,
} from "../controllers/forgotPasswordController.js";

const router = express.Router();

router.post("/request-otp", request_otp);
router.post("/verify-otp", verify_otp);
router.post("/reset-password", reset_password);

export default router;
