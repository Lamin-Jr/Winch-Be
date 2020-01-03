const mongoose = require('mongoose');
const Meter = require('../../app/winch/api/models/meter');
const mongooseMixins = require('../../api/middleware/mongoose-mixins');
const creatorFragment = mongooseMixins.makeCreator(
  new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID),
  process.env.WCH_AUTHZ_SYSTEM_ROLE);

module.exports.buildMeters = () => {
  return new Promise((resolve, reject) => {
    const meters = getMeters();

    meters.forEach((meter, index) => {
      Meter.create(meter)
        .then(createResult => {
          console.log(`${createResult['label']} meter creation succeeded with id: ${createResult._id}`);
        })
        .catch(createError => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            console.log(`${meter['label']} meter creation already done`);
          } else {
            console.error(`'${meter['label']}' meter creation error: ${createError}`);
          }
        })
        .finally(() => {
          if (index === meters.lenght - 1) {
            resolve();
          }
        });
    });
  });
};

function getMeters() {
  return [
    buildMeter('|vSPM|SM5R-04-000091F1|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a109', 3, 'SM5R-04-000091F1',   'SM5R-04-000091F1',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-000091BD|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a109', 3, 'SM60R-05-000091BD',  'SM60R-05-000091BD',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-00008746|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a10f', 3, 'SM60R-05-00008746',  'SM60R-05-00008746',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009185|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a10f', 3, 'SM5R-04-00009185',   'SM5R-04-00009185',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000878C|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a10e', 3, 'SM5R-04-0000878C',   'SM5R-04-0000878C',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009186|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13e', 3, 'SM5R-04-00009186',   'SM5R-04-00009186',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-00008EFA|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13e', 3, 'SM60R-05-00008EFA',  'SM60R-05-00008EFA',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-00008EFE|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a11b', 3, 'SM60R-05-00008EFE',  'SM60R-05-00008EFE',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000917C|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a119', 2, 'SM5R-04-0000917C',   'SM5R-04-0000917C',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009182|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a11b', 3, 'SM5R-04-00009182',   'SM5R-04-00009182',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-00008F1E|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13d', 3, 'SM60R-05-00008F1E',  'SM60R-05-00008F1E',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009183|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13e', 3, 'SM5R-04-00009183',   'SM5R-04-00009183',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009184|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a119', 2, 'SM5R-04-00009184',   'SM5R-04-00009184',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C332|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a121', 3, 'SM60R-05-0000C332',  'SM60R-05-0000C332',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000918F|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a119', 2, 'SM5R-04-0000918F',   'SM5R-04-0000918F',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000918D|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a126', 3, 'SM5R-04-0000918D',   'SM5R-04-0000918D',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C127|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a11a', 1, 'SM60R-05-0000C127',  'SM60R-05-0000C127',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000917F|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a11a', 3, 'SM5R-04-0000917F',   'SM5R-04-0000917F',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000917D|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a121', 2, 'SM5R-04-0000917D',   'SM5R-04-0000917D',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C334|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13d', 2, 'SM60R-05-0000C334',  'SM60R-05-0000C334',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C4C2|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a12a', 3, 'SM60R-05-0000C4C2',  'SM60R-05-0000C4C2',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C13E|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a11f', 1, 'SM60R-05-0000C13E',  'SM60R-05-0000C13E',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009190|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a11f', 1, 'SM5R-04-00009190',   'SM5R-04-00009190',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009187|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a118', 3, 'SM5R-04-00009187',   'SM5R-04-00009187',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009192|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a112', 3, 'SM5R-04-00009192',   'SM5R-04-00009192',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C349|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a124', 2, 'SM60R-05-0000C349',  'SM60R-05-0000C349',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000C0AD|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a121', 2, 'SM5R-04-0000C0AD',   'SM5R-04-0000C0AD',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C497|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a124', 1, 'SM60R-05-0000C497',  'SM60R-05-0000C497',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C148|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a120', 3, 'SM60R-05-0000C148',  'SM60R-05-0000C148',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C141|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a112', 3, 'SM60R-05-0000C141',  'SM60R-05-0000C141',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C348|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a11f', 1, 'SM60R-05-0000C348',  'SM60R-05-0000C348',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C35A|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a118', 3, 'SM60R-05-0000C35A',  'SM60R-05-0000C35A',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-000091B0|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a12b', 3, 'SM60R-05-000091B0',  'SM60R-05-000091B0',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C358|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a124', 3, 'SM60R-05-0000C358',  'SM60R-05-0000C358',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009193|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a124', 1, 'SM5R-04-00009193',   'SM5R-04-00009193',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-000091EE|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a117', 1, 'SM5R-04-000091EE',   'SM5R-04-000091EE',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009191|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a12a', 3, 'SM5R-04-00009191',   'SM5R-04-00009191',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-000091F0|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a11c', 3, 'SM5R-04-000091F0',   'SM5R-04-000091F0',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000C06A|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a128', 3, 'SM5R-04-0000C06A',   'SM5R-04-0000C06A',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-00009198|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a120', 3, 'SM5R-04-00009198',   'SM5R-04-00009198',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-000091AE|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a148', 3, 'SM60R-05-000091AE',  'SM60R-05-000091AE',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C12B|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a122', 1, 'SM60R-05-0000C12B',  'SM60R-05-0000C12B',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C335|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a124', 3, 'SM60R-05-0000C335',  'SM60R-05-0000C335',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C142|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a123', 3, 'SM60R-05-0000C142',  'SM60R-05-0000C142',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-000091BA|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a136', 3, 'SM60R-05-000091BA',  'SM60R-05-000091BA',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-000091C8|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a146', 3, 'SM60R-05-000091C8',  'SM60R-05-000091C8',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C351|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a126', 2, 'SM60R-05-0000C351',  'SM60R-05-0000C351',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-000091B8|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a120', 3, 'SM60R-05-000091B8',  'SM60R-05-000091B8',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C315|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a132', 3, 'SM60R-05-0000C315',  'SM60R-05-0000C315',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60RP-02-000092B2|', '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a133', 3, 'SM60RP-02-000092B2', 'SM60RP-02-000092B2', buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C356|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a117', 1, 'SM60R-05-0000C356',  'SM60R-05-0000C356',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C492|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13b', 3, 'SM60R-05-0000C492',  'SM60R-05-0000C492',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000C0BE|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a137', 3, 'SM5R-04-0000C0BE',   'SM5R-04-0000C0BE',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C35D|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a128', 1, 'SM60R-05-0000C35D',  'SM60R-05-0000C35D',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C313|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13c', 1, 'SM60R-05-0000C313',  'SM60R-05-0000C313',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-000091EF|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a10a', 3, 'SM5R-04-000091EF',   'SM5R-04-000091EF',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C18C|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a126', 2, 'SM60R-05-0000C18C',  'SM60R-05-0000C18C',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM5R-04-0000C0B5|',   '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a122', 3, 'SM5R-04-0000C0B5',   'SM5R-04-0000C0B5',   buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C333|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13a', 1, 'SM60R-05-0000C333',  'SM60R-05-0000C333',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C345|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a126', 2, 'SM60R-05-0000C345',  'SM60R-05-0000C345',  buildSparkmeterHardwareInfo),
    buildMeter('|vSPM|SM60R-05-0000C4BB|',  '|BEN|BEN_2019_005|1|', '5e0efc42c6eb2f27e0f6a13a', 1, 'SM60R-05-0000C4BB',  'SM60R-05-0000C4BB',  buildSparkmeterHardwareInfo),
  ];
}

function buildMeter(id, plantId, poleId, phase, label, meterSerial, hwInfoBuilder) {
  const result = {
    _id: id,
    ...creatorFragment,
    plant: plantId,
    pole: new mongoose.Types.ObjectId(poleId),
    phase: phase,
    label: label,
    ...hwInfoBuilder(meterSerial)
  };

  return result;
}

function buildSparkmeterHardwareInfo(meterSerial) {
  return {
    hw: {
      manufacturer: 'SparkMeter, Inc.',
      model: meterSerial.substring(0, meterSerial.indexOf('-')),
      'serial-no': meterSerial
    }
  }
}
