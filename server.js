const {PORT} =require("./configure/config")
const connectDB = require("./configure/db");
const {AttachPermissions}=require("./Seed/AttachPermission")
const {SendPermissions}=require("./Seed/PermissionSeed")
const cloudinary=require("cloudinary").v2
const http=require("http")
const {Server}=require("socket.io")

async function Seed(){
await connectDB();

 await SendPermissions();
 await AttachPermissions();
}


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

const server=http.createServer(app)
const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"]
    }
})

io.on("connection",(socket)=>{
    console.log("User Connected",socket.id)
})
app.use(cors());
app.use(express.json());
app.set("io",io)
// Routes
app.use("/api/auth", authRoutes);

async function startServer(){
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
await Seed()
}

startServer()

