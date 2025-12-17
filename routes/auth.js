const express =require("express")
const router=express.Router()

const authController=require("../controllers/mail_auth.js")

router.post("/send-otp",authController.sendOtp)

router.post("/verify-otp",authController.verifyOtp)

router.post("/send-details",authController.sendDetails)

router.post("/login-userr",authController.verifyUser)

router.post("/verify-userotp",authController.verifyUserOtp)

router.get("/viewprofile",authmiddleware,authController.getUserData)

module.exports=router