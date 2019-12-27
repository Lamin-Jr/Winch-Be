const mongoose = require('mongoose');

const AccountCtrl = require('../../../../api/controllers/account');
const RealmCtrl = require('../../../../api/controllers/realm');

const {
    WellKnownJsonRes,
    // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
// const {
//     BasicRead,
//     BasicWrite,
// } = require('../../../../api/middleware/crud');


//
// endpoint-related

// others/acceptSignup
exports.accept_signup = (req, res, next) => {
    const isAccept = req.method === 'POST';

    {
        const missingParams = new Set();
        if (!req.body.username) {
            missingParams.add('username');
        }
        if (isAccept && !req.body.role) {
            missingParams.add('role');
        }
        if (missingParams.size !== 0) {
            WellKnownJsonRes.error(res, 400, `missing required params: \'${[...missingParams].join('\', \'')}\'`);
            return;
        }
    }

    if (!req.userData || !req.userData['app-name']) {
        // this is a bug
        WellKnownJsonRes.error(res)
        return;
    }

    if (isAccept) {
        AccountCtrl.getCorrelationIdByUsername(req.body.username)
        .then((correlationId) => {
            return new Promise((resolve, reject) => {
                RealmCtrl.realmExistsByCorrelationIdAndAppName(correlationId, req.userData['app-name'], false)
                .then(() => resolve(correlationId))
                .catch(realmExistsError => reject(realmExistsError))
            })
        })
        .then((correlationId) => RealmCtrl.activateUserWithRole(req.userData, correlationId, req.userData['app-name'], req.body.role))
        .then((acceptSignupResult) => {
            WellKnownJsonRes.created(res);
            // return;
        })
        .catch(acceptSignupError => {
            WellKnownJsonRes.conflict(res);
            // return;
        });
    } else if (req.method === 'DELETE') {
        WellKnownJsonRes.error(res, 501)
        // return;
    } else {
        WellKnownJsonRes.notFound(res)
        // return;
    }
}