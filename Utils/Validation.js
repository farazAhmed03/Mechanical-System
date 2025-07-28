const validator = require('validator');
const passwordValidator = require('password-validator');
const Joi = require('joi');

// ======================== Password Validation ========================
const passwordSchema = new passwordValidator()
    .is().min(8)                
    .is().max(100)            
    .has().uppercase()            
    .has().lowercase()            
    .has().digits(1)             
    .has().symbols(1)             
    .has().not().spaces();        


const validatePassword = (password) => {
    const errors = passwordSchema.validate(password, { details: true });
    return {
        isValid: errors.length === 0,
        errors: errors.map(err => err.message)
    };
};

// ======================== Email Validation ========================
const validateEmail = (email) => {
    if (!validator.isEmail(email)) {
        return {
            isValid: false,
            error: 'Please enter a valid email address'
        };
    }

    // Additional checks for TLDs
    const domain = email.split('@')[1];
    if (!domain || !domain.includes('.')) {
        return {
            isValid: false,
            error: 'Email domain is invalid'
        };
    }

    return { isValid: true };
};

// ======================== Username Validation ========================
const validateUsername = (username) => {
    const schema = Joi.string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, 'letters, numbers and underscore')
        .required();

    const { error } = schema.validate(username);
    return {
        isValid: !error,
        error: error ? error.details[0].message : null
    };
};

module.exports = {
    validatePassword,
    validateEmail,
    validateUsername
};