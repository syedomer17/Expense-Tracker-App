import dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const envSchema = z.object({
  PORT: z
    .string()
    .default("8000")
    .refine((val) => !isNaN(Number(val)), { message: "PORT must be a number" }),

  MONGO_URL: z
    .string()
    .refine(
      (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
      { message: "MONGO_URL must be a valid MongoDB connection string" }
    ),

  JWT_SECRET: z
    .string()
    .min(32, { message: "JWT_SECRET must be at least 32 characters long" }),

  CLIENT_URL: z.string().url({ message: "CLIENT_URL must be a valid URL" }),

  EMAIL_USER: z.string().email({ message: "EMAIL_USER must be a valid email" }),

  EMAIL_PASSWORD: z
    .string()
    .min(8, { message: "EMAIL_PASSWORD must be at least 8 characters" }),

  BACKEND_URL: z
    .string()
    .url({ message: "BACKEND_URL must be a valid URL" })
    .optional(),
});

const env = envSchema.parse(process.env);

export default env;
