const User=require("../../Schema/User")
const jwt=require("jsonwebtoken")
exports.getUserRole=async(req,res)=>{
    try{
        const email=req.user.email
        const user=await User.findOne({email}).populate({path:"role",select:"name"})
          if(user){
            const token=jwt.sign({email,rolename:user.role.name,userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
            return res.status(200).json({token})
          }
          else{
            return res.status(400).json({message:"User not found"})
          }
    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
}