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
console.info(` - WCH_NTF_AWS_SES_API_VERSION=${process.env.WCH_NTF_AWS_SES_API_VERSION}`);


// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

// Load AWS credentials
AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: process.env.WCH_NTF_AWS_PROFILE });

// Set AWS region
AWS.config.update({ region: process.env.WCH_NTF_AWS_REGION });

// Create AWS SES service object
const awsSes = new AWS.SES({
  apiVersion: process.env.WCH_NTF_AWS_SES_API_VERSION
})

// init
const fs = require('fs');
const templates = [{
  name: 'MON_2019_020_report_base',
  htmlSourcePath: `${__dirname}/assets/aws/report-base.html`,
  txtSourcePath: `${__dirname}/assets/aws/report-base.txt`,
}]

templates.forEach(template => {
  const templateName = template.name;
  const htmlTemplateSourcePath = template.htmlSourcePath;

  const awsTemplateData = {
    Template: {
      TemplateName: templateName, /* required */
      HtmlPart: fs.readFileSync(htmlTemplateSourcePath).toString(),
      SubjectPart: '{{reportType}} Report',
      // TextPart: fs.readFileSync(templateTxtSourcePath).toString(),
    }
  }

  // upsert template mail
  awsSes.getTemplate({ TemplateName: templateName }).promise()
    .then(data => {
      // console.log(require('util').inspect(data));
      // console.log(JSON.stringify(data));
      // console.log(data.Template.SubjectPart);
      // console.log(data.Template.HtmlPart);

      awsSes.updateTemplate(awsTemplateData).promise()
        .then(updateTemplateData => {
          console.info(`${templateName} template updated -> ${JSON.stringify(updateTemplateData)}`);
        })
        .catch(updateTemplateError => {
          console.error(updateTemplateError, updateTemplateError.stack);
        })
    })
    .catch(err => {
      if (err.code === 'TemplateDoesNotExist') {
        awsSes.createTemplate(awsTemplateData).promise()
          .then(createTemplateData => {
            console.info(`${templateName} template created -> ${JSON.stringify(createTemplateData)}`);
          })
          .catch(createTemplateError => {
            console.error(createTemplateError, createTemplateError.stack);
          })
      } else {
        console.error(err, err.stack);
      }
    });
});
