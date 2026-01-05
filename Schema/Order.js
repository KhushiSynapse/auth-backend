const mongoose=require("mongoose")

const OrderSchema = new mongoose.Schema({
    id:{type:"String",required:true},
    userid:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    amount:{type:"String",required:true},
    paymentstatus:{type:"String",required:true},
    orderstatus:{type:"String",required:true},
    currency:{type:"String"},
    createdat:{type:Date,default:Date.now}

})

const Order=mongoose.model("Order",OrderSchema)

module.exports=Order