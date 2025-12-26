
exports.checkLanguage=async(req,res,next)=>{
    req.lang=req.headers["accept-language"]?.split(",")[0]||"en"
    next()
}