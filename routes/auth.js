const express =require("express")
const router=express.Router()

const authController=require("../controllers/mail_auth.js")
const permissionController=require("../controllers/middleware/check_permission.js")
router.post("/send-otp",authController.sendOtp)

router.post("/verify-otp",authController.verifyOtp)

router.post("/send-details",authController.sendDetails)

router.post("/login-userr",authController.verifyUser)

router.post("/verify-userotp",authController.verifyUserOtp)

router.get("/view-profile",[authController.authmiddleware,permissionController.PermissionCheck("view-profile")],authController.getUserData)

module.exports=router