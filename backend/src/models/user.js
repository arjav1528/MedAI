const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();



const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    refreshToken: { type: String, default: null },
    role: { 
      type: String, 
      enum: ['clinician', 'patient'], // Define role enum
      required: true 
    },
    queries: { type: Array, default: [] },
    maxConcurrentQueries: { type: Number, default: 4 }, 
    medicalHistory: { type: String }, 
    currentSymptoms: { type: String },
    bodyTemperature: { type: Number },
  }, {
    timestamps: true
  });



const User = mongoose.model('User', userSchema);
module.exports = User;