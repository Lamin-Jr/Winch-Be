const mongoose = require('mongoose');

const mongooseMixins = require('../../api/middleware/mongoose-mixins');
const { defaultUpdateOptions } = require('../../api/middleware/mongoose-util');

const creatorFragment = mongooseMixins.makeCreator(
  new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID),
  process.env.WCH_AUTHZ_SYSTEM_ROLE
);

const { buildFeaturesCollection } = require('../winch-boot/utils');

const Pole = require('../../app/winch/api/models/pole');

module.exports.buildPoles = () => {
  return new Promise((resolve, reject) => {
    const poles = getPoles();

    poles.forEach((pole, index) => {
      const id = pole._id;
      const filter = {
        _id: id
      };
      const update = {
        $set: {
          enabled: pole.enabled,
          code: pole.code,
          geo: pole.geo
        }
      };
      Pole.findOneAndUpdate(filter, update, defaultUpdateOptions)
        .then(upsertResult => {
          if (upsertResult) {
            console.log(`'${pole['code']}' pole update succeeded with id: ${upsertResult._id}`);
          } else {
              Pole.create(pole)
              .then(createResult => {
                console.log(`'${pole['code']}' pole creation succeeded with id: ${createResult._id}`);
              })
              .catch(createError => {
                console.error(`'${pole['code']}' pole creation error: ${createError}`);
              });
          }
        })
        .catch(upsertError => {
          console.error(`'${pole.code}' pole creation error: ${upsertError}`);
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
    buildPole('5e0efc42c6eb2f27e0f6a0f0', 'Pole 1', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f1', 'Pole 2', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f2', 'Pole 3', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f3', 'Pole 4', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f4', 'Pole 5', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f5', 'Pole 6', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f6', 'Pole 7', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f7', 'Pole 8', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a0f8', 'Pole 9', undefined),
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
    buildPole('5e0efc42c6eb2f27e0f6a108', 'Pole 25', 6.82919011, 2.52594233),
    buildPole('5e0efc42c6eb2f27e0f6a109', 'Pole 26', 6.82932194, 2.52634086),
    buildPole('5e0efc42c6eb2f27e0f6a10a', 'Pole 27', 6.82945377, 2.52673949),
    buildPole('5e0efc42c6eb2f27e0f6a10b', 'Pole 28', 6.82958559, 2.52713811),
    buildPole('5e0efc42c6eb2f27e0f6a10c', 'Pole 29', 6.82971742, 2.52753664),
    buildPole('5e0efc42c6eb2f27e0f6a10d', 'Pole 30', 6.82984924, 2.52793527),
    buildPole('5e0efc42c6eb2f27e0f6a10e', 'Pole 31', 6.82998107, 2.5283338),
    buildPole('5e0efc42c6eb2f27e0f6a10f', 'Pole 32', 6.83011129, 2.5284888),
    buildPole('5e0efc42c6eb2f27e0f6a110', 'Pole 33', 6.82969859, 2.52863328),
    buildPole('5e0efc42c6eb2f27e0f6a111', 'Pole 34', 6.82928597, 2.52877785),
    buildPole('5e0efc42c6eb2f27e0f6a112', 'Pole 35', 6.82887336, 2.52892234),
    buildPole('5e0efc42c6eb2f27e0f6a113', 'Pole 36', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a114', 'Pole 37', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a115', 'Pole 38', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a116', 'Pole 39', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a117', 'Pole 40', 6.83025401, 2.52891972),
    buildPole('5e0efc42c6eb2f27e0f6a118', 'Pole 41', 6.83039681, 2.52935064),
    buildPole('5e0efc42c6eb2f27e0f6a119', 'Pole 42', 6.83053961, 2.52978166),
    buildPole('5e0efc42c6eb2f27e0f6a11a', 'Pole 43', 6.83068186, 2.53021123),
    buildPole('5e0efc42c6eb2f27e0f6a11b', 'Pole 44', 6.83082421, 2.53064079),
    buildPole('5e0efc42c6eb2f27e0f6a11c', 'Pole 45', 6.83011207, 2.52992932),
    buildPole('5e0efc42c6eb2f27e0f6a11d', 'Pole 46', 6.82968453, 2.53007699),
    buildPole('5e0efc42c6eb2f27e0f6a11e', 'Pole 47', 6.83054371, 2.52833886),
    buildPole('5e0efc42c6eb2f27e0f6a11f', 'Pole 48', 6.83068724, 2.52877232),
    buildPole('5e0efc42c6eb2f27e0f6a120', 'Pole 49', 6.83083086, 2.52920587),
    buildPole('5e0efc42c6eb2f27e0f6a121', 'Pole 50', 6.83097393, 2.52963797),
    buildPole('5e0efc42c6eb2f27e0f6a122', 'Pole 51', 6.83111619, 2.53006754),
    buildPole('5e0efc42c6eb2f27e0f6a123', 'Pole 52', 6.83125844, 2.53049701),
    buildPole('5e0efc42c6eb2f27e0f6a124', 'Pole 53', 6.83091998, 2.52820835),
    buildPole('5e0efc42c6eb2f27e0f6a125', 'Pole 54', 6.83129615, 2.52807784),
    buildPole('5e0efc42c6eb2f27e0f6a126', 'Pole 55', 6.83170081, 2.52793752),
    buildPole('5e0efc42c6eb2f27e0f6a127', 'Pole 56', 6.83210538, 2.52779721),
    buildPole('5e0efc42c6eb2f27e0f6a128', 'Pole 57', 6.8311482, 2.52765027),
    buildPole('5e0efc42c6eb2f27e0f6a129', 'Pole 58', 6.83100024, 2.52722261),
    buildPole('5e0efc42c6eb2f27e0f6a12a', 'Pole 59', 6.83170829, 2.52661319),
    buildPole('5e0efc42c6eb2f27e0f6a12b', 'Pole 60', 6.83183485, 2.52699073),
    buildPole('5e0efc42c6eb2f27e0f6a12c', 'Pole 61', 6.8319615, 2.52736819),
    buildPole('5e0efc42c6eb2f27e0f6a12d', 'Pole 62', 6.83225009, 2.52823646),
    buildPole('5e0efc42c6eb2f27e0f6a12e', 'Pole 63', 6.83239453, 2.52867481),
    buildPole('5e0efc42c6eb2f27e0f6a12f', 'Pole 64', 6.83253896, 2.52911324),
    buildPole('5e0efc42c6eb2f27e0f6a130', 'Pole 65', 6.83268429, 2.52953249),
    buildPole('5e0efc42c6eb2f27e0f6a131', 'Pole 66', 6.83282952, 2.52995174),
    buildPole('5e0efc42c6eb2f27e0f6a132', 'Pole 67', 6.83297375, 2.53037135),
    buildPole('5e0efc42c6eb2f27e0f6a133', 'Pole 68', 6.833117, 2.53079142),
    buildPole('5e0efc42c6eb2f27e0f6a134', 'Pole 69', 6.83324336, 2.5311629),
    buildPole('5e0efc42c6eb2f27e0f6a135', 'Pole 70', 6.83336973, 2.53153429),
    buildPole('5e0efc42c6eb2f27e0f6a136', 'Pole 71', 6.83349701, 2.5319055),
    buildPole('5e0efc42c6eb2f27e0f6a137', 'Pole 72', 6.83363906, 2.53232014),
    buildPole('5e0efc42c6eb2f27e0f6a138', 'Pole 73', 6.83218367, 2.52923233),
    buildPole('5e0efc42c6eb2f27e0f6a139', 'Pole 74', 6.83175478, 2.5293761),
    buildPole('5e0efc42c6eb2f27e0f6a13a', 'Pole 75', 6.83232828, 2.52966108),
    buildPole('5e0efc42c6eb2f27e0f6a13b', 'Pole 76', 6.83247298, 2.53008983),
    buildPole('5e0efc42c6eb2f27e0f6a13c', 'Pole 77', 6.82368601, 2.5309285),
    buildPole('5e0efc42c6eb2f27e0f6a13d', 'Pole 78', 6.83225493, 2.53106549),
    buildPole('5e0efc42c6eb2f27e0f6a13e', 'Pole 79', 6.83189322, 2.53118802),
    buildPole('5e0efc42c6eb2f27e0f6a13f', 'Pole 80', 6.83153151, 2.53131064),
    buildPole('5e0efc42c6eb2f27e0f6a140', 'Pole 81', 6.83111102, 2.53144834),
    buildPole('5e0efc42c6eb2f27e0f6a141', 'Pole 82', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a142', 'Pole 83', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a143', 'Pole 84', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a144', 'Pole 85', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a145', 'Pole 86', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a146', 'Pole 87', 6.83162179, 2.53158912),
    buildPole('5e0efc42c6eb2f27e0f6a147', 'Pole 88', 6.83171216, 2.5318676),
    buildPole('5e0efc42c6eb2f27e0f6a148', 'Pole 89', 6.83128081, 2.53200368),
    buildPole('5e0efc42c6eb2f27e0f6a149', 'Pole 90', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14a', 'Pole 91', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14b', 'Pole 92', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14c', 'Pole 93', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14d', 'Pole 94', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14e', 'Pole 95', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a14f', 'Pole 96', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a150', 'Pole 97', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a151', 'Pole 98', undefined),
    buildPole('5e0efc42c6eb2f27e0f6a152', 'Pole 99', undefined)
  ];
}

function buildPole(id, code, lat = undefined, lng = undefined) {
  const geo =
    lat == undefined || lng == undefined
      ? undefined
      : buildFeaturesCollection(lat, lng);

  const result = {
    _id: new mongoose.Types.ObjectId(id),
    ...creatorFragment,
    enabled: true,
    code: code,
    geo: geo
  };

  return result;
}
