/**
 * Authentication endpoints
 *
 *
 */

var keystone = require('../../libs/keystone/keystone.js');

/**
 * Authenticates a username and password.  Returns an authentication token
 * and the user_id information.
 *
 *  Return:
 *  { statusCode: 200,
  token:
   { issued_at: '2014-03-09T01:02:19.235225',
     expires: '2014-03-10T01:02:19Z',
     id: 'MIIDCQYJKoZIhvcNAQcCoIIC+jCCAvYCAQExCTAHBgUrDgMCGjCCAV8GCSqGSIb3DQEHAaCCAVAEggFMeyJhY2Nlc3MiOiB7InRva2VuIjogeyJpc3N1ZWRfYXQiOiAiMjAxNC0wMy0wOVQwMTowMjoxOS4yMzUyMjUiLCAiZXhwaXJlcyI6ICIyMDE0LTAzLTEwVDAxOjAyOjE5WiIsICJpZCI6ICJwbGFjZWhvbGRlciJ9LCAic2VydmljZUNhdGFsb2ciOiBbXSwgInVzZXIiOiB7InVzZXJuYW1lIjogImc0QGF1dG9kZXZib3QuY29tIiwgInJvbGVzX2xpbmtzIjogW10sICJpZCI6ICJkNTVhMjU0ZWRjOTg0ZmRlOTUyNjVkMDBiNjRmZDk5OCIsICJyb2xlcyI6IFtdLCAibmFtZSI6ICJnNEBhdXRvZGV2Ym90LmNvbSJ9LCAibWV0YWRhdGEiOiB7ImlzX2FkbWluIjogMCwgInJvbGVzIjogW119fX0xggGBMIIBfQIBATBcMFcxCzAJBgNVBAYTAlVTMQ4wDAYDVQQIDAVVbnNldDEOMAwGA1UEBwwFVW5zZXQxDjAMBgNVBAoMBVVuc2V0MRgwFgYDVQQDDA93d3cuZXhhbXBsZS5jb20CAQEwBwYFKw4DAhowDQYJKoZIhvcNAQEBBQAEggEANmFtl9Ygq9cELplrRT9utqycTN48DSVnnAvmOzBnDTMl4zY5DCSH18G+WtF6EdqfKMxC1FU5+8ckV1z7rN9-PHhXTztjZeTBvBBA79qIGFiGyMYnoK116zV2yMKHWXL+zsSnSIRxSg+h90jo2LWd0aCpmy7IoUgq3v7UOXBo9UODs6No18YW1+5t4IDcUGlgkPdG9CZuN9odGr1jr3TA9iLJHhAL4uscgVAX93zAOp413EPHqxsB5uFfYFNrdHTJK6-wxtltx-Hc6gcye4wrPo0hu2twu+JIUkjyaNBpkOeWvlOV20OrjRK5tUt05trOPMnqMHqZ0FUw0PZuEx6NcA==' },
  user:
   { username: 'g4@autodevbot.com',
 roles_links: [],
 id: 'd55a254edc984fde95265d00b64fd998',
 roles: [],
 name: 'g4@autodevbot.com' } }
 *
 * @param req
 * @param res
 */
exports.authenticate = function(req, res){

    var username = req.body.email;
    var password = req.body.password;

    console.log('username: '+username);
    console.log('password: '+password);

    keystone.authenticateUserPassword(username, password, function(err, result){

        if(err){
            console.log('There was an error with authenticate');
        }else{
            console.log('return to user: ');
            console.log(result);

            res.status(result.statusCode);
            res.send(JSON.stringify(result));
        }
    });

}

/**
 * Validates a token.  Return validation status and the user's info
 *
 * Return:
 { statusCode: 200,
   token:
    { issued_at: '2014-03-09T01:02:19.235225',
      expires: '2014-03-10T01:02:19Z',
      id: 'MIIDCQYJKoZIhvcNAQcCoIIC+jCCAvYCAQExCTAHBgUrDgMCGjCCAV8GCSqGSIb3DQEHAaCCAVAEggFMeyJhY2Nlc3MiOiB7InRva2VuIjogeyJpc3N1ZWRfYXQiOiAiMjAxNC0wMy0wOVQwMTowMjoxOS4yMzUyMjUiLCAiZXhwaXJlcyI6ICIyMDE0LTAzLTEwVDAxOjAyOjE5WiIsICJpZCI6ICJwbGFjZWhvbGRlciJ9LCAic2VydmljZUNhdGFsb2ciOiBbXSwgInVzZXIiOiB7InVzZXJuYW1lIjogImc0QGF1dG9kZXZib3QuY29tIiwgInJvbGVzX2xpbmtzIjogW10sICJpZCI6ICJkNTVhMjU0ZWRjOTg0ZmRlOTUyNjVkMDBiNjRmZDk5OCIsICJyb2xlcyI6IFtdLCAibmFtZSI6ICJnNEBhdXRvZGV2Ym90LmNvbSJ9LCAibWV0YWRhdGEiOiB7ImlzX2FkbWluIjogMCwgInJvbGVzIjogW119fX0xggGBMIIBfQIBATBcMFcxCzAJBgNVBAYTAlVTMQ4wDAYDVQQIDAVVbnNldDEOMAwGA1UEBwwFVW5zZXQxDjAMBgNVBAoMBVVuc2V0MRgwFgYDVQQDDA93d3cuZXhhbXBsZS5jb20CAQEwBwYFKw4DAhowDQYJKoZIhvcNAQEBBQAEggEANmFtl9Ygq9cELplrRT9utqycTN48DSVnnAvmOzBnDTMl4zY5DCSH18G+WtF6EdqfKMxC1FU5+8ckV1z7rN9-PHhXTztjZeTBvBBA79qIGFiGyMYnoK116zV2yMKHWXL+zsSnSIRxSg+h90jo2LWd0aCpmy7IoUgq3v7UOXBo9UODs6No18YW1+5t4IDcUGlgkPdG9CZuN9odGr1jr3TA9iLJHhAL4uscgVAX93zAOp413EPHqxsB5uFfYFNrdHTJK6-wxtltx-Hc6gcye4wrPo0hu2twu+JIUkjyaNBpkOeWvlOV20OrjRK5tUt05trOPMnqMHqZ0FUw0PZuEx6NcA==' },
   user:
    { username: 'g4@autodevbot.com',
 roles_links: [],
 id: 'd55a254edc984fde95265d00b64fd998',
 roles: [],
 name: 'g4@autodevbot.com' } }
 *
 * @param req
 * @param res
 */
exports.validate = function(req, res){

    var token = req.body.token;

    console.log('token: '+token);

    keystone.validateToken(token, function(err, result){

        if(err){
            console.log('There was an error in validate');
        }else{
            console.log(result);

            res.status(result.statusCode);
            res.send(JSON.stringify(result));
        }
    });
}

/**
 * Validates a token against keystone
 *
 * Returns the user object from keystone
 *
 { statusCode: 200,
   token:
    { issued_at: '2014-03-09T01:02:19.235225',
      expires: '2014-03-10T01:02:19Z',
      id: 'MIIDCQYJKoZIhvcNAQcCoIIC+jCCAvYCAQExCTAHBgUrDgMCGjCCAV8GCSqGSIb3DQEHAaCCAVAEggFMeyJhY2Nlc3MiOiB7InRva2VuIjogeyJpc3N1ZWRfYXQiOiAiMjAxNC0wMy0wOVQwMTowMjoxOS4yMzUyMjUiLCAiZXhwaXJlcyI6ICIyMDE0LTAzLTEwVDAxOjAyOjE5WiIsICJpZCI6ICJwbGFjZWhvbGRlciJ9LCAic2VydmljZUNhdGFsb2ciOiBbXSwgInVzZXIiOiB7InVzZXJuYW1lIjogImc0QGF1dG9kZXZib3QuY29tIiwgInJvbGVzX2xpbmtzIjogW10sICJpZCI6ICJkNTVhMjU0ZWRjOTg0ZmRlOTUyNjVkMDBiNjRmZDk5OCIsICJyb2xlcyI6IFtdLCAibmFtZSI6ICJnNEBhdXRvZGV2Ym90LmNvbSJ9LCAibWV0YWRhdGEiOiB7ImlzX2FkbWluIjogMCwgInJvbGVzIjogW119fX0xggGBMIIBfQIBATBcMFcxCzAJBgNVBAYTAlVTMQ4wDAYDVQQIDAVVbnNldDEOMAwGA1UEBwwFVW5zZXQxDjAMBgNVBAoMBVVuc2V0MRgwFgYDVQQDDA93d3cuZXhhbXBsZS5jb20CAQEwBwYFKw4DAhowDQYJKoZIhvcNAQEBBQAEggEANmFtl9Ygq9cELplrRT9utqycTN48DSVnnAvmOzBnDTMl4zY5DCSH18G+WtF6EdqfKMxC1FU5+8ckV1z7rN9-PHhXTztjZeTBvBBA79qIGFiGyMYnoK116zV2yMKHWXL+zsSnSIRxSg+h90jo2LWd0aCpmy7IoUgq3v7UOXBo9UODs6No18YW1+5t4IDcUGlgkPdG9CZuN9odGr1jr3TA9iLJHhAL4uscgVAX93zAOp413EPHqxsB5uFfYFNrdHTJK6-wxtltx-Hc6gcye4wrPo0hu2twu+JIUkjyaNBpkOeWvlOV20OrjRK5tUt05trOPMnqMHqZ0FUw0PZuEx6NcA==' },
   user:
    { username: 'g4@autodevbot.com',
 roles_links: [],
 id: 'd55a254edc984fde95265d00b64fd998',
 roles: [],
 name: 'g4@autodevbot.com' } }
 *
 * @param token
 * @param callback
 */
exports.isTokenValid = function(token, callback){
    keystone.validateToken(token, function(err, result){

        if(err){
            console.log('There was an error in validate');
            callback(true, null);
        }else{
            console.log(result);

            callback(null, result);
        }
    });
}