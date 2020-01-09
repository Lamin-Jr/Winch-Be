const mongoose = require('mongoose');
const mongooseMixins = require('../../api/middleware/mongoose-mixins');
const Tariffs = require('../../app/winch/api/models/tariff');
// const {
// buildFeaturesCollection,
// } = require('../winch-boot/utils')
const creatorFragment = mongooseMixins.makeCreator(
  new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID),
  process.env.WCH_AUTHZ_SYSTEM_ROLE);

module.exports.buildTariffs = () => {
  return new Promise((resolve, reject) => {
    const tariff = getTariffs();

    tariff.forEach((tariff, index) => {

      Tariffs.create(tariff)
        .then(createResult => {
          console.log(`'${createResult['name']}' Trariff creation succeeded with id: ${createResult._id}`);
        })
        .catch(createError => {
          if (createError.name === 'MongoError' && createError.code === 11000) {
            console.log(`'${tariff['name']}' tariff creation already done`);
          } else {
            console.error(`'${tariff['name']}' tariff creation error: ${createError}`);
          }
        })
        .finally(() => {
          if (index === tariff.length - 1) {
            resolve();
          }
        });

      
      });

  
  });
};




function buildSchedTariff(tariffarray) {
  let arrtariff = []

 tariffarray.forEach((res, index) => {
   arrtariff.push({
     from: res.from,
     to: res.to,
     cost: res.cost,
     amount: res.amount,
     unit: res.unit
   })

 })

  return arrtariff;
}

function buildVolumesTariff(volumesarray) {
  let arrtariff = [];
  volumesarray.forEach(res => {
    arrtariff.push({
      from: res.from,
      to: res.to,
      factor: res.factor
    })

  })

  return arrtariff;
}

function buildBaseTariff(flatcost, flatamt, flatunit, tariffarray, volumesarray ) {
  return {
    
      flat: {
        cost: flatcost,
        amount:flatamt,
        unit: flatunit
      },
      scheduled: buildSchedTariff(tariffarray),
      volumes: buildVolumesTariff(volumesarray)
 
}
}

function buildLimitTariff(daily, flat, arraysched ){
  let arr = [];
  let limit = '';
  arraysched.forEach((res, index) => {
    arr.push({
        from: res.from,
        to: res.to,
        max: res.max
    })
  })

  limit = {
    e: {
      daily: daily
    },
    p: {
      flat: {
        max: flat
      },
      scheduled: arr
    }
  }

  return limit
  

}

function buildStandingTariff(unit, cost, amount) {

  standing = {
    cost: cost,
    amount: amount,
    unit: unit,
    'allow-overbooking': false,
    'cycle-start': 1
  }
  return standing
}

function getTariffs() {
  return [
    buildTariff(new mongoose.Types.ObjectId('5e1597d640bf2c0cb48b066a'), 'Eclairange Public BT3', 'XOF', new Date(), 2100, buildBaseTariff(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 144, amount: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '01:00', max: 700 }, { from: '01:00', to: '19:00', max: 0 }, { from: '19:00', to: '00:00', max: 700 } ]), '|BEN|BEN_2019_005|1|'  ),
    buildTariff(new mongoose.Types.ObjectId('5e15e5654f832005accc64b3'), 'Professionel BT2', 'XOF', new Date(), 2100, buildBaseTariff(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 131, amount: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '08:00', max: 900 }, { from: '08:00', to: '18:00', max: 1800 }, { from: '18:00', to: '00:00', max: 900 }]), '|BEN|BEN_2019_005|1|'),
    buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d99e'), 'Professionel BT2 Cold Room', 'XOF', new Date(), 2100, buildBaseTariff(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 131, amount: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '23:00', max: 10000 }]), '|BEN|BEN_2019_005|1|'),
    buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d99f'), 'Professionel BT2 Station AEV', 'XOF', new Date(), 2100, buildBaseTariff(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 131, amount: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '23:00', max: 10000 }]), '|BEN|BEN_2019_005|1|'),
    buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d9a0'), 'Residential Tranche 1', 'XOF', new Date(), 2100, buildBaseTariff(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 129, amount: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '08:00', max: 350 }, { from: '08:00', to: '18:00', max: 700 }, { from: '18:00', to: '00:00', max: 350 }]), '|BEN|BEN_2019_005|1|'),
    buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d9a1'), 'Residential Tranche 2', 'XOF', new Date(), 2100, buildBaseTariff(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 136, amount: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '08:00', max: 900 }, { from: '08:00', to: '18:00', max: 1800 }, { from: '18:00', to: '00:00', max: 900 }]), '|BEN|BEN_2019_005|1|'),
  ];
}


function buildTariff(id, nametariff, currency, validity, connfee, base, standing, limit, plant, ) {
  const result = {
    _id: id,
    ...creatorFragment,
    ...mongooseMixins.makeHistoryOnCreate(new Date(), id, undefined, undefined),
    name: nametariff,
    currency: currency,
    validity: validity, // new date
    'conn-fee': {
      cost: connfee
    }, // cost: {double}
    base: base, // this contain flat { const: double, amount: double, unit: string}
    'standing-charge': standing, // cost: double, amount: double, unit: string, 'allow-overbooking': boolean, 'cycle-start': number
    'limit': limit, // e: {daily: double} , p: {flat: { max: double}, scheduled: [{from: string, to: string, max: double}]} 
    plant: plant
  
  };

  return result;
}
