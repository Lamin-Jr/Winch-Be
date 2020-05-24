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
          // FIXME
          // this.emit('sms-sent', { _id: data.MessageId })
          // if (context.key) {
          //   this.emit(`sms-sent-${context.key}`, {
          //     _id: data.MessageId,
          //     context,
          //   })
          // }
          resolve(data);
        })
        .catch(awsSnsPublishError => {
          eventName = eventName.concat('err')
          // FIXME
          // this.emit('sms-err', { _id: data.MessageId })
          // if (context.key) {
          //   this.emit(`sms-err-${context.key}`, {
          //     _id: data.MessageId,
          //     context,
          //   })
          // }
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
