const mongoose = require('mongoose');

const mongooseGeoJsonSchema = require('mongoose-geojson-schema');

const mongooseMixins = require('../../api/middleware/mongoose-mixins');

const Plant = require('../../app/winch/api/models/plant');

const Village = require('../../app/winch/api/models/village');

const {
  buildSystemCreator,
  buildFeaturesCollection,
  PlantIdGenerator
} = require('../winch-boot/utils')


module.exports.buildPlants = () => {
  const entityName = 'plant';

  return new Promise((resolve, reject) => {
    const plantIdGenerator = new PlantIdGenerator();
    const plantBuilders = getPlantBuilders();

    Village.find({}).select({ name: 1 }).exec()
      .then(findResult => {
        let plantsByVillage;

        findResult.forEach((village, indexVillage) => {
          const lastVillageIteration = (indexVillage === findResult.length - 1);

          if (!plantBuilders[village.name]) {
            if (lastVillageIteration) {
              resolve();
            }
            return;
          }

          plantsByVillage = plantBuilders[village.name](village._id);

          plantsByVillage.forEach((plant, indexPlant) => {
            plantIdGenerator.apply(plant)
            Plant.create(plant)
              .then(createResult => {
                console.log(`'${plant.name}@${village.name}' ${entityName} creation succeeded with id: ${createResult._id}`);
              })
              .catch(createError => {
                if (createError.name === 'MongoError' && createError.code === 11000) {
                  console.log(`'${plant.name}@${village.name}' ${entityName} creation already done`);
                } else {
                  console.error(`'${plant.name}@${village.name}' ${entityName} creation error: ${createError}`);
                }
              })
              .finally(() => {
                if (lastVillageIteration && indexPlant === (plantsByVillage.length - 1)) {
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


function getPlantBuilders () {
  const systemCreator = buildSystemCreator();

  return {
    // -> Angola
    'Luena': (villageId) => {
      return [
        buildPlant(systemCreator, 'School Luena', 'Angola Total CSR', 'ANG_2019_006', 'ANG', -11.715636, 19.910525, villageId, undefined, undefined, 72.00, 296.00, 80.50, buildOrganization(), 0)
      ];
    },
    'Luanda': (villageId) => {
      return [
        buildPlant(systemCreator, 'School Mulemba - Luanda', 'Angola Total CSR', 'ANG_2019_006', 'ANG', -8.880833, 13.319167, villageId, undefined, undefined, 36.00, 296.00, 0.00, buildOrganization(), 0)
      ];
    },
    // -> Benin
    'Adido Bonou': (villageId) => {
      return [
        buildPlant(systemCreator, 'Adido', 'Benin DBO 100 Villages', 'BEN_2019_005', 'BEN', 6.830128, 2.528068, villageId, undefined, new Date('2019-09-06'), 31.20, 148.32, 0.00, buildOrganization(), 62, 0, 1)
      ];
    },
    // -> Mauritania
    'Nimjat': (villageId) => {
      return [
        buildPlant(systemCreator, 'Nimjat RPU001', 'Mauritania DBO', 'MAU_2019_008', 'MAU', 17.404711, -15.691929, villageId, undefined, undefined, 16.74, 74.16, 0.00, buildOrganization(), 19),
        buildPlant(systemCreator, 'Nimjat RPU002', 'Mauritania DBO', 'MAU_2019_008', 'MAU', 17.406925, -15.691758, villageId, undefined, undefined, 30.24, 148.32, 0.00, buildOrganization(), 72)
      ];
    },
    // -> São Tomé e Príncipe
    'Caixão Grande': (villageId) => {
      return [
        buildPlant(systemCreator, 'Orphanage Caixão Grande', 'São Tomé Total CSR', 'SAO_2019_007', 'SAO', 0.295247, 6.700283, villageId, undefined, undefined, 51.75, 222.43, 0.00, buildOrganization(), 0)
      ];
    },
    // -> Sierra Leone
    // -> Sierra Leone / WP1
    'Bafodia': (villageId) => {
      return [
        buildPlant(systemCreator, 'Bafodia', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.684119, -11.731742, villageId, new Date('2019-05-31'), new Date('2020-05-02'), 36.54, 155.52, 0.00, buildOrganization(buildOrganizationBasicInfo('Kabala Road', buildCustomerContacts(['+232075057055', '+232033570611']))), 168, 1, 1, 20)
      ];
    },
    'Batkanu': (villageId) => {
      return [
        buildPlant(systemCreator, 'Batkanu', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.073461, -12.41555, villageId, new Date('2019-05-31'), new Date('2019-11-20'), 16.38, 77.76, 0.00, buildOrganization(buildOrganizationBasicInfo('Batkanu Road', buildCustomerContacts(['+232075057055', '+232033570611']))), 80, 1, 3, 20)
      ];
    },
    'Fintonia': (villageId) => {
      return [
        buildPlant(systemCreator, 'Fintonia', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.672972, -12.225753, villageId, new Date('2019-05-31'), new Date('2019-12-17'), 26.46, 155.52, 0.00, buildOrganization(buildOrganizationBasicInfo('Hospital Road', buildCustomerContacts(['+232075057055', '+232033570611']))), 83, 1, 0, 20)
      ];
    },
    'Kagbere': (villageId) => {
      return [
        buildPlant(systemCreator, 'Kagbere', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.220358, -12.140444, villageId, new Date('2019-05-31'), new Date('2019-12-06'), 16.38, 77.76, 0.00, buildOrganization(buildOrganizationBasicInfo('Kagbere Road', buildCustomerContacts(['+232075057055', '+232033570611']))), 53, 1, 3, 20)
      ];
    },
    'Kamaranka': (villageId) => {
      return [
        buildPlant(systemCreator, 'Kamaranka', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.297661, -12.206139, villageId, new Date('2019-05-31'), new Date('2019-11-29'), 16.38, 77.76, 0.00, buildOrganization(buildOrganizationBasicInfo('Fullah Town Road', buildCustomerContacts(['+232075057055', '+232033570611']))), 83, 1, 3, 20)
      ];
    },
    'Kathantha Yimboi': (villageId) => {
      return [
        buildPlant(systemCreator, 'Kathantha Yimboi', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.545878, -12.170625, villageId, new Date('2019-05-31'), new Date('2019-12-23'), 16.38, 77.76, 0.00, buildOrganization(buildOrganizationBasicInfo('', buildCustomerContacts(['+232075057055', '+232033570611']))), 62, 1, 0, 20)
      ];
    },
    'Mabang': (villageId) => {
      return [
        buildPlant(systemCreator, 'Mabang', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 8.567592, -12.173, villageId, new Date('2019-05-31'), new Date('2019-10-09'), 16.38, 77.76, 0.00, buildOrganization(buildOrganizationBasicInfo('Mabang Road', buildCustomerContacts(['+232075057055', '+232033570611']))), 43, 1, 0, 0)
      ];
    },
    'Mara': (villageId) => {
      return [
        buildPlant(systemCreator, 'Mara', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 8.662931, -12.245683, villageId, new Date('2019-05-31'), new Date('2019-09-30'), 26.46, 155.52, 0.00, buildOrganization(buildOrganizationBasicInfo('Mara Town', buildCustomerContacts(['+232075057055', '+232033570611']))), 108, 1, 3, 10)
      ];
    },
    'Musaia': (villageId) => {
      return [
        buildPlant(systemCreator, 'Musaia', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.755061, -11.570375, villageId, new Date('2019-05-31'), new Date('2020-02-28'), 26.46, 155.52, 0.00, buildOrganization(buildOrganizationBasicInfo('', buildCustomerContacts(['+232075057055', '+232033570611']))), 121, 1, 2, 20)
      ];
    },
    'Rokonta': (villageId) => {
      return [
        buildPlant(systemCreator, 'Rokonta', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 8.746544, -12.049283, villageId, new Date('2019-05-31'), new Date('2019-09-16'), 16.38, 77.76, 0.00, buildOrganization(buildOrganizationBasicInfo('Middle of Rokonta', buildCustomerContacts(['+232075057055', '+232033570611']))), 87, 1, 1, 23)
      ];
    },
    'Sinkunia': (villageId) => {
      return [
        buildPlant(systemCreator, 'Sinkunia', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.860631, -11.430731, villageId, new Date('2019-05-31'), new Date('2020-02-14'), 36.54, 155.52, 0.00, buildOrganization(buildOrganizationBasicInfo('Bindi Falaba Road', buildCustomerContacts(['+232075057055', '+232033570611']))), 174, 1, 0, 20)
      ];
    },
    'Yiffin': (villageId) => {
      return [
        buildPlant(systemCreator, 'Yiffin', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.123019, -11.269533, villageId, new Date('2019-05-31'), new Date('2020-06-24'), 36.54, 155.52, 0.00, buildOrganization(buildOrganizationBasicInfo('Central Town', buildCustomerContacts(['+232075057055', '+232033570611']))), 204, 1, 1, 20)
      ];
    },
    // -> Sierra Leone / WP2
    'Alikalia': (villageId) => {
      return [
        buildPlant(systemCreator, 'Alikalia', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.151992, -11.388275, villageId, undefined, undefined, 111.78, 384.0, 0.00, buildOrganization(), 0, 0, 0, 331)
      ];
    },
    'Bendugu Mongo': (villageId) => {
      return [
        buildPlant(systemCreator, 'Bendugu Mongo', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.535237, -10.957753, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 179)
      ];
    },
    'Bindi': (villageId) => {
      return [
        buildPlant(systemCreator, 'Bindi', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.915203, -11.447152, villageId, undefined, undefined, 111.78, 384.0, 0.00, buildOrganization(), 0, 0, 0, 393)
      ];
    },
    'Dogoloya': (villageId) => {
      return [
        buildPlant(systemCreator, 'Dogoloya', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.708182, -11.55197, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 174)
      ];
    },
    'Falaba': (villageId) => {
      return [
        buildPlant(systemCreator, 'Falaba', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.854305, -11.320968, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 218)
      ];
    },
    'Firawa': (villageId) => {
      return [
        buildPlant(systemCreator, 'Firawa', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.358892, -11.30088, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 226)
      ];
    },
    'Gbendembu': (villageId) => {
      return [
        buildPlant(systemCreator, 'Gbendembu', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.108262, -12.20772, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 220)
      ];
    },
    'Kondembaia': (villageId) => {
      return [
        buildPlant(systemCreator, 'Kondembaia', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.382413, -11.567958, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 179)
      ];
    },
    'Masumbri': (villageId) => {
      return [
        buildPlant(systemCreator, 'Masumbri', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 8.822325, -11.754525, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 199)
      ];
    },
    'Mathoir': (villageId) => {
      return [
        buildPlant(systemCreator, 'Mathoir', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 8.484747, -12.417392, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 210)
      ];
    },
    'Sambia Bendugu': (villageId) => {
      return [
        buildPlant(systemCreator, 'Sambia Bendugu', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.062537, -11.488232, villageId, undefined, undefined, 111.78, 384.0, 0.00, buildOrganization(), 0, 0, 0, 358)
      ];
    },
    'Seria': (villageId) => {
      return [
        buildPlant(systemCreator, 'Seria', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.46446, -10.923058, villageId, undefined, undefined, 55.89, 192.0, 0.00, buildOrganization(), 0, 0, 0, 193)
      ];
    },
    // -> Togo
    'Koglo Kope': (villageId) => {
      return [
        buildPlant(systemCreator, 'Koglo Kope', 'Togo Benoo Pilot', 'TOG_2019_006', 'TOG', 6.935627, 1.208748, villageId, undefined, undefined, 30.72, 148.32, 0.00, buildOrganization(), 0)
      ];
    },
    // -> Uganda
    // -> Uganda / Bunjako
    'Bugoma': (villageId) => {
      return [
        buildPlant(systemCreator, 'Bugoma', 'Uganda Bunjako Island', 'UGA_2019_003', 'Bunjako', -0.04757, 32.148877, villageId, undefined, undefined, 38.40, 148.32, 0.00, buildOrganization(), 0, 0, 0, 70)
      ];
    },
    'Bukina': (villageId) => {
      return [
        buildPlant(systemCreator, 'Bukina', 'Uganda Bunjako Island', 'UGA_2019_003', 'Bunjako', -0.044698, 32.20927, villageId, undefined, undefined, 9.60, 38.40, 0.00, buildOrganization(), 0, 0, 0, 0)
      ];
    },
    'Ssenyondo': (villageId) => {
      return [
        buildPlant(systemCreator, 'Ssenyondo', 'Uganda Bunjako Island', 'UGA_2019_003', 'Bunjako', -0.06675, 32.191303, villageId, undefined, undefined, 75.84, 296.64, 0.00, buildOrganization(), 0, 0, 0, 200),
        buildPlant(systemCreator, 'Hub', '-', '-', '-', -0.068013, 32.186464, villageId, undefined, undefined, 7.68, 37.54, 7.00, buildOrganization(), 0, 0, 0, 0)
      ];
    },
    // -> Uganda / GIZ25
    'Agoro': (villageId) => {
      return [
        buildPlant(systemCreator, 'Agoro (incl. Tumanum B)', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.797533, 33.016575, villageId, undefined, undefined, 77.76, 288.00, 0.00, buildOrganization(), 0, 0, 0, 235)
      ];
    },
    'Apwoyo TC ': (villageId) => {
      return [
        buildPlant(systemCreator, 'Apwoyo TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.759322, 32.999982, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 46)
      ];
    },
    'Apyetta TC': (villageId) => {
      return [
        buildPlant(systemCreator, 'Apyetta TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.37173, 32.4165, villageId, undefined, undefined, 77.76, 288.00, 0.00, buildOrganization(), 0, 0, 0, 189)
      ];
    },
    'Apyetta West': (villageId) => {
      return [
        buildPlant(systemCreator, 'Apyetta West', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.3062, 32.37103, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 79)
      ];
    },
    'Aweno Olwi': (villageId) => {
      return [
        buildPlant(systemCreator, 'Aweno Olwi', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.719, 32.7478, villageId, undefined, undefined, 19.44, 72.00, 0.00, buildOrganization(), 0, 0, 0, 55)
      ];
    },
    'Ayuu Alali': (villageId) => {
      return [
        buildPlant(systemCreator, 'Ayuu Alali', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.53991, 32.56081, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 102)
      ];
    },
    'Kapeta': (villageId) => {
      return [
        buildPlant(systemCreator, 'Kapeta', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.504054, 32.591669, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 73)
      ];
    },
    'Labayango': (villageId) => {
      return [
        buildPlant(systemCreator, 'Labayango (School and Village)', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.520616, 32.865017, villageId, undefined, undefined, 19.44, 72.00, 0.00, buildOrganization(), 0, 0, 0, 44)
      ];
    },
    'Lapidiyenyi': (villageId) => {
      return [
        buildPlant(systemCreator, 'Lapidiyenyi', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.581635, 32.931536, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 199)
      ];
    },
    'Lelapwot West': (villageId) => {
      return [
        buildPlant(systemCreator, 'Lelapwot West', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.6269, 32.708736, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 53)
      ];
    },
    'Logwak': (villageId) => {
      return [
        buildPlant(systemCreator, 'Logwak', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.657853, 32.740582, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 79)
      ];
    },
    'Loromibeng': (villageId) => {
      return [
        buildPlant(systemCreator, 'Loromibeng A + B', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.758299, 33.039266, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 43)
      ];
    },
    'Moroto East': (villageId) => {
      return [
        buildPlant(systemCreator, 'Moroto East', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.693575, 32.930281, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 44)
      ];
    },
    'Muddu Central': (villageId) => {
      return [
        buildPlant(systemCreator, 'Muddu Central', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.497164, 32.452439, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 47)
      ];
    },
    'Ngomoromo': (villageId) => {
      return [
        buildPlant(systemCreator, 'Ngomoromo', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.687719, 32.58713, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 97)
      ];
    },
    'Oboko TC': (villageId) => {
      return [
        buildPlant(systemCreator, 'Oboko TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.670277, 32.984139, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 48)
      ];
    },
    'Ogili TC': (villageId) => {
      return [
        buildPlant(systemCreator, 'Ogili TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.409353, 32.496177, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 131)
      ];
    },
    'Opoki': (villageId) => {
      return [
        buildPlant(systemCreator, 'Opoki', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.429328, 32.716621, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 54)
      ];
    },
    'Otaa': (villageId) => {
      return [
        buildPlant(systemCreator, 'Otaa', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.486728, 32.478779, villageId, undefined, undefined, 19.44, 72.00, 0.00, buildOrganization(), 0, 0, 0, 45)
      ];
    },
    'Paloga Central': (villageId) => {
      return [
        buildPlant(systemCreator, 'Paloga Central', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.58893, 32.94357, villageId, undefined, undefined, 77.76, 288.00, 0.00, buildOrganization(), 0, 0, 0, 219)
      ];
    },
    'Pangira / Licwar Central': (villageId) => {
      return [
        buildPlant(systemCreator, 'Pangira / Licwar Central', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.614721, 32.651851, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 123)
      ];
    },
    'Pany Buk East and West ': (villageId) => {
      return [
        buildPlant(systemCreator, 'Pany Buk East and West', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.670064, 32.954506, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 48)
      ];
    },
    'Pawena TC': (villageId) => {
      return [
        buildPlant(systemCreator, 'Pawena TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.283056, 32.67194, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 100)
      ];
    },
    'Potika ': (villageId) => {
      return [
        buildPlant(systemCreator, 'Potika', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.719951, 32.881144, villageId, undefined, undefined, 38.88, 144.00, 0.00, buildOrganization(), 0, 0, 0, 114)
      ];
    },
    'Ywaya': (villageId) => {
      return [
        buildPlant(systemCreator, 'Ywaya', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.694761, 33.080893, villageId, undefined, undefined, 19.44, 72.00, 0.00, buildOrganization(), 0, 0, 0, 35)
      ];
    },
  }
}


function buildPlant (systemCreator, name, prjDesc, prjCode, prjId, lat, lng, villageId, cDate, bDate, pvCpty, bCpty, gCpty, organization, totCust, subTotChc = 0, subTotSchool = 0, totWait = 0) {
  const result = {
    _id: '<dummy_id>', // this preserves field position
    ...systemCreator,
    enabled: true,
    name: name,
    project: {
      id: prjId,
      code: prjCode,
      desc: prjDesc
    },
    geo: buildFeaturesCollection(lat, lng),
    village: villageId,
    dates: {
      commit: cDate,
      business: bDate
    },
    setup: {
      pv: {
        cpty: parseFloat(pvCpty)
      },
      batt: {
        cpty: parseFloat(bCpty)
      },
      genset: {
        cpty: parseFloat(gCpty)
      }
    },
    tariffs: [],
    'add-ons': [],
    stats: {
      'total-active-customers': parseInt(totCust),
      'total-connected-customers': parseInt(totCust),
      'chc-count': parseInt(subTotChc),
      'school-count': parseInt(subTotSchool),
      'total-waiting-customers': parseInt(totWait)
    },
    organization: organization
  };
  return result;
}


function buildOrganization (basicInfo = buildOrganizationBasicInfo()) {
  return {
    ...basicInfo,
    representatives: [],
    'om-managers': [],
    agents: []
  }
}

function buildOrganizationBasicInfo (fullAddress = '', customerContacts = []) {
  return {
    office: {
      fullAddress: fullAddress,
    },
    'customer-contacts': customerContacts,
  }
}

function buildCustomerContacts (phoneNoList = []) {
  const result = phoneNoList.map((phoneNo) => {
    return {
      'type': 'PHN',
      address: phoneNo,
    }
  });

  return result;
}

