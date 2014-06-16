/**
 * AutoDevBot API
 *
 * Starting server:
 * -You will have to export an environment variable with the name of one of the config file:
 *      export NODE_ENV=dev_garland
 */

var CONFIG = require('config').api;
var CONFIG2 = require('config').commandAndControl;
var express = require('express');
//var routes = require('./routes');
var user = require('./routes/v1.0/user');
var signup = require('./routes/v1.0/signup');
//var githubWebhook = require('./routes/v1.0/githubWebhook.js');
var authenticate = require('./routes/v1.0/authenticate.js');
var rootEndpoint = require('./routes/rootEndpoint.js');
var internalUser = require('./routes/v1.0/internal/user.js');
var notification = require('./routes/v1.0/notification.js');
//var monitor = require('./routes/v1.0/monitor.js');
//var monitorData = require('./routes/v1.0/monitorData.js');
var passwordReset = require('./routes/v1.0/passwordReset.js');
var http = require('http');
var path = require('path');

var app = express();

var io = require('socket.io');

/**
 * Output system variables
 */
console.log('System configuration info:');
console.log('Env name: '+CONFIG.env_name);

//
// CORS Options
//

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Auth-Token');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('port', CONFIG.api_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
//app.use(express.session());
app.use(allowCrossDomain);
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Global Error Handling
// Doc: http://expressjs.com/guide.html#error-handling
//app.use(function(err, req, res, next){
//    console.error(err.stack);
//    res.send(500, 'Something broke!');
//});

//
// Authentication Middleware
//
function requireAuthentication(req, res, next) {

    //console.log('header token: '+req.headers['x-auth-token']);


    if (req.headers['x-auth-token'] !== undefined) {

        var token = req.headers['x-auth-token'];

        authenticate.isTokenValid(token, function(err, result){
            if(err){
                console.log('Error validating user token');
                res.send(401, '{"result":"failed","msg":"invalid token"}');
            }else{
                // Check if isTokenValid returned a 200
                if(result.statusCode==200){
                    console.log('Valid token');

                    //
                    // Valid token
                    //
                    // Set the auth token associated with this token so it can be accessed in each route
                    // Doc: http://expressjs.com/3x/api.html#app.set
                    app.set('auth_user_id', result.user.id);

                    next(); // allow the next route to run
                }else{
                    console.log('User does not match with user_id');
                    res.send(401, '{"result":"failed","msg":"invalid token"}');
                }
            }
        });
    } else {
        // require an authentication
        res.send(401, '{"result":"failed","msg":"invalid token"}');
    }
}

//
// REST Endpoints
//

// Root Endpoint
app.get('/', rootEndpoint.hello);
//app.get('/', routes.index);
//app.get('/users', user.list);


// Authentication endpoint
app.post('/v1.0/authenticate', authenticate.authenticate);
app.post('/v1.0/validate', authenticate.validate);

// Signup endpoint
app.post('/v1.0/signup', signup.add);

// Password Resets
app.post('/v1.0/password/resetRequest', passwordReset.request);
app.post('/v1.0/password/reset', passwordReset.reset);

// Github webhook endpoint
//app.post('/v1.0/gitHubWebHook/:user_id', githubWebhook.fromGithub);

// Internal Endpoints
app.get('/v1.0/internal/getUserInfo/:internalAuthKey/:user_id', internalUser.userInfo);

// User
app.get('/v1.0/user', requireAuthentication, user.get);

// Notification Endpoints
app.post('/v1.0/notification', requireAuthentication, notification.set);

// Monitor Endpoints
//app.post('/v1.0/monitor', requireAuthentication, monitor.set);

// Collaborator Endpoints
// app.post('/v1.0/collaborator'.....);

// monitorData Endpoints
//app.get('/v1.0/monitorData/:type/:startTimeUnixTime/:hoursToRetrieve', requireAuthentication, monitorData.get);


//
// Starting HTTP server
//
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/*
//
// Starting Socket.io
//
if (!module.parent) {

    var socket  = io.listen(server);
    const redis = require('redis');

    // CORS for socket.io
    //socket.set( 'origins', '*:*' );

    socket.on('connection', function(client) {

        // Connect to redis
        const redisSubscribe = redis.createClient(CONFIG2.redis_port, CONFIG2.redis_host);

        console.log('New socket.io connection');

        //
        // Client subscribe request to the live event stream
        //
        client.on('subscribe-event-stream', function(msg) {

            var user_id = msg.user_id;
            var authToken = msg.authToken;

            //
            // Authenticate user before letting connection join the stream.
            // Matches a valid authToken with the user_id
            //
            authenticate.isTokenValid(authToken, function(err, result){
                if(err){
                    console.log('Error validating user token');
                    console.log('Discconecting user');
                    client.disconnect();
                }else{
                    if(result.statusCode==200 && result.user.id==user_id){
                        console.log('Valid token');

                        //
                        // Let the user join this stream
                        //

                        console.log('Subscribe var user_id:'+user_id);
                        console.log('Subscribe var authToken:'+authToken);

                        // Setting the channal name that this will subscribe to
                        var channel_name = CONFIG.env_name+'_live_event_stream_'+user_id;
                        console.log('Redis channel name: '+channel_name);

                        // Subscribe to the user's channel
                        redisSubscribe.subscribe(channel_name);

                        redisSubscribe.on("message", function(channel, message) {

                            // Emit out to users when we receive a message in this Redis channel
                            client.emit('subscribe-event-stream', message);
                            console.log('msg', "received from channel #" + channel + " : " + message);
                        });


                    }else{
                        console.log('Invalid token');
                        console.log('Discconecting user');
                        client.disconnect();
                    }
                }
            });

        });

        // :TODO on client disconnect, unsubscribe to the redis channel

    });
}
*/