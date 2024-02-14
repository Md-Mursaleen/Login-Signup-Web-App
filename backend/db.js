const mongoose = require("mongoose");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log(`Not Connected to MongoDB` + error);
});