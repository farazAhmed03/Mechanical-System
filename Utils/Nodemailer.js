const nodeMailer = require('nodemailer');
const { VERIFICATION_EMAIL_TEMPLATE } = require('../Templates/emailVerification');

const mailSender = async (email, title, body, isRawHTML = false) => {
    try {
        let transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const htmlContent = isRawHTML 
            ? body 
            : VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', body);

        let info = await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: `${email}`,
            subject: `${title}`,
            html: htmlContent,
        });

        console.log("Message sent", info);
        return info;

    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

module.exports = mailSender;
