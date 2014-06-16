/**
 * Retrieves data from the monitor events tables
 *
 */

var monitorDataModel = require('../../models/monitorEvents.js');

/**
 * Returns monitoring data for a given user_id
 *
 * @param req
 * @param res
 */
exports.get = function(req, res){

    var user_id = req.app.get('auth_user_id'); //'a9ed1c532b0d48e3aa2a653544a4f693'; //'a369df5475714e38be8f688cc9fa8e20';
    var eventType = req.params.type;
    var startTimeUnixTime = req.params.startTimeUnixTime;
    var hoursToRetrieve = req.params.hoursToRetrieve;

    console.log('type: '+eventType);
    console.log('startTimeUnixTime: '+startTimeUnixTime);
    console.log('housAgo: '+hoursToRetrieve);

    var now = new Date();
    var startTime = Date.parse(now); // Returns unix time format
    var hoursPriorToQuery = 6;

    monitorDataModel.get24FailureItems(res, user_id, startTimeUnixTime, hoursToRetrieve, eventType);
};



