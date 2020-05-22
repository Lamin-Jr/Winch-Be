// get the app environment
const env = process.env.NODE_ENV || 'dev';
const isLocalEnv = env === 'test' || env === 'dev'

// exit if not development environment
if (!isLocalEnv) {
  console.error(`unable to run whitin '${env}' environment`);
  return;
}

require('dotenv').config({
});

console.info(`AWS env:`);
console.info(` - WCH_NTF_AWS_PROFILE=${process.env.WCH_NTF_AWS_PROFILE}`);
console.info(` - WCH_NTF_AWS_REGION=${process.env.WCH_NTF_AWS_REGION}`);
console.info(` - WCH_NTF_AWS_API_VERSION=${process.env.WCH_NTF_AWS_API_VERSION}`);


// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

const credentials = new AWS.SharedIniFileCredentials({profile: process.env.WCH_NTF_AWS_PROFILE});
AWS.config.credentials = credentials;

// Set region
AWS.config.update({region: process.env.WCH_NTF_AWS_REGION});


// Create promise and SNS service object
const awsSns = new AWS.SNS({
  apiVersion: process.env.WCH_NTF_AWS_API_VERSION
})

awsSns.setSMSAttributes({
  attributes: {
    // 'DefaultSMSType': 'Transactional', /* highest reliability */
    DefaultSMSType: 'Promotional' /* lowest cost */
  }
}).promise()
  .then(data => {
    console.info(`setup outcome: ${require('util').inspect(data)}`);
  }).catch(err => {
    console.error(err, err.stack);
  });


// Create promise and SNS service object
awsSns.publish({
  Message: 'Test sending from BE',
  PhoneNumber: '+15014380798',
}).promise()
  .then(data => {
    console.info(`MessageID is ${data.MessageId}`);
  }).catch(err => {
    console.error(err, err.stack);
  });
