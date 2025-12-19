const User=require("../../Schema/User")

exports.PermissionCheck=(userPermission)=>{
    return async(req,res,next)=>{
    try{
        const userEmail=req.user.uemail
       const user= await User.findOne(userEmail).populate({path:"role",populate:{path:"permissions",select:"name"}})
       const hasPermission=user.role.permissions.some(perm=>perm.name===userPermission)
       if(hasPermission){
        next()
       }
       else{
        return res.status(403).json({message:"Permission Denied"})
       }
    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
}
}