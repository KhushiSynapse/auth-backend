const mongoose=require("mongoose")

const OrderItemSchema=new mongoose.Schema({
    orderid:{type:mongoose.Schema.Types.ObjectId,required:true},
    name:{type:"String",required:true},
        price:{type:"Number",required:true},
        addedAt:{type:"Date",default:Date.now},
        Quantity:{type:"Number",default:1},
        total:{type:"Number",required:true},
        userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
})

const OrderItem=mongoose.model("OrderItem",OrderItemSchema)

module.exports=OrderItem