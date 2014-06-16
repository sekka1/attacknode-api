AutoDevBot_API
==============

AutoDevBot API

* Sign Up
    curl -X POST \
    -H "Content-type: application/json" \
    -d '{"email":"g5@adb.com","password":"1234"}' \
    http://localhost:8080/v1.0/signup

returns:
    {"username":"g5@adb.com","message":"User Exists","created":false}

* Authenticate
    curl -X POST \
    -H "Content-type: application/json" \
    -d '{"email":"g2@adb.com","password":"1234"}' \
    http://localhost/v1.0/authenticate