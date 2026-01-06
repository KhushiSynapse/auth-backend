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
            return res.status(400).json({message:t("NOtoken",req.lang)})
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
        return res.status(400).json({message:t("Invalid Token",req.lang)})
    }
}

exports.getUserData=async(req,res)=>{
    const email=req.user.email;
    try{
        const data=await User.findOne({email})
            if (!data) return res.status(404).json({ message:t("Usernotfound",req.lang) });

        return res.status(200).json(data)
    }
    catch(error){
        return res.status(400).json({message:t("Errorinfetchingdata",req.lang)})
    }
}

exports.createUser=async(req,res)=>{
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
    try{
        const userId=req.params.id
        await User.findByIdAndDelete(userId)
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
    
        const isAdd=await Product.create({name,price:Number(price),desc:description,category,imageURL:uploadImages})
        if(isAdd){
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
    try{
        const data=await Product.find()
        return res.status(201).json(data)
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
        const item=await Item.create({name:details.name,price:details.price,imageURL:details.imageURL,userId:Id})
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
    try{
        const{amount,currency,paymentStatus}=req.body
        const result=await Order.create({amount:amount,currency:currency,paymentstatus:paymentStatus,userid:userId})
        if(result){
            return res.status(200).json({message:"Oredr Created",orderId: result._id})
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
        const data=await OrderItem.find({userid:id}).populate({path:"orderid",select:"_id paymentstatus orderstatus"})
        console.log(data)
        if(data.length>0){
            return res.status(200).json(data)
        }
        else{
            res.status(400).json({message:"error"})}
    }catch(error){
        res.status(500).json({message:error.message})
    }
}

exports.cancelOrder=async(req,res)=>{
    const id=req.params.id
    try{
        const status=await Order.findOne({_id:id}).select("orderstatus")
        console.log(status)
        if(status.orderstatus==="processing"){
            const count=await Order.updateOne({_id:id},{$set:{orderstatus:"cancelled"}})
            if(count.modifiedCount>0){
                return res.status(200).json({message:"Order Cancelled"})
            }
        }
        else{
            return res.status(400).json({message:"Cannot cancel the order"})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}