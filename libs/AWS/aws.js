/**
 * Sets up connection into AWS
 *
 */
var CONFIG = require('config').api;
var AWS = require('aws-sdk');

// Load aws credentials and settings
AWS.config.update({accessKeyId: CONFIG.aws_accessKeyId, secretAccessKey: CONFIG.aws_secretAccessKey, region: CONFIG.aws_region});
AWS.config.apiVersions = {
    dynamodb: CONFIG.aws_DynamoDB_version
}

var dynamodb = new AWS.DynamoDB();

/**
 * Returns the dynamodb object
 */
exports.getDynamodb = function(){
    return dynamodb;
}