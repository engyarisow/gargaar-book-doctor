import React, { useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Edit, Trash2, Plus, AlertCircle, Copy, Check, X } from 'lucide-react';
import { PharmacyContext } from '../../context/PharmacyContext'; 
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
    // Waxaan ku darnay backendUrl, pToken, iyo getPharmacyProducts si xogta loola falgalo
    const { products, backendUrl, pToken, getPharmacyProducts } = useContext(PharmacyContext);
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const formatProductId = (id) => {
        if (!id) return '';
        return `#P-${id.slice(-5).toUpperCase()}`;
    };

    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase();
        const nameMatch = product?.name?.toLowerCase().includes(query);
        const shortIdMatch = formatProductId(product._id).toLowerCase().includes(query);
        const rawIdMatch = product?._id?.toLowerCase().includes(query);

        return nameMatch || shortIdMatch || rawIdMatch;
    });

    const copyToClipboard = (textToCopy, productId) => {
        navigator.clipboard.writeText(textToCopy);
        setCopiedId(productId); 
        setTimeout(() => setCopiedId(null), 2000); 
    };

    // 1. Function-ka Delete-ka (Tirtirida)
    const handleDelete = async (id) => {
        if (!window.confirm("Ma hubtaa inaad tirtirto alaabtan? Arrintan dib looma soo celin karo.")) return;
        
        try {
            const { data } = await axios.delete(`${backendUrl}/api/pharmacy/delete-product/${id}`, {
                headers: { ptoken: pToken }
            });

            if (data.success) {
                toast.success("Product deleted successfully.");
                if (getPharmacyProducts) getPharmacyProducts(); // Miiska dib u soo celi xogta cusub
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while deleting the product.");
        }
    };

    // 2. Function-ka Update-ka (Edit-ka)
    const handleEdit = (id) => {
        // Tani waxay ku geynaysaa Page-ka Edit-ka adigoo wata ID-ga alaabta
        navigate(`/pharmacy-edit-product/${id}`);
    };

    return (
        <div className="p-4 sm:p-8 w-full relative">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Inventory Products</h2>
                    <p className="text-slate-500 text-sm mt-1">Monitor and manage your medicine stock levels.</p>
                </div>

                <button onClick={() => navigate('/pharmacy-add-product')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Search Input */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or ID..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm" 
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                        <AlertCircle size={48} className="mb-4 text-slate-300" />
                        <p className="text-lg font-semibold text-slate-600">Wax alaab ah lama helin.</p>
                        <p className="text-sm">Haddii aad search samaynayso, hubi higaada magaca ama ID-ga.</p>
                    </div>
                ) : (
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Product ID</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                            {filteredProducts.map((product) => {
                                const shortId = formatProductId(product._id);
                                return (
                                    <tr key={product._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div 
                                                onClick={() => setSelectedImage(product.image)}
                                                className="w-16 h-16 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden group cursor-pointer"
                                                title="Guji si aad u weyneyso sawirka"
                                            >
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                                />
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <span>{shortId}</span>
                                                <button 
                                                    onClick={() => copyToClipboard(shortId, product._id)}
                                                    className="p-1.5 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                                                    title="Copy Short ID"
                                                >
                                                    {copiedId === product._id ? (
                                                        <Check size={14} className="text-emerald-500" />
                                                    ) : (
                                                        <Copy size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                                        
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                                {product.category}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            ${Number(product.price).toFixed(2)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${product.quantity > 10 ? 'bg-emerald-500' : product.quantity > 0 ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                                                <span className="font-semibold">{product.quantity} pcs</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 flex justify-center gap-2 mt-1">
                                            {/* Edit Button */}
                                            <button 
                                                onClick={() => handleEdit(product._id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" 
                                                title="Edit Product"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors" 
                                                title="Delete Product"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* IMAGE MODAL */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
                    onClick={() => setSelectedImage(null)} 
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button 
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={32} />
                        </button>
                        
                        <img 
                            src={selectedImage} 
                            alt="Full Screen Product" 
                            className="w-full h-full max-h-[85vh] object-contain rounded-2xl shadow-2xl bg-white"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;