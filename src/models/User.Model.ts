import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String },
    role: { type: String, default: 'member' },

    //For staffs
    // NumberOfScans 
    //ActivatedMembers
    

    //For Members
    activated: { type: Boolean },
    startTime: { type: Date },
    duration: { type: String },
    qrCode: {
        type: String,
    }
}, { timestamps: true });

const Users = mongoose.models.Users || mongoose.model('Users', userSchema);
export default Users;
