import Coupon from "../models/coupon.model.js"

export const getCoupon=async(req,res,next)=>{
try {
    const coupon=await Coupon.findOne({userId:req.user._id,isActive:true});
    res.json(coupon || null)

} catch (error) {
    console.log("Error in getCoupon:",error.message)
    res.status(500).json({ message: "Internal Server Error",error:error.message })
}
}

export const validateCoupon=async(req,res,next)=>{
    try {
        const {code}=req.body;
        const coupon=await Coupon.findOne({code:code,userId:req.user._id,isActive:true})

        if(!coupon){
            return res.json({ message: "Coupon not found or inactive" })
        }

        if(coupon.expireDate<new Date()) {
            coupon.isActive=false;
            await coupon.save();
            return res.json({ message: "Coupon has expired" });
        }
        res.json({
            message:"Coupon is valid",
            code:coupon.code,
            discountPercentage:coupon.discountPercentage  
        })
    } catch (error) {
        console.log("Error in validateCoupon:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

}