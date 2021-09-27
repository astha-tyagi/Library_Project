require('dotenv').config();
const nodemailer = require("nodemailer");

// async function sendmail(mailOptions) {
var sendmail = async (send_to, mail_subject, email_contents) => {
    try {
        console.log(mail_subject);
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

        var email_content = email_contents;
        // console.log(`send to! ${send_to}`);
        let mailOptions = {
            from: process.env.EMAIL_FROM,
            to: send_to,
            subject: mail_subject,
            html: email_content,
        }
        transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.log(`email could not be sent
                ${err}`);
            }
            else {
                console.log('email sent');
            }
        });
    }
    catch (err) {
        console.log(`Error: ${err}`);
    }
}
// var email = async (send_to, mail_subject, email_contents) => {
// var email = async function sendmail(send_to, mail_subject, email_contents) {
//     // console.log(send_to);
//     // var send_to = send_to;
//     console.log('hello here!');
//     // console.log(mail_subject);
//     // console.log(email_contents);

//     let testAccount = await nodemailer.createTestAccount();

//     var transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         name: process.env.EMAIL_NAME,
//         port: process.env.EMAIL_PORT,
//         type: process.env.EMAIL_TYPE,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASSWD
//         }
//     });

//     var email_content = email_contents;
//     // console.log(`send to! ${send_to}`);
//     let mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to: send_to,
//         subject: mail_subject,
//         html: email_content,
//     }
//     // console.log(`From: ${mailOptions.from}, to: ${mailOptions.to}, subject: ${mailOptions.subject}, html: ${mailOptions.html}`);
//     transporter.sendMail(mailOptions, function (err, data) {
//         if (err) {
//             console.log('email could not be sent');
//         }
//         else {
//             console.log('email sent');
//         }
//     });
// }

module.exports = sendmail;