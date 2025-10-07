const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const isProdoctionMode = process.env.NODE_ENV === 'production';
if(!isProdoctionMode) {
    dotenv.config();
};

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Mongoodb connected: ${mongoose.connection.host}`);

    } catch (err) {
        console.error(`Error in mongoose connection: ${err}`);
        process.exit(1);
    };
};

async function startServer() {
    const port = +process.env.PORT || 4000;

    app.listen(port, () => {
        console.log(`Server is Running ${isProdoctionMode ? "production" : "development"} mode on port ${port}`);
    });
};

async function run() {
    await connectToDB();
    await startServer();
};

run();
