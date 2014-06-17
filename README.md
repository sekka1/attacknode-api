AttackNode API
==============

# API

## Sign Up

        curl -X POST \
        -H "Content-type: application/json" \
        -d '{"email":"joe@example.com","password":"1234"}' \
        http://localhost:8080/v1.0/signup

returns:

* success

        {
          "email": "joe@example.com",
          "user_id": "<USER_ID>",
          "enabled": true,
          "message": "User created",
          "created": true
        }

* Failure

        {
          "username": "joe@example.com",
          "message": "User Exists",
          "created": false
        }

## Authenticate

        curl -X POST \
        -H "Content-type: application/json" \
        -d '{"email":"joe@example.com","password":"1234"}' \
        http://localhost/v1.0/authenticate

* success

        {
          "statusCode": 200,
          "token": {
            "issued_at": "2014-03-08T06:34:40.833523",
            "expires": "2014-03-09T06:34:40Z",
            "id": "<AUTH_TOKEN>"
          },
          "user": {
            "username": "joe@example.com",
            "roles_links": [],
            "id": "<USER_ID>",
            "roles": [],
            "name": "joe@example.com"
          }
        }

* Failure

        {
           "statusCode": 401,
           "error": {
           "message": "The request you have made requires authentication.",
           "code": 401,
           "title": "Unauthorized"
          }
        }

## Validate Token

        curl -X POST \
        -H "Content-type: application/json" \
        -d '{"token":"<AUTH_TOKEN>"}' \
        http://localhost:8080/v1.0/validate -v

* Success

        {
          "statusCode": 200,
          "token": {
            "issued_at": "2014-03-08T05:17:03.843144",
            "expires": "2014-03-09T05:17:03Z",
            "id": "<AUTH_TOKEN>"
          },
            "user": {
            "username": "joe@example.com",
            "roles_links": [],
            "id": "2a332f2899ab4190adcfa845c1bda445",
            "roles": [],
            "name": "joe@example.com"
          }
        }

* Failure

        {
           "statusCode": 404,
           "error": {
           "message": "Could not find token, 5211be33f85440b81f54821e4fb17897.",
            "code": 404,
            "title": "Not Found"
            }
        }