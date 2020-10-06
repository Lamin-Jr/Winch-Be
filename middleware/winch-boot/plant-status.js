const mongoose = require('mongoose');

const PlantStatus = require('../../app/winch/api/models/plant-status');

const Plant = require('../../app/winch/api/models/plant');

const {
  buildSystemCreator,
} = require('../winch-boot/utils')


module.exports.buildPlantsStatus = () => {
  const entityName = 'plant status';

  return new Promise((resolve, reject) => {
    const defaultPlantStatus = getDefaultPlantStatus();
    const plantStatusByPlantName = getPlantStatusByPlantName();
    const systemCreator = buildSystemCreator();

    Plant.find({}).select({ name: 1 }).exec()
      .then(findResult => {
        findResult.forEach((plant, index) => {
          const plantStatus = plantStatusByPlantName[plant.name] || defaultPlantStatus;
          PlantStatus.create(new PlantStatus({
            _id: plant._id,
            ...systemCreator,
            ...plantStatus
          }))
            .then(createResult => {
              console.log(`'${plantStatus.status}@${plant.name}[${plant._id}]' ${entityName} creation succeeded with id: ${createResult._id}`);
            })
            .catch(createError => {
              if (createError.name === 'MongoError' && createError.code === 11000) {
                console.log(`'${plantStatus.status}@${plant.name}[${plant._id}]' ${entityName} creation already done`);
              } else {
                console.error(`'${plantStatus.status}@${plant.name}[${plant._id}]' ${entityName} creation error: ${createError}`);
              }
            })
            .finally(() => {
              if (index === (findResult.length - 1)) {
                resolve();
              }
            });
        });
      })
      .catch(findError => {
        reject(findError);
      })
  });
}


function getPlantStatusByPlantName () {
  const regular = { status: 6, messages: [] };
  const commFailure = { status: 2, messages: ['comm-lost'] };
  const techWarn = { status: 4, messages: ['inv-failure', 'invs-failure'] };

  return {
    'Adido': regular,
    'Bafodia': regular,
    'Batkanu': regular,
    'Fintonia': regular,
    'Kagbere': regular,
    'Kamaranka': regular,
    'Kathantha Yimboi': regular,
    'Mabang': regular,
    'Mara': regular,
    'Musaia': regular,
    'Rokonta': regular,
    'Sinkunia': regular,
    'Yiffin': regular,
    'Nimjat RPU001': commFailure,
    'Nimjat RPU002': regular,
    'Koglo Kope': techWarn,
  }
}


function getDefaultPlantStatus () {
  return {
    status: 1,
    messages: []
  }
}