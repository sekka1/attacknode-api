/**
 * Password reset functionality
 *
 */

var userModel = require('../../models/users.js');
var emailNotification = require('../../libs/notifications/EmailAutoDevBot.js');
var keystone = require('../../libs/keystone/keystone.js');

/**
 * Request a password reset.  Given an email address this functionality will
 * initiate a password reset.  It will look up the user and if the user exist it
 * will send this user an email with an URL stating a password reset has been initiated.
 * The user will have to click on this link to actually reset the password.
 *
 * @param req
 * @param res
 */
exports.request = function(req, res){

    console.log('Password reset request');

    emailAddress = req.body.email;

    userModel.getUserByEmailAddress(emailAddress, function(err, data){

        if(err){
            console.log('There was an error getUserByEmailAddress()');
        }else{

            // do something with the result here
            console.log(data);

            if(data.email !== null){
                // Send email to user to reset password
                console.log('Sending email to user for resetting password...');

                var emailArray = [data.email];
                var subject = 'AutoDevBot Password Reset Request';
                var htmlBody = "Hello <br/><br/>" +
                    "This email was sent in response to your request to reset your password. To reset your password and access AutoDevBot click on this link: <a href=\"https://api.autodevbot.com/dashboard/resetPassword.html?id="+data.user_id+"&email="+data.email+"\">Reset Password</a> <br/><br/>"+
                    "If you did not request that we assist in resetting your password, please report this email to us at: <a href=\"mailto:support@autodevbot.com\">support@AutoDevBot.com</a> <br/><br/>"+
                    "Sincerely, <br/>"+
                    "AutoDevBot Support Team";

                emailNotification.send(emailArray, subject, htmlBody, htmlBody, function(err, didSend){
                    if(err){
                        console.log('Error sending email to user for password reset');
                    }else{
                        console.log('Email sent for password reset');
                    }
                });

            }else{
                // Did not find this user in our database
                console.log('Did not find this user in our database');
                res.send('{"msg":"password reset initiated"}');
            }
        }
    });

    // user output
    res.send('{"msg":"password reset initiated"}');
};

/**
 * This will change a user's password given the user_id and the new password.
 *
 * :TODO this is probably not the most secure way of doing things but this eliminates us
 * from having to store a temporary random key in a DB for this verification.
 *
 * @param req
 * @param res
 */
exports.reset = function(req, res){

    console.log('Password resetting...');

    var user_id = req.body.id;
    var email = req.body.email;
    var newPassword = req.body.newPassword;

    if(user_id !== undefined && email !== undefined && newPassword !== undefined) {

        userModel.getUserByUserId(user_id, function (err, data) {

            if (err) {
                console.log('Error getUserByUserId() in password reset');
            } else {
                console.log(data);

                if (data.Count === 1) {
                    // found user
                    if (data.Items[0].email.S === email) {
                        console.log('email address matched');

                        // reset password in Keystone
                        keystone.updatePassword(user_id, newPassword, function (err, result) {
                            if (err) {
                                console.log('Error updating users password');
                            } else {
                                if (result.outcome === 'success') {
                                    res.send('{"msg":"updated"}');
                                } else {
                                    res.send('{"msg":"An error occured while resetting your password. Please contact support at support@autodevbot.com"}');
                                }
                            }
                        });

                    } else {
                        console.log('email address did not match');

                        // exit
                        res.send('{"msg":"An error occured while resetting your password. Please contact support at support@autodevbot.com"}');
                    }
                } else {
                    console.log('Did not find this user_id');

                    // exit
                    res.send('{"msg":"An error occured while resetting your password. Please contact support at support@autodevbot.com"}');
                }
            }
        });
    }else{
        res.send('{"msg":"Required parameters are missing"}');
    }


};