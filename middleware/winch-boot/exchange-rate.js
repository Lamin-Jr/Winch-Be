const mongoose = require('mongoose')
const ExchangeRate = require('../../app/winch/api/models/exchange-rate')

module.exports.buildExchangeRates = () => {
    return new Promise((resolve, reject) => {
        const exchangeRates = getExchangeRates();
        const updateOptions = { upsert: true };

        exchangeRates.forEach((exchangeRate, index) => {
            const filter = {
                _id: exchangeRate._id
            };
            ExchangeRate.findOneAndUpdate(filter, exchangeRate, updateOptions)
                .then(upsertResult => {
                    console.log(`exchange rate creation succeeded with id: ${upsertResult._id}`);
                })
                .catch(upsertError => {
                    console.error(`'[${upsertResult._id}]' exchange rate creation error: ${upsertError}`);
                })
                .finally(() => {
                    if (index === (exchangeRates.length - 1)) {
                        resolve();
                    }
                });
        });
    });
}

function getExchangeRates() {
    return [
        buildExchangeRate('XOF', 'USD', 0.0017),
        buildExchangeRate('CFA', 'USD', 0.0017),
        buildExchangeRate('SLL', 'USD', 0.00010638297872340425), // === 1 / 9400
    ];
}

function buildExchangeRate(currencyFrom, currencyTo, rate, from = undefined, to = undefined) {
    return {
        _id: `${currencyFrom}/${currencyTo}`,
        rate: rate,
        validity: {
            from: from,
            to: to
        }
    };
}
