const mongoose = require('mongoose');


const querySchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient'
        },
        clinicianId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clinician'
        },
        queryText: {
            type: String,
            required: true
        },
        response: {
            type: String
        },
        createdAt: {
        type: Date,
        default: Date.now
        }
    }
)

const Query = mongoose.model('Query', querySchema);

module.exports = Query;