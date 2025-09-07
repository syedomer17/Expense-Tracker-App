import env from './config/env.js';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';   

import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import incomeRoutes from './routes/incomeRoute.js';
import expenseRoutes from './routes/expenseRoute.js';
import dashboardRoutes from './routes/dashboardRoute.js';
import forgotPasswordRoutes from './routes/forgotPasswordRouter.js';

const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);        

const app = express();

//Middleware to handle cors
app.use(
    cors({
        origin: process.env.CLIENT_URL || '*',
        methods: ["GET","POST","PUT","DELETE"],
        allowedHeaders:['Content-Type', "Authorization"],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/forgot-password", forgotPasswordRoutes);

// server uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = env.PORT || 8000;

// Ensure critical envs are present before starting the server
if (!env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not configured. Set it in your .env.');
    process.exit(1);
}
if (!env.MONGO_URL) {
    console.error('FATAL: MONGO_URL is not configured. Set it in your .env.');
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
