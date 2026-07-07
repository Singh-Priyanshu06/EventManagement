const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL) {
            console.log('MONGO_URL is not set, skipping database connection');
            return;
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log('connected to DB');
    } catch (error) {
        console.log(error);
    }
};

module.exports = connectDB;