
exports.checkLanguage=async(req,res,next)=>{
      console.log("Accept-Language header received:", req.headers["accept-language"]);

    req.lang=req.headers["Accept-Language"]||"en"
    next()
}