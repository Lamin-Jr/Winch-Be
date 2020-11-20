const mongoose = require('mongoose');

const PlantService = require('../../app/winch/api/models/plant-service');

const {
  plantServiceTags,
  buildPlantServiceId,
} = require('../../app/winch/api/models/shared/plant');

const Plant = require('../../app/winch/api/models/plant');


module.exports.buildPlantsServices = () => {
  const entityName = 'plant service';

  return new Promise((resolve, reject) => {
    const plantServicesByPlantName = getPlantServicesByPlant();

    Plant.find({}).select({ name: 1 }).exec()
      .then(findResult => {

        findResult.forEach((plant, index) => {
          const plantServicesDelegate = plantServicesByPlantName[plant._id];

          if (!plantServicesDelegate) {
            if (index === (findResult.length - 1)) {
              resolve();
            }
            return;
          }

          plantServicesDelegate(plant._id).forEach(plantService => {

            if (!plantServiceTags.includes(plantService._id.t)) {
              console.warn(`unrecognized service tag '${plantService.headTag}' assigned to '${plant._id}' plant`);
            }

            PlantService.create(plantService)
              .then(createResult => {
                console.log(`'${plantService._id.t}${plantService._id.i ? `_${plantService._id.i}` : ''}@${plantService._id.m}' ${entityName} creation succeeded with id: ${createResult._id}`);
              })
              .catch(createError => {
                if (createError.name === 'MongoError' && createError.code === 11000) {
                  console.log(`'${plantService._id.t}${plantService._id.i ? `_${plantService._id.i}` : ''}@${plantService._id.m}' ${entityName} creation already done`);
                } else {
                  console.error(`'${plantService._id.t}${plantService._id.i ? `_${plantService._id.i}` : ''}@${plantService._id.m}' ${entityName} creation error: ${createError}`);
                }
              })
              .finally(() => {
                if (index === (findResult.length - 1)) {
                  resolve();
                }
              });

          });

        });
      })
      .catch(findError => {
        reject(findError);
      })

  });
}


function getPlantServicesByPlant () {
  return {
    // -> Benin
    // --> |BEN|BEN_2019_005|1| -> Adido
    '|BEN|BEN_2019_005|1|': (plantId) => [
      buildPlantService(buildPlantServiceId(plantId, 'cold-room'), buildHeadGroup('Cold room')),
      buildPlantService(buildPlantServiceId(plantId, 'chrg-phn'), buildHeadGroup('Phone charge')),
      buildPlantService(buildPlantServiceId(plantId, 'inet-wifi'), buildHeadGroup('Wi-Fi voucher')),
    ],
    // -> Sierra Leone
    // --> |WP1|SLL_2019_001|69| -> Bafodia
    '|WP1|SLL_2019_001|69|': (plantId) => [
      buildPlantService(buildPlantServiceId(plantId, 'rent-batt'), buildHeadGroup('Battery rental'), buildDatesGroup(new Date('2020-11-06'), new Date('2020-10-20')), 'mopo'),
    ],
    // --> |WP1|SLL_2019_001|55| -> Sinkunia
    '|WP1|SLL_2019_001|55|': (plantId) => [
      buildPlantService(buildPlantServiceId(plantId, 'rent-batt'), buildHeadGroup('Battery rental'), buildDatesGroup(new Date('2020-06-11'), new Date('2020-06-10')), 'mopo'),
    ],
    // -> Uganda
    // --> |UG|HUB-SEN|1| -> Hub
    '|UG|HUB-SEN|1|': (plantId) => [
      buildPlantService(buildPlantServiceId(plantId, 'chrg-phn'), buildHeadGroup('Phone charge')),
      buildPlantService(buildPlantServiceId(plantId, 'chrg-lapt'), buildHeadGroup('Laptop charge')),
      buildPlantService(buildPlantServiceId(plantId, 'chrg-batt', 'big'), buildHeadGroup('Battery charge', 'Small size')),
      buildPlantService(buildPlantServiceId(plantId, 'chrg-batt', 'small'), buildHeadGroup('Battery charge', 'Big size')),
      buildPlantService(buildPlantServiceId(plantId, 'print'), buildHeadGroup('Printing')),
      buildPlantService(buildPlantServiceId(plantId, 'scan'), buildHeadGroup('Scanning')),
      buildPlantService(buildPlantServiceId(plantId, 'copy', '20max'), buildHeadGroup('Copying', 'Max 20 pages')),
      buildPlantService(buildPlantServiceId(plantId, 'copy', '20+'), buildHeadGroup('Copying', 'More than 20 pages')),
      buildPlantService(buildPlantServiceId(plantId, 'cold-drnk'), buildHeadGroup('Cold drinks')),
      buildPlantService(buildPlantServiceId(plantId, 'inet-wifi'), buildHeadGroup('WiFi')),
    ],
  };
}


function buildPlantService (id, headGroup, datesGroup = undefined, driver = undefined) {
  const plantService = {
    _id: id,
    ...headGroup,
    ...datesGroup,
    driver,
  };

  return plantService;
}

function buildHeadGroup(headTag, headItem = undefined) {
  return {
    headTag,
    headItem
  }
}

function buildDatesGroup(business, commit = undefined) {
  return {
    commit,
    business,
  }
}