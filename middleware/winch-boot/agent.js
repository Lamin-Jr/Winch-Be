const mongoose = require('mongoose');

const Agent = require('../../app/winch/api/models/agent');

const Plant = require('../../app/winch/api/models/plant');


module.exports.buildAgents = () => {
  return new Promise((resolve, reject) => {
    const agentsByPlantId = getAgentsByPlantId();

    Object.entries(agentsByPlantId).forEach(agentByPlantIdEntry => {

      const agents = agentByPlantIdEntry[1](agentByPlantIdEntry[0]);

      agents.forEach(agent => {

        Agent.create(agent)
          .then(createResult => {
            console.info(`agent creation succeeded with id: ${createResult._id}`);

            Plant.updateOne({
              _id: agentByPlantIdEntry[0]
            }, {
              agents: agents
            })
              .then(plantUpdateResult => {
                console.info(`'${plantUpdateResult}' plant update succeeded`);
              })
              .catch(plantUpdateError => {
                console.error(`'[${agentId}]' agent creation error: ${plantUpdateError}`);
                reject(createError);  
              });
          })
          .catch(createError => {
            if (createError.name === 'MongoError' && createError.code === 11000) {
              console.log(`'[${agentId}]' agent creation already done`);
            } else {
              console.error(`'[${agentId}]' agent creation error: ${createError}`);
              reject(createError);
            }
          })
          .finally(() => {
            // TODO controllare length
            resolve();
          });
    
      });

    });

  });
}


function getAgentsByPlantId() {
  return {
    '|BEN|BEN_2019_005|1|': (plantId) => {
      return [
        buildAgent('Geraud Fadeyi', buildAgentContacts('+22967337540'), plantId)
      ];
    },
  };
}


function buildAgent(fullName, contacts, plantId) {
  const result = {
    _id: new mongoose.Types.ObjectId(),
    fullName: fullName,
    contacts: contacts,
    plant: plantId,
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
