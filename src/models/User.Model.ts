import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'member' },

    //For staffs

    //For Members
    activated: { type: Boolean, default: false },
    duration: { type: String, default: '' },

    qrCode: {
        type: String,
        default: null   // this will store the base64 png/image or a URL to your server
    }
}, { timestamps: true });

const Users = mongoose.models.Users || mongoose.model('Users', userSchema);
export default Users;
