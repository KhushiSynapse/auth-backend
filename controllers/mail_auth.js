const sendEmail =require("../utils/sendEmail")
const Otpgen=require("../otpgenerate/otpgen")
const User=require("../Schema/User")
const otpstore={}
const { totp } = require('otplib');
const generateOtp=()=>{
    return Math.floor(10000+Math.random()*900000)
}
    exports.sendOtp=async(req,res)=>{
        const {email}=req.body
        if(!email)
        {
            return res.status(400).json({message:"email is required"})
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
           const {secret,qr}=await Otpgen(email)

           const newUser= new User({firstname,lastname,email,password,secret})
            await newUser.save()
            res.status(201).json({qr,message:"User created successfully!!", user: newUser})
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
            const hasEmail=await User.findOne({email})
            if (hasEmail){
                if(password===hasEmail.password)
                {
                    return res.status(200).json({message:"Login successfull"})
                }
                else{
                    return res.status(400).json({message:"Wrong Password"})
                }
            }
            else{
                res.status(400).json({message:"Register now "})
            }
        }
        catch(error){
            return res.status(400).json({message:"error in login"})
        }

    }


    exports.verifyUserOtp=async(req,res)=>{
        try{
            const{otp,email}=req.body
            if(!otp){
                res.status(400).json({message:"Otp is required for authentication"})
            }
            else{
                const user=await User.findOne({email},"secret")
                const token=totp.generate(user.secret)
               
                if(otp===token){
                    return res.status(200).json({message:"You are authenticated successfully"})
                }else{
                 return res.status(400).json({message:"Invalid OTP"})}
            }
        }
        catch(error){
            res.status(400).json({message:error.message})
        }
    }
