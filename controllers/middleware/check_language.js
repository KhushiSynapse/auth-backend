
exports.checkLanguage=async(req,res,next)=>{
      console.log("Accept-Language header received:", req.headers["Accept-Language"]);

    req.lang=req.headers["Accept-Language"]||"en"
    next()
}