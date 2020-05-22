const mongoose = require('mongoose');

// Creator
//
module.exports.makeCreator = (creatorId, role) => {
    return {
        _crtr: {
            _id: creatorId,
            role: role
        }
    }
}
module.exports.makeCreatorCompact = (creatorId, role) => {
    return {
        '_crtr._id': creatorId,
        '_crtr.role': role
    }
}
module.exports.makeCreatorByUserData = (userData) => {
    return this.makeCreator(new mongoose.Types.ObjectId(userData._id), userData.role);
}

module.exports.getCreatorId = (target) => {
    return target._crtr._id
}
module.exports.getCreatorRole = (target) => {
    return target._crtr.role
}

module.exports.creator = {
    _crtr: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        role: {
            type: String
        }
    }
}

module.exports.creatorTs = {
    timestamps: { createdAt: '_crtr.ts' }
}

module.exports.creatorPrj = (prjValue) => {
    return { '_crtr': prjValue }
}


// Updater
//
module.exports.makeLastUpdater = (updaterId, role) => {
    return {
        '_last-updtr': {
            _id: updaterId,
            role: role
        }
    }
}
module.exports.makeLastUpdaterCompact = (updaterId, role) => {
    return {
        '_last-updtr._id': updaterId,
        '_last-updtr.role': role
    }
}
module.exports.makeLastUpdaterByUserData = (userData) => {
    return this.makeLastUpdater(new mongoose.Types.ObjectId(userData._id), userData.role);
}

module.exports.lastUpdater = {
    '_last-updtr': {
        _id: {
            type: mongoose.Schema.Types.ObjectId
        },
        role: {
            type: String
        }
    }
}

module.exports.lastUpdaterTs = {
    timestamps: { updatedAt: '_last-updtr.ts' }
}

module.exports.lastUpdaterPrj = (prjValue) => {
    return { '_last-updtr': prjValue }
}


// Creator + Updater
//
module.exports.fullCrudActors = {
    ...module.exports.creator,
    ...module.exports.lastUpdater
}

module.exports.fullCrudActorsTs = {
    timestamps: {
        ...module.exports.creatorTs.timestamps,
        ...module.exports.lastUpdaterTs.timestamps
    }
}

module.exports.fullCrudActorsPrj = (prjValue) => {
    return {
        ...module.exports.creatorPrj(prjValue),
        ...module.exports.lastUpdaterPrj(prjValue)
    }
}


// History
//
module.exports.history = {
    _hist: {
        r: mongoose.Schema.Types.ObjectId,
        p: mongoose.Schema.Types.ObjectId,
        f: {
            type: Date,
            required: true
        },
        t: {
            type: Date,
            default: new Date(process.env.DATE_MAX)
        }
    }
}

module.exports.makeHistory = (root, parent, from, to) => {
    return {
        _hist: {
            r: root,
            p: parent,
            f: from,
            t: to
        }
    }
}
module.exports.makeHistoryOnCreate = (targetCreationDate, targetId) => {
    return this.makeHistory(targetId, undefined, targetCreationDate, undefined)
}
module.exports.makeHistoryOnUpdateOldTarget = (targetUpdateDate, storedTarget) => {
    return this.makeHistory(storedTarget._hist.r, storedTarget._hist.p, storedTarget._hist.f, targetUpdateDate)
}
module.exports.makeHistoryOnUpdateNewTarget = (targetUpdateDate, storedTarget) => {
    return this.makeHistory(storedTarget._hist.r, storedTarget._id, targetUpdateDate, undefined)
}


// Person
//
module.exports.makePerson = (title, firstName, lastName) => {
    return {
        'title': title,
        'first-name': firstName,
        'last-name': lastName
    }
}

module.exports.makePersonModel = (conf = { title: {}, firstName: {}, lastName: {} }) => {
    return {
        'title-name': {
            type: String,
            ...conf.title
        },
        'first-name': {
            type: String,
            ...conf.firstName
        },
        'last-name': {
            type: String,
            ...conf.lastName
        }
    }
}


// Contact
//
module.exports.makeContact = (type, icon, address) => {
    return {
        type: type,
        icon: icon,
        address: address
    }
}

module.exports.makeContactModel = (conf = { type: {}, icon: {}, address: {} }) => {
    return {
        'type': {
            type: String,
            ...conf.type
        },
        icon: {
            type: String,
            ...conf.icon
        },
        address: {
            type: String,
            ...conf.address
        }
    }
}
