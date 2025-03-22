const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();



const Clinicain = new mongoose.Schema(
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
        maxConcurrentQueries: {
            type: Number,
            default: 4
        },
    },
    {
        timestamps: true
    }
)

Clinicain.pre("save", async function (next) {
    const user = this;
    console.log('Pre Save Hook');
    next();
});
Clinicain.methods.generateRefreshToken = async function (){
    const user = this;
    const refreshToken = jwt.sign({
        googleId: user.googleId,
        id : user._id
    },
    process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'}
    );

    return refreshToken;
}

Clinicain.methods.generateAccessToken = async function (){
    const user = this;
    const accessToken = jwt.sign({
        googleId: user.googleId,
        id : user._id
    },
    process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'}
    );

    return accessToken;

}

const Clinicain = mongoose.model('Clinicain', Clinicain);
module.exports = Clinicain;