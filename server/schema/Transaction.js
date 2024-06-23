import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: String  // Assuming dateOfSale is stored as a string in the format shown
});

export default mongoose.model('Transaction', transactionSchema);
