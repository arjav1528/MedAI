const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const connectDB = async () => {
    try{
        const connection =  await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB is connected ✔✔');
    }catch(err){
        console.error('Failed to connect to MongoDB ✘✘.. Error:', err);
        process.exit(1);
    }
}


module.exports = connectDB;