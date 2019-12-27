const mongoose = require('mongoose');
const mongooseGeoJsonSchema = require('mongoose-geojson-schema');
const mongooseMixins = require('../api/middleware/mongoose-mixins')
const Country = require('../app/winch/api/models/country');
const Village = require('../app/winch/api/models/village');
const Plant = require('../app/winch/api/models/plant');
const PlantStatus = require('../app/winch/api/models/plant-status');
const PlantPerformaceRatio = require('../app/winch/api/models/plant-pr')
const PlantElectricityAvailableForSale = require('../app/winch/api/models/plant-eafs')
const PlantGenerationLog = require('../app/winch/api/models/plant-generation-log')

const { PlantIdGenerator } = require('./winch-boot/utils')
const { buildPlantParts } = require('./winch-boot/plant-part')

const creator = new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID);
const creatorRole = process.env.WCH_AUTHZ_SYSTEM_ROLE;

function buildFeaturesCollection(lat, lng) {
  const result = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      }
    ]
  };
  return result;
}

function buildCountry(defaultName, alpha2, alpha3, numericCode) {
  const result = {
    _id: alpha2,
    'default-name': defaultName,
    'aplha-3-code': alpha3,
    'numeric-code': numericCode
  };

  return result;
}

function getCountries() {
  const countries = [
    buildCountry('Italy', 'IT', 'ITA', 380),
    buildCountry('Angola', 'AO', 'AGO', 024),
    buildCountry('Benin', 'BJ', 'BEN', 204),
    buildCountry('Mauritania', 'MR', 'MRT', 478),
    buildCountry('São Tomé and Príncipe', 'ST', 'STP', 678),
    buildCountry('Sierra Leone', 'SL', 'SLE', 694),
    buildCountry('Togo', 'TO', 'TGO', 768),
    buildCountry('Uganda', 'UG', 'UGA', 800)
  ];

  return countries;
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

function getVillages() {
  const villages = [
    // -> startup test
    // buildVillage('Adido Bonou', 6.9083946, 2.4511809, 'BJ'),
    // buildVillage('Rokonta', 8.746048341, -12.048280551, 'SL'),
    // buildVillage('Mara', 8.663703, -12.244886, 'SL'),
    // buildVillage('Mabang', 8.3488265, -12.8547926, 'SL'),
    // buildVillage('Nimjat', 17.5369021, -15.9829403, 'MR'),
    // buildVillage('Bunjako Island', 0.0027993, 32.1256682, 'UG'),
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

function buildPlant(name, prjDesc, prjCode, prjId, lat, lng, villageId, cDate, bDate, pvCpty, bCpty, gCpty, totCust, subTotChc = 0, subTotSchool = 0, totWait = 0) {
  const result = {
    _id: '<dummy_id>', // do this to preserve field position
    ...mongooseMixins.makeCreator(creator, creatorRole),
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
      'chc-count': parseInt(subTotChc),
      'school-count': parseInt(subTotSchool),
      'total-waiting-customers': parseInt(totWait)
    },
    organization: {
      office: {
        fullAddress: ''
      },
      representatives: [],
      'om-managers': [],
      agents: []
    }
  };
  return result;
}

function getPlantBuilders() {
  return {
    // -> startup test
    // 'Adido Bonou': (villageId) => { return [ buildPlant('Adido Bonou', 6.83011, 2.528081, villageId, undefined, undefined, 31.2, 148.0, 0.0, 62) ]; },
    // 'Rokonta': (villageId) => { return [ buildPlant('Rokonta', 8.746343, -12.04933, villageId._id, 16.38, 77.76, 0.0, 86) ]; },
    // 'Mara': (villageId) => { return [ buildPlant('Mara', 8.663117, -12.24571, villageId, undefined, undefined, 26.46, 155.52, 0.0, 107) ]; },
    // 'Mabang': (villageId) => { return [ buildPlant('Mabang', 8.5675917, -12.173, villageId, undefined, undefined, 16.38, 77.76, 0.0, 42) ]; },
    // 'Nimjat': (villageId) => { return [ buildPlant('Nimjat', 17.40674, -15.69189, villageId, undefined, undefined, 47.0,  118.0, 0.0, 100) ]; },
    // 'Bunjako Island': (villageId) => { return [ buildPlant('Bunjako Island', -0.067826, 32.1864, villageId, undefined, undefined, 3.84,  18.77, 7.0, 0) ]; },
    // -> Angola
    'Luena': (villageId) => { return [ buildPlant('School Luena', 'Angola Total CSR', 'ANG_2019_006', 'ANG', -11.715636, 19.910525, villageId, undefined, undefined, 72.00, 296.00, 80.50, 0) ]; },
    'Luanda': (villageId) => { return [ buildPlant('School Mulemba - Luanda', 'Angola Total CSR', 'ANG_2019_006', 'ANG', -8.880833, 13.319167, villageId, undefined, undefined, 36.00, 296.00, 0.00, 0) ]; },
    // -> Benin
    'Adido Bonou': (villageId) => { return [ buildPlant('Adido', 'Benin DBO 100 Villages', 'BEN_2019_005', 'BEN', 6.830128, 2.528068, villageId, undefined, new Date('2019-09-06'), 31.20, 148.32, 0.00, 62) ]; },
    // -> Mauritania
    'Nimjat': (villageId) => {
      return [ 
        buildPlant('Nimjat RPU001', 'Mauritania DBO', 'MAU_2019_008', 'MAU', 17.404711, -15.691929, villageId, undefined, undefined, 16.74, 74.16, 0.00, 19),
        buildPlant('Nimjat RPU002', 'Mauritania DBO', 'MAU_2019_008', 'MAU', 17.406925, -15.691758, villageId, undefined, undefined, 30.24, 148.32, 0.00, 71)
      ];
    },
    // -> São Tomé e Príncipe
    'Caixão Grande': (villageId) => { return [ buildPlant('Orphanage Caixão Grande', 'São Tomé Total CSR', 'SAO_2019_007', 'SAO', 0.295247, 6.700283, villageId, undefined, undefined, 51.75, 222.43, 0.00, 0) ]; },
    // -> Sierra Leone
    'Alikalia': (villageId) => { return [ buildPlant('Alikalia', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.151992, -11.388275, villageId, undefined, undefined, 103.50, 444.86, 0.00, 394) ]; },
    'Bafodia': (villageId) => { return [ buildPlant('Bafodia', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.684119, -11.731742, villageId, new Date('2019-05-31'), undefined, 36.54, 155.52, 0.00, 167) ]; },
    'Batkanu': (villageId) => { return [ buildPlant('Batkanu', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.073461, -12.41555, villageId, new Date('2019-05-31'), new Date('2019-11-20'), 16.38, 77.76, 0.00, 79, 1, 3, 20) ]; },
    'Bendugu Mongo': (villageId) => { return [ buildPlant('Bendugu Mongo', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.535237, -10.957753, villageId, undefined, undefined, 51.75, 222.43, 0.00, 212) ]; },
    'Bindi': (villageId) => { return [ buildPlant('Bindi', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.915203, -11.447152, villageId, undefined, undefined, 103.50, 444.86, 0.00, 468) ]; },
    'Dogoloya': (villageId) => { return [ buildPlant('Dogoloya', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.708182, -11.55197, villageId, undefined, undefined, 51.75, 222.43, 0.00, 208) ]; },
    'Falaba': (villageId) => { return [ buildPlant('Falaba', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.854305, -11.320968, villageId, undefined, undefined, 51.75, 222.43, 0.00, 260) ]; },
    'Fintonia': (villageId) => { return [ buildPlant('Fintonia', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.672972, -12.225753, villageId, new Date('2019-05-31'), undefined, 26.46, 155.52, 0.00, 80) ]; },
    'Firawa': (villageId) => { return [ buildPlant('Firawa', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.358892, -11.30088, villageId, undefined, undefined, 51.75, 222.43, 0.00, 268) ]; },
    'Gbendembu': (villageId) => { return [ buildPlant('Gbendembu', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.108262, -12.20772, villageId, undefined, undefined, 51.75, 222.43, 0.00, 261) ]; },
    'Kagbere': (villageId) => { return [ buildPlant('Kagbere', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.220358, -12.140444, villageId, new Date('2019-05-31'), new Date('2019-12-06'), 16.38, 77.76, 0.00, 52) ]; },
    'Kamaranka': (villageId) => { return [ buildPlant('Kamaranka', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.297661, -12.206139, villageId, new Date('2019-05-31'), new Date('2019-11-29'), 16.38, 77.76, 0.00, 88, 1, 3, 20) ]; },
    'Kathantha Yimboi': (villageId) => { return [ buildPlant('Kathantha Yimboi', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.545878, -12.170625, villageId, new Date('2019-05-31'), undefined, 16.38, 77.76, 0.00, 65) ]; },
    'Kondembaia': (villageId) => { return [ buildPlant('Kondembaia', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.382413, -11.567958, villageId, undefined, undefined, 51.75, 222.43, 0.00, 212) ]; },
    'Mabang': (villageId) => { return [ buildPlant('Mabang', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 8.567592, -12.173, villageId, new Date('2019-05-31'), new Date('2019-10-09'), 16.38, 77.76, 0.00, 43, 1, 0, 0) ]; },
    'Mara': (villageId) => { return [ buildPlant('Mara', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 8.662931, -12.245683, villageId, new Date('2019-05-31'), new Date('2019-09-30'), 26.46, 155.52, 0.00, 108, 1, 3, 10) ]; },
    'Masumbri': (villageId) => { return [ buildPlant('Masumbri', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 8.822325, -11.754525, villageId, undefined, undefined, 51.75, 222.43, 0.00, 236) ]; },
    'Mathoir': (villageId) => { return [ buildPlant('Mathoir', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 8.484747, -12.417392, villageId, undefined, undefined, 51.75, 222.43, 0.00, 250) ]; },
    'Musaia': (villageId) => { return [ buildPlant('Musaia', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.755061, -11.570375, villageId, new Date('2019-05-31'), undefined, 26.46, 155.52, 0.00, 120) ]; },
    'Rokonta': (villageId) => { return [ buildPlant('Rokonta', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 8.746544, -12.049283, villageId, new Date('2019-05-31'), new Date('2019-09-16'), 16.38, 77.76, 0.00, 87, 1, 1, 23) ]; },
    'Sambia Bendugu': (villageId) => { return [ buildPlant('Sambia Bendugu', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.062537, -11.488232, villageId, undefined, undefined, 103.50, 444.86, 0.00, 427) ]; },
    'Seria': (villageId) => { return [ buildPlant('Seria', 'Sierra Leone Unops WP2', 'SLL_2019_002', 'WP2', 9.46446, -10.923058, villageId, undefined, undefined, 51.75, 222.43, 0.00, 230) ]; },
    'Sinkunia': (villageId) => { return [ buildPlant('Sinkunia', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.860631, -11.430731, villageId, new Date('2019-05-31'), undefined, 36.54, 155.52, 0.00, 174) ]; },
    'Yiffin': (villageId) => { return [ buildPlant('Yiffin', 'Sierra Leone Unops WP1', 'SLL_2019_001', 'WP1', 9.123019, -11.269533, villageId, new Date('2019-05-31'), undefined, 36.54, 155.52, 0.00, 204) ]; },
    // -> Togo
    'Koglo Kope': (villageId) => { return [ buildPlant('Koglo Kope', 'Togo Benoo Pilot', 'TOG_2019_006', 'TOG', 6.935627, 1.208748, villageId, undefined, undefined, 30.72, 148.32, 0.00, 0) ]; },
    // -> Uganda
    'Agoro': (villageId) => { return [ buildPlant('Agoro (incl. Tumanum B)', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.797533, 33.016575, villageId, undefined, undefined, 76.80, 288.00, 0.00, 235) ]; },
    'Apwoyo TC ': (villageId) => { return [ buildPlant('Apwoyo TC ', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.759322, 32.999982, villageId, undefined, undefined, 38.40, 144.00, 0.00, 46) ]; },
    'Apyetta TC': (villageId) => { return [ buildPlant('Apyetta TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.37173, 32.4165, villageId, undefined, undefined, 76.80, 288.00, 0.00, 189) ]; },
    'Apyetta West': (villageId) => { return [ buildPlant('Apyetta West', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.3062, 32.37103, villageId, undefined, undefined, 38.40, 144.00, 0.00, 79) ]; },
    'Aweno Olwi': (villageId) => { return [ buildPlant('Aweno Olwi', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.719, 32.7478, villageId, undefined, undefined, 19.20, 72.00, 0.00, 55) ]; },
    'Ayuu Alali': (villageId) => { return [ buildPlant('Ayuu Alali', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.53991, 32.56081, villageId, undefined, undefined, 38.40, 144.00, 0.00, 102) ]; },
    'Bugoma': (villageId) => { return [ buildPlant('Bugoma', 'Uganda Bunjako Island', 'UGA_2019_003', 'Bunjako', -0.056834, 32.140917, villageId, undefined, undefined, 36.48, 148.32, 0.00, 70) ]; },
    'Burkina': (villageId) => { return [ buildPlant('Burkina', 'Uganda Bunjako Island', 'UGA_2019_003', 'Bunjako', -0.048274, 32.211167, villageId, undefined, undefined, 7.68, 37.54, 7.00, 0) ]; },
    'Kapeta': (villageId) => { return [ buildPlant('Kapeta', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.504054, 32.591669, villageId, undefined, undefined, 38.40, 144.00, 0.00, 73) ]; },
    'Labayango': (villageId) => { return [ buildPlant('Labayango (School and Village)', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.520616, 32.865017, villageId, undefined, undefined, 19.20, 72.00, 0.00, 44) ]; },
    'Lapidiyenyi': (villageId) => { return [ buildPlant('Lapidiyenyi', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.581635, 32.931536, villageId, undefined, undefined, 38.40, 144.00, 0.00, 199) ]; },
    'Lelapwot West': (villageId) => { return [ buildPlant('Lelapwot West', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.6269, 32.708736, villageId, undefined, undefined, 38.40, 144.00, 0.00, 53) ]; },
    'Logwak': (villageId) => { return [ buildPlant('Logwak', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.657853, 32.740582, villageId, undefined, undefined, 38.40, 144.00, 0.00, 79) ]; },
    'Loromibeng': (villageId) => { return [ buildPlant('Loromibeng A + B', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.758299, 33.039266, villageId, undefined, undefined, 38.40, 144.00, 0.00, 43) ]; },
    'Moroto East': (villageId) => { return [ buildPlant('Moroto East', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.693575, 32.930281, villageId, undefined, undefined, 38.40, 144.00, 0.00, 44) ]; },
    'Muddu Central': (villageId) => { return [ buildPlant('Muddu Central', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.497164, 32.452439, villageId, undefined, undefined, 38.40, 144.00, 0.00, 47) ]; },
    'Ngomoromo': (villageId) => { return [ buildPlant('Ngomoromo', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.687719, 32.58713, villageId, undefined, undefined, 38.40, 144.00, 0.00, 97) ]; },
    'Oboko TC': (villageId) => { return [ buildPlant('Oboko TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.670277, 32.984139, villageId, undefined, undefined, 38.40, 144.00, 0.00, 48) ]; },
    'Ogili TC': (villageId) => { return [ buildPlant('Ogili TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.409353, 32.496177, villageId, undefined, undefined, 38.40, 144.00, 0.00, 131) ]; },
    'Opoki': (villageId) => { return [ buildPlant('Opoki', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.429328, 32.716621, villageId, undefined, undefined, 38.40, 144.00, 0.00, 54) ]; },
    'Otaa': (villageId) => { return [ buildPlant('Otaa', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.486728, 32.478779, villageId, undefined, undefined, 19.20, 72.00, 0.00, 45) ]; },
    'Paloga Central': (villageId) => { return [ buildPlant('Paloga Central', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.58893, 32.94357, villageId, undefined, undefined, 76.80, 288.00, 0.00, 219) ]; },
    'Pangira / Licwar Central': (villageId) => { return [ buildPlant('Pangira / Licwar Central', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.614721, 32.651851, villageId, undefined, undefined, 38.40, 144.00, 0.00, 123) ]; },
    'Pany Buk East and West ': (villageId) => { return [ buildPlant('Pany Buk East and West ', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.670064, 32.954506, villageId, undefined, undefined, 38.40, 144.00, 0.00, 48) ]; },
    'Pawena TC': (villageId) => { return [ buildPlant('Pawena TC', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.283056, 32.67194, villageId, undefined, undefined, 38.40, 144.00, 0.00, 100) ]; },
    'Potika ': (villageId) => { return [ buildPlant('Potika ', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.719951, 32.881144, villageId, undefined, undefined, 38.40, 144.00, 0.00, 114) ]; },
    'Ssenyondo': (villageId) => { return [ buildPlant('Ssenyondo', 'Uganda Bunjako Island', 'UGA_2019_003', 'Bunjako', -0.068013, 32.186464, villageId, undefined, undefined, 72.96, 288.00, 0.00, 200) ]; },
    'Ywaya': (villageId) => { return [ buildPlant('Ywaya', 'Uganda GIZ 25', 'UGA_2019_004', 'GIZ', 3.694761, 33.080893, villageId, undefined, undefined, 19.20, 72.00, 0.00, 35) ]; },
  }
}


function getDefaultPlantStatus() {
  return {
    status: 1,
    messages: []
  }
}

function getPlantStatusByPlantName() {
  const regular = { status: 6, messages: [] };
  const commFailure = { status: 2, messages: [ 'comm-lost' ] };
  const techWarn = { status: 4, messages: [ 'inv-failure', 'invs-failure' ] };

  return {
    'Adido': regular,
    'Batkanu': regular,
    'Kagbere': regular,
    'Kamaranka': regular,
    'Mabang': regular,
    'Mara': regular,
    'Rokonta': regular,
    'Nimjat RPU001': commFailure,
    'Nimjat RPU002': commFailure,
    'Koglo Kope': techWarn,
  }
}


function getElectricityAvailableForSaleList() {
  return [{
    plantNames: ['Adido'],
    data: {
      'degradation-factors': [{
        from: 1,
        value: [ 0.0075 ]
      }],
      'ramp-up-factors': [
        0.00,
        0.00,
        0.14,
        0.17,
        0.20,
        0.25,
        0.33,
        0.50   
      ],
      eafs: [
        74.73,
        70.46,
        74.73,
        74.73,
        76.86,
        64.05,
        61.92,
        59.78,
        68.32,
        76.86,
        81.13,
        81.13
      ]
    }
  }]
}

function createPlantElectricityAvailableForSaleEntry(plantIds, data) {
  return new Promise((resolve, reject) => {
    PlantElectricityAvailableForSale.create({
      _id: new mongoose.Types.ObjectId(),
      plants: plantIds,
      ...data
    })
    .then(createResult => {
      console.log(`plant EAFS creation for '[${plantIds}]' succeeded with id: ${createResult._id}`);
      resolve();
    })
    .catch(createError => {
      if (createError.name === 'MongoError' && createError.code === 11000) {
        console.log(`'[${plantIds}]' plant EAFS creation already done`);
        resolve();
      } else {
        console.error(`'[${plantIds}]' plant EAFS creation error: ${createError}`);
        reject(createError);
      }
    });
  });
}

function createPlantElectricityAvailableForSaleByPlantNames(electricityAvailableForSale, resolveOnErrors = true) {  
  return new Promise((resolve, reject) => {
    const plantNames = electricityAvailableForSale.plantNames;

    Plant.find({ 'name': { '$in': plantNames } })
    .select({ name: 1 })
    .exec()
    .then(findResult => {
      console.log(`starting plant EAFS creation for '[${plantNames}]'...`);

      const plantIds = [];
      const invalidPlantNames = [...plantNames];
      findResult.forEach((plant) => {
        plantIds.push(plant._id);
        invalidPlantNames.splice(invalidPlantNames.findIndex(v => v === plant.name), 1);
      })

      if (invalidPlantNames.length > 0) {
        const onlyOne = invalidPlantNames.length == 1;
        console.error(`plant${onlyOne ? '' : 's' } '${invalidPlantNames}' ${onlyOne ? 'does' : 'do'} not exist, it will not have EAFS table`);
      }

      createPlantElectricityAvailableForSaleEntry(plantIds, electricityAvailableForSale.data)
      .then(() => resolve())
      .catch(createError => {
        resolveOnErrors
        ? resolve()
        : reject(createError);
      });
    })
    .catch(findError => {
      console.error(`plant EAFS creation error for '[${plantNames}]' on searching for plants by name: ${findError}`);
      resolveOnErrors
        ? resolve()
        : reject(findError);
    })
  });
}


function getPerformanceRatioList() {
  return [{
    plantNames: ['Adido'],
    pr: [74.2, 73.8, 73.8, 74.3, 75.0, 75.8, 76.4, 76.5, 76.3, 75.7, 74.5, 74.4,]
  }]
}

function createPlantPerfrmanceRatioEntry(pr, month, plantIds) {
  return new Promise((resolve, reject) => {
    PlantPerformaceRatio.create({
      _id: new mongoose.Types.ObjectId(),
      plants: plantIds,
      month: month,
      pr: pr
    })
    .then(createResult => {
      console.log(`plant PR creation for '[${plantIds}]@${month}' succeeded with id: ${createResult._id}`);
      resolve();
    })
    .catch(createError => {
      if (createError.name === 'MongoError' && createError.code === 11000) {
        console.log(`'[${plantIds}]@${month}' plant PR creation already done`);
        resolve();
      } else {
        console.error(`'[${plantIds}]@${month}' plant PR creation error: ${createError}`);
        reject(createError);
      }
    });
  });
}

function createPlantPerfrmanceRatioByPlantNames(performanceRatio, resolveOnErrors = true) {  
  return new Promise((resolve, reject) => {
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const plantNames = performanceRatio.plantNames;
    const prByMonth = performanceRatio.pr;

    Plant.find({ 'name': { '$in': plantNames } })
    .select({ name: 1 })
    .exec()
    .then(findResult => {
      console.log(`starting plant PR creation for '[${plantNames}]'...`);

      const plantIds = [];
      const invalidPlantNames = [...plantNames];
      findResult.forEach((plant) => {
        plantIds.push(plant._id);
        invalidPlantNames.splice(invalidPlantNames.findIndex(v => v === plant.name), 1);
      })

      if (invalidPlantNames.length > 0) {
        const onlyOne = invalidPlantNames.length == 1;
        console.error(`plant${onlyOne ? '' : 's' } '${invalidPlantNames}' ${onlyOne ? 'does' : 'do'} not exist, it will not have PR table`);
      }

      const createPromises = [];
      months.forEach((month, index) => {
        createPromises.push(createPlantPerfrmanceRatioEntry(prByMonth[index] || Number.NaN, month, plantIds));
      });
      
      Promise.all(createPromises)
      .then(() => resolve())
      .catch(createError => {
        resolveOnErrors
        ? resolve()
        : reject(createError);
      });
    })
    .catch(findError => {
      console.error(`plant PR creation error for '[${plantNames}]' on searching for plants by name: ${findError}`);
      resolveOnErrorsdeleteResult
        ? resolve()
        : reject(findError);
    })
  });
}


function buildCountries() {
  return new Promise((resolve, reject) => {
    const countries = getCountries();
    
    countries.forEach((country, index) => {
      Country.create(country)
        .then(createResult => {
          console.log(`'${createResult['default-name']}' country creation succeeded with id: ${createResult._id}`);
        })
        .catch(createError => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            console.log(`'${country['default-name']}' country creation already done`);
          } else {
            console.error(`'${country['default-name']}' country creation error: ${createError}`);
          }
        })
        .finally(() => {
          if (index === (countries.length - 1)) {
            resolve();
          }
        });
    });
  });
}

function buildVillages() {
  return new Promise((resolve, reject) => {
    const villages = getVillages();

    villages.forEach((village, index) => {
      Village.create(village)
        .then(createResult => {
          console.log(`'${createResult.name}' village creation succeeded with id: ${createResult._id}`);
        })
        .catch(createError => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            console.log(`'${village.name}' village creation already done`);
          } else {
            console.error(`'${village.name}' village creation error: ${createError}`);
          }
        })
        .finally(() => {
          if (index === (villages.length - 1)) {
            resolve();
          }
        });
    });
  });
}

function buildPlants() {
  return new Promise((resolve, reject) => {
    const plantIdGenerator = new PlantIdGenerator();
    let plantBuilders = getPlantBuilders();

    Village.find({}).select({ name: 1 }).exec()
    .then(findResult => {
      let plantsByVillage;

      findResult.forEach((village, index1) => {
        const lastVillageIteration = (index1 === findResult.length -1);
        if (!plantBuilders[village.name]) {
          if (lastVillageIteration) {
            resolve();
          }
          return;
        }

        plantsByVillage = plantBuilders[village.name](village._id);

        plantsByVillage.forEach((plant, index2) => {
          plantIdGenerator.apply(plant)
          Plant.create(plant)
            .then(createResult => {
              console.log(`'${plant.name}@${village.name}' plant creation succeeded with id: ${createResult._id}`);
            })
            .catch(createError => {
              if (createError.name === 'MongoError' && createError.code === 11000) {
                console.log(`'${plant.name}@${village.name}' plant creation already done`);
              } else {
                console.error(`'${plant.name}@${village.name}' plant creation error: ${createError}`);
              }
            })
            .finally(() => {
              if (lastVillageIteration && index2 === (plantsByVillage.length - 1)) {
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

function buildPlantsStatus() {
  return new Promise((resolve, reject) => {
    const defaultPlantStatus = getDefaultPlantStatus();
    const plantStatusByPlantName = getPlantStatusByPlantName();

    Plant.find({}).select({ name: 1 }).exec()
    .then(findResult => {
      findResult.forEach((plant, index) => {
        const plantStatus = plantStatusByPlantName[plant.name] || defaultPlantStatus;
        PlantStatus.create(new PlantStatus({
          _id: plant._id,
          ...mongooseMixins.makeCreator(creator, creatorRole),
          ...plantStatus
        }))
        .then(createResult => {
          console.log(`'${plantStatus.status}@${plant.name}[${plant._id}]' plant status creation succeeded with id: ${createResult._id}`);
        })
        .catch(createError => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            console.log(`'${plantStatus.status}@${plant.name}[${plant._id}]' plant status creation already done`);
          } else {
            console.error(`'${plantStatus.status}@${plant.name}[${plant._id}]' plant status creation error: ${createError}`);
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

function buildPlantsElectricityAvailableForSale() {
  return new Promise((resolve, reject) => {
    PlantElectricityAvailableForSale.deleteMany({}).exec()
    .then((deleteResult) => {
      getElectricityAvailableForSaleList().forEach((electricityAvailableForSale) => {
        createPlantElectricityAvailableForSaleByPlantNames(electricityAvailableForSale)
        .then(() => resolve())
        .catch(createError => reject(createError));
      });
    })
    .catch(deleteError => {
      reject(deleteError);
    });
  });
}

function buildPlantsPerformanceRatio() {
  return new Promise((resolve, reject) => {
    PlantPerformaceRatio.deleteMany({}).exec()
    .then((deleteResult) => {
      getPerformanceRatioList().forEach((performanceRatio) => {
        createPlantPerfrmanceRatioByPlantNames(performanceRatio)
        .then(() => resolve())
        .catch(createError => reject(createError));
      });
    })
    .catch(deleteError => {
      reject(deleteError);
    });
  });
}

function checkPlantGenerationLog() {
  return new Promise((resolve, reject) => {
    let tsSamplig = new Date(Date.UTC(2019, 10, 23, 15));

    PlantGenerationLog.create({
      _id: new mongoose.Types.ObjectId(),
      plant: new mongoose.Types.ObjectId(),
      'ts': tsSamplig
    })
    .then(createResult => {
      console.log(`plant generation log creation succeeded with id: ${createResult._id}`);
    })
    .then(() => PlantGenerationLog.deleteMany({}))
    .then(() => resolve())
    .catch(checkError => {
      reject(checkError);
    });
  });
}


exports.boot = () => {
  buildCountries()
  .then(() => buildVillages())
  .then(() => buildPlants())
  .then(() => buildPlantsStatus())
  .then(() => buildPlantsElectricityAvailableForSale())
  .then(() => buildPlantsPerformanceRatio())
  .then(() => checkPlantGenerationLog())
  .then(() => buildPlantParts())
  .catch(error => {
    console.error(`errors encountered during winch database population: ${error}`);
  })
};
