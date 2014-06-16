/**
 * Message Queue
 *
 *
 */
var CONFIG = require('config').softlayer_mq;
var SMQ = require('./SoftlayerMessageQueue.js');

var host = CONFIG.host;
var account_id = CONFIG.account_id;
var authToken = CONFIG.authToken;

// Softlayer Authentication Token
SMQ.setHost(host);
SMQ.setAccountId(account_id);
SMQ.setAuthToken(authToken);

exports.queuesPOST = function(queueName, messageObject){

    SMQ.queuesPOST(queueName, messageObject);
}

exports.queuesGET = function(queueName, batchNumber, callback){

    SMQ.queuesGET(queueName, batchNumber, function(result){

        callback(result);
    });
}

exports.queuesDELETE = function(queueName, msgId){

    SMQ.queuesDELETE(queueName, msgId);
}

