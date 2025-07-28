const mongoose = require('mongoose');
const mailSender = require('../Utils/Nodemailer');

const otpSchema = new mongoose.Schema({

  // !Stores the email address for which the OTP is generated
  email: {
    type: String,
    required: true,
  },

  // !Stores the actual OTP value
  otp: {
    type: String,
    required: true,
  },

  // !Stores the timestamp of OTP creation
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes 
  }

});

// !Function to send a verification email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(email, "Verification email from LegalSphere", otp);
    console.log("Email sent successfully", mailResponse);
  } catch (error) {
    console.log("An Error Occured while sending mail", error);
    throw error;
  }
}


// !Pre-save hook OTP schema
otpSchema.pre('save', async function (next) {
  try {
    await sendVerificationEmail(this.email, this.otp);
    next();
  } catch (err) {
    console.log("Error sending email:", err.message);
    next(err);
  }
});

const otpModel = mongoose.model('OTP', otpSchema);
module.exports = otpModel;