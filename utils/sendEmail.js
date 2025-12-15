const nodemailer=require("nodemailer")
const {user_email,user_pass} =require("../configure/config")
const sendEmail=async(text,to)=>{
const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:user_email,
        pass:user_pass
    }
    })
const mailOptions={
    from:"kh7124ch@gmail.com",
    to,
    subject:"OTP",
    text,
}

await transporter.sendMail(mailOptions)

}

module.exports=sendEmail
