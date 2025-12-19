const {PORT} =require("./configure/config")
const connectDB = require("./configure/db");
const {AttachPermissions}=require("./Seed/AttachPermission")
const {SendPermissions}=require("./Seed/PermissionSeed")

async function Seed(){
await connectDB();

 await SendPermissions();
 await AttachPermissions();
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
