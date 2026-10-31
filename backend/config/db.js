const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URL) {
        throw new Error('MONGO_URL is not set. Configure a valid MongoDB connection string.');
    }

    await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 });
    console.log('connected to DB');
};

module.exports = connectDB;