const {PORT} =require("./configure/config")
const connectDB = require("./configure/db");
const {AttachPermission}=require("./Seed/AttachPermission")
const {PermissionSeed}=require("./Seed/PermissionSeed")

async function Seed(){
connectDB();
await AttachPermission();
 await PermissionSeed();
}

Seed()

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
