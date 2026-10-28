import React, { useState, useContext } from 'react';
import { PlusCircle, Upload, Layers, DollarSign, Package, Calendar } from 'lucide-react';
import { PharmacyContext } from '../../context/PharmacyContext'; 
import { toast } from 'react-toastify';

const AddProduct = () => {
    const { addProduct } = useContext(PharmacyContext);

    // States
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Tablets');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(''); 
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImage(reader.result);
            };
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!name || !price || !category || !image || !expiryDate) {
            toast.error("Please fill in all required fields including the image and expiry date!");
            return;
        }

        const productData = {
            name,
            category,
            price: Number(price),
            quantity: Number(quantity),
            description,
            image, 
            expiryDate 
        };

        const success = await addProduct(productData);

        if (success) {
            setName('');
            setCategory('Tablets');
            setPrice('');
            setQuantity('');
            setExpiryDate('');
            setDescription('');
            setImage('');
            setImagePreview(null);
        }
    };

    return (
        <div className="p-4 sm:p-8 w-full max-w-4xl mx-auto min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <div className="mb-8 border-b border-slate-200 pb-4">
                <h1 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <PlusCircle className="text-blue-600" size={18} />
                    Add New Product
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Add a new medicine or healthcare product to your inventory.
                </p>
            </div>

            <form onSubmit={onSubmitHandler} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
                
                {/* Image Upload Area */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Product Image</label>
                    <label htmlFor="imageUpload" className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group relative overflow-hidden bg-slate-50/50">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-32 object-contain" />
                        ) : (
                            <>
                                <Upload className="mx-auto text-slate-400 group-hover:text-blue-500 transition-colors mb-2" size={28} />
                                <p className="text-xs uppercase tracking-wider font-bold text-slate-600">Click to upload</p>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">PNG, JPG or JPEG</p>
                            </>
                        )}
                        <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Product Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            placeholder="e.g., Paracetamol 500mg" 
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm text-slate-700 font-medium placeholder:text-slate-300" 
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                        <div className="relative">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm bg-white appearance-none text-slate-700 font-medium"
                            >
                                <option value="Tablets">Tablets</option>
                                <option value="Syrup">Syrup</option>
                                <option value="Capsules">Capsules</option>
                                <option value="Injections">Injections</option>
                                <option value="Ointment">Ointment</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Price ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="number" 
                                step="0.01" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)} 
                                required 
                                placeholder="0.00" 
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm text-slate-700 font-medium placeholder:text-slate-300" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Stock Quantity</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)} 
                                required 
                                placeholder="e.g., 100" 
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm text-slate-700 font-medium placeholder:text-slate-300" 
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Expiry Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="date" 
                                value={expiryDate} 
                                onChange={(e) => setExpiryDate(e.target.value)} 
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm text-slate-700 font-medium" 
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                        <textarea 
                            rows="3" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                            placeholder="Enter medicine details, usage instructions, or side effects..." 
                            className="w-full px-4 py-3 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm resize-none text-slate-700 font-medium placeholder:text-slate-300"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                        type="submit" 
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-xs uppercase tracking-wider font-bold rounded-md shadow-sm hover:bg-blue-700 hover:shadow transition-all"
                    >
                        Save Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;