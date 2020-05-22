const mongoose = require('mongoose');

const Agent = require('../../app/winch/api/models/agent');

const Plant = require('../../app/winch/api/models/plant');


module.exports.buildAgents = () => {
  return new Promise((resolve, reject) => {
    const agentsByPlantId = getAgentsByPlantId();
    const toBeCompleted = Object.keys(agentsByPlantId).length;
    const plantUpdates = {};
    let completed = 0;

    Object.entries(agentsByPlantId).forEach(agentByPlantIdEntry => {

      const plantId = agentByPlantIdEntry[0]
      const agents = agentByPlantIdEntry[1](plantId);

      agents.forEach((agent) => {

        agent.plants.forEach(plantIdByAgent => {
          if (!plantUpdates[plantIdByAgent]) {
            plantUpdates[plantIdByAgent] = new Set()
          }
          plantUpdates[plantIdByAgent].add(agent._id);
        });

        Agent.create(agent)
          .then(createResult => {
            console.info(`'${agent.fullName}@${plantId}' agent creation succeeded with id: ${createResult._id}`);
          })
          .catch(createError => {
            if (createError.name === 'MongoError' && createError.code === 11000) {
              console.log(`'${agent.fullName}@${plantId}' agent creation already done`);
            } else {
              console.error(`'${agent.fullName}@${plantId}' agent creation error: ${createError}`);
              reject(createError);
            }
          })
          .finally(() => {
            if (++completed === toBeCompleted) {
              Object.entries(plantUpdates).forEach(plantUpdateEntry => {
                Plant.updateOne({
                  _id: plantUpdateEntry[0]
                }, {
                  $set: { 'organization.agents': [...plantUpdateEntry[1]] }
                })
                  .then(plantUpdateResult => {
                    console.info(`'${plantUpdateEntry[0]}' plant agents update (${plantUpdateResult.nModified}) succeeded`);
                    resolve();
                  })
                  .catch(plantUpdateError => {
                    console.error(`'${plantUpdateEntry[0]}' plant agents update error: ${plantUpdateError}`);
                    reject(plantUpdateError);
                  });
                });
            } 
          });
      });
      
    });

  });
}


function getAgentsByPlantId() {
  return {
    // -> Benin
    // --> |BEN|BEN_2019_005|1| -> Adido
    '|BEN|BEN_2019_005|1|': (plantId) => {
      return [
        buildAgent('5e2f29e2b0a5102704b89d0a', 'Geraud Fadeyi', buildAgentContacts('+22967337540'), [ plantId ])
      ];
    },
    // -> Sierra Leone
    // --> |WP1|SLL_2019_001|69| -> Bafodia
    '|WP1|SLL_2019_001|69|': (plantId) => {
      return [
        buildAgent('5ec4ed406347a52f28d6387a', 'Sieh Y. Kamara', buildAgentContacts('+232077703546'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|46| -> Fintonia
    '|WP1|SLL_2019_001|46|': (plantId) => {
      return [
        buildAgent('5e4ac29704b1fc16fc509260', 'Osman Kamara', buildAgentContacts('+232030520185'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|5| -> Kathantha Yimboi
    '|WP1|SLL_2019_001|5|': (plantId) => {
      return [
        buildAgent('5e4ac2b104b1fc16fc509261', 'Alimamy Yata', buildAgentContacts('+232099234450'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|8| -> Kagbere
    '|WP1|SLL_2019_001|8|': (plantId) => {
      return [
        buildAgent('5e4ac2c104b1fc16fc509262', 'Kassim Kanu', buildAgentContacts('+232078092297'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|27| -> Kamaranka
    '|WP1|SLL_2019_001|27|': (plantId) => {
      return [
        buildAgent('5e4ac2e204b1fc16fc509263', 'John Alhaji Sesay', buildAgentContacts('+232099779824'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|7| -> Batkanu
    '|WP1|SLL_2019_001|7|': (plantId) => {
      return [
        buildAgent('5e4ac2f004b1fc16fc509264', 'Alhaji Kargbo', buildAgentContacts('+232099850687'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|43| -> Mabang
    '|WP1|SLL_2019_001|43|': (plantId) => {
      return [
        buildAgent('5e4ac30304b1fc16fc509265', 'Abdul B. Kamara', buildAgentContacts('+232076294079'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|31| -> Mara
    '|WP1|SLL_2019_001|31|': (plantId) => {
      return [
        buildAgent('5e4ac32c04b1fc16fc509266', 'Abdul Karim Thullah', buildAgentContacts('+232088677973'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|65| -> Musaia
    '|WP1|SLL_2019_001|65|': (plantId) => {
      return [
        buildAgent('5e626fb342a170482014ebd9', 'Abubakarr Jawara', buildAgentContacts('+232078576321'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|42| -> Rokonta
    '|WP1|SLL_2019_001|42|': (plantId) => {
      return [
        buildAgent('5e4ac34604b1fc16fc509267', 'Idrissa Thullah', buildAgentContacts('+232088948004'), [ plantId ])
      ];
    },
    // --> |WP1|SLL_2019_001|55| -> Sinkunia
    '|WP1|SLL_2019_001|55|': (plantId) => {
      return [
        buildAgent('5e4a957104b1fc16fc509231', 'Mohamed Kamara', buildAgentContacts('+232078832122'), [ plantId ])
      ];
    },
  };
}


function buildAgent(idAsString, fullName, contacts, plantIdList) {
  const result = {
    _id: new mongoose.Types.ObjectId(idAsString),
    fullName: fullName,
    contacts: contacts,
    plants: plantIdList,
  };

  return result;
}

function buildAgentContacts(phoneNo) {
  const result = [{
    'type': 'PHN',
    address: phoneNo,
  }];

  return result;
}
