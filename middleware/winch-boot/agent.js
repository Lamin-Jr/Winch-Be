const mongoose = require('mongoose');

const Agent = require('../../app/winch/api/models/agent');

const Plant = require('../../app/winch/api/models/plant');


module.exports.buildAgents = () => {
  return new Promise((resolve, reject) => {
    const agentsByPlantId = getAgentsByPlantId();

    Object.entries(agentsByPlantId).forEach(agentByPlantIdEntry => {

      const agents = agentByPlantIdEntry[1](agentByPlantIdEntry[0]);

      agents.forEach((agent, index) => {

        Agent.create(agent)
          .then(createResult => {
            console.info(`agent creation succeeded with id: ${createResult._id}`);
          })
          .catch(createError => {
            if (createError.name === 'MongoError' && createError.code === 11000) {
              console.log(`'${agent.fullName}@${agentByPlantIdEntry[0]}' agent creation already done`);
            } else {
              console.error(`'${agent.fullName}@${agentByPlantIdEntry[0]}' agent creation error: ${createError}`);
              reject(createError);
            }
          })
          .finally(() => {
            if (index === agents.length - 1) {
              Plant.updateOne({
                _id: agentByPlantIdEntry[0]
              }, {
                $set: { 'organization.agents': agents }
              })
                .then(plantUpdateResult => {
                  console.info(`'${agentByPlantIdEntry[0]}' plant update (${plantUpdateResult.nModified}) succeeded`);
                  resolve();

                })
                .catch(plantUpdateError => {
                  console.error(`'${agentByPlantIdEntry[0]}' plant update error: ${plantUpdateError}`);
                  reject(plantUpdateError);
                });

            } 

          });
    
      });
      
    });

  });
}


function getAgentsByPlantId() {
  return {
    '|BEN|BEN_2019_005|1|': (plantId) => {
      return [
        buildAgent('5e2f29e2b0a5102704b89d0a', 'Geraud Fadeyi', buildAgentContacts('+22967337540'), plantId)
      ];
    },
  };
}


function buildAgent(idAsString, fullName, contacts, plantId) {
  const result = {
    _id: new mongoose.Types.ObjectId(idAsString),
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
