import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true }, 
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'pharmacy', required: true },
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 1 },
  
  expiryDate: { type: Date, required: true } 
}, { timestamps: true });

const productModel = mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;