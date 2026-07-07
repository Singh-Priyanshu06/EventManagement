const mongoose = require('mongoose'); 

const otpschema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    action:{
        type:String,
        emun:["account-verify","event_boocking"],
        require: true
    },
    createAt:{
        type:Date,
        default: Date.now,
        expires:300
    }
});

module.exports = mongoose.model('OTP', otpschema)