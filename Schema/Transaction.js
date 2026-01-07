const mongoose =require("mongoose")

const TransactionSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    orderId:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true},
    paymentMethod:{type:String,default:"PayPal"},
    amount:{type:String,required:true},
    currency:{type:String,default:"USD"},
    paypalOrderId:{type:String},
    paypalCaptureId:{type:String},
    paymentStatus:{type:String},
    paymentPaidAt:{type:Date},
    paymentCancelledAt:{type:Date},
    refundRequestedAt:{type:Date},
    paymentRefundedAt:{type:Date}
})

const Transaction=mongoose.model("Transaction",TransactionSchema)

module.exports=Transaction