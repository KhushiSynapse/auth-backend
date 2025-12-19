const mongoose=require("mongoose")

const RoleSchema=new mongoose.Schema({
    name:{type:String,required:true},
    permissions:[{type:mongoose.Schema.types.ObjectId,ref:"Permission"}]

})

const Role=mongoose.model("Role",RoleSchema)

module.exports=Role