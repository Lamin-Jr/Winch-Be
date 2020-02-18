const mongoose = require('mongoose');

const Representative = require('../../app/winch/api/models/representative');

const Plant = require('../../app/winch/api/models/plant');


module.exports.buildRepresentatives = () => {
  return new Promise((resolve, reject) => {
    const representativesByPlantId = getRepresentativesByPlantId();
    const toBeCompleted = Object.keys(representativesByPlantId).length;
    const plantUpdates = {};
    let completed = 0;

    Object.entries(representativesByPlantId).forEach(representativeByPlantIdEntry => {

      const plantId = representativeByPlantIdEntry[0];
      const representatives = representativeByPlantIdEntry[1]();

      representatives.forEach((representative) => {

        representative.plants.forEach(plantIdByRepresentative => {
          if (!plantUpdates[plantIdByRepresentative]) {
            plantUpdates[plantIdByRepresentative] = new Set()
          }
          plantUpdates[plantIdByRepresentative].add(representative._id);
        });

        Representative.create(representative)
          .then(createResult => {
            console.info(`'${representative.fullName}@${plantId}' representative creation succeeded with id: ${createResult._id}`);
          })
          .catch(createError => {
            if (createError.name === 'MongoError' && createError.code === 11000) {
              console.log(`'${representative.fullName}@${plantId}' representative creation already done`);
            } else {
              console.error(`'${representative.fullName}@${plantId}' representative creation error: ${createError}`);
              reject(createError);
            }
          })
          .finally(() => {
            if (++completed === toBeCompleted) {
              Object.entries(plantUpdates).forEach(plantUpdateEntry => {
                Plant.updateOne({
                  _id: plantUpdateEntry[0]
                }, {
                  $set: { 'organization.representatives': [...plantUpdateEntry[1]] }
                })
                  .then(plantUpdateResult => {
                    console.info(`'${plantUpdateEntry[0]}' plant representatives update (${plantUpdateResult.nModified}) succeeded`);
                    resolve();  
                  })
                  .catch(plantUpdateError => {
                    console.error(`'${plantUpdateEntry[0]}' plant representatives update error: ${plantUpdateError}`);
                    reject(plantUpdateError);
                  });
                });
            } 
          });
      });
      
    });

  });
}


function getRepresentativesByPlantId() {
  const wp1Representative = buildRepresentative(
    '5e4a9c0c04b1fc16fc509232', 
    'Harold Serry-Kamal', 
    buildRepresentativeContacts('+232076550112'),
    [
      '|WP1|SLL_2019_001|7|',
      '|WP1|SLL_2019_001|46|',
      '|WP1|SLL_2019_001|8|',
      '|WP1|SLL_2019_001|27|',
      '|WP1|SLL_2019_001|5|',
      '|WP1|SLL_2019_001|43|',
      '|WP1|SLL_2019_001|31|',
      '|WP1|SLL_2019_001|42|',
      '|WP1|SLL_2019_001|55|',
    ]);

  return {
    // -> Sierra Leone
    // --> |WP1|SLL_2019_001|7| -> Batkanu
    '|WP1|SLL_2019_001|7|': () => {
      return [ wp1Representative ];
    },
    // --> |WP1|SLL_2019_001|46| -> Fintonia
    '|WP1|SLL_2019_001|46|': () => {
      return [ wp1Representative ];
    },
    // --> |WP1|SLL_2019_001|8| -> Kagbere
    '|WP1|SLL_2019_001|8|': () => {
      return [ wp1Representative ];
    },
    // --> |WP1|SLL_2019_001|27| -> Kamaranka
    '|WP1|SLL_2019_001|27|': () => {
      return [ wp1Representative ];
    },
    // --> |WP1|SLL_2019_001|5| -> Kathantha Yimboi
    '|WP1|SLL_2019_001|5|': () => {
      return [ wp1Representative ];
    },
    // --> |WP1|SLL_2019_001|43| -> Mabang
    '|WP1|SLL_2019_001|43|': () => {
      return [ wp1Representative ];
    },
    // --> |WP1|SLL_2019_001|31| -> Mara
    '|WP1|SLL_2019_001|31|': () => {
      return [ wp1Representative ];
    },
    // --> |WP1|SLL_2019_001|42| -> Rokonta
    '|WP1|SLL_2019_001|42|': () => {
      return [ wp1Representative ];
    },
    // --> |WP1|SLL_2019_001|55| -> Sinkunia
    '|WP1|SLL_2019_001|55|': () => {
      return [ wp1Representative ];
    },
  };
}


function buildRepresentative(idAsString, fullName, contacts, plantIdList) {
  const result = {
    _id: new mongoose.Types.ObjectId(idAsString),
    fullName: fullName,
    contacts: contacts,
    plants: plantIdList,
  };

  return result;
}

function buildRepresentativeContacts(phoneNo) {
  const result = [{
    'type': 'PHN',
    address: phoneNo,
  }];

  return result;
}
