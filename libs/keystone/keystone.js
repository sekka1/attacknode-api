/**
 * OpenStack Keystone functionality
 *
 * Docs: http://docs.openstack.org/api/openstack-identity-service/2.0/content/GET_listUsers_v2.0_users_User_Operations_OS-KSADM.html#GET_listUsers_v2.0_users_User_Operations_OS-KSADM-Request
 * API ref: http://docs.openstack.org/developer/keystone/api_curl_examples.html
 */
var CONFIG = require('config').api;
var http = require('http'); // Using http, can also use https for SSL

/**
 * Creates a user in Keystrone
 *
 * @param email
 * @param password
 * @param callback
 */
exports.createUser = function(email, password, callback){

    // :TODO probably should do a check against DynamoDb user's table before getting to this point.
    // Check if user exist before adding
    doesUserExistByEmail(email, function(err, userExist){

        var returnObj = new Object();

        if(userExist){
            console.log('User email exist in keystone already.');

            returnObj.email = email;
            returnObj.message = 'User Exists';
            returnObj.created = false;
            callback(null, returnObj);
        }else{
            // Continue to add this user

            console.log('Creating user in keystone...');
            console.log(CONFIG.keystone_host);
            console.log(CONFIG.keystone_port_internal);

            var endpoint = '/'+CONFIG.keystone_version+'/users';
            var method = 'POST';

            var headers = {
                'Content-Type': 'application/json',
                'X-Auth-Token': CONFIG.keystone_auth_token
            };

            var options = {
                host: CONFIG.keystone_host,
                port: CONFIG.keystone_port_internal,
                path: endpoint,
                method: method,
                headers: headers
            };

            var post_string = '{"user":{"name":"'+email+'","email":"'+email+'","enabled":true,"password":"'+password+'"}}';

            var req = http.request(options, function(res) {
                res.setEncoding('utf-8');
                var statusCode = res.statusCode;

                var responseString = '';

                res.on('data', function(data) {
                    responseString += data;
                });

                res.on('end', function() {
                    console.log('Keystone POST create user status code: '+statusCode);
                    console.log(responseString);
                    var responseObject = JSON.parse(responseString);

                    returnObj.email = responseObject.user.name;
                    returnObj.user_id = responseObject.user.id;
                    returnObj.enabled = responseObject.user.enabled;
                    returnObj.message = 'User created';
                    returnObj.created = true;

                    callback(null, returnObj);
                });
            });

            req.write(post_string);
            req.end();
        }

    });
};

/**
 * Returns all users in the system
 *
 * @return obj
 * {
  "users": [
    {
      "name": "admin",
      "enabled": true,
      "email": "admin@example.com",
 "id": "49fa89f2830b4cd6838d8678d0795943"
 }
 ]
 }
 */
function listUsers(callback){

    console.log('Listing user in keystone...');
    console.log(CONFIG.keystone_host);
    console.log(CONFIG.keystone_port_internal);

    var endpoint = '/'+CONFIG.keystone_version+'/users';
    var method = 'GET';

    var headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token': CONFIG.keystone_auth_token
    };

    var options = {
        host: CONFIG.keystone_host,
        port: CONFIG.keystone_port_internal,
        path: endpoint,
        method: method,
        headers: headers
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf-8');
        var statusCode = res.statusCode;

        var responseString = '';

        res.on('data', function(data) {
            responseString += data;  // Keep appending to data.  Appears it comes in chunks
        });

        res.on('end', function() {
            console.log('Keystone POST list user status code: '+statusCode);
            //console.log(responseString);

            returnObj = JSON.parse(responseString);

            callback(null, returnObj);
        });
    });

    req.end();
};

/**
 * Returns a boolean if a user exist in keystone via email key.
 *
 * @param email
 * @param callback
 * @return boolean
 */
function doesUserExistByEmail(email, callback){

    // Get a list of the users and check if the email is in it
    listUsers(function(err, result){

        var userExists = false;

        if(err){
            console.log('error retrieving keystone userList');
        }else{
            // Loop through the results to find user

            //console.log('user list length: '+ result.users.size );

            result.users.forEach(function(item){

                if(item.name == email){
                    userExists = true;
                }
            });

            callback(null, userExists);
        }
    });
};

/**
 * Authenticates by a username and password.
 *
 * Returns:
 *  -token
 *  -user_id
 *
 *  -Keystone docs: http://docs.openstack.org/api/quick-start/content/
 *
 * @param username
 * @param password
 * @param callback
 */
exports.authenticateUserPassword = function(username, password, callback){

    console.log('authenticateUserPassword user in keystone...');
    console.log(CONFIG.keystone_host);
    console.log(CONFIG.keystone_port_internal);

    var returnObj = new Object();

    var endpoint = '/'+CONFIG.keystone_version+'/tokens';
    var method = 'POST';

    var headers = {
        'Content-Type': 'application/json'
    };

    var options = {
        host: CONFIG.keystone_host,
        port: CONFIG.keystone_port_internal,
        path: endpoint,
        method: method,
        headers: headers
    };

    var post_string = '{"auth":{"passwordCredentials":{"username": "'+username+'", "password": "'+password+'"}}}';

    var req = http.request(options, function(res) {
        res.setEncoding('utf-8');
        var statusCode = res.statusCode;
        returnObj.statusCode = statusCode;

        var responseString = '';

        res.on('data', function(data) {
            responseString += data;
        });

        res.on('end', function() {
            console.log('Keystone POST authenticateUserPassword user status code: '+statusCode);
            console.log(responseString);

            var responseObject = JSON.parse(responseString);

            if(statusCode == 200){
                // User authenticated successfully

                returnObj.token = responseObject.access.token;
                returnObj.user = responseObject.access.user;
            }else{
                // Something other than a successful authentication

                returnObj.error = responseObject.error;
            }

            callback(null, returnObj);
        });
    });

    req.write(post_string);
    req.end();
};

/**
 * Validates an authentication token
 *
 * Docs:
 * http://docs.openstack.org/developer/keystone/api_curl_examples.html
 * http://docs.openstack.org/api/openstack-identity-service/2.0/content/Admin_API_Service_Developer_Operations-d1e1356.html
 *
 * @param token
 * @param callback
 */
exports.validateToken = function(token, callback){

    console.log('validateToken user in keystone...');
    console.log(CONFIG.keystone_host);
    console.log(CONFIG.keystone_port_internal);

    var returnObj = new Object();

    var endpoint = '/'+CONFIG.keystone_version+'/tokens/'+token;
    var method = 'GET';

    var headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token': CONFIG.keystone_auth_token
    };

    var options = {
        host: CONFIG.keystone_host,
        port: CONFIG.keystone_port_internal,
        path: endpoint,
        method: method,
        headers: headers
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf-8');
        var statusCode = res.statusCode;
        returnObj.statusCode = statusCode;

        var responseString = '';

        res.on('data', function(data) {
            responseString += data;
        });

        res.on('end', function() {
            console.log('Keystone GET validateToken user status code: '+statusCode);
            console.log(responseString);

            var responseObject = JSON.parse(responseString);

            if(statusCode == 200){
                // authenticated successfully

                returnObj.token = responseObject.access.token;
                returnObj.user = responseObject.access.user;
            }else{
                // Something other than a successful authentication

                returnObj.error = responseObject.error;
            }

            callback(null, returnObj);
        });
    });

    req.end();
};

exports.updatePassword = function(user_id, newPassword, callback){

    console.log('updatePassword in keystone...');
    console.log(CONFIG.keystone_host);
    console.log(CONFIG.keystone_port_internal);

    var returnObj = new Object();

    var endpoint = '/'+CONFIG.keystone_version+'/users/'+user_id+'/OS-KSADM/password';
    var method = 'PUT';

    var headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token': CONFIG.keystone_auth_token
    };

    var options = {
        host: CONFIG.keystone_host,
        port: CONFIG.keystone_port_internal,
        path: endpoint,
        method: method,
        headers: headers
    };

    //var post_string = '{"user": {"password": "'+newPassword+'", "id": "'+user_id+'"}}';
    var post_obj = {"user": {"password": newPassword, "id": user_id}};

    var req = http.request(options, function(res) {
        res.setEncoding('utf-8');
        var statusCode = res.statusCode;
        returnObj.statusCode = statusCode;

        var responseString = '';

        res.on('data', function(data) {
            responseString += data;
        });

        res.on('end', function() {
            console.log('Keystone POST authenticateUserPassword user status code: '+statusCode);
            console.log(responseString);

            var responseObject = JSON.parse(responseString);

            if(statusCode == 200){
                // User authenticated successfully

                returnObj.outcome = 'success';
            }else{
                // Something other than a successful authentication

                returnObj.outcome = 'failed';
                returnObj.error = responseObject.error;
            }

            callback(null, returnObj);
        });
    });

    req.write(JSON.stringify(post_obj));
    req.end();

}