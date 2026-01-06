const mongoose=require("mongoose")

const OrderSchema = new mongoose.Schema({
    userid:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    amount:{type:"String",required:true},
    paymentstatus:{type:"String",required:true},
    orderstatus:{type:"String",required:true,default:"processing"},
    currency:{type:"String"},
    captureid:{type:"String",required:true},
    createdat:{type:Date,default:Date.now},
    refund:{type:Boolean,default:false}

})

const Order=mongoose.model("Order",OrderSchema)

module.exports=Order