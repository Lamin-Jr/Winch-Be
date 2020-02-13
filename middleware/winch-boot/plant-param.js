const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const { defaultUpdateOptions } = require('../../api/middleware/mongoose-util');

const PlantParam = require('../../app/winch/api/models/plant-param');


module.exports.buildPlantParams = () => {
  return new Promise((resolve) => {
    const plantParams = getPlantParams();

    plantParams.forEach((plantParam, index) => {
      const filter = {
        _id: plantParam._id
      };
      const update = {
        $set: {
          degradation:  plantParam.degradation,
          eafs:         plantParam.eafs,
          pr:           plantParam.pr,
          'ramp-up':    plantParam['ramp-up']
        }
      };
      PlantParam.findOneAndUpdate(filter, update, defaultUpdateOptions)
        .then(updateResult => {
          if (updateResult) {
            console.info(`plant param update succeeded with id: ${updateResult._id}`);
          } else {
            PlantParam.create(plantParam)
              .then(createResult => {
                console.info(`plant param creation succeeded with id: ${createResult._id}`);
              })
              .catch(createError => {
                console.error(`'${plantParam['_id']}' plant param creation error: ${createError}`);
              });
          }
        })
        .catch(updateError => {
          console.error(`'${plantParam['_id']}' plant param creation error: ${updateError}`);
        })
        .finally(() => {
          if (index === plantParams.length - 1) {
            resolve();
          }
        });
    });
  });
};

function getPlantParams() {
  return [
    // -> Benin
    {
      _id:          '|BEN|BEN_2019_005|1|',
      degradation:  { 
                      default : [
                        'daily', 
                        'linear'
                      ],
                      yearly: {
                        linear: 0.79
                      },
                      monthly: {
                        linear: 0.065833333
                      },
                      weekly: {
                        linear: 0.015192308
                      },
                      daily: {
                        linear: 0.002162902
                      }
                    },
      eafs:         [ 74.73, 70.46, 74.73, 74.73, 76.86, 64.05, 61.92, 59.78, 68.32, 76.86, 81.13, 81.13 ],
      pr:           [ 74.20, 73.80, 73.80, 74.30, 75.00, 75.80, 76.40, 76.50, 76.30, 75.70, 74.50, 74.40 ],
      'ramp-up':    [ 18.00, 22.82, 27.65, 32.47, 37.29, 42.12, 46.94, 51.76, 56.59, 61.41, 66.24, 71.06, 75.88, 80.71, 85.53, 90.35, 95.18, 99.73, 99.73, 99.73, 99.73, 99.73, 99.73, 100.00 ]
    }
  ];
}
