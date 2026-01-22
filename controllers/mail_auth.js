const sendEmail =require("../utils/sendEmail")
const Otpgen=require("../otpgenerate/otpgen")
const User=require("../Schema/User")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const Role=require("../Schema/Role")
const t=require("../helper/translator")
const otpstore={}
const { authenticator } = require("otplib");
const multer=require("multer")
const cloudinary=require("cloudinary").v2
const Product=require("../Schema/Product")
const Item=require("../Schema/Item")
const paypal = require("@paypal/checkout-server-sdk");
const Order=require("../Schema/Order")
const OrderItem = require("../Schema/OrderItem")
const mongoose=require("mongoose")
const Transaction=require("../Schema/Transaction")
const DailyAnalytics=require("../Schema/DailyAnalytics")

const environment=new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    
)
const paypalClient = new paypal.core.PayPalHttpClient(environment);
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
    

const user = await User.findOne({ email }).populate({path:"role",select:"name"})
  .select("+secret role")
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const isValid = authenticator.check(otp, user.secret,{window:1});
   
  if (isValid) {
      const token=jwt.sign({email,userId:user._id,rolename:user.role.name},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
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
            return res.status(401).json({message:t("NOtoken",req.lang)})
        }
       else{
            const token=authHeader.split(" ")[1]
            if(token==="null"){
                return res.status(401).json({message:t("Notokenfound",req.lang)})
            }
            const decoder=jwt.verify(token,process.env.JWT_SECRET_KEY)
            req.user={email:decoder.email,
                roleID:decoder.roleId,
                userId:decoder.userId
            }
            next()
        }
    }catch(error){
        return res.status(500).json({message:t("Invalid Token",req.lang)})
    }
}

exports.getUserData=async(req,res)=>{
    const email=req.user.email;
    try{
        const data=await User.findOne({email}).populate({path:"role",select:"name"})
            if (!data) return res.status(404).json({ message:t("Usernotfound",req.lang) });

        return res.status(200).json(data)
    }
    catch(error){
        return res.status(400).json({message:t("Errorinfetchingdata",req.lang)})
    }
}

exports.createUser=async(req,res)=>{
    const io=req.app.get("io")
    try{
    const {firstname,lastname,email,password}=req.body;
    if(!firstname||!lastname||!email||!password){
        return res.status(400).json({message:t("Detailsarerequiredtocreateauser",req.lang)})
    }
    const hasOne=await User.findOne({email})
    if(hasOne){
        return res.status(400).json({message:t("Useralreadyexisted",req.lang)})
    }
   

const hashedPassword = await bcrypt.hash(password, 12);

 const defaultUser=await Role.findOne({name:"user"})
 const {secret}=await Otpgen(email)
   const newuser= new User({firstname,lastname,email,password:hashedPassword,role:defaultUser._id,secret})
   await newuser.save()
     io.emit("user:created",{userdata:newuser})
    return res.status(200).json({message:t("Usercreatedsuccesfully",req.lang)})
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
        return res.status(400).json({message:t("errorinlisting",req.lang)})
    }
}


exports.deleteUser=async(req,res)=>{
    const io=req.app.get("io")
    try{
        const userId=req.params.id
        await User.findByIdAndDelete(userId)
        io.emit("user:deleted",{userID:userId})
        return res.status(200).json({message:t("Userdeleted",req.lang)})
    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
}


exports.newUser=async(req,res)=>{
    try{
        const users=await User.find({status:false}).populate({path:"role",select:"name"})
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
             return res.status(200).json({message:t("Roleupdated",req.lang)})
        }
        else{return res.status(400).json({message:t("errorinassigningrole",req.lang)})}
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
         return res.status(403).json({message:t("Unauthorized",req.lang)})
        }
        const token=authHeader.split(" ")[1]
        const decoder=jwt.verify(token,process.env.JWT_SECRET_KEY)
        const email=decoder.email
       
        const user=await User.findOne({email}).select("+password")
        const isSame= await bcrypt.compare(oldPassword,user.password)
        if(isSame){
            const hashednewPass= await bcrypt.hash(newPassword,12)
        const result=await User.updateOne({email},{$set:{password:hashednewPass}})
        if(result.modifiedCount===1){
            return res.status(200).json({message:t("passwordchanged",req.lang)})
        }
        else{return res.status(400).json({message:t("errorinpasswordchange",req.lang)})}
    }
    else{
        return res.status(400).json({message:t("Oldpasswordmismatch",req.lang)})
    }
}
catch(error){
    return res.status(400).json({message:error.message})
}
}


exports.addProduct=async(req,res)=>{
    const {name,price,description,category}=req.body
   const images=req.files
   const io=req.app.get("io")

    try{
        
        const uploadToCloudinary=(fileBuffer)=>{
        return new Promise((resolve,reject)=>{
    const stream= cloudinary.uploader.upload_stream({
        folder:"product-img"},
        (error,result)=>{
            if(error)
                reject (error)
            else resolve(result)
        }
    )
    stream.end(fileBuffer)
})
    }
     const uploadImages=[]
        for (const file of images ){
             const result=await uploadToCloudinary(file.buffer)
             uploadImages.push(result.secure_url)
        }
    
        const result=await Product.create({name,price:Number(price),desc:description,category,imageURL:uploadImages})
        if(result){
            io.emit("product:added",result)
            return res.status(200).json({message:"Product added successfully"})
        }
        else{
            return res.status(400).json({message:"Product not added"})
        }
    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
}

exports.getProducts=async(req,res)=>{
    const limit=req.params.limit
    const pageNo=req.params.pageNo
    const skipNo=(pageNo-1)*limit
    try{
        const result=await Product.find().limit(limit).skip(skipNo)
        const totalDoc=await Product.countDocuments()
        if(result.length>0){
        return res.status(201).json({result,totalPage:Math.ceil(totalDoc/limit)})
        }
        else{
            return res.status(404).json({message:"No Products Available"})
        }
    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
}


exports.saveProduct=async(req,res)=>{
    const productId=req.params.productId
    const Id=req.user.userId
    
    console.log(Id)
    try{
        const details=await Product.findById(productId)
        const item=await Item.create({name:details.name,price:details.price,imageURL:details.imageURL,userId:Id,productID:productId})
        if(item){
            return res.status(200).json({message:"Product added to cart"})
        }
        else{
            return res.status(400).json({message:"Issue in adding Product"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}


exports.getCartProducts=async(req,res)=>{
   const Id=req.user.userId
   try{
   const items=await Item.find({userId:Id})
   if(items.length===0){
    return res.status(400).json({message:"No items added in cart"})
   }
   else{
    return res.status(200).json(items)
   }}
   catch(error){
    return res.status(500).json({message:error.message})
   }
}

exports.removeItem=async(req,res)=>{
    try{
        const itemId=req.params.id
        const data=await Item.findByIdAndDelete(itemId)
        if(data){
            return res.status(200).json({message:"Item deleted"})
        }
        else{
            return res.status(400).json({message:"Erroe in removing data"})
        }
    }
    catch(error){
        return res.status(500).json(error.message)
    }
}
 exports.getProductData=async(req,res)=>{
try{
    const productId=req.params.id
    const details=await Product.findOne({_id:productId})
    return res.status(200).json(details)
}catch(error){
    return res.status(500).json({message:error.message})
}
 }

 exports.updateQuantity=async(req,res)=>{
    try{
        const newQuantity=req.body.Quantity
        const productid=req.params.id
        const update=await Item.updateOne({_id:productid},{$set:{Quantity:newQuantity}})
        if(update){
            return res.status(200).json({message:"updated"})
        }
        else{
            return res.status(400).json({message:"error"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
 }

exports.createPayPalOrder=async(req,res)=>{
    const {amount}=req.body
    const requestOredrBody={
        intent:"CAPTURE",
        purchase_units:[{
            amount:{
                "currency_code":"USD",
                value:amount
            }
        }]
    }
    try{
        const request=new paypal.orders.OrdersCreateRequest()
        request.prefer=("return=representation")
        request.requestBody(requestOredrBody)

        const response=await paypalClient.execute(request)

        res.json({orderId:response.result.id})
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}


exports.captureOrder=async(req,res)=>{
    const {orderId}=req.body
 if(!orderId){
    return res.status(400).json({message:"OrderId Missing"})
 }
 try{
 const request=new paypal.orders.OrdersCaptureRequest(orderId)
 request.requestBody({})

 const response=await paypalClient.execute(request)

 res.json({
    status:response.result.status,
    details:response.result
 })}
 catch(error){
    console.log(error)
    return res.status(500).json({message:error.message})
 }
}

exports.createTransaction=async(req,res)=>{
    const uId=req.user.userId
    const {amount,currency,paymentStatus,captureId,paymentPaidAt, paypalorderId,paymentMethod,orderid}=req.body
    try{
        const result=await Transaction.create({userId:uId,paymentMethod:paymentMethod,amount,currency:currency,paypalOrderId:paypalorderId,paypalCaptureId:captureId,paymentPaidAt,paymentStatus,orderId:orderid})
             if(result){
                return res.status(200).json({message:"created"})
             }
             else{
                return res.status(400).json({message:"not created"})
             }
    
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.clearCart=async(req,res)=>{
    const id=req.user.userId
    try{
        const result= await Item.deleteMany({userId:id})
        if(result){
           
            return res.json({message:"successfully deleted"})
        }
        else{
            return res.json({message:"successfully not deleted"})
        }
    }
    catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.createOrder=async(req,res)=>{
    const userId=req.user.userId
    const io=req.app.get("io")
    try{
        const{amount,currency,paymentStatus,captureId}=req.body
        const result=await Order.create({amount:amount,currency:currency,paymentstatus:paymentStatus,userid:userId,captureid:captureId})
        if(result){
            io.emit("order:generated",result)
            const orderDate=result.createdat.toISOString().split("T")[0]
            await DailyAnalytics.updateOne({date:orderDate},
                {
                    $inc:{
                        totalOrders:1,
                        totalProcessed:1,
                        totalRevenue:result.amount
                    },$setOnInsert:{
                         totalCancelled:0,
                         createdAt:new Date()
                    },
                    $set:{
                          updatedAt:new Date()
                    }
                },{upsert:true},
            )
            return res.status(200).json(result)
        }
        else{
            return res.status(400).json({message:"Problem in creating order"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.createOrderItems=async(req,res)=>{
    const{id,list}=req.body
    console.log(id)
    const userId=req.user.userId
    try{
       const orderItems = list.map(item => ({
      orderid:new mongoose.Types.ObjectId(id),
      userId,
      name: item.name,
      price: Number(item.price),
      Quantity: Number(item.Quantity),
      total: Number(item.price) * Number(item.Quantity),
    }));
     await OrderItem.insertMany(orderItems)
     return res.status(200).json({message:"Added"})
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.getOrderItems=async(req,res)=>{
    const id=req.user.userId
    try{
       
        const items=await OrderItem.find({userId:id}).populate("orderid", "amount orderstatus paymentstatus")  
        console.log(items)
        if(items.length>0){
            return res.status(200).json(items)
        }
        else{
            res.status(400).json({message:"No items ordered"})}
           
    }catch(error){
        res.status(500).json({message:error.message})
    }
}

exports.cancelOrder=async(req,res)=>{
    const uid=req.user.userId
    const id=req.params.id
    const io=req.app.get("io")
    try{
        const status=await Order.findOne({_id:id}).select("orderstatus amount createdat")
        console.log(status)
        if(status.orderstatus==="processing"){
            const count=await Order.updateOne({_id:id},{$set:{orderstatus:"cancelled"}})
            if(count.modifiedCount>0){
                io.emit("order:cancelled",{orderId:id})
                await Transaction.updateOne({userId:uid,orderId:id},{$set:{paymentCancelledAt:new Date()}})
                const orderDate = status.createdat.toISOString().split("T")[0];
                await DailyAnalytics.updateOne({date:orderDate},
                {
                    $inc:{
                        totalProcessed:-1,
                        totalRevenue:-(status.amount),
                        totalCancelled:1,
                        cancelledPayments:1
                    },
                    $set:{
                          updatedAt:new Date()
                    }
                },
            )
                return res.status(200).json({message:"Order Cancelled"})
                
            }
        }
        else if(status.orderstatus==="cancelled"){
            return res.status(400).json({message:"Order is already cancelled."})
        }else{
            return res.status(400).json({message:"Cannot cancel the order"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.getAllOrderedItems=async(req,res)=>{
    try{
        const result=await OrderItem.find()
        if(result.length===0){
            return res.status(400).json({message:"NO items yet or error in getting items"})
        }
        else{
            return res.status(200).json(result)
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.updateOrderStatus=async(req,res)=>{
    const id=req.params.id
    const value=req.params.value
    try{
        const result=await Order.updateOne({_id:id},{$set:{orderstatus:value}})
        if(result.modifiedCount>0){
            return res.status(200).json({message:"Status Updated"})
        }
        else{return res.status(400).json({message:"Error in status change"})}
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.requestOrder=async(req,res)=>{
    const uid=req.params.uid
    const id =req.params.id
    
    try{
       const result=await Order.findOne({_id:id}).select("captureid amount currency paymentstatus")
    const request=new paypal.payments.CapturesRefundRequest(result.captureid)
    if (result.paymentstatus === "refunded") {
            return res.status(400).json({ message: "Order already refunded" });
        }

    request.requestBody({
        amount:{
            value:result.amount,
            currency_code:result.currency
        }
    })
     const response=await paypalClient.execute(request)
     if(response.result.status === "COMPLETED"){
        const update=await Order.updateOne({_id:id},{$set:{paymentstatus:"refunded",refund:false}})
        if(update.modifiedCount>0){
            console.log(uid,id)
           const result= await Transaction.updateOne({userId:new mongoose.Types.ObjectId(uid),orderId:new mongoose.Types.ObjectId(id)},{$set:{paymentRefundedAt:new Date(),paymentStatus:"REFUNDED"}})
           if(result.modifiedCount>0){
        return res.status(200).json({message:"Payment Refund successful"})}
        }
     }
     else{
        return res.status(400).json({message:"Payment refund Unsuccessful"})

     }

     }catch(error){
       return res.status(500).json({message:error.message})
    }
}

exports.updateRefund=async(req,res)=>{
    const uid=req.user.userId
    const id=req.params.id
    try{
        const result=await Order.findOne({_id:id}).select("orderstatus paymentstatus refund")
        if(result.orderstatus==="cancelled" && result.paymentstatus!=="refunded"){
        const update=await Order.updateOne({_id:id},{$set:{refund:true}})
        if(update.modifiedCount>0){
             await Transaction.updateOne({userId:uid,orderId:id},{$set:{refundRequestedAt:new Date()}})
            return res.status(200).json({message:"updated"})
        }
        else if(result.refund===true){
            return res.status(402).json({message:"Request already sent"})
        }
        else{
             return res.status(400).json({message:"not updated"})
        }}
        else{
            return res.status(400).json({message:"Order status is not cancelled or payment is refunded"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.getRefundList=async(req,res)=>{
    try{
        const result=await Order.find({refund:true})
        if(result.length>0){
            return res.status(200).json(result)
        }
        else{
            return res.status(400).json({message:"No refund request"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}


exports.getTransactionList=async(req,res)=>{
    const userid=req.user.userId
try{
    const limit=req.params.limit
    const PageNo=req.params.pageNo
    const skipNo=(PageNo-1)*limit
    const list=await Transaction.find({userId:userid}).limit(limit).skip(skipNo)
    const totalDoc=await Transaction.countDocuments({userId:userid})
    if(list.length>0){
        return res.status(200).json({list,totalPage:Math.ceil(totalDoc/limit)})
    }
    else{
        return res.status(400).json({message:"no transaction"})
    }
}catch(error){
    return res.status(500).json({message:error.message})
}
}

exports.getOrderId=async(req,res)=>{
    const limit=parseInt(req.params.limit)
    const pageNo=parseInt(req.params.pageNo)
    const skipNo=(pageNo-1)*limit
    try{
        const totalDoc=await Order.countDocuments()
        const list=await Order.find().select("_id").lean().limit(limit).skip(skipNo)
        if(list.length>0){
            return res.status(200).json({list,totalPage:Math.ceil(totalDoc/limit)})
        }
        else{
            return res.status(400).json({message:"Error"})
        }
    }
    catch(error){
        return res.status(500).jaon({message:error.message})
    }
}

exports.getOrederDetails=async(req,res)=>{
    try{
        const id=req.params.id
        const order=await Order.findOne({_id:id})
        if(order){
            return res.status(200).json(order)
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.getUserProfile=async(req,res)=>{
    try{
        const uid=req.params.id
        const data=await User.findOne({_id:uid})
        if(data){
            return res.status(200).json(data)
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}


exports.getItemDetails=async(req,res)=>{
    try{
        const orderId=req.params.id
        const items=await OrderItem.find({orderid:orderId})
        if(items.length>0){
            return res.status(200).json(items)
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.getTransactionDetails=async(req,res)=>{
    try{
        const orderid=req.params.id
        const details=await Transaction.findOne({orderId:orderid})
        if(details){
            return res.status(200).json(details)
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.getSearchItem=async(req,res)=>{
    const id=req.user.userId
    try{
        const {search,startDate,endDate,pageno,limit}=req.query
        const skipno=(pageno-1)*limit
    let query={}
        if(search){
           query.$or=[
            {orderstatus:{ $regex:search, $options: "i" }},
            {paymentstatus:{$regex:search,$options:"i"}}
        ]
        }
        if(startDate||endDate){
            query.createdat={}
            if(startDate){
                query.createdat.$gte=new Date(startDate)
            }
            if(endDate){
               const end=new Date(endDate)
               end.setHours(23,59,59,999)
               query.createdat.$lte=end
            }
             if (startDate && !endDate) {
    const end = new Date(startDate);
    end.setHours(23, 59, 59, 999);
    query.createdat.$lte = end;
  }
        }
        const finalQuery={
            userid:id,
            ...query
        }
        const totalDoc=await Order.countDocuments(finalQuery)
        const result=await Order.find(finalQuery).select(" _id orderstatus paymentstatus amount").limit(limit).skip(skipno)
        if(result.length>0){
            return res.status(200).json({result,totalPage:Math.ceil(totalDoc/limit)})
        }
        else{
            return res.status(400).json({message:"No item found"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.getOrder=async(req,res)=>{
    const id=req.user.userId
    const limitno=parseInt(req.params.limit)
    const pageno=parseInt(req.params.pageno)
    const skipno=(pageno-1)*limitno
    try{
        const totalDoc=await Order.countDocuments({userid:id})
        const order=await Order.find({userid:id}).limit(limitno).skip(skipno)
       
        if(order.length>0){
            return res.status(200).json({order,totalPages:Math.ceil(totalDoc/limitno)})
        }
        else{
            return res.status(404).json({message:"No orders yet"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

exports.getSearchTransaction=async(req,res)=>{
  const id=req.user.userId
    try{
        const {search,paidDate,endDate,pageno,limit}=req.query
       
        const skipno=(pageno-1)*limit
    let query={}
        if(search){
           query.paymentStatus={$regex:search,$options:"i"}
        }
        if(paidDate){
            query.paymentPaidAt={}
            if(paidDate){
                query.paymentPaidAt.$gte=new Date(paidDate)
            }
            if(endDate){
               const end=new Date(endDate)
               end.setHours(23,59,59,999)
               query.paymentPaidAt.$lte=end
            }
             if (paidDate && !endDate) {
    const end = new Date(paidDate);
    end.setHours(23, 59, 59, 999);
    query.paymentPaidAt.$lte = end;
  }
        }
        const finalQuery={
            userId:id,
            ...query
        }
        const totalDoc=await Transaction.countDocuments(finalQuery)
        const result=await Transaction.find(finalQuery).limit(limit).skip(skipno)
        if(result.length>0){
            return res.status(200).json({result,totalPage:Math.ceil(totalDoc/limit)})
        }
        else{
            return res.status(404).json({message:"No transaction found"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}


exports.getSearchOrderId=async(req,res)=>{
    try{
        const {limit,pageNo,startDate,endDate}=req.query
        const skipNo=(pageNo-1)*limit
        let query={}
       if(startDate||endDate){
            query.createdat={}
            if(startDate){
                query.createdat.$gte=new Date(startDate)
            }
            if(endDate){
               const end=new Date(endDate)
               end.setHours(23,59,59,999)
               query.createdat.$lte=end
            }
             if (startDate && !endDate) {
    const end = new Date(startDate);
    end.setHours(23, 59, 59, 999);
    query.createdat.$lte = end;
  }
const result=await Order.find(query).select("_id").limit(limit).skip(skipNo)
const totalDoc=await Order.countDocuments(query)

if(result.length>0){
    return res.status(200).json({result,totalPage:Math.ceil(totalDoc/limit),pageNum:1})
}
else{
    return res.status(404).json({message:"No order found"})
}
    }
}catch(error){
return res.status(500).json({message:error.message})
    }}


    exports.getAllOrders=async(req,res)=>{
       
        try{
            const orders=await Order.find()
            if(orders.length>0){
                
                return res.status(200).json(orders)
            }
        }catch(error){
            return res.status(500).json({message:error.message})
        }
    }

    exports.getStats=async(req,res)=>{
        const date=new  Date()
        const todayDate=date.toISOString().split("T")[0]
        try{
            const stat=await DailyAnalytics.findOne({date:todayDate}).select("totalOrders totalProcessed totalCancelled totalRevenue cancelledPayments")
            if(stat){
                return res.status(200).json(stat)
            }
        }catch(error){
            return res.status(500).json({message:error.message})
        }
    }

    exports.getChartData=async(req,res)=>{
        try{
               const data=await DailyAnalytics.find().select("date totalProcessed totalCancelled totalRevenue totalOrders ").sort({createAt:-1}).limit(7)
               return res.status(200).json(data)
        }catch(error){
            return res.status(500).json({message:error.message})
        }
    }