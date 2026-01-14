const express =require("express")
const router=express.Router()

const authController=require("../controllers/mail_auth.js")
const permissionController=require("../controllers/middleware/check_permission.js")
const langController=require("../controllers/middleware/check_language.js")
const upload=require("../controllers/middleware/upload_image.js")
router.post("/send-otp",authController.sendOtp)

router.post("/verify-otp",authController.verifyOtp)

router.post("/send-details",authController.sendDetails)

router.post("/login-userr",authController.verifyUser)

router.post("/verify-userotp",authController.verifyUserOtp)

router.get("/view-profile",[langController.checkLanguage,authController.authmiddleware,permissionController.PermissionCheck("view-profile"),langController.checkLanguage],authController.getUserData)

router.post("/create-user",[langController.checkLanguage,authController.authmiddleware,permissionController.PermissionCheck("create-user")],authController.createUser)

router.get("/list-users",[langController.checkLanguage,authController.authmiddleware,permissionController.PermissionCheck("list-users")],authController.listUser)

router.delete("/delete-user/:id",[langController.checkLanguage,authController.authmiddleware,permissionController.PermissionCheck("delete-user")],authController.deleteUser)

router.get("/new-users",[langController.checkLanguage,authController.authmiddleware,permissionController.PermissionCheck("manage-roles")],authController.newUser)

router.post("/assign-role/:role/:id",[langController.checkLanguage,authController.authmiddleware,permissionController.PermissionCheck("manage-roles")],authController.assignRole)

router.post("/change-password",[langController.checkLanguage,authController.authmiddleware],authController.changePass)

router.post("/add-product",[authController.authmiddleware,permissionController.PermissionCheck("add-product"),upload.array("image")],authController.addProduct)

router.get("/list-products/:limit/:pageNo",authController.authmiddleware,authController.getProducts)

router.post("/save-product/:productId",[authController.authmiddleware],authController.saveProduct)

router.get("/list-items",authController.authmiddleware,authController.getCartProducts)

router.delete("/remove-item/:id",[authController.authmiddleware,],authController.removeItem)

router.get("/get-ProductData/:id",authController.getProductData)

router.patch("/update-quantity/:id",[authController.authmiddleware],authController.updateQuantity)

router.post("/create-order",[authController.authmiddleware],authController.createPayPalOrder)

router.post("/capture-order",[authController.authmiddleware],authController.captureOrder)

router.delete("/clear-cart",[authController.authmiddleware,],authController.clearCart)

router.post("/create-orderinDB",[authController.authmiddleware],authController.createOrder)

router.get("/get-OrderItem/",[authController.authmiddleware],authController.getOrderItems)

router.post("/add-orderitems",[authController.authmiddleware],authController.createOrderItems)

router.patch("/cancel-order/:id",[authController.authmiddleware],authController.cancelOrder)

router.get("/getAll-OrderItem/",[authController.authmiddleware],authController.getAllOrderedItems)

router.patch("/update-status/:id/:value",authController.updateOrderStatus)

router.post("/get-refund/:id/:uid",[authController.authmiddleware],authController.requestOrder)

router.patch("/update-refund/:id",[authController.authmiddleware],authController.updateRefund)

router.get("/get-RefundList",[authController.authmiddleware],authController.getRefundList)

router.post("/create-transaction",[authController.authmiddleware],authController.createTransaction)

router.get("/get-transaction/:limit/:pageNo",[authController.authmiddleware],authController.getTransactionList)

router.get("/get-userprofile/:id",[authController.authmiddleware],authController.getUserProfile)

router.get("/get-transactiondetails/:id",[authController.authmiddleware],authController.getTransactionDetails)

router.get("/get-productdetails/:id",[authController.authmiddleware],authController.getItemDetails)

router.get("/get-Orderid/:limit/:pageNo",[authController.authmiddleware],authController.getOrderId)

router.get("/get-orderdetails/:id",[authController.authmiddleware],authController.getOrederDetails)

router.get("/get-searchOrder",[authController.authmiddleware],authController.getSearchItem)

router.get("/get-Order/:limit/:pageno",[authController.authmiddleware],authController.getOrder)

router.get("/get-searchTransaction",[authController.authmiddleware],authController.getSearchTransaction)


module.exports=router
