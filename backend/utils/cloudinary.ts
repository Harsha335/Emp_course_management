import { v2 as cloudinary } from 'cloudinary';

const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret:  process.env.CLOUD_KEY_SECRET,
});

module.exports = cloudinary;