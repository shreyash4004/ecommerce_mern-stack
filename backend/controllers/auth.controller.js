
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js"
const generateTokens=(userId)=>{
 const accessToken=jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET,{
  expiresIn:"15m",
 });
 const refreshToken=jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d",
 })
  return {accessToken, refreshToken};
 }
 const setCookies=(res,accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, { httpOnly: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true });
 }
const storeRefreshToken=async(userId,refreshToken)=>{
  await redis.set(`refresh_token:${userId}`, refreshToken, {
  ex: 60 * 60 * 24 * 7 // 7 days in seconds
});
}
//signup
export const signup = async (req, res) => {
  try {
    const { email, password, name ,role} = req.body;
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password,role });

    // Authenticate before sending response
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User Created Successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


//login
export const login = async (req, res) => {
   try{
      const{email,password} = req.body;
      const user=await User.findOne({ email });
      if(user && await user.comparePassword(password)) {
        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);
        res.json({message: "Login successful",
          _id:user._id,
          name:user.name,
          email:user.email,
          role:user.role,
         });
   }
   else{
     return res.status(401).json({ message: "Invalid credentials" });
   }
  }
   catch(error){
    console.log("Error in login controller"+error.message)
    res.status(500).json({ message: error.message });
   }
    
}

 //logout
export const logout = async (req, res) => {
  try{
    const refreshToken=req.cookies.refreshToken;
    if(refreshToken){
      const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie('accessToken');
     res.clearCookie('refreshToken');
     res.json({message:"Logged out successfully"})
  }
  catch(error){
   res.status(500).json({ message: error.message });
  }
}


//refresh accesstokens

export const refreshToken=async(req,res,next)=>{
try{
  const refreshToken=req.cookies.refreshToken;

  if(!refreshToken){
   return next(new Error("No refresh token provided"));

  }
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  console.log("decoded"+decoded)
  const storedToken=await redis.get(`refresh_token:${decoded.userId}`);
  console.log("storedToken"+storedToken)
  if (storedToken !== refreshToken) {
  return res.status(401).json({ message: "Invalid refresh token" });
}
   const accessToken=jwt.sign({userId:decoded.userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
   res.cookie("accessToken",accessToken, { httpOnly: true, secure: true });
   res.json({message: "Access token refreshed successfully", accessToken });
}
catch(error){
  res.json({message: error.message });
}
}


//profile
export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
