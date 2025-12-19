const User=require("../../Schema/User")

exports.PermissionCheck=(userPermission)=>{
    return async(req,res,next)=>{
    try{
        const userId=req.user._id
       const user= await User.findById(userId).populate({path:"role",populate:{path:"permissions"}})
       const hasPermission=user.role.permissions.some(perm=>perm.name===userPermission)
       if(hasPermission){
        next()
       }
       else{
        return res.status(403).json({message:"Permission Denied"})
       }
    }
    catch(error){
        return res.status(400).json({message:"Error in checking Permissions"})
    }
}
}