const { Resend } = require("resend");
const{USER_EMAIL}=require("../configure/config")
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (text, to) => {
  try {
    const response = await resend.emails.send({
      from: USER_EMAIL,
      to,
      subject: "OTP Verification",
      text: text,
    });

    console.log("Email sent successfully:", response);
    return response;

  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
