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
AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: process.env.WCH_NTF_AWS_PROFILE});

// Set AWS region
AWS.config.update({region: process.env.WCH_NTF_AWS_REGION});

// Create AWS SES service object
const awsSes = new AWS.SES({
  apiVersion: process.env.WCH_NTF_AWS_SES_API_VERSION
})

// create Nodemailer instance and AWS SES transporter
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  SES: awsSes
});

// send simple mail
// transporter.sendMail({
//   from: 'bot@winchenergy.it',
//   subject: 'Test sending from BE with attachment',
//   html: `<p>You got a contact message from: <b>Winch Bot</b></p>`,
//   to: 'fabio.valenti@winchenergy.com',
//   // bcc: Any BCC address you want here in an array,
//   attachments: [
//     {
//         filename: 'home-report.pdf',
//         content: require('fs').readFileSync('./public/assets/home-report.pdf')
//     }
//   ],
// });

const fs = require('fs');
const templateName = 'daily_reports';
const templateSourcePath = `${__dirname}/assets/daily-reports-html-template-src.html`;
const sampleAttachment = `${__dirname}/../../public/assets/home-report.pdf`;

// send AWS templated mail
awsSes.getTemplate({TemplateName: templateName}).promise()
  .then(data => {
    // console.log(require('util').inspect(data));
    // console.log(JSON.stringify(data));
    // console.log(data.Template.SubjectPart);
    // console.log(data.Template.HtmlPart);

    awsSes.updateTemplate({
      Template: { 
        TemplateName: templateName, /* required */
        HtmlPart: fs.readFileSync(templateSourcePath).toString(),
        SubjectPart: 'Daily Reports',
        // TextPart: 'TEXT_CONTENT'
      }
    }).promise()
    .then(updateTemplateData => {
      console.log(JSON.stringify(updateTemplateData));
      transporter.sendMail({
        from: 'bot@winchenergy.it',
        subject: `Test sending template from BE with attachment - ${data.Template.SubjectPart}`,
        html: data.Template.HtmlPart,
        to: 'fabio.valenti@winchenergy.com',
        // bcc: Any BCC address you want here in an array,
        attachments: [
          {
            filename: 'home-report.pdf',
            content: fs.readFileSync(sampleAttachment)
          }
        ],
      });    
  })
    .catch(updateTemplateError => {
      console.error(updateTemplateError, updateTemplateError.stack);
    })
  })
  .catch(err => {
    if (err.code === 'TemplateDoesNotExist') {
      awsSes.createTemplate({
        Template: { 
          TemplateName: templateName, /* required */
          HtmlPart: fs.readFileSync(templateSourcePath).toString(),
          SubjectPart: 'Daily Reports',
          // TextPart: 'TEXT_CONTENT'
        }
      }).promise()
      .then(createTemplateData => {
        console.log(JSON.stringify(createTemplateData));
        transporter.sendMail({
          from: 'bot@winchenergy.it',
          subject: `Test sending template from BE with attachment - ${createTemplateData.Template.SubjectPart}`,
          html: data.Template.HtmlPart,
          to: 'fabio.valenti@winchenergy.com',
          // bcc: Any BCC address you want here in an array,
          attachments: [
            {
              filename: 'home-report.pdf',
              content: fs.readFileSync(sampleAttachment)
            }
          ],
        });    
      })
      .catch(createTemplateError => {
        console.error(createTemplateError, createTemplateError.stack);
      })
    } else {
      console.error(err, err.stack);
    }
  });

/* REFS
https://medium.com/@xoor/sending-emails-with-attachments-with-aws-lambda-and-node-js-e6a78500227c
*/