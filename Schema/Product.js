const mongoose=require("mongoose")

const ProductSchema=new mongoose.Schema({
    name:{type:"String",required:true},
    price:{type:"Number",required:true},
    category:{type:"String",required:false},
    desc:{type:"String",required:true},
    imageURL:{type:"String",required:true},
    createdAt:{type:"Date",default:Date.now}
})

const Product=mongoose.model("Product",ProductSchema)

module.exports=Product