

const nodemailer = require('nodemailer')

module.exports = function SendOtp(email,otp){
    return new Promise((resolve,reject)=>{

        let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                      user: "xcaze797@gmail.com",
                      pass: "bdccjxdvfitjlmxr",
                    },
                  });

                  var mailOptions={
                    from: 'xcaze797@gmail.com',
                    to: email,
                    subject: "p-Mart Email verification",
                    html: `
                    <h1>Verify Your Email For p-Mart</h1>
                      <h3>use this code to verify your email</h3>
                      <h2>${otp}</h2>
                    `,
                  }
              
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      reject("Email sending failed",error)
                    } else {
                      resolve("Email send successfuly")
                    }
                  });
    })
}