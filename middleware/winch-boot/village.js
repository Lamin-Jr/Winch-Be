const mongoose = require('mongoose');

const mongooseMixins = require('../../api/middleware/mongoose-mixins');
// const { defaultUpdateOptions } = require('../../api/middleware/mongoose-util');

const Village = require('../../app/winch/api/models/village');

const { buildFeaturesCollection } = require('../winch-boot/utils');


const creator = new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID);
const creatorRole = process.env.WCH_AUTHZ_SYSTEM_ROLE;

module.exports.buildVillages = () => {
  const entityName = 'village';

  return new Promise((resolve, reject) => {
    const villages = getVillages();

    villages.forEach((village, index) => {
      Village.create(village)
        .then(createResult => {
          console.info(`'${createResult.name}' ${entityName} creation succeeded with id: ${createResult._id}`);
        })
        .catch(createError => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            console.info(`'${village.name}' ${entityName} creation already done`);
          } else {
            console.error(`'${village.name}' ${entityName} creation error: ${createError}`);
          }
        })
        .finally(() => {
          if (index === (villages.length - 1)) {
            resolve();
          }
        });
      // const filter = {
      //   name: village['name'],
      // };
      // const update = {
      //   $set: {
      //     // ...mongooseMixins.makeLastUpdaterCompact(
      //     //   new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID),
      //     //   process.env.WCH_AUTHZ_SYSTEM_ROLE
      //     // ),          
      //     enabled: village['enabled'],
      //     geo: village['geo'],
      //     country: village['country'],
      //   }
      // };
      // Village.findOneAndUpdate(filter, update, defaultUpdateOptions)
      //   .then(updateResult => {
      //     if (updateResult) {
      //       console.info(`${entityName} update succeeded with id: ${updateResult._id}`);
      //     } else {
      //       Village.create(village)
      //         .then(createResult => {
      //           console.info(`${entityName} creation succeeded with id: ${createResult._id}`);
      //         })
      //         .catch(createError => {
      //           console.error(`'${village['_id']}' ${entityName} creation error: ${createError}`);
      //         });
      //     }
      //   })
      //   .catch(readError => {
      //     console.error(`'${village['_id']}' ${entityName} reading error: ${readError}`);
      //   })
      //   .finally(() => {
      //     if (index === villages.length - 1) {
      //       resolve();
      //     }
      //   });
    });
  });
}


function getVillages() {
  const villages = [
    // -> Angola
    // - corrected: buildVillage('School Luena', -11.715636, 19.910525, 'AO'),
    buildVillage('Luena', -11.715636, 19.910525, 'AO'),
    // - corrected: buildVillage('School Mulemba - Luanda', -8.880833, 13.319167, 'AO'),
    buildVillage('Luanda', -8.880833, 13.319167, 'AO'),
    // -> Benin
    // - corrected: buildVillage('Adido', 6.830128, 2.528068, 'BJ'),
    buildVillage('Adido Bonou', 6.9083946, 2.4511809, 'BJ'),
    // -> Mauritania
    // - corrected: buildVillage('Nimjat RPU001', 17.404711, -15.691929, 'MR'),
    // - corrected: buildVillage('Nimjat RPU002', 17.406925, -15.691758, 'MR'),
    buildVillage('Nimjat', 17.5369021, -15.9829403, 'MR'),
    // -> São Tomé e Príncipe
    // - corrected buildVillage('Orphanage Caixao Grande', 0.295247, 6.700283, 'ST'),
    buildVillage('Caixão Grande', 0.295247, 6.700283, 'ST'),
    // -> Sierra Leone
    buildVillage('Alikalia', 9.151992, -11.388275, 'SL'),
    buildVillage('Bafodia', 9.684119, -11.731742, 'SL'),
    buildVillage('Batkanu', 9.073461, -12.41555, 'SL'),
    buildVillage('Bendugu Mongo', 9.535237, -10.957753, 'SL'),
    buildVillage('Bindi', 9.915203, -11.447152, 'SL'),
    buildVillage('Dogoloya', 9.708182, -11.55197, 'SL'),
    buildVillage('Falaba', 9.854305, -11.320968, 'SL'),
    buildVillage('Fintonia', 9.672972, -12.225753, 'SL'),
    buildVillage('Firawa', 9.358892, -11.30088, 'SL'),
    buildVillage('Gbendembu', 9.108262, -12.20772, 'SL'),
    buildVillage('Kagbere', 9.220358, -12.140444, 'SL'),
    buildVillage('Kamaranka', 9.297661, -12.206139, 'SL'),
    buildVillage('Kathantha Yimboi', 9.545878, -12.170625, 'SL'),
    buildVillage('Kondembaia', 9.382413, -11.567958, 'SL'),
    buildVillage('Mabang', 8.567592, -12.173, 'SL'),
    buildVillage('Mara', 8.662931, -12.245683, 'SL'),
    buildVillage('Masumbri', 8.822325, -11.754525, 'SL'),
    buildVillage('Mathoir', 8.484747, -12.417392, 'SL'),
    buildVillage('Musaia', 9.755061, -11.570375, 'SL'),
    buildVillage('Rokonta', 8.746544, -12.049283, 'SL'),
    buildVillage('Sambia Bendugu', 9.062537, -11.488232, 'SL'),
    buildVillage('Seria', 9.46446, -10.923058, 'SL'),
    buildVillage('Sinkunia', 9.860631, -11.430731, 'SL'),
    buildVillage('Yiffin', 9.123019, -11.269533, 'SL'),
    // -> Togo
    buildVillage('Koglo Kope', 6.935627, 1.208748, 'TO'),
    // -> Uganda
    // -corrected buildVillage('Agoro (incl. Tumanum B)', 3.797533, 33.016575, 'UG'),
    buildVillage('Agoro', 3.797533, 33.016575, 'UG'),
    buildVillage('Apwoyo TC ', 3.759322, 32.999982, 'UG'),
    buildVillage('Apyetta TC', 3.37173, 32.4165, 'UG'),
    buildVillage('Apyetta West', 3.3062, 32.37103, 'UG'),
    buildVillage('Aweno Olwi', 3.719, 32.7478, 'UG'),
    buildVillage('Ayuu Alali', 3.53991, 32.56081, 'UG'),
    buildVillage('Bugoma', -0.056834, 32.140917, 'UG'),
    buildVillage('Burkina', -0.048274, 32.211167, 'UG'),
    buildVillage('Kapeta', 3.504054, 32.591669, 'UG'),
    // - corrected buildVillage('Labayango (School and Village)', 3.520616, 32.865017, 'UG'),
    buildVillage('Labayango', 3.520616, 32.865017, 'UG'),
    buildVillage('Lapidiyenyi', 3.581635, 32.931536, 'UG'),
    buildVillage('Lelapwot West', 3.6269, 32.708736, 'UG'),
    buildVillage('Logwak', 3.657853, 32.740582, 'UG'),
    // - corrected buildVillage('Loromibeng A + B', 3.758299, 33.039266, 'UG'),
    buildVillage('Loromibeng', 3.758299, 33.039266, 'UG'),
    buildVillage('Moroto East', 3.693575, 32.930281, 'UG'),
    buildVillage('Muddu Central', 3.497164, 32.452439, 'UG'),
    buildVillage('Ngomoromo', 3.687719, 32.58713, 'UG'),
    buildVillage('Oboko TC', 3.670277, 32.984139, 'UG'),
    buildVillage('Ogili TC', 3.409353, 32.496177, 'UG'),
    buildVillage('Opoki', 3.429328, 32.716621, 'UG'),
    buildVillage('Otaa', 3.486728, 32.478779, 'UG'),
    buildVillage('Paloga Central', 3.58893, 32.94357, 'UG'),
    buildVillage('Pangira / Licwar Central', 3.614721, 32.651851, 'UG'),
    buildVillage('Pany Buk East and West ', 3.670064, 32.954506, 'UG'),
    buildVillage('Pawena TC', 3.283056, 32.67194, 'UG'),
    buildVillage('Potika ', 3.719951, 32.881144, 'UG'),
    buildVillage('Ssenyondo', -0.068013, 32.186464, 'UG'),
    buildVillage('Ywaya', 3.694761, 33.080893, 'UG'),
  ];

  return villages;
}


function buildVillage(name, lat, lng, country) {
  const result = {
    _id: new mongoose.Types.ObjectId(),
    ...mongooseMixins.makeCreator(creator, creatorRole),
    enabled: true,
    name: name,
    geo: buildFeaturesCollection(lat, lng),
    country: country
  };

  return result;
}