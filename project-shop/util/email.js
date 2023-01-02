const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));


module.exports = (params = {}) => {
    console.log("Sending email", params);
    return transporter.sendMail({
        from: 'shop@nodejs-project.com',
        ...params
    });
};
