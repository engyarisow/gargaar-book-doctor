import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PharmacyContext } from '../../context/PharmacyContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditProduct = () => {
    const { id } = useParams(); // Wuxuu soo qabanayaa ID-ga dawada
    const navigate = useNavigate();
    const { products, backendUrl, pToken, getPharmacyProducts } = useContext(PharmacyContext);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        quantity: ''
    });

    // Marka page-ku soo koco, wuxuu raadinayaa xogta dawadaas si uu form-ka ugu soo buuxiyo
    useEffect(() => {
        const productToEdit = products.find((p) => p._id === id);
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                category: productToEdit.category,
                price: productToEdit.price,
                quantity: productToEdit.quantity
            });
        }
    }, [id, products]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Wuxuu dirayaa xogta cusub
            const { data } = await axios.post(
                `${backendUrl}/api/pharmacy/update-product`, 
                { id, ...formData },
                { headers: { ptoken: pToken } }
            );

            if (data.success) {
                toast.success("Product updated successfully!");
                if(getPharmacyProducts) getPharmacyProducts(); // Dib u cusboonaysii liiska
                navigate('/pharmacy-products'); // Dib ugu celi miiska alaabta
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Cilad ayaa dhacday.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input 
                        type="text" name="name" 
                        value={formData.name} onChange={handleChange}
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <input 
                        type="text" name="category" 
                        value={formData.category} onChange={handleChange}
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        required 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                        <input 
                            type="number" name="price" 
                            value={formData.price} onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                        <input 
                            type="number" name="quantity" 
                            value={formData.quantity} onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                            required 
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        type="button" onClick={() => navigate(-1)}
                        className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" disabled={loading}
                        className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {loading ? "Updating..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;