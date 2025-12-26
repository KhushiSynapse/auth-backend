
exports.checkLanguage=async(req,res,next)=>{
    req.lang=req.headers["Accept-Language"]||"en"
    next()
}