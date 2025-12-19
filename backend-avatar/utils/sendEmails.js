const nodemailer = require("nodemailer")

const sendEmail = async (email, subject, html) => {


  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password
      },
      tls: { rejectUnauthorized: false }

    })

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: subject,
      html: html
    }


    console.log("sendEmail function successfull ")
    return await transporter.sendMail(mailOptions)

  }
  catch (e) {
    console.log("Failed due to send email function",e.message)
     throw e
  }
}
module.exports = sendEmail