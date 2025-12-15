const nodemailer=require("nodemailer")

const sendEmail=async(text,to)=>{
const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:"kh7124ch@gmail.com",
        pass:"kivfoavfwunvegte"
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
