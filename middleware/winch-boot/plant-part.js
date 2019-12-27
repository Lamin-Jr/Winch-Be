const mongoose = require('mongoose');
const Plant = require('../../app/winch/api/models/plant');
const PlantPart = require('../../app/winch/api/models/plant-part');
const Part = require('../../app/winch/api/models/part');

module.exports.buildPlantParts = () => {
  return new Promise((resolve, reject) => {
    const partsById = {}

    // firstly, populate all parts
    getParts().forEach(part => {
      const partId = part._id;
      partsById[partId] = part;
      
      Part.create(part)
      .then(createResult => {
        console.log(`part creation succeeded with id: ${createResult._id}`);
        resolve();
      })
      .catch(createError => {
        if (createError.name === 'MongoError' && createError.code === 11000) {
          console.log(`'[${partId}]' part creation already done`);
          resolve();
        } else {
          console.error(`'[${partId}]' part creation error: ${createError}`);
          reject(createError);
        }
      });
  
    })

    // then, associate parts to plants as plant parts
    const plantPartsFactoryByPlantName = getPlantPartsFactoryByPlantName(partsById);

    Plant.find({}).select({ name: 1 }).exec()
    .then(findResult => {
      findResult.forEach((plant, index) => {
        const plantPartsFactory = plantPartsFactoryByPlantName[plant.name];
        if (!plantPartsFactory) {
          if (index === (findResult.length - 1)) {
            resolve();
          }
          return;
        }
        plantPartsFactory(plant._id).forEach(plantPart => {
          PlantPart.countDocuments({
            plant: plant._id,
            'part._id': plantPart.part._id
          }).exec()
          .then(countResult => {
            if (countResult !== 0) {
              console.log(`'${plantPart.part._id}@${plant.name}[${plant._id}]' plant part creation already done`);
              return;
            }
            PlantPart.create(plantPart)
            .then(createResult => {
              console.log(`'${plantPart.part._id}@${plant.name}[${plant._id}]' plant part creation succeeded with id: ${createResult._id}`);
            })
            .catch(createError => {
              console.error(`'${plantPart.part._id}@${plant.name}[${plant._id}]' plant part creation error: ${createError}`);
            })
            .finally(() => {
              if (index === (findResult.length - 1)) {
                resolve();
              }
            });
          })
          .catch(countError => {
            console.error(`'${plantPart.part._id}@${plant.name}[${plant._id}]' plant part count error: ${countError}`);
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


//
// plant-part section

function getPlantPartsFactoryByPlantName(partsById) {
  return {
    'Adido': (plantId) => { return [
      buildPlantPart(plantId, 1, partsById['|hw|cnt|we|bs40|']),
      buildPlantPart(plantId, 96, partsById['|hw|pvm|js|JKM325PP-72|325|']),
      buildPlantPart(plantId, 9, partsById['|hw|invs|ips|I4000B|']),
      buildPlantPart(plantId, 15, partsById['|hw|invb|ips|SML 2000|']),
      buildPlantPart(plantId, 48, partsById['|hw|batt|hpk|OPzV S/P VR L 2-1700|']),
      buildPlantPart(plantId, 47, partsById['|hw|meter|spm|SM5R|']),
      buildPlantPart(plantId, 71, partsById['|hw|meter|spm|SM60R|']),
      buildPlantPart(plantId, 5, partsById['|hw|meter|spm|SM60RP|']),
    ]},
  };
}

function buildPlantPart(plantId, quantity, part, info = []) {
  const result = {
    _id: new mongoose.Types.ObjectId(),
    plant: plantId,
    qty: quantity,
    part: part,
    info: info
  };

  return result;
}


//
// part section

function getParts() {
  // enum: ['container', 'pv module', 'genset', 'solar inverter', 'battery inverter', 'battery pack', 'meter'],
  const parts = [
    // Adido
    buildPart('|hw|cnt|we|bs40|', 'container', 'Container Bespoke 40FT',
              buildPartHw('Winch Energy', 'BS40'),
              buildPartDoc()),
    buildPart('|hw|pvm|js|JKM325PP-72|325|', 'pv module', 'Jinko Solar - JKM325PP-72 - 325Wp',
              buildPartHw('Jinko Solar', 'JKM325PP-72'),
              buildPartDoc()),
    buildPart('|hw|invs|ips|I4000B|', 'solar inverter', 'IPS - Inverter module I4000B',
              buildPartHw('IPS - International Power Supply AD', 'I4000B'),
              buildPartDoc()),
    buildPart('|hw|invb|ips|SML 2000|', 'battery inverter', 'IPS - Solar Charger Controller SML 2000',
              buildPartHw('IPS - International Power Supply AD', 'SML 2000'),
              buildPartDoc()),
    buildPart('|hw|batt|hpk|OPzV S/P VR L 2-1700|', 'battery pack', 'Hoppecke - OPzV Sun/Power VR L 2-1700',
              buildPartHw('HOPPECKE Carl Zoellner & Sohn GmbH', 'OPzV S/P VR L 2-1700'),
              buildPartDoc()),
    buildPart('|hw|meter|spm|SM5R|', 'meter', 'SparkMeter - SM5R',
              buildPartHw('SparkMeter, Inc.', 'SM5R'),
              buildPartDoc()),
    buildPart('|hw|meter|spm|SM60R|', 'meter', 'SparkMeter - SM60R',
              buildPartHw('SparkMeter, Inc.', 'SM60R'),
              buildPartDoc()),
    buildPart('|hw|meter|spm|SM60RP|', 'meter', 'SparkMeter - SM60RP',
              buildPartHw('SparkMeter, Inc.', 'SM60R'),
              buildPartDoc()),
  ];

  return parts;
}

function buildPart(id, category, label, hw, doc) {
  const result = {
    _id: id,
    category: category,
    label: label,
    hw: hw,
    doc: doc
  };

  return result;
}

function buildPartHw(manufacturer = undefined, model = undefined) {
  const result = {
    manufacturer: manufacturer,
    model: model
  };
  return result;
}
function buildPartDoc(datasheets = [], manuals = [], certs = []) {
  const result = {
    datasheets: datasheets,
    manuals: manuals,
    certs: certs
  };
  return result;
}