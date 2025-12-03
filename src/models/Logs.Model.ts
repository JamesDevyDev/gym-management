import mongoose from "mongoose";
import '@/models/User.Model'

const logsSchema = new mongoose.Schema({
    adminId: {
        ref: 'Users',
        type: mongoose.Types.ObjectId
    },
    user: {
        ref: 'Users',
        type: mongoose.Types.ObjectId
    },

}, { timestamps: true })

const Logs = mongoose.models.Logs || mongoose.model('Logs', logsSchema);
export default Logs;
