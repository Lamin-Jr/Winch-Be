  // Load the AWS SDK for Node.js
  const AWS = require('aws-sdk');

  const credentials = new AWS.SharedIniFileCredentials({
    profile: process.env.WCH_NTF_AWS_PROFILE,
  });
  AWS.config.credentials = credentials;

  // Set region
  AWS.config.update({ region: process.env.WCH_NTF_AWS_REGION });

  // Create promise and SNS service object
  const awsSns = new AWS.SNS({
    apiVersion: process.env.WCH_NTF_AWS_SNS_API_VERSION,
  });

  awsSns
    .setSMSAttributes({
      attributes: {
        // 'DefaultSMSType': 'Transactional', /* highest reliability */
        DefaultSMSType: 'Promotional' /* lowest cost */,
      },
    })
    .promise()
    .then((data) => {
      console.info(`[AWS][SNS] setSMSAttributes call outcome: ${require('util').inspect(data)}`);
    })
    .catch((err) => {
      console.error(err, err.stack);
    });

module.exports = {
  awsSns
}
