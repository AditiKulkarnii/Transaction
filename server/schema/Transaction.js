import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: String  
});

export default mongoose.model('Transaction', transactionSchema);
