const mongoose=require("mongoose")

const UserSchema=mongoose.Schema({
    firstname:{type:String,reruired:true},
    lastname:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,unique:true},
    secret:{type:String,required:true,unique:true}
})

const User=mongoose.model("User",UserSchema)

export default User;