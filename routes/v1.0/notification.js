/**
 * Notification REST Endpoint
 *
 * -set - allows user to set the notification object (json)
 *
 */

var userModel = require('../../models/users.js');


/**
 * Sets the notification field in a user's object
 *
 * @param req
 * @param res
 */
exports.set = function(req, res){

    var user_id = req.app.get('auth_user_id'); // req.params.user_id;
    //var token = req.body.token;

    console.log('auth_user_id: '+user_id);

    // :TODO probably should validate the incoming JSON object

    // Update notifications setting
    userModel.setNotification(user_id, req.body, function(err, success){

        if(err){
            console.log('error tring setUsersNotification');
        }else{
            console.log('success setUsersNotification');
            res.send(200, '{"result":"success","msg":"updated"}');
        }
    });

}