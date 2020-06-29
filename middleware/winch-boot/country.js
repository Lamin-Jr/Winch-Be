const mongoose = require('mongoose');

// const { defaultUpdateOptions } = require('../../api/middleware/mongoose-util');

const Country = require('../../app/winch/api/models/country');


module.exports.buildCountries = () => {
  const entityName = 'country';

  return new Promise((resolve, reject) => {
    const countries = getCountries();
    
    countries.forEach((country, index) => {
      Country.create(country)
        .then(createResult => {
          console.info(`'${createResult['default-name']}' ${entityName} creation succeeded with id: ${createResult._id}`);
        })
        .catch(createError => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            console.info(`'${country['default-name']}' ${entityName} creation already done`);
          } else {
            console.error(`'${country['default-name']}' ${entityName} creation error: ${createError}`);
          }
        })
        .finally(() => {
          if (index === (countries.length - 1)) {
            resolve();
          }
        });
      // const filter = {
      //   _id: country._id
      // };
      // const update = {
      //   $set: {
      //     'default-name': country['default-name'],
      //     'aplha-3-code': country['aplha-3-code'],
      //     'numeric-code': country['numeric-code'],
      //   }
      // };
      // Country.findOneAndUpdate(filter, update, defaultUpdateOptions)
      //   .then(updateResult => {
      //     if (updateResult) {
      //       console.info(`${entityName} update succeeded with id: ${updateResult._id}`);
      //     } else {
      //       Country.create(country)
      //         .then(createResult => {
      //           console.info(`${entityName} creation succeeded with id: ${createResult._id}`);
      //         })
      //         .catch(createError => {
      //           console.error(`'${country['_id']}' ${entityName} creation error: ${createError}`);
      //         });
      //     }
      //   })
      //   .catch(readError => {
      //     console.error(`'${country['_id']}' ${entityName} reading error: ${readError}`);
      //   })
      //   .finally(() => {
      //     if (index === countries.length - 1) {
      //       resolve();
      //     }
      //   });
    });
  });
}


function getCountries() {
  const countries = [
    buildCountry('Italy', 'IT', 'ITA', 380),
    buildCountry('Angola', 'AO', 'AGO', 024),
    buildCountry('Benin', 'BJ', 'BEN', 204),
    buildCountry('Mauritania', 'MR', 'MRT', 478),
    buildCountry('São Tomé and Príncipe', 'ST', 'STP', 678),
    buildCountry('Sierra Leone', 'SL', 'SLE', 694),
    buildCountry('Togo', 'TO', 'TGO', 768),
    buildCountry('Uganda', 'UG', 'UGA', 800)
  ];

  return countries;
}


function buildCountry(defaultName, alpha2, alpha3, numericCode) {
  const result = {
    _id: alpha2,
    'default-name': defaultName,
    'aplha-3-code': alpha3,
    'numeric-code': numericCode
  };

  return result;
}