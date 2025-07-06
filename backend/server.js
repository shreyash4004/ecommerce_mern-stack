import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cartRoutes from './routes/cart.route.js';

dotenv.config();

const app = express(); //app initialized first
const PORT = process.env.PORT || 5000;

app.use(cors()); // safe now
app.use(express.json());
app.use(cookieParser());  // JSON parser first
app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
  });
});
