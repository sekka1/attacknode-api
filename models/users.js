/**
 * The <env>_users table model
 *
 * Docs:
 * query: http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
 * putitem: http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html
 */
var CONFIG = require('config').api;
var aws = require('../libs/AWS/aws.js');

// Load DynamoDb Object
var dynamodb = aws.getDynamodb();

/**
 * Retrieves a users information by a user_id
 *
 * Actually right now, this is the only way to retrieve a user's information.  Unless you want
 * to scan the entire <env>_users table.
 *
 * @param user_id
 */
exports.getUserByUserId = function(user_id, callback){

    // Query parameters
    var params = {
        "TableName": CONFIG.aws_dynamodb_table_users,
        "ConsistentRead": false,
        "KeyConditions":
        {
            "user_id" :
            {
                "AttributeValueList": [
                    {
                        "S": user_id
                    }
                ],
                "ComparisonOperator": "EQ"
            }
        },
        "ReturnConsumedCapacity": "TOTAL",
        "Select": "ALL_ATTRIBUTES"
    };

    dynamodb.query(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
            callback(true, null);
        } else {

            callback(null, data);

            //console.log(data); // successful response
        }
    });

};

/**
 * Returns a user's information by an email address.
 *
 * This is an expensive operation since it would get the full
 * DynamoDB table then loop through each one trying to find the
 * email address.
 *
 * :TODO find a way to make this more efficient
 *
 * @param {string} email
 */
exports.getUserByEmailAddress = function(email, callback){

    var didFindUser = false;

    // Query parameters
    var params = {
        "TableName": CONFIG.aws_dynamodb_table_users,
        "ReturnConsumedCapacity": "TOTAL",
        "Select": "SPECIFIC_ATTRIBUTES",
        "AttributesToGet": ["user_id", "email"]
    };

    dynamodb.scan(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
            callback(true, null);
        } else {
            if(data.Count > 0){
                // Look for the email address that was passed into this function
                //console.log(data);

                var user_id = null;

                for(var i=0; i<data.Count; i++){
                    if(data.Items[i].email.S === email){
                        console.log('Found email address in user table: '+email+' user_id: '+data.Items[i].user_id.S);

                        didFindUser = true;
                        user_id = data.Items[i].user_id.S;
                    }

                    // Do callback.  Yeah, looping through the entire list before returning even if it is found
                    // :TODO fix this
                    if(data.Count-1 === i){
                        if(didFindUser)
                            callback(false, {"email":email, "user_id":user_id});
                        else
                            callback(false, {"email":null, "user_id":null});
                    }
                }

            }else{
                // no users found in table
                callback(true, null);
            }
        }
    });
};

/**
 * Updates a user's notification parameter field
 *
 * @param user_id
 * @param notificationObject
 * {    token: '1234',
        email: [ 'email1@email.com', 'email2@email.com' ],
        pagerDuty: false
   }
 * @param callback
 */
exports.setNotification = function(user_id, notificationObject, callback){

    // Update parameters
    var params = {
        "TableName": CONFIG.aws_dynamodb_table_users,
        "Key":
        {
            "user_id" :
            {
                "S": user_id
            }
        },
        "AttributeUpdates":
        {
            "notifications": {
                "Value": {
                    "S": JSON.stringify(notificationObject)
                },
                "Action": "PUT"
            }
        }
    };

    dynamodb.updateItem(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
            callback(true, null);
        } else {

            callback(null, true);

            //console.log(data); // successful response
            console.log('Updated users notification: ');
        }
    });
};

/**
 * Updates a user's monitor parameter field
 *
 * Used for controlling a users monitoring settings
 *
 * @param user_id
 * @param monitorObject
 * {    token: '1234',
        globalSetting: 'on',
        interval: 5
    }
 * @param callback
 */
exports.setMonitor = function(user_id, monitorObject, callback){

    // Update parameters
    var params = {
        "TableName": CONFIG.aws_dynamodb_table_users,
        "Key":
        {
            "user_id" :
            {
                "S": user_id
            }
        },
        "AttributeUpdates":
        {
            "monitors": {
                "Value": {
                    "S": JSON.stringify(monitorObject)
                },
                "Action": "PUT"
            }
        }
    };

    dynamodb.updateItem(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
            callback(true, null);
        } else {

            callback(null, true);

            //console.log(data); // successful response
            console.log('Updated users monitor: ');
        }
    });
};

exports.setCollaborator = function(user_id, collaboratorObject, callback){

    // collaboratorObject = {"user1","user2","user3"}
};