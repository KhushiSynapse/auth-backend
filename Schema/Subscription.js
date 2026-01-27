const mongoose=require("mongoose")

const SubscriptionSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    planId:{type:mongoose.Schema.Types.ObjectId,ref:"Plan"},
    status:{type:String,default:"inactive"},
    paypalSubscriptionId:{type:String},
    startDate:{type:Date,default:Date.now},
    nextBillingDate: { type: Date }
},{timestamps:true})

const Subscription=mongoose.model("Subscription",SubscriptionSchema)

module.exports=Subscription