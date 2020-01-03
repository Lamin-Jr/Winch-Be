const mongoose = require('mongoose');

const mongooseMixins = require('../../api/middleware/mongoose-mixins')

const Pole = require('../../app/winch/api/models/pole');

function buildPole (enabled, code, lat, lng) {
    const result = {
        _id: new mongoose.Types.ObjectId(),
        ...mongooseMixins.makeCreator(creator, creatorRole),
        'enabled': enabled,
        code: code,
        geo: buildFeaturesCollection(lat, lng)
    };

    return result;
}

function getPoles() {
    const pole = [];
    for (let i = 1; i < 100; i++) {
        pole.push(buildPole(true, `Pole ${i}`, 0.0, 0.0))
    }

    return pole;
}


module.exports.buildPoles = () => {
    return new Promise((resolve, reject) => {
        const poles = getPoles();

        poles.forEach((pole, index) => {
            Pole.create(pole)
                .then(createResult => {
                    console.log(`'${createResult['code']}' Poles creation succeeded with id: ${createResult._id}`);
                })
                .catch(createError => {
                    if (createError.name === 'MongoError' && createError.code === 11000) {
                        console.log(`'${pole['code']}' Poles creation already done`);
                    } else {
                        console.error(`'${pole['code']}' Poles creation error: ${createError}`);
                    }
                })
                .finally(() => {
                    if (index === (poles.length - 1)) {
                        resolve();
                    }
                });
        });
    });
}
