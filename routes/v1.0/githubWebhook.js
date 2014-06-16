/**
 * Github webhook functionality
 *
 *
 */
var table_users = require('../../models/users.js');

/**
 * Call back from GitHub's webhook.  This is set to happen on a push into
 * a repo.
 *
 * URL: http://localhost:8080/v1.0/gitHubWebHook/<user_id>?tempKey=17a0989ba2deda3b00e0bf8e1248fb47
 *
 * INPUT:
 * :user_id - the user id this webhook is for
 * tempKey - :TODO not really using this but was thinking using this for some security checking
 *
 * @param req
 * @param res
 */
exports.fromGithub = function(req, res){

    var user_id = req.params.user_id;
    var tempKey = req.query.tempKey;

    console.log('user_id: '+user_id);
    console.log('tempKey: '+req.query.tempKey);

    if(user_id !== undefined && tempKey !== undefined){

        //
        // Query DB on this user_id and retrieve information
        //
        table_users.getUserByUserId(user_id, function(err, result){

            if(err){
                console.log('Error retrieving by user_id');
            }else{
                console.log('Retrieved by user_id');
                console.log(result);

                if(result.Count !== undefined && result.Items !== undefined){
                    // Query ran successfully

                    if(result.Count ==1){
                        // Found user, send C&C command to have it pull from repo

                        var email = result.Items[0].email.S;
                        var repo_name = result.Items[0].clone_url.S;
                        var location = 'tbd'; // This needs to be a container env.  cant have C&C replace it

                        console.log('Sending C&C command to repull repo for: '+email+' - '+repo_name);

                        // Issue C&C command to have these containers repull from the repo
                        sendRedisCommandToPullCode(user_id, email, repo_name, location);

                        // Send message to the user's live stream
                        console.log('Sending notification to users live stream');
                        sendToUsersEventStream(user_id, {
                            eventType: "system_provisioning",
                            createdOn: new Date(),
                            status: "completed",
                            item: "Github Push",
                            description: "There was a push event into the repo.  Re-pulling the master branch into all monitoring nodes."
                        });

                        res.send('{"message":"Life is great!"}');
                    }else if(result.Count > 1){
                        console.log('Found more than 1 user.  Something is really wrong here.');
                        res.send('{"message":"error3"}');
                    }else{
                        console.log('Did not find user');
                        res.send('{"message":"error2"}');
                    }
                }

            }
        })

        //
        // If found run the C&C sendRedisCommandToPullCode() function
        //
    }else{
        // Send output to the API call
        res.send('{"message":"error"}');
    }

}


/**
 * Sends the C&C to redis that a container is listening on to pull code
 *
 * @param user_id
 * @param email
 * @param repo_name - aka clone_url
 * @param location
 */
function sendRedisCommandToPullCode(user_id, email, repo_name, location){
    var CONFIG = require('config').commandAndControl;
    var CONFIG2 = require('config').githubAuthentication;
    var redis = require("redis");
    var client = redis.createClient(CONFIG.redis_port, CONFIG.redis_host);

    var channel_name = 'production_frisbyContainer_CandC_'+user_id;
    var message = '{"user_id":"'+user_id+'","username":"'+email+'","email":"'+email+'","github_url":"'+repo_name+'","location":"'+location+'","oauth_token":"'+CONFIG2.oauthToken+'"}';

    // Publish to channel
    console.log('Publishing to channel: '+channel_name);
    console.log('Published message: '+message);
    client.publish(channel_name, message);

}

/**
 * Publishes a message into the <evn>_live_event_stream_<user_id> channel.
 *
* @param user_id
* @param eventObject - {
    eventType: "system_provisioning",
    createdOn: new Date(),
    status: "completed",
    item: "something",
    description: "making something here"
}
*/
function sendToUsersEventStream(user_id, eventObject){
    var CONFIG = require('config').commandAndControl;
    var CONFIG2 = require('config').api;
    var redis = require("redis");
    var client = redis.createClient(CONFIG.redis_port, CONFIG.redis_host, {connect_timeout: 1800});
    var redisRoom = CONFIG2.env_name+'_live_event_stream_'+user_id;
    console.log('Publishing to Redis room: '+redisRoom);
    client.publish(redisRoom, JSON.stringify(eventObject));
}