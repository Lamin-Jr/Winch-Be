const mongoose = require('mongoose');

const mongooseMixins = require('../../api/middleware/mongoose-mixins')

const PlantServiceTariff = require('../../app/winch/api/models/plant-service-tariff');

const {
  plantServiceTags,
  buildPlantServiceTariffId,
  buildPlantServiceId,
} = require('../../app/winch/api/models/shared/plant');

const PlantService = require('../../app/winch/api/models/plant-service');


module.exports.buildPlantsServiceTariffs = () => {
  const entityName = 'plant service tariff';

  return new Promise((resolve, reject) => {
    const plantServiceTariffsByPlantService = getPlantServiceTariffsByPlantService();

    PlantService.find({}).select({ _id: 1 }).exec()
      .then(findResult => {

        findResult.forEach((plantService, index) => {
          const plantServiceTariffWrites = plantServiceTariffsByPlantService[JSON.stringify(plantService._id)];

          if (!plantServiceTariffWrites) {
            if (index === (findResult.length - 1)) {
              resolve();
            }
            return;
          }

          const plantServiceTariff = plantServiceTariffWrites.create

          if (!plantServiceTags.includes(plantServiceTariff._id.t)) {
            console.warn(`unrecognized service tag '${plantServiceTariff._id.t}' assigned to '${plantServiceTariff._id.m}' plant`);
          }

          PlantServiceTariff.create(plantServiceTariff)
            .then(createResult => {
              console.log(`'${plantServiceTariff._id.t}${plantServiceTariff._id.i ? `_${plantServiceTariff._id.i}` : ''}@${plantServiceTariff._id.m}-${plantServiceTariff._id.v}' ${entityName} creation succeeded with id: ${createResult._id}`);
            })
            .catch(createError => {
              if (createError.name === 'MongoError' && createError.code === 11000) {
                console.log(`'${plantServiceTariff._id.t}${plantServiceTariff._id.i ? `_${plantServiceTariff._id.i}` : ''}@${plantServiceTariff._id.m}-${plantServiceTariff._id.v}' ${entityName} creation already done`);
              } else {
                console.error(`'${plantServiceTariff._id.t}${plantServiceTariff._id.i ? `_${plantServiceTariff._id.i}` : ''}@${plantServiceTariff._id.m}-${plantServiceTariff._id.v}' ${entityName} creation error: ${createError}`);
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


function getPlantServiceTariffsByPlantService () {
  return {
    // -> Benin
    // --> |BEN|BEN_2019_005|1| -> Adido
    // '|BEN|BEN_2019_005|1|': (plantId) => [
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'cold-room'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'chrg-phn'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'inet-wifi'), ...),
    // ],
    // -> Sierra Leone
    // --> |WP1|SLL_2019_001|55| -> Sinkunia
    [JSON.stringify(buildPlantServiceId('|WP1|SLL_2019_001|55|', 'rent-batt'))]: {
      create: buildPlantServiceTariff(buildPlantServiceTariffId(1, '|WP1|SLL_2019_001|55|', 'rent-batt'), new Date('2020-06-11'), buildUnitPriceGroup(4000.0, 'SLL'), buildShareGroup(0.25, 0.525)),
      updates: [],
    },
    // -> Uganda
    // --> |UG|HUB-SEN|1| -> Hub
    // '|UG|HUB-SEN|1|': (plantId) => [
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'chrg-phn'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'chrg-lapt'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'chrg-batt', 'big'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'chrg-batt', 'small'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'print'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'scan'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'copy', '20max'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'copy', '20+'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'cold-drnk'), ...),
    //   buildPlantServiceTariff(buildPlantServiceTariffId(plantId, 'inet-wifi'), ...),
    // ],
  };
}


function buildPlantServiceTariff (id, vFrom, unitPriceGroup, shareGroup = buildShareGroup()) {
  const plantServiceTariff = {
    _id: id,
    //
    // set/overwrite readonly fields
    ...mongooseMixins.makeHistoryOnCreate(vFrom, id),
    //
    // set user fields
    'unit-price': unitPriceGroup,
    share: shareGroup,
  };

  return plantServiceTariff;
}

function buildUnitPriceGroup (amount, currency) {
  return {
    amt: amount,
    ccy: currency,
  }
}

function buildShareGroup (agent = 0.0, operator = 0.0) {
  return {
    ag: operator,
    op: agent,
  }
}