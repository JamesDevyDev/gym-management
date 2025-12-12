import mongoose from 'mongoose'
import '@/models/User.Model'

const AdminLogsSchema = new mongoose.Schema({
    userId: {
        ref: 'Users',
        type: mongoose.Schema.Types.ObjectId
    },
    staffId: {
        ref: 'Users',
        type: mongoose.Schema.Types.ObjectId
    },
    action: {
        type: String,
        default: ""
    }
}, { timestamps: true })

const AdminLogs = mongoose.models.AdminLogs || mongoose.model('AdminLogs', AdminLogsSchema);
export default AdminLogs;
