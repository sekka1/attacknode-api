/**
 * Emailer using an AutoDevBot Amazon AWS SES
 *
 * smtp mailer: https://github.com/andris9/Nodemailer
 *      -List of known service for this mailer: https://github.com/andris9/nodemailer#well-known-services-for-smtp
 *      -Possible transport method: https://github.com/andris9/nodemailer#possible-transport-methods
 *
 */
var CONFIG = require('config').autoDevBotEmailSetting;

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport(CONFIG.service, {
    AWSAccessKeyID: CONFIG.SES_AWSAccessKeyID,
    AWSSecretKey: CONFIG.SES_AWSSecretKey
});

/**
 * Sending email with AutoDevBot's SMTP server
 *
 * [ 'g1@autodevbot.com', 'g2@autodevbot.com' ]
 *
 * @param {array} inputs
 */
exports.send = function(inputs, subject, text, html, callback){
    console.log('Sending email for user...');
    //console.log(inputs[0]);

    inputs.forEach(function(anEmail){

        console.log('Sending email to: '+anEmail);

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: "AutoDevBot <no-reply@autodevbot.com>", // sender address
            to: anEmail, //"bar@blurdybloop.com, baz@blurdybloop.com", // list of receivers
            subject: subject, // Subject line
            text: text, // plaintext body
            html: html  //"<b>Hello world ✔</b>" // html body
        }

        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                callback(true, null);
            }else{
                console.log("Message sent: " + response.message);
                callback(null, true);
            }
        });
    });

    smtpTransport.close(); // shut down the connection pool, no more messages
}