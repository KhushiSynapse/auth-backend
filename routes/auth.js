const express =require("express")
const router=express.Router()

const authController=require("../controllers/mail_auth.js")
const permissionController=require("../controllers/middleware/check_permission.js")
const langController=require("../controllers/middleware/check_language.js")
router.post("/send-otp",authController.sendOtp)

router.post("/verify-otp",authController.verifyOtp)

router.post("/send-details",authController.sendDetails)

router.post("/login-userr",authController.verifyUser)

router.post("/verify-userotp",authController.verifyUserOtp)

router.get("/view-profile",[authController.authmiddleware,permissionController.PermissionCheck("view-profile"),langController.checkLanguage],authController.getUserData)

router.post("/create-user",[authController.authmiddleware,permissionController.PermissionCheck("create-user"),langController.checkLanguage],authController.createUser)

router.get("/list-users",[authController.authmiddleware,permissionController.PermissionCheck("list-users")],authController.listUser)

router.delete("/delete-user/:id",[authController.authmiddleware,permissionController.PermissionCheck("delete-user")],authController.deleteUser)

router.get("/new-users",[authController.authmiddleware,permissionController.PermissionCheck("manage-roles")],authController.newUser)

router.post("/assign-role/:role/:id",[authController.authmiddleware,permissionController.PermissionCheck("manage-roles")],authController.assignRole)

router.post("/change-password",authController.authmiddleware,authController.changePass)


module.exports=router
