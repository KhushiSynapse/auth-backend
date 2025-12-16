const { authenticator } = require("otplib");
const QRCode = require("qrcode");
const fs = require("fs");

async function otpGen(email) {
  const secret = authenticator.generateSecret();

  
    const token = authenticator.generate(secret);
    const tokengen=()=>{
    console.log("Current Token:", token, "| Time:", new Date().toLocaleTimeString());
    }

  const otpauthURL = authenticator.keyuri(email, "MyApp", secret);
  const qrCodeDataURL=await QRCode.toDataURL(otpauthURL)
  setInterval(tokengen,30000)
  return {secret,
    qr:qrCodeDataURL
  }
   
  
  
}

module.exports=otpGen


