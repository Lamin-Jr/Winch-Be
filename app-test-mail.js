// get the app environment
const env = process.env.NODE_ENV || 'dev';
const isLocalEnv = env === 'test' || env === 'dev' || env == 'production';

// exit if not development environment
if (!isLocalEnv) {
  console.error(`unable to run from '${env}' environment`);
  return;
}

require('dotenv').config({
});

console.info(`AWS env:`);
console.info(` - WCH_NTF_AWS_PROFILE=${process.env.WCH_NTF_AWS_PROFILE}`);
console.info(` - WCH_NTF_AWS_REGION=${process.env.WCH_NTF_AWS_REGION}`);
console.info(` - WCH_NTF_AWS_SES_API_VERSION=${process.env.WCH_NTF_AWS_SES_API_VERSION}`);


// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

const credentials = new AWS.SharedIniFileCredentials({profile: process.env.WCH_NTF_AWS_PROFILE});
AWS.config.credentials = credentials;

// Set region
AWS.config.update({region: process.env.WCH_NTF_AWS_REGION});


// Create SES service object
const awsSes = new AWS.SES({
  apiVersion: process.env.WCH_NTF_AWS_SES_API_VERSION
})

// send mail
awsSes.sendEmail({
  Destination: { /* required */
    // CcAddresses: [
    //   '',
    //   /* more items */
    // ],
    ToAddresses: [
      'fabio.valenti@winchenergy.com',
      /* more items */
    ]
  },
  Message: { /* required */
    Body: { /* required */
      Html: {
       Charset: "UTF-8",
       Data: "HTML_FORMAT_BODY"
      },
      Text: {
       Charset: "UTF-8",
       Data: "TEXT_FORMAT_BODY"
      }
     },
     Subject: {
      Charset: 'UTF-8',
      Data: 'Test sending from BE'
     }
    },
  Source: 'bot@winchenergy.it', /* required */
  ReplyToAddresses: [
     'bot@winchenergy.it',
    /* more items */
  ],
}).promise()
  .then(data => {
    console.info(`MessageID is ${data.MessageId}`);
  }).catch(err => {
    console.error(err, err.stack);
  });
