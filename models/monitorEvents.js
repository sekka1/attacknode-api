/**
 * The <env>_MonitorEvents table model
 *
 */
var CONFIG = require('config').api;
var aws = require('../libs/AWS/aws.js');

// Load DynamoDb Object
var dynamodb = aws.getDynamodb();

// Object holding all the event results
var result = new Object();
//var days_ago_to_retrieve = 1;


/**
 * Calls the queryOverXHours() function
 *
 * @param {http} res
 * @param {string} user_id
 * @param {int} startTime - unix time
 * @param {int} hoursPriorToQuery - how many hours prior to run it for
 * @param {string} eventType - success|failure
 */
exports.get24FailureItems = function(res, user_id, startTime, hoursPriorToQuery, eventType){

    //var hoursToQuery = 6;

    //var now = new Date();
    //var unix_time_now = Date.parse(now);

    result.user_id = user_id;
    //result.date_unixtime = getBeginningofDay(days_ago_to_retrieve);
    //result.date_string = new Date(result.date_unixtime);
    result.total = 0;
    result.success = 0;
    result.failure = 0;

    if(eventType === 'success')
        result.successItems = new Array();
    else
        result.successItems = undefined;
    if(eventType === 'failure')
        result.failureItems = new Array();
    else
        result.failureItems = undefined;

    queryOverXHours(0, res, hoursPriorToQuery, startTime, user_id);
};

/**
 * Runs query in a "recursive" way where it wont call the next recursion until
 * the callback from the previous call is returned.  This simulates an synchronous call.
 *
 * Can query a range.  current_time is the starting time and hoursToQuery is how many hours
 * to query for prior to that.
 *
 * Querying Range:
 * current_time - start time
 * hoursPriorToQuery - hours to query prior on current_time
 *
 * @param {int} i - itteration
 * @param {http} res - the http res object.  This fuction will call it after it is done
 * @param {int} hoursPriorToQuery - how many hours prior to run it for
 * @param {int} current_time - unix time
 * @param {string} user_id - user_id to query on
 */
function queryOverXHours(i, res, hoursPriorToQuery, current_time, user_id){

    var totalItterations = hoursPriorToQuery;

    if(i<=totalItterations){

        // Setup the day and time to retrieve
        var time1 = current_time - 3600000; // -1 hour //getHoursByDay(days_ago_to_retrieve, i).toString();
        var time2 = current_time;  //getHoursByDay(days_ago_to_retrieve, i+1).toString();
        console.log(time1);
        console.log(new Date(time1));
        console.log(new Date(time2));

        // Query parameters
        var params = {
            "TableName": CONFIG.aws_dynamodb_tablename_MonitorEvents,
            "ConsistentRead": false,
            "KeyConditions":
            {
                "user_id" :
                {
                    "AttributeValueList": [
                        {
                            "S": user_id.toString()
                        }
                    ],
                    "ComparisonOperator": "EQ"
                },
                "dbCreatedOn" :
                {
                    "AttributeValueList": [
                        {
                            "N": time1.toString()
                        },
                        {
                            "N": time2.toString()
                        }
                    ],
                    "ComparisonOperator": "BETWEEN"
                }
            },
            "AttributesToGet": [
                "testStatus", "username", "dbCreatedOn", "createdOn", "testResultJSON", "testResult"
            ],
            "ReturnConsumedCapacity": "TOTAL",
            "ScanIndexForward": false,
            "Select": "SPECIFIC_ATTRIBUTES"
        };

        // Running query
        runQuery(params, function(err, data){
            if(err){
                console.log('Error running query...');
            }else{

                console.log('iteration: '+i);
                //console.log(data);
                console.log('Number of events found: '+data.Count);
                console.log('LastEvaluatedKey...');
                console.log(data.LastEvaluatedKey);

                // Set the username from each of the data.  Should be all the same username.
                var username = '';

                if(data.Items!=undefined){
                    data.Items.forEach(function(anItem){
                        //console.log(anItem);

                        if(anItem.testStatus.S == 'success'){
                            result.success++;

                            if(result.successItems !== undefined)
                                result.successItems.push(prepEventReturn(anItem));
                        }
                        if(anItem.testStatus.S == 'failure'){
                            result.failure++;
                            console.log('failure found: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
                            console.log(anItem);

                            if(result.failureItems !== undefined)
                                result.failureItems.push(prepEventReturn(anItem));
                        }

                        username = anItem.username.S;
                        result.total++;
                    });

                    // Run recursion
                    queryOverXHours(i+1, res, hoursPriorToQuery, time1, user_id);

                    if(i==totalItterations){
                        // Do other call back function here.  It has finished looping through
                        // the 24 hour period

                        // This is called on the last iteration. Can be assured everything is
                        // completed running now.

                        //console.log('Number of total count: '+count.total);
                        //console.log('Number of success count: '+count.success);
                        //console.log('Number of failure count: '+count.failure);

                        //outputStatement(result);

                        // Run callback here
                        console.log('in 22 here');
                        console.log(result);

                        res.send(200, JSON.stringify(result));

                        // Put daily totals into DynamoDB
                        //dynamoInsert_MonitorEventsDailyTotals(result.user_id, username, result.date_unixtime, result.date_string, result.total, result.success, result.failure)
                    }
                }
            }
        });
    }
};


/**
 * Runs a dynamodb query
 *
 * @param params
 * @param callback
 */
function runQuery(params, callback){

    dynamodb.query(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
            callback(true, null);
        } else {

            callback(null, data);

            //console.log(data); // successful response
        }
    });
}

/**
 * Prepares a DynamoDB event return to the user.  For every field that DynamoDB returns
 * it has the type which we want to take out and we also want to return JSON for the JSON
 * fields we keep
 *
 * eventItem: {
      "username": {
        "S": "g9@autodevbot.com"
 },
 "testResult": {
        "S": "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<testsuites>\n<testsuite name=\"Frisby Test: Sample GET\" errors=\"0\" tests=\"1\" failures=\"1\" time=\"5.027\" timestamp=\"2014-03-29T09:36:10\">\n  <testcase classname=\"Frisby Test: Sample GET\" name=\"\n\t[ GET http://test.AutoDevBot.com/sample ]\" time=\"5.024\"><failure>1: Expected 500 to equal 200. 2: Error: Header &apos;content-type&apos; not present in HTTP response</failure></testcase>\n</testsuite>\n</testsuites>"
      },
 "testStatus": {
        "S": "failure"
      },
 "dbCreatedOn": {
        "N": "1396085789887"
      },
 "createdOn": {
        "S": "2014-03-29T09:36:10"
      },
 "testResultJSON": {
        "S": "{\"testsuites\":{\"testsuite\":[{\"$\":{\"name\":\"Frisby Test: Sample GET\",\"errors\":\"0\",\"tests\":\"1\",\"failures\":\"1\",\"time\":\"5.027\",\"timestamp\":\"2014-03-29T09:36:10\"},\"testcase\":[{\"$\":{\"classname\":\"Frisby Test: Sample GET\",\"name\":\"\\n\\t[ GET http://test.AutoDevBot.com/sample ]\",\"time\":\"5.024\"},\"failure\":[\"1: Expected 500 to equal 200. 2: Error: Header 'content-type' not present in HTTP response\"]}]}]}}"
      }
 }
 *
 * @param eventItem
 * @returns {Object}
 */
function prepEventReturn(eventItem){

    var result = new Object();

    result.username = eventItem.username.S;
    result.testResult = eventItem.testResult.S;
    result.testStatus = eventItem.testStatus.S;
    result.dbCreatedOn = eventItem.dbCreatedOn.N;
    result.createdOn = eventItem.createdOn.S;
    result.testResultJSON = JSON.parse(eventItem.testResultJSON.S);

    return result;
}