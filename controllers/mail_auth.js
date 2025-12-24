const sendEmail =require("../utils/sendEmail")
const Otpgen=require("../otpgenerate/otpgen")
const User=require("../Schema/User")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const Role=require("../Schema/Role")
const otpstore={}
const { authenticator } = require("otplib");
const generateOtp=()=>{
    return Math.floor(10000+Math.random()*900000)
}
    exports.
    sendOtp=async(req,res)=>{
        const {email}=req.body
        if(!email)
        {
            return res.status(400).json({message:"email is required"})
        }
        const hasEmail=await User.findOne({email})
        if(hasEmail){
            return res.status(400).json({message:"Email already registered"})
        }

        const otp=generateOtp()
        const expiry=Date.now()+2*60*1000;

        otpstore[email]={otp,expiry}

        try {
  await sendEmail(`Your OTP code is: ${otp}`, email); // <- must await
  res.json({ message: "OTP sent to email" });
} catch (error) {
  res.status(500).json({ message: "Failed to send OTP", error: error.message });
}

    }

    exports.verifyOtp=async(req,res)=>{
        const{email,otp}=req.body

        if(!email||!otp)
        {
            return res.status(400).json({message:"Email and otp required"})
        }

        const record=otpstore[email]
        if(!record){
            return res.status(400).json({message:"No OTp send to this email"})
        }
        if(Date.now()>record.expiry){
            delete otpstore[email]
            return res.status(400).json({message:"OTP expired"})

        }

        if(parseInt(otp)!==record.otp){
            res.status(400).json({message:"Inavalid OTP"})
        }
        delete otpstore[email]
        res.json({message:"Email verified suceesfullly"})
    }

    
    
    exports.sendDetails=async(req,res)=>{
        try{
        const{firstname,lastname,email,password}=req.body;
        

        if(!firstname||!lastname||!email){
            return res.status(400).json({message:"details are required"})
        }
        const existingUser=await User.findOne({email})
        if(existingUser){
           return res.status(400).json({message:"email already registered"})
        }
        const rounds=12
        const hashedpass=await bcrypt.hash(password,rounds)
           const {secret,qr}=await Otpgen(email)
         
        const defaultUser=await Role.findOne({name:"user"})
           const newUser= new User({firstname,lastname,email,password:hashedpass,secret,role:defaultUser._id})
            await newUser.save()
            res.status(201).json({qr,message:"User created successfully!!"})
    }catch(error){
        return res.status(500).json({message:error.message})
    }
    }

    exports.verifyUser=async(req,res)=>{
        try{
            const{email,password}=req.body
            if(!email||!password){
                return res.status(400).json({message:"details are required"})
            }
            const hasEmail=await User.findOne({email}).select("+password")
            if (hasEmail){
                const validPass=await bcrypt.compare(password,hasEmail.password)
                if(validPass)
                {
                    return res.status(200).json({message:"Login successfull"})
                }
                else{
                    return res.status(400).json({message:"Wrong Credentials"})
                }
            }
            else{
                res.status(400).json({message:"Register now "})
            }
        }
        catch(error){
            return res.status(500).json({message:"error in login"})
        }

    }


    exports.verifyUserOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required for authentication" });
    }
    

const user = await User.findOne({ email })
  .select("+secret role")
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const isValid = authenticator.check(otp, user.secret,{window:1});
   
  if (isValid) {
      const token=jwt.sign({email,},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
       return res.status(200).json({token})
    
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.authmiddleware= (req,res,next)=>{
    try{
        const authHeader=req.headers.authorization
        if(!authHeader){
            return res.status(400).json({message:"NO token"})
        }else{
            const token=authHeader.split(" ")[1]
            const decoder=jwt.verify(token,process.env.JWT_SECRET_KEY)
            req.user={email:decoder.email,
                roleID:decoder.roleId
            }
            next()
        }
    }catch(error){
        return res.status(400).json({message:"Invalid Token"})
    }
}

exports.getUserData=async(req,res)=>{
    const email=req.user.email;
    try{
        const data=await User.findOne({email})
            if (!data) return res.status(404).json({ message: "User not found" });

        return res.status(200).json(data)
    }
    catch(error){
        return res.status(400).json({message:"Error in fetching data"})
    }
}

exports.createUser=async(req,res)=>{
    try{
    const {firstname,lastname,email,password}=req.body;
    if(!firstname||!lastname||!email||!password){
        return res.status(400).json({message:"Details are required to create a user"})
    }
    const hasOne=await User.findOne({email})
    if(hasOne){
        return res.status(400).json({message:"User already existed"})
    }
   

const hashedPassword = await bcrypt.hash(password, 12);

 const defaultUser=await Role.findOne({name:"user"})
 const {secret}=await Otpgen(email)
   const newuser= new User({firstname,lastname,email,password:hashedPassword,role:defaultUser._id,secret})
   await newuser.save()

    return res.status(200).json({message:"User created succesfully"})
}
catch(error){
    return res.status(401).json({message:error.message})
}
}    

exports.listUser=async(req,res)=>{
    try{
        const list= await User.find({},{firstname:1, lastname:1, role:1, email:1,_id:1}).populate({path:"role",select:"name"})
        return res.status(200).json(list)
    }
    catch(error){
        return res.status(400).json({message:"error in listing"})
    }
}


exports.deleteUser=async(req,res)=>{
    try{
        const userId=req.params.id
        await User.findByIdAndDelete(userId)
        return res.status(200).json({message:"User deleted"})
    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
}


exports.newUser=async(req,res)=>{
    try{
        const users=await User.find({status:false})
        return res.status(200).json(users)
    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
}

exports.assignRole=async(req,res)=>{
    try{
        const role=req.params.role
        const roleId=await Role.findOne({name:role})
        const id=req.params.id
        const result=await User.updateOne({_id:id},{$set:{role:roleId._id,status:true}})
        if(result.modifiedCount===1){
             return res.status(200).json({message:"Role updated"})
        }
        else{return res.status(400).json({message:"error in assigning role"})}
    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
}

exports.changePass=async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    try{
        const authHeader=req.headers.authorization
        if(!authHeader){
         return res.status(403).json("Unauthorized")
        }
        const token=authHeader.split(" ")[1]
        const decoder=jwt.verify(token,process.env.JWT_SECRET_KEY)
        const email=decoder.email
        
        const user=await User.findOne({email}).select("+password")
        const isSame= await bcrypt.compare(oldPassword,user.password)
        if(isSame){
            const hashednewPass=bcrypt.hash(newPassword,12)
        const result=await User.updateOne({email},{$set:{password:hashednewPass}})
        if(result.modifiedCount===1){
            return res.status(200).json({message:"password changed"})
        }
        else{return res.status(400).json({message:"error in password change"})}
    }
    else{
        return res.status(400).json({message:"Old password mismatch"})
    }
}
catch(error){
    return res.status(400).json({message:error.message})
}
}
