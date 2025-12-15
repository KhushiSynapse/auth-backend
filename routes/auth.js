const express =require("express")
const router=express.Router()

const authController=require("../controllers/mail_auth.js")

router.post("/send-otp",authController.sendOtp)

router.post("/verify-otp",authController.verifyOtp)

router.post("/send-details",authController.sendDetails)

module.exports=router