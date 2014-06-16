

var userModel = require('../../models/users.js');

/**
 * Get a user's information.
 *
 * Returns the entire user's object
 *
 * @param req
 * @param res
 */
exports.get = function(req, res){

    var user_id = req.app.get('auth_user_id'); //req.params.user_id;
    //var token = req.params.token;

    console.log(user_id);

    //
    // Query DB on this user_id and retrieve information
    //
    userModel.getUserByUserId(user_id, function(err, result){

        if(err){
            console.log('Error retrieving by user_id');
        }else{
            console.log('Retrieved by user_id');
            console.log(result);

            if(result.Count !== undefined && result.Items !== undefined){
                // Query ran successfully

                if(result.Count ==1){
                    // Found user, send C&C command to have it pull from repo
                    console.log('Found user');

                    // Set return object for output
                    var returnObj = new Object();
                    returnObj.user_id = result.Items[0].user_id.S;
                    // Return default value if this field is not in the user's row already
                    returnObj.email = (typeof result.Items[0].email === 'undefined') ? 'unknown' : result.Items[0].email.S;
                    returnObj.github_user = (typeof result.Items[0].github_user === 'undefined') ? 'unknown' : result.Items[0].github_user.S;
                    returnObj.clone_url = (typeof result.Items[0].clone_url === 'undefined') ? 'unknown' : result.Items[0].clone_url.S;
                    returnObj.monitors = (typeof result.Items[0].monitors === 'undefined') ? {"isEnabled":true,"interval":1} : JSON.parse(result.Items[0].monitors.S);
                    returnObj.notifications = (typeof result.Items[0].notifications === 'undefined') ? {"isEnabled":false,"email":["Email Address"]} : JSON.parse(result.Items[0].notifications.S);
                    returnObj.isEmailVerified = (typeof result.Items[0].isEmailVerified === 'undefined') ? false : result.Items[0].isEmailVerified.S;

                    console.log(returnObj);

                    res.send(JSON.stringify(returnObj));

                }else{
                    // Did not find a user
                    console.log('Did not find user');

                    res.send('{"msg":"no user found"}');
                }
            }
        }
    });

};