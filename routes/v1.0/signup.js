/**
 * Signup API functionality
 *
 * 1) Creates this user if they do not exist in keystone.  Returns user_id which is our GUID
 * 2) Puts this information into DynamoDB
 * 3) Submits rest of the provisioning job into the queue <env>_provision_new_user to do the rest of the job
 *
 */
var CONFIG = require('config').api;
var keystone = require('../../libs/keystone/keystone.js');
var aws = require('../../libs/AWS/aws.js');
//var MQ = require('../../libs/Softlayer/MessageQueue.js');

// Load DynamoDb Object
var dynamodb = aws.getDynamodb();

/*
 * POST user sign up
 */
exports.add = function(req, res){

    console.log(req.body.email);
    console.log(req.body.password);
    console.log(req.body.github_user);

    var email = req.body.email;
    var password = req.body.password;
    var github_user = req.body.github_user;
    var betaCode = req.body.beta_code;

    // Response header for Cross Site Scripting calls.
    // Pretty much everything will be a XSS call.
    res.header("Access-Control-Allow-Origin", "*");

    // :TODO check if the user already exist in the user's table
    // :TODO the keystone.createUser has this functionality already.  Need another check?

    if( (email !== undefined && password !== undefined && github_user !== undefined)

        //
        // Checking for beta code.  Can take this out anytime
        && (betaCode == 'f7d6' || betaCode == '18c6' || betaCode == 'db79' || betaCode == 'f3a8' || betaCode == '8d1b' || betaCode == '4a3a' || betaCode == 'bc0f' || betaCode == '5d38' ) ){

        console.log('Beta code: '+betaCode);

        // Create user in OpenStack Keystone
        keystone.createUser(email, password, function(err, result){

            if(err){
                console.log('Error occured creating user');

            }else{
                console.log(result);

                console.log(result.email);

                if(result.created){
                    // Insert this user into DynamoDb Table

                    addUserToDynamo(result.user_id, result.email, github_user, betaCode);

                    // Add task into the provisioning queue
                    //var mq_provision_new_user = CONFIG.mq_provision_new_user;
                    // send that info into the queue
                    //var queueObject = new Object();
                    //queueObject.body = 'provisioning new user';
                    /*queueObject.fields = { user_id: result.user_id,
                                            github_user: github_user,
                                            repo_name: result.user_id,
                                            email: result.email
                                          };
                                          */

                    // POST message to the queue
                    //console.log('pushing message to queue: '+mq_provision_new_user);
                    //MQ.queuesPOST(mq_provision_new_user, queueObject);

                }

                // Send output to the API call
                res.send(JSON.stringify(result));
            }
        });
    }else{
        // Send output to the API call
        var returnObj = new Object();
        returnObj.created = false;
        returnObj.message = 'Missing input parameters';
        res.send(JSON.stringify(returnObj));
    }
};

/**
 * Inserts a record into the DynamoDB table <env>_users
 *
 * @param user_id
 * @param email
 * @param github_user
 */
function addUserToDynamo(user_id, email, github_user, betaCode){

    var tablename = CONFIG.aws_dynamodb_table_users;

    // Date and time now
    var date = new Date();


    var db_item = {};
    db_item.user_id = { 'S': user_id.toString() };
    db_item.email = { 'S': email.toString() };
    db_item.github_user = { 'S': github_user.toString() };
    db_item.created_on_unixtime = { 'N': Date.parse(date).toString() };
    db_item.created_on = { 'S': date.toString() };
    db_item.isEmailVerified = { 'S': 'false'.toString() };
    db_item.beta_code = { 'S': betaCode.toString() };

    // Put item into DynamoDB
    dynamodb.putItem({
        'TableName': tablename,
        'Item': db_item
    }, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
        } else {
            console.log('Saving data into dynamodb...');
            console.log('createdOn: '+date);
            console.log(data); // successful response
        }
    });
}