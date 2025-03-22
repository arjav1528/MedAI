const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const Patient = new mongoose.Schema(
    {
        googleId: {
            type: String,
            required: true
        },
        displayName: {
            type: String
        },
        refreshToken : {
            type: String,
            default: null
        },
        queries: {
            type: Array,
            default: []
        },
        medicalHistory: {
          type: String
        },
        currentSymptoms: {
            type: String
        },
        bodyTemperature: {
            type: Number
        }
    },
    {
        timestamps: true
    }

);

Patient.pre("save", async function (next) {
    const user = this;
    console.log('Pre Save Hook');
    next();
});



Patient.methods.generateRefreshToken = async function (){
    const user = this;
    const refreshToken = jwt.sign({
        googleId: user.googleId,
        id : user._id
    },
    process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'}
    );

    return refreshToken;
}

user.methods.generateAccessToken = async function (){
    const user = this;
    const accessToken = jwt.sign({
        googleId: user.googleId,
        id : user._id
    },
    process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'}
    );

    return accessToken;

}


const Patient = mongoose.model('Patient', Patient);

module.exports = Patient;
