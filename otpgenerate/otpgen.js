const { authenticator } = require("otplib");
const QRCode = require("qrcode");
const fs = require("fs");

async function otpGen(email) {
  const secret = authenticator.generateSecret();
  const otpauthURL = authenticator.keyuri(email, "MyApp", secret);
  const qrCodeDataURL=await QRCode.toDataURL(otpauthURL)
  
  return {secret,
    qr:qrCodeDataURL
  }
   
   
  
}

module.exports=otpGen


