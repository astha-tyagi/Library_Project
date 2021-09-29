const nodemailer = require("nodemailer");

async function sendemail(emailid, email_content) {
    try {
        let testAccount = await nodemailer.createTestAccount();

        var transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            name: process.env.EMAIL_NAME,
            port: process.env.EMAIL_PORT,
            type: process.env.EMAIL_TYPE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_FROM,
            to: emailid,
            subject: "Test Welcome",
            html: email_content,
        }
        // console.log(`Coming here in config mail!`);

        transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.log('email could not be sent');
            }
            else {
                console.log('email sent');
            }
        });
    }
    catch (error) {

    }

}

module.exports = { sendemail };