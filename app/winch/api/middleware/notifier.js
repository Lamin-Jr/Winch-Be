const EventEmitter = require('events');

class Notifier extends EventEmitter {
  constructor() {
    super();
  }

  send_sms(context) {
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
          console.err(`[Notifier][sms] sending failed -> ${awsSnsPublishError}`)
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
}


module.exports = new Notifier();
