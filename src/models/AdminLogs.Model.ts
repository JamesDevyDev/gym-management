import mongoose from 'mongoose'

const AdminLogsSchema = new mongoose.Schema({
    userId: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    },
    staffId: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    },
    action: {
        type: String,
        default: ""
    }
}, { timestamps: true })

const AdminLogs = mongoose.models.AdminLogs || mongoose.model('AdminLogs', AdminLogsSchema);
export default AdminLogs;
