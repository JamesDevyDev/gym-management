import mongoose from "mongoose";
import '@/models/User.Model'

const StaffLogsSchema = new mongoose.Schema({
    adminId: {
        ref: 'Users',
        type: mongoose.Types.ObjectId
    },
    user: {
        ref: 'Users',
        type: mongoose.Types.ObjectId
    },

}, { timestamps: true })

const StaffLogs = mongoose.models.StaffLogs || mongoose.model('StaffLogs', StaffLogsSchema);
export default StaffLogs;
