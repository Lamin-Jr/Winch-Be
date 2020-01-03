const mongoose = require('mongoose');
const Meter = require('../../app/winch/api/models/meter');

module.exports.buildMeters = () => {
    return new Promise((resolve, reject) => {
        Meter.deleteMany({}).exec()
            .then((deleteResult) => {
                getMeter().forEach((meter, index) => {
                    Meter.create(meter)
                        .then(createResult => {
                            console.log(`${createResult['label']} Meter Creation Success with id: ${createResult._id}`);
                        })
                        .catch(createError => {
                            if (createError.name === 'MongoError' && createError.code === 11000) {
                                console.log(`${meter['label']} Creation already done`)
                            } else {
                                console.error(`'${meter['label']}' Meter creation error: ${createError}`);
                            }
                        })
                        .finally(() => {
                            if (index === (meters.lenght - 1)) {
                                resolve();
                            }
                        })

                });
            })
            .catch(deleteError => {
                reject(deleteError);
            });
    })
}

function datameter(id, plantid, poleid, phase, label) {
    const result = {
        _id: id,
        plant: plantid,
        pole: poleid,
        phase: phase,
        label: label,
        'hardware-info': {
            manufacturer: '-',
            model: '-',
            'serial-no': '-'
        }
    };

    return result;
}

function getMeter() {
    return [
        datameter("vSM5R-04-000091F1", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a109", 3, "SM5R-04-000091F1"),
        datameter("vSM60R-05-000091BD", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a109", 3, "SM60R-05-000091BD"),
        datameter("vSM60R-05-00008746", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a10f", 3, "SM60R-05-00008746"),
        datameter("vSM5R-04-00009185", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a10f", 3, "SM5R-04-00009185"),
        datameter("vSM5R-04-00009185", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a10f", 3, "SM5R-04-00009185"),
        datameter("vSM5R-04-0000878C", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a10e", 3, "SM5R-04-0000878C"),
        datameter("vSM60R-05-00008EFA", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13e", 3, "SM60R-05-00008EFA"),
        datameter("vSM5R-04-00009183", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13e", 3, "SM5R-04-00009183"),
        datameter("vSM5R-04-00009186", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13e", 3, "SM5R-04-00009186"),
        datameter("vSM60R-05-00008EFE", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a11b", 3, "SM60R-05-00008EFE"),
        datameter("vSM5R-04-00009182", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a11b", 3, "SM5R-04-00009182"),
        datameter("vSM60R-05-00008F1E", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13d", 3, "SM60R-05-00008F1E"),
        datameter("vSM60R-05-0000C334", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13d", 2, "SM60R-05-0000C334"),
        datameter("vSM5R-04-0000917C", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a119", 2, "SM5R-04-0000917C"),
        datameter("vSM5R-04-00009184", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a119", 2, "SM5R-04-00009184"),
        datameter("vSM5R-04-0000918F", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a119", 2, "SM5R-04-0000918F"),
        datameter("vSM5R-04-0000917D", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a121", 2, "SM5R-04-0000917D"),
        datameter("vSM5R-04-0000C0AD", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a121", 2, "SM5R-04-0000C0AD"),
        datameter("vSM60R-05-0000C332", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a121", 3, "SM60R-05-0000C332"),
        datameter("vSM5R-04-0000917F", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a11a", 3, "SM5R-04-0000917F"),
        datameter("vSM60R-05-0000C127", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a11a", 1, "SM60R-05-0000C127"),
        datameter("vSM5R-04-00009187", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a118", 3, "SM5R-04-00009187"),
        datameter("vSM60R-05-0000C35A", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a118", 3, "SM60R-05-0000C35A"),
        datameter("vSM5R-04-0000918D", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a126", 3, "SM5R-04-0000918D"),
        datameter("vSM5R-04-00009190", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a11f", 1, "SM5R-04-00009190"),
        datameter("vSM60R-05-0000C13E", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a11f", 1, "SM60R-05-0000C13E"),
        datameter("vSM60R-05-0000C348", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a11f", 1, "SM60R-05-0000C348"),
        datameter("vSM5R-04-00009191", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a12a", 3, "SM5R-04-00009191"),
        datameter("vSM60R-05-0000C4C2", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a12a", 3, "SM60R-05-0000C4C2"),
        datameter("vSM60R-05-0000C141", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a112", 3, "SM60R-05-0000C141"),
        datameter("vSM5R-04-00009192", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a112", 3, "SM5R-04-00009192"),
        datameter("vSM5R-04-00009193", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a124", 1, "SM5R-04-00009193"),
        datameter("vSM60R-05-0000C335", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a124", 3, "SM60R-05-0000C335"),
        datameter("vSM60R-05-0000C349", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a124", 2, "SM60R-05-0000C349"),
        datameter("vSM60R-05-0000C358", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a124", 3, "SM60R-05-0000C358"),
        datameter("vSM60R-05-0000C497", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a124", 1, "SM60R-05-0000C497"),
        // pole 49
        datameter("vSM5R-04-00009198", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a120", 3, "SM5R-04-00009198"),
        datameter("vSM60R-05-000091B8", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a120", 3, "SM60R-05-000091B8"),
        datameter("vSM60R-05-0000C148", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a120", 3, "SM60R-05-0000C148"),
        // pole 89
        datameter("vSM60R-05-000091AE", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a148", 3, "SM60R-05-000091AE"),
        // pole 60
        datameter("vSM60R-05-000091B0", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a12b", 3, "SM60R-05-000091B0"),
        // pole 71
        datameter("vSM60R-05-000091BA", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a136", 3, "SM60R-05-000091BA"),
        //pole 26
        datameter("vSM60R-05-000091BD", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a109", 3, "SM60R-05-000091BD"),
        datameter("vSM5R-04-000091F1", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a109", 3, "SM5R-04-000091F1"),
        // pole 87
        datameter("vSM60R-05-000091C8", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a146", 3, "SM60R-05-000091C8"),
        //pole 40
        datameter("vSM5R-04-000091EE", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a117", 1, "SM5R-04-000091EE"),
        datameter("vSM60R-05-0000C356", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a117", 1, "SM60R-05-0000C356"),
        // pole 27
        datameter("vSM5R-04-000091EF", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a10a", 3, "SM5R-04-000091EF"),
        // pole 45
        datameter("vSM5R-04-000091F0", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a11c", 3, "SM5R-04-000091F0"),
        // pole 68
        datameter("vSM60RP-02-000092B2", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a133", 3, "SM60RP-02-000092B2"),
        // pole 57
        datameter("vSM5R-04-0000C06A", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a128", 3, "SM5R-04-0000C06A"),
        datameter("vSM60R-05-0000C35D", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a128", 1, "SM60R-05-0000C35D"),
        // pole 51
        datameter("vSM5R-04-0000C0B5", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a122", 3, "SM5R-04-0000C0B5"),
        datameter("vSM60R-05-0000C12B", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a122", 1, "SM60R-05-0000C12B"),
        // pole 72
        datameter("vSM5R-04-0000C0BE", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a137", 3, "SM5R-04-0000C0BE"),
        // pole 52
        datameter("vSM60R-05-0000C142", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a123", 3, "SM60R-05-0000C142"),
        // pole 55
        datameter("vSM60R-05-0000C18C", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a126", 2, "SM60R-05-0000C18C"),
        datameter("vSM60R-05-0000C345", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a126", 2, "SM60R-05-0000C345"),
        datameter("vSM60R-05-0000C351", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a126", 2, "SM60R-05-0000C351"),
        // pole 77
        datameter("vSM60R-05-0000C313", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13c", 1, "SM60R-05-0000C313"),
        // pole 67
        datameter("vSM60R-05-0000C315", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a132", 3, "SM60R-05-0000C315"),
        // pole 75
        datameter("vSM60R-05-0000C333", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13a", 1, "SM60R-05-0000C333"),
        datameter("vSM60R-05-0000C4BB", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13a", 1, "SM60R-05-0000C4BB"),
        // pole 76
        datameter("vSM60R-05-0000C492", "|BEN|BEN_2019_005|1|", "5e0efc42c6eb2f27e0f6a13b", 3, "SM60R-05-0000C492"),
    ]
}

