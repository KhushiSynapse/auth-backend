const nodemailer = require("nodemailer");
const { user_email, user_pass } = require("../configure/config");

const sendEmail = async (text, to) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true only for port 465
      auth: {
        user: user_email,
        pass: user_pass,
      },
    });

    const mailOptions = {
      from: user_email, // use your email from env
      to,
      subject: "OTP",
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // propagate to controller
  }
};

module.exports = sendEmail;
