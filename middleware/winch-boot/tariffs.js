const mongoose = require('mongoose');

const mongooseMixins = require('../../api/middleware/mongoose-mixins');
const { defaultUpdateOptions } = require('../../api/middleware/mongoose-util');

const creatorFragment = mongooseMixins.makeCreator(
  new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID),
  process.env.WCH_AUTHZ_SYSTEM_ROLE);

const now = new Date(new Date().setUTCHours(0, 0, 0, 0));

const Tariff = require('../../app/winch/api/models/tariff');
  
  
module.exports.buildTariffs = () => {
  return new Promise((resolve, reject) => {
    const tariffs = getTariffs();

    tariffs.forEach((tariff, index) => {
      const id = tariff._id;
      const filter = {
        _id: id
      };
      const update = {
        $set: {
          base: tariff.base,
          'standing-charge': tariff['standing-charge'],
          plant: tariff.plant
        }
      };

      Tariff.findOneAndUpdate(filter, update, defaultUpdateOptions)
        .then(updateResult => {
          if (updateResult) {
            console.log(`'${tariff['name']}' tariff update succeeded with id: ${updateResult._id}`);
          } else {
            Tariffs.create(tariff)
            .then(createResult => {
              console.log(`'${createResult['name']}' tariff creation succeeded with id: ${createResult._id}`);
            })
            .catch(createError => {
              console.error(`'${tariff['name']}' tariff creation error: ${createError}`);
            })
              }
        })
        .catch(updateError => {
          console.error(`'${tariff.name}' pole creation error: ${updateError}`);
        })
        .finally(() => {
          if (index === tariffs.tariffs - 1) {
            resolve();
          }
        });
      });
  });
};

function getTariffs() {
  return [
    buildTariff(new mongoose.Types.ObjectId('5e1597d640bf2c0cb48b066a'), 'Eclairange Public BT3', 'XOF', now, 2100, 
                buildTariffBase(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 144, qty: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '01:00', max: 700 }, { from: '01:00', to: '19:00', max: 0 }, { from: '19:00', to: '00:00', max: 700 } ]), '|BEN|BEN_2019_005|1|'  ),
    buildTariff(new mongoose.Types.ObjectId('5e15e5654f832005accc64b3'), 'Professionel BT2', 'XOF', now, 2100,
                buildTariffBase(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 131, qty: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '08:00', max: 900 }, { from: '08:00', to: '18:00', max: 1800 }, { from: '18:00', to: '00:00', max: 900 }]), '|BEN|BEN_2019_005|1|'),
    buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d99e'), 'Professionel BT2 Cold Room', 'XOF', now, 2100,
                buildTariffBase(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 131, qty: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '23:00', max: 10000 }]), '|BEN|BEN_2019_005|1|'),
    buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d99f'), 'Professionel BT2 Station AEV', 'XOF', now, 2100,
                buildTariffBase(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 131, qty: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '23:00', max: 10000 }]), '|BEN|BEN_2019_005|1|'),
    buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d9a0'), 'Residential Tranche 1', 'XOF', now, 2100,
                buildTariffBase(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 129, qty: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '08:00', max: 350 }, { from: '08:00', to: '18:00', max: 700 }, { from: '18:00', to: '00:00', max: 350 }]), '|BEN|BEN_2019_005|1|'),
    buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d9a1'), 'Residential Tranche 2', 'XOF', now, 2100,
                buildTariffBase(2100, 1, 'XOF/kWh', 
                                buildTariffSchedule([{ from: '00:00', to: '00:00', cost: 136, qty: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }])
                                buildTariffVolumes(volumesarray)

                ), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '08:00', max: 900 }, { from: '08:00', to: '18:00', max: 1800 }, { from: '18:00', to: '00:00', max: 900 }]), '|BEN|BEN_2019_005|1|'),
  ];
}

function buildTariff(id, name, currency, validity, connFeeCost, base, standing, limit, plant) {
  const result = {
    _id: id,
    ...creatorFragment,
    ...mongooseMixins.makeHistoryOnCreate(now, id),
    name: name,
    currency: currency,
    validity: validity,
    'conn-fee': {
      cost: connFeeCost
    },
    base: base,
    'standing-charge': standing,
    'limit': limit,
    plant: plant
  };

  return result;
}


function buildTariffBase(flat, scheduled, volumes) {
  return {
    flat: flat,
    scheduled: scheduled,
    volumes: volumes,
  }
}

function buildTariffFlat(cost, qty, unit) {
  return {
    cost: cost,
    qty: qty,
    unit: unit
  }
}

function buildTariffSchedule(tariffarray) {
  let arrtariff = []

 tariffarray.forEach((res, index) => {
   arrtariff.push({
     from: res.from,
     to: res.to,
     cost: res.cost,
     qty: res.qty,
     unit: res.unit
   })

 })

  return arrtariff;
}

function buildTariffVolumes(volumesarray) {
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

function buildStandingTariff(unit, cost, qty) {

  standing = {
    cost: cost,
    qty: qty,
    unit: unit,
    'allow-overbooking': false,
    'cycle-start': 1
  }
  return standing
}

