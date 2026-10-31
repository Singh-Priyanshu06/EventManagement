require("dotenv").config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const connectDB = require("./config/db")
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', require("./routes/auth"));
app.use('/api/events',require('./routes/events'));
app.use('/api/bookings',require('./routes/booking'));



const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error(`Unable to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

startServer();