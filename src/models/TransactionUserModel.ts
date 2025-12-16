import mongoose from "mongoose";

const TransactionUserSchema = new mongoose.Schema({

    

})

const TransactionUser = mongoose.models.TransactionUser || mongoose.model('TransactionUser', TransactionUserSchema);
export default TransactionUser;
