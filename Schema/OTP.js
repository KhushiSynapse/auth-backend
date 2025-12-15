const mongoose=require("mongoose")

const OtpSchema=mongoose.Schema({
    email:{type:String,required:true},
    otp:{type:String,required:true},
    createdAt:{type:Date,default:Date.now(),expires:120}
})

const OTP=mongoose.model("OTP",OtpSchema)

export default OtpSchema;