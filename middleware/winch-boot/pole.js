const mongoose = require('mongoose');
const mongooseMixins = require('../../api/middleware/mongoose-mixins');
const Pole = require('../../app/winch/api/models/pole');
// const {
  // buildFeaturesCollection,
// } = require('./winch-boot/utils')
const creatorFragment = mongooseMixins.makeCreator(
  new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID),
  process.env.WCH_AUTHZ_SYSTEM_ROLE);

module.exports.buildPoles = () => {
  return new Promise((resolve, reject) => {
    const poles = getPoles();

    poles.forEach((pole, index) => {
      Pole.create(pole)
        .then(createResult => {
          console.log(`'${createResult['code']}' pole creation succeeded with id: ${createResult._id}`);
        })
        .catch(createError => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            console.log(`'${pole['code']}' pole creation already done`);
          } else {
            console.error(`'${pole['code']}' pole creation error: ${createError}`);
          }
        })
        .finally(() => {
          if (index === poles.length - 1) {
            resolve();
          }
        });
    });
  });
};

function getPoles() {
  return [
    buildPole('5e0efc42c6eb2f27e0f6a0f0', 'Pole 1',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f1', 'Pole 2',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f2', 'Pole 3',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f3', 'Pole 4',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f4', 'Pole 5',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f5', 'Pole 6',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f6', 'Pole 7',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f7', 'Pole 8',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f8', 'Pole 9',  undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f9', 'Pole 10', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0fa', 'Pole 11', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0fb', 'Pole 12', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0fc', 'Pole 13', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0fd', 'Pole 14', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0fe', 'Pole 15', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0ff', 'Pole 16', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a100', 'Pole 17', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a101', 'Pole 18', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a102', 'Pole 19', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a103', 'Pole 20', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a104', 'Pole 21', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a105', 'Pole 22', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a106', 'Pole 23', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a107', 'Pole 24', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a108', 'Pole 25', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a109', 'Pole 26', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a10a', 'Pole 27', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a10b', 'Pole 28', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a10c', 'Pole 29', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a10d', 'Pole 30', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a10e', 'Pole 31', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a10f', 'Pole 32', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a110', 'Pole 33', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a111', 'Pole 34', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a112', 'Pole 35', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a113', 'Pole 36', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a114', 'Pole 37', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a115', 'Pole 38', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a116', 'Pole 39', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a117', 'Pole 40', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a118', 'Pole 41', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a119', 'Pole 42', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a11a', 'Pole 43', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a11b', 'Pole 44', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a11c', 'Pole 45', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a11d', 'Pole 46', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a11e', 'Pole 47', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a11f', 'Pole 48', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a120', 'Pole 49', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a121', 'Pole 50', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a122', 'Pole 51', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a123', 'Pole 52', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a124', 'Pole 53', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a125', 'Pole 54', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a126', 'Pole 55', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a127', 'Pole 56', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a128', 'Pole 57', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a129', 'Pole 58', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a12a', 'Pole 59', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a12b', 'Pole 60', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a12c', 'Pole 61', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a12d', 'Pole 62', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a12e', 'Pole 63', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a12f', 'Pole 64', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a130', 'Pole 65', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a131', 'Pole 66', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a132', 'Pole 67', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a133', 'Pole 68', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a134', 'Pole 69', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a135', 'Pole 70', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a136', 'Pole 71', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a137', 'Pole 72', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a138', 'Pole 73', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a139', 'Pole 74', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a13a', 'Pole 75', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a13b', 'Pole 76', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a13c', 'Pole 77', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a13d', 'Pole 78', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a13e', 'Pole 79', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a13f', 'Pole 80', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a140', 'Pole 81', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a141', 'Pole 82', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a142', 'Pole 83', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a143', 'Pole 84', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a144', 'Pole 85', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a145', 'Pole 86', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a146', 'Pole 87', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a147', 'Pole 88', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a148', 'Pole 89', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a149', 'Pole 90', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14a', 'Pole 91', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14b', 'Pole 92', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14c', 'Pole 93', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14d', 'Pole 94', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14e', 'Pole 95', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14f', 'Pole 96', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a150', 'Pole 97', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a151', 'Pole 98', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a152', 'Pole 99', undefined),
  ];
}

function buildPole(id, code, geo = undefined) {
  const result = {
    _id: new mongoose.Types.ObjectId(id),
    ...creatorFragment,
    enabled: true,
    code: code,
    geo: geo,
  };

  return result;
}
