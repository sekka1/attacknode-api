/**
 * Internal User information functionality
 *
 */
var userModel = require('../../../models/users.js');

/**
 * Gets a user object from DynamoDb
 *
 * {
  "ConsumedCapacity": {
    "CapacityUnits": 0.5,
    "TableName": "garland_users"
  },
  "Count": 1,
  "Items": [
    {
      "beta_code": {
        "S": "f7d6"
      },
      "notifications": {
        "S": "{\"email\":[\"g1@autodevbot.com\",\"g2@autodevbot.com\"],\"webhook\":{\"host\":\"example.com\",\"endpoint\":\"/hitme\"},\"pagerDuty\":false,\"x_other\":false}"
 },
 "created_on": {
        "S": "Wed Mar 05 2014 18:19:25 GMT-0800 (PST)"
      },
 "clone_url": {
        "S": "https://github.com/AutoDevBot/158e07d3d93c4080906c2e92a3e75d4a.git"
      },
 "github_user": {
        "S": "sekka1"
      },
 "email": {
        "S": "d2@d1.com"
 },
 "isEmailVerified": {
        "S": "false"
      },
 "created_on_unixtime": {
        "N": "1394072365000"
      },
 "repo_plain_name": {
        "S": "158e07d3d93c4080906c2e92a3e75d4a"
      },
 "user_id": {
        "S": "158e07d3d93c4080906c2e92a3e75d4a"
      }
 }
 ]
 }
 *
 * @param req
 * @param res
 */
exports.userInfo = function(req, res){

    var internalAuthKey = req.params.internalAuthKey;
    var user_id = req.params.user_id;

    console.log(internalAuthKey);
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

            var userJSON = JSON.stringify(result);

            if(result.Count !== undefined && result.Items !== undefined){
                // Query ran successfully

                if(result.Count ==1){
                    // Found user, send C&C command to have it pull from repo
                    console.log('Found user');

                    console.log(userJSON);

                    res.send(userJSON);

                }else{
                    // Did not find a user
                    console.log('Did not find user');

                    res.send(userJSON);
                }
            }
        }
    });

}
