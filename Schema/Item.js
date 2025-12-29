const mongoose=require("mongoose")

const CartSchema=new mongoose.Schema({
    name:{type:"String",required:true},
    price:{type:"Number",required:true},
    imageURL:{type:"String",required:true},
    addedAt:{type:"Date",default:Date.now},
    Quantity:{type:"Number",default:1},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
})

const Item=mongoose.model("Item",CartSchema)

module.exports=Item