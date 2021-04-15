const mongoose = require ('mongoose');
const passpLocalMongoose = require('passport-local-mongoose');
 
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passpLocalMongoose); //adding an username field and a password

module.exports = mongoose.model('User', UserSchema);