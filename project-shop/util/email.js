const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}));


module.exports = (params = {}) => {
    console.log("Sending email", params);
    return transporter.sendMail({
        from: 'shop@nodejs-project.com',
        ...params
    });
};
