import mongoose from "mongoose";
import '@/models/User.Model'

const TransactionUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    membershipDuration: {
        type: Number, // in months
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    startTime: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    reference: {
        type: String,
        unique: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'gcash', 'bank_transfer', 'card'],
        default: 'cash'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes
TransactionUserSchema.index({ userId: 1, createdAt: -1 });
TransactionUserSchema.index({ reference: 1 });

// Generate unique reference number before validation
TransactionUserSchema.pre('validate', function(next) {
    if (!this.reference) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.reference = `MEM-${year}-${month}-${randomNum}`;
    }
    next();
});

const TransactionUser = mongoose.models.TransactionUser || mongoose.model('TransactionUser', TransactionUserSchema);
export default TransactionUser;