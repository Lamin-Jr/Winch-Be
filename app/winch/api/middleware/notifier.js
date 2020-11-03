const EventEmitter = require('events');

class Notifier extends EventEmitter {
  constructor () {
    super();
  }

  send_sms (context) {
    return new Promise((resolve, reject) => {
      const {
        awsSns
      } = require('../clients/aws')

      let eventName = 'sms-';
      let serviceReply = undefined

      awsSns.publish({
        Message: context.content['text/plain'],
        PhoneNumber: context.address,
      }).promise()
        .then(data => {
          eventName = eventName.concat('sent')
          serviceReply = data
          console.info(`[Notifier][sms] sending succeeded -> ${require('util').inspect(data)}`)
          resolve(data);
        })
        .catch(awsSnsPublishError => {
          eventName = eventName.concat('err')
          console.error(`[Notifier][sms] sending failed -> ${awsSnsPublishError}`)
          reject(awsSnsPublishError);
        })
        .finally(() => {
          const eventData = {
            context,
          };

          if (serviceReply) {
            Object.assign(eventData, { serviceReply })
          }

          this.emit(eventName, eventData);
          if (context.key) {
            this.emit(`${eventName}-${context.key}`, eventData);
          }
        });
    });
  }

  send_mail_a_t (context) {
    return new Promise((resolve, reject) => {
      const {
        awsSes
      } = require('../clients/aws')
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        SES: awsSes
      });

      let eventName = 'mail-';
      let serviceReply = undefined

      awsSes.getTemplate({ TemplateName: context.template }).promise()
        .then(awsTemplate => {
          const messageConf = {
            from: process.env.WCH_NTF_MAIL_SENDER,
            subject: awsTemplate.Template.SubjectPart,
            html: awsTemplate.Template.HtmlPart,
            to: context.recipients.to,
            attachments: context.attachments,
          }

          if (awsTemplate.Template.TextPart) {
            messageConf['text'] = data.Template.TextPart;
          }

          if (context.recipients.cc) {
            messageConf['cc'] = context.recipients.cc;
          }
          if (context.recipients.bcc) {
            messageConf['bcc'] = context.recipients.bcc;
          }

          return transporter.sendMail(messageConf);
        })
        .then(sendMailInfo => {
          eventName = eventName.concat('sent')
          serviceReply = sendMailInfo
          console.info(`[Notifier][mail] sending succeeded -> ${serviceReply.messageId}`)
          resolve(sendMailInfo);
        })
        .catch(error => {
          eventName = eventName.concat('err')
          console.error(`[Notifier][mail] sending failed -> ${error}`)
          reject(error);
        })
        .finally(() => {
          const eventData = {
            context,
          };

          if (serviceReply) {
            Object.assign(eventData, { serviceReply })
          }

          this.emit(eventName, eventData);
          if (context.key) {
            this.emit(`${eventName}-${context.key}`, eventData);
          }
        });
    });
  }

  send_mail_a_dt (context) {
    return new Promise((resolve, reject) => {
      const {
        awsSes
      } = require('../clients/aws')
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        SES: awsSes
      });

      let eventName = 'mail-';
      let serviceReply = undefined

      awsSes.getTemplate({ TemplateName: context.template }).promise()
        .then(awsTemplate => new Promise(resolve => {
          // prepare AWS-compliant template to be processed by EJS engine
          awsTemplate.Template.SubjectPart = awsTemplate.Template.SubjectPart.replace('{{', '<%=').replace('}}', '%>');
          awsTemplate.Template.HtmlPart = awsTemplate.Template.HtmlPart.replace('{{', '<%=').replace('}}', '%>');
          const templateEngine = new (require(`../../../../api/lib/util/template/ejsTemplateEngine`))();
          // process AWS template parts
          awsTemplate.Template.SubjectPart = templateEngine.render(awsTemplate.Template.SubjectPart, context.templateContext);
          awsTemplate.Template.HtmlPart = templateEngine.render(awsTemplate.Template.HtmlPart, context.templateContext);
          resolve(awsTemplate);
        }))
        .then(awsTemplate => {
          const messageConf = {
            from: process.env.WCH_NTF_MAIL_SENDER,
            subject: awsTemplate.Template.SubjectPart,
            html: awsTemplate.Template.HtmlPart,
            to: context.recipients.to,
            attachments: context.attachments,
          }

          if (awsTemplate.Template.TextPart) {
            messageConf['text'] = data.Template.TextPart;
          }

          if (context.recipients.cc) {
            messageConf['cc'] = context.recipients.cc;
          }
          if (context.recipients.bcc) {
            messageConf['bcc'] = context.recipients.bcc;
          }

          return transporter.sendMail(messageConf);
        })
        .then(sendMailInfo => {
          eventName = eventName.concat('sent')
          serviceReply = sendMailInfo
          console.info(`[Notifier][mail] sending succeeded -> ${serviceReply.messageId}`)
          resolve(sendMailInfo);
        })
        .catch(error => {
          eventName = eventName.concat('err')
          console.error(`[Notifier][mail] sending failed -> ${error}`)
          reject(error);
        })
        .finally(() => {
          const eventData = {
            context,
          };

          if (serviceReply) {
            Object.assign(eventData, { serviceReply })
          }

          this.emit(eventName, eventData);
          if (context.key) {
            this.emit(`${eventName}-${context.key}`, eventData);
          }
        });
    });
  }
}


module.exports = new Notifier();
