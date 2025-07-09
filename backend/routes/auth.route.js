
import express  from 'express' ;
const router=express.Router();
import {signup, login,logout,refreshToken,getProfile} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/refresh-token",refreshToken)
router.get("/profile", protectRoute, getProfile);
router.get('/test', (req, res) => {
  res.json({ message: "API is alive 🚀" });
});
export default router;