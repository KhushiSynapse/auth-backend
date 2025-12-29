const mongoose=require("mongoose")

const CartSchema=new mongoose.Schema({
    name:{type:"String",required:true},
    price:{type:"Number",required:true},
    imageURL:{type:"String",required:true},
    addedAt:{type:"Date",default:Date.now},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
})

const Item=mongoose.model("Item",CartSchema)

module.exports=Item