const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.Api_Key,
    api_secret: process.env.Api_Secret
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
    folder: 'Camping4You',
    allowedFormats: ['jpeg', 'jpg', 'png']
    }
})

module.exports = { cloudinary, storage}