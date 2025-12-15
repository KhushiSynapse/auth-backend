const {MONGO_URI} =require("./config")
const MONGO_URI = process.env.MONGO_URI;
const mongoose=require("mongoose")

const connectDB=async()=>{
    try{
        await mongoose.connect(MONGO_URI ,{
      serverSelectionTimeoutMS: 30000,
      family: 4, // force IPv4 for Windows DNS
     } ) 
        console.log("DB connected")
        
    }
    catch(error){
           console.log(error)
           process.exit(1)
    }

}
connectDB()
module.exports=connectDB

