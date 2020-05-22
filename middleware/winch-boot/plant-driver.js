const mongoose = require('mongoose');

const { defaultUpdateOptions } = require('../../api/middleware/mongoose-util');

const PlantDriver = require('../../app/winch/api/models/plant-driver');


module.exports.buildPlantDrivers = () => {
  return new Promise((resolve) => {
    const plantDrivers = getPlantDrivers();

    plantDrivers.forEach((plantDriver, index) => {
      const filter = {
        _id: plantDriver._id
      };
      const update = {
        $set: {
          'gen-drivers':   plantDriver['gen-drivers'],
          'deliv-driver':  plantDriver['deliv-driver'],
          accounting:      plantDriver.accounting,
        }
      };
      PlantDriver.findOneAndUpdate(filter, update, defaultUpdateOptions)
        .then(updateResult => {
          if (updateResult) {
            console.info(`plant driver update succeeded with id: ${updateResult._id}`);
          } else {
            PlantDriver.create(plantDriver)
              .then(createResult => {
                console.info(`plant driver creation succeeded with id: ${createResult._id}`);
              })
              .catch(createError => {
                console.error(`'${plantDriver['_id']}' plant driver creation error: ${createError}`);
              });
          }
        })
        .catch(readError => {
          console.error(`'${plantDriver['_id']}' plant driver reading error: ${readError}`);
        })
        .finally(() => {
          if (index === plantDrivers.length - 1) {
            resolve();
          }
        });
    });
  });
};

function spmXform() {
  return {
    'm': 'spmMXform',
    'ms': 'spmMsXform',
    'cid': 'spmCidXform',
  }
}

function getPlantDrivers() {
  return [
    // -> DEMO
    { 
      "_id" : "DEMO",
      'gen-drivers': [ 'not_avail' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          'm': 'demoMXform',
          'ms': 'spmMsXform',
          'cid': 'spmCidXform',
        },
      },
    },
    // -> Adido
    { 
      "_id" : "|BEN|BEN_2019_005|1|",
      'gen-drivers': [ 'mcl', 'exn' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1
    // -> WP1/Rokonta
    { 
      "_id" : "|WP1|SLL_2019_001|42|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Mara
    { 
      "_id" : "|WP1|SLL_2019_001|31|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Mabang
    { 
      "_id" : "|WP1|SLL_2019_001|43|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Batkanu
    { 
      "_id" : "|WP1|SLL_2019_001|7|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Kamaranka
    { 
      "_id" : "|WP1|SLL_2019_001|27|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Kagbere
    { 
      "_id" : "|WP1|SLL_2019_001|8|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Fintonia
    { 
      "_id" : "|WP1|SLL_2019_001|46|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Kathantha Yimboi
    { 
      "_id" : "|WP1|SLL_2019_001|5|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Sinkunia
    { 
      "_id" : "|WP1|SLL_2019_001|55|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Musaia
    { 
      "_id" : "|WP1|SLL_2019_001|65|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Bafodia
    { 
      "_id" : "|WP1|SLL_2019_001|69|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
    // -> WP1/Yiffin
    { 
      "_id" : "|WP1|SLL_2019_001|87|",
      'gen-drivers': [ 'sma' ],
      'deliv-driver': 'spm',
      accounting: {
        xform: {
          ...spmXform(),
        },
      },
    },
  ];
}
