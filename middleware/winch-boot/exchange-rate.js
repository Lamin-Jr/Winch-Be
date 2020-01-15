const mongoose = require('mongoose');

const mongooseMixins = require('../../api/middleware/mongoose-mixins');

const creatorFragment = mongooseMixins.makeCreator(
  new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID),
  process.env.WCH_AUTHZ_SYSTEM_ROLE
);

const { defaultUpdateOptions } = require('../../api/middleware/mongoose-util');

const ExchangeRate = require('../../app/winch/api/models/exchange-rate');


module.exports.buildExchangeRates = () => {
  return new Promise((resolve, reject) => {
    const defaultFrom = new Date();
    const defaultTo = new Date(process.env.DATE_MAX);
    const exchangeRates = getExchangeRates();

    exchangeRates.forEach((exchangeRate, index) => {
      const filter = {
        _id: exchangeRate._id
      };
      const update = {
        $set: {
          rate: exchangeRate.rate,
          vFrom: exchangeRate.vFrom || defaultFrom,
          vTo: exchangeRate.vTo || defaultTo,
        }
      };
      ExchangeRate.findOneAndUpdate(filter, update, defaultUpdateOptions)
        .then(upsertResult => {
          if (upsertResult) {
            console.log(`exchange rate update succeeded with id: ${upsertResult._id}`);
          } else {
            ExchangeRate.create(exchangeRate)
              .then(createResult => {
                console.log(`exchange rate creation succeeded with id: ${createResult._id}`);
              })
              .catch(createError => {
                console.error(`'${exchangeRate['_id']}' exchange rate creation error: ${createError}`);
              });
          }
        })
        .catch(upsertError => {
          console.error(
            `'[${upsertResult._id}]' exchange rate creation error: ${upsertError}`
          );
        })
        .finally(() => {
          if (index === exchangeRates.length - 1) {
            resolve();
          }
        });
    });
  });
};

function getExchangeRates() {
  return [
    buildExchangeRate('XOF', 'USD', 0.0017),
    buildExchangeRate('CFA', 'USD', 0.0017),
    buildExchangeRate('SLL', 'USD', 0.00010638297872340425) // === 1 / 9400
  ];
}

function buildExchangeRate(currencyFrom, currencyTo, rate, validityFrom = undefined, validityTo = undefined) {
  const exchangeRate = {
    _id: `${currencyFrom}/${currencyTo}`,
    ...creatorFragment,
    rate: rate
  };

  if (validityFrom) {
    exchangeRate.vFrom = validityFrom;
    if (validityTo) {
        exchangeRate.vTo = validityTo
    }
  }

  return exchangeRate;
}
