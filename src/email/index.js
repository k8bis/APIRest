const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth:{
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS
    },
    tls:{
        rejectUnauthorized: false
    }
});

module.exports = transporter;