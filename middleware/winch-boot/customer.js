const mongoose = require('mongoose')
const mongooseMixins = require('../../api/middleware/mongoose-mixins')
const Customer = require('../../app/winch/api/models/customer')
const tariffs = require('./tariffs')
const {
    buildFeaturesCollection,
} = require('../winch-boot/utils')
const creatorFragment = mongooseMixins.makeCreator(
    new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID),
    process.env.WCH_AUTHZ_SYSTEM_ROLE);
module.exports.buildCustomers = () => {
    return new Promise((resolve, reject) => {
        const customer = getCustomer()

        customer.forEach((customer, index) => {
            Customer.create(customer)
                .then(createResult => {
                    console.log(`'${createResult['first-name']}' Customer creation succeeded with id: ${createResult._id}`);
                })
                .catch(createError => {
                    if (createError.name === 'MongoError' && createError.code === 11000) {
                        console.log(`'${customer['first-name']}' Customer creation already done`);
                    } else {
                        console.error(`'${customer['first-name']}' Customer creation error: ${createError}`);
                    }
                })
                .finally(() => {
                    if (index === poles.length - 1) {
                        resolve();
                    }
                });
        }); //finish foreach
            
        }); //finish promise
 }




function buildNextTariff(idnexttariff, from) {
   return  {
            _id: idnexttariff,
            from: from
    }
}

function buildStatsCustomer (datets, read) {
    return  {
        'startup-ts': datets,
        'total-people-served': 1,
        'startup-read': 0.0
    }
}

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

function buildBaseTariff(flatcost, flatamt, flatunit, tariffarray, volumesarray) {
    return {

        flat: {
            cost: flatcost,
            amount: flatamt,
            unit: flatunit
        },
        scheduled: buildSchedTariff(tariffarray),
        volumes: buildVolumesTariff(volumesarray)

    }
}

function buildLimitTariff(daily, flat, arraysched) {
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


function importTariff() {
    const tar = buildTariff(new mongoose.Types.ObjectId('5e15e7572ac0c54738b3d9a0'), 'Residential Tranche 1', 'XOF', new Date(), 2100, buildBaseTariff(2100, 1, 'XOF/kWh', [{ from: '00:00', to: '00:00', cost: 129, amount: 1, unit: 'XOF/kWh' }], [{ from: 0.0, to: 0.0, factor: 0.0 }]), buildStandingTariff('month', 2100, 1), buildLimitTariff(0, 0, [{ from: '00:00', to: '08:00', max: 350 }, { from: '08:00', to: '18:00', max: 700 }, { from: '18:00', to: '00:00', max: 350 }]), '|WP1|SLL_2019_001|11|');
    return tar;
    
}


function buildCustomer(id, customerType, title, firstname, lastname, lat, lng, meterid, nexttariff, stats) {

    const customer = {
            _id: id,
            ...creatorFragment,
            enabled: true,
            customerType: customerType,
            ...mongooseMixins.makePerson(title, firstname, lastname),
            geo: buildFeaturesCollection(lat, lng),
            meter: meterid,
            tariff: importTariff(),
            'next-tariff': nexttariff,
            stats: stats
    }
    return customer
}

function getCustomer() {
    return [
        buildCustomer('1', 'Residential', 'Mr', 'Sikirou', 'Moustapha', 0, 0, '|vSPM|SM5R-04-000091F1|', buildNextTariff(undefined, undefined), buildStatsCustomer(new Date(), 0.0))
    ]
}

