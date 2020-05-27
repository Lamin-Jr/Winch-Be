// get the app environment
const env = process.env.NODE_ENV || 'dev';
const isEligibleEnv = env === 'test' || env === 'dev' || env == 'production';
const isLocalEnv = env === 'test' || env === 'dev';

// exit if not development environment
if (!isEligibleEnv) {
  console.error(`unable to run from '${env}' environment`);
  return;
}

if (isLocalEnv) {
  require('dotenv').config({
  });
}

console.info(`AWS env:`);
console.info(` - WCH_NTF_AWS_PROFILE=${process.env.WCH_NTF_AWS_PROFILE}`);
console.info(` - WCH_NTF_AWS_REGION=${process.env.WCH_NTF_AWS_REGION}`);
console.info(` - WCH_NTF_AWS_S3_API_VERSION=${process.env.WCH_NTF_AWS_S3_API_VERSION}`);


// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

// Load AWS credentials
AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: process.env.WCH_NTF_AWS_PROFILE});

// Set AWS region
AWS.config.update({region: process.env.WCH_NTF_AWS_REGION});

// Create AWS SES service object
const awsS3 = new AWS.S3({
  apiVersion: process.env.WCH_NTF_AWS_S3_API_VERSION
})

awsS3.getObject({Bucket: 'bot--at--winchenergy.it.asset.store', Key: 'img/bg.jpg'}).promise()
.then(data => {
  console.info(`${JSON.stringify(data)}`);
}).catch(err => {
  console.error(err, err.stack);
});
