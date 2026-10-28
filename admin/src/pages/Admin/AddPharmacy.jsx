import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AddPharmacy = () => {
    const { addPharmacy } = useContext(AdminContext);

    // 🔄 UI STATES
    const [isLoading, setIsLoading] = useState(false);
    const [mapType, setMapType] = useState('satellite'); // 'streets' or 'satellite'

    // 📦 UNIFIED FORM STATE (Compact Design)
    const [formValues, setFormValues] = useState({
        name: '', email: '', password: '', about: '', contactNumber: '',
        pharmacistName: '', ceoName: '', holderNumber: '', locationText: '',
        payoutMethod: 'EVC Plus', payoutAccountType: 'Merchant', payoutAccountNumber: '', payoutHolderName: ''
    });

    // 📍 LOCATION STATES (Default: Mogadishu)
    const [mapPosition, setMapPosition] = useState({ lat: 2.0446, lng: 45.3418 }); 
    const [isMapClicked, setIsMapClicked] = useState(false); 

    // 🖼️ FILES
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [certificatePreview, setCertificatePreview] = useState(null);

    // 🛡️ PREVENT MEMORY LEAKS (Cleanup Object URLs)
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            if (certificatePreview) URL.revokeObjectURL(certificatePreview);
        };
    }, [imagePreview, certificatePreview]);

    // ✨ MAP REFRESHER (Prevents gray map rendering bug)
    const MapRefresher = () => {
        const map = useMap();
        useEffect(() => {
            const timeout = setTimeout(() => { map.invalidateSize(); }, 400);
            return () => clearTimeout(timeout);
        }, [map]);
        return null;
    };

    // 🗺️ MAP CLICK HANDLER
    const LocationPicker = () => {
        useMapEvents({
            click(e) {
                setMapPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
                setIsMapClicked(true);
            },
        });
        return <Marker position={mapPosition} />;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Security: Validate file type and size (Max 5MB)
        if (!file.type.startsWith('image/')) return toast.error("Please upload a valid image file.");
        if (file.size > 5 * 1024 * 1024) return toast.error("Image size must be less than 5MB.");
        
        setFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues.email.trim())) return toast.error("Invalid email format."), false;
        if (formValues.password.length < 8) return toast.error("Password must be at least 8 characters."), false;
        if (formValues.contactNumber.trim().length < 9) return toast.error("Please enter a valid contact number."), false;
        if (!isMapClicked) return toast.error("Please click on the map to pin the exact location."), false;
        if (formValues.payoutAccountType === 'Personal' && !formValues.payoutHolderName.trim()) return toast.error("Account holder name is strictly required."), false;
        if (!image || !certificate) return toast.error("Both Pharmacy Logo and License Certificate are required."), false;
        return true;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const formData = new FormData();
            Object.keys(formValues).forEach(key => formData.append(key, formValues[key].trim()));
            formData.append('lat', mapPosition.lat);
            formData.append('lng', mapPosition.lng);
            formData.append('image', image);
            formData.append('certificate', certificate);

            const success = await addPharmacy(formData);
            if (success) {
                toast.success("Pharmacy registered successfully!");
                setFormValues({
                    name: '', email: '', password: '', about: '', contactNumber: '',
                    pharmacistName: '', ceoName: '', holderNumber: '', locationText: '',
                    payoutMethod: 'EVC Plus', payoutAccountType: 'Merchant', payoutAccountNumber: '', payoutHolderName: ''
                });
                setImage(null); setImagePreview(null);
                setCertificate(null); setCertificatePreview(null);
                setIsMapClicked(false);
            }
        } catch (error) {
            toast.error("An error occurred during registration. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 font-sans text-sm selection:bg-blue-100">
            <div className="max-w-5xl mx-auto">
                
                {/* HEADER */}
                <div className="mb-6 text-left">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Register New Pharmacy</h2>
                    <p className="text-slate-500 text-xs mt-1">Complete the form below systematically to onboard a new pharmacy.</p>
                </div>

                <form onSubmit={onSubmitHandler} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="p-5 sm:p-8 space-y-7">
                        
                        {/* 📁 1. DOCUMENTS (Compact Upload UI) */}
                        <section>
                            <SectionHeader step="1" title="Documents & Media" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FileUploadBox 
                                    label="Pharmacy Logo *" 
                                    preview={imagePreview} 
                                    onChange={(e) => handleFileChange(e, setImage, setImagePreview)} 
                                    required={!image} 
                                />
                                <FileUploadBox 
                                    label="License / Certificate *" 
                                    preview={certificatePreview} 
                                    onChange={(e) => handleFileChange(e, setCertificate, setCertificatePreview)} 
                                    required={!certificate} 
                                />
                            </div>
                        </section>

                        <hr className="border-slate-100" />

                        {/* 🏢 2. BASIC INFO (Compact Grid) */}
                        <section>
                            <SectionHeader step="2" title="Pharmacy & Management Details" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
                                <InputField label="Pharmacy Name" name="name" value={formValues.name} onChange={handleChange} placeholder="e.g. HealthCare Pharmacy" />
                                <InputField label="Pharmacist in Charge" name="pharmacistName" value={formValues.pharmacistName} onChange={handleChange} placeholder="Dr. Full Name" />
                                <InputField label="CEO / Owner Name" name="ceoName" value={formValues.ceoName} onChange={handleChange} placeholder="Owner's Full Name" />
                                <InputField label="Official Holder ID" name="holderNumber" value={formValues.holderNumber} onChange={handleChange} placeholder="License / ID Number" />
                                <InputField label="Email Address" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="contact@pharmacy.com" />
                                <InputField label="Secure Password" name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Min 8 characters" />
                            </div>
                        </section>

                        <hr className="border-slate-100" />

                        {/* 📍 3. LOCATION & MAP */}
                        <section>
                            <SectionHeader step="3" title="Location & Contact" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4 mb-4">
                                <InputField label="Contact Number" name="contactNumber" value={formValues.contactNumber} onChange={handleChange} placeholder="+252 61X XXX XXX" />
                                <div className="md:col-span-2">
                                    <InputField label="Physical Address" name="locationText" value={formValues.locationText} onChange={handleChange} placeholder="e.g. jigjiga yar hargaisa" />
                                </div>
                            </div>

                            {/* Map Container */}
                            <div className="w-full relative mt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pin Exact Location (Click on Map) <span className="text-red-500">*</span></label>
                                    
                                    {/* Map Toggle Switch */}
                                    <div className="bg-slate-100 p-1 rounded-lg flex gap-1 text-[10px] shadow-inner border border-slate-200">
                                        <button type="button" onClick={() => setMapType('streets')} className={`px-3 py-1 rounded-md font-semibold transition-all ${mapType === 'streets' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Map View</button>
                                        <button type="button" onClick={() => setMapType('satellite')} className={`px-3 py-1 rounded-md font-semibold transition-all ${mapType === 'satellite' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Satellite View</button>
                                    </div>
                                </div>
                                <div className={`h-[300px] w-full rounded-xl overflow-hidden border-2 z-0 relative transition-colors duration-300 ${isMapClicked ? 'border-emerald-500 shadow-emerald-500/20' : 'border-slate-200'}`}>
                                    <MapContainer center={[mapPosition.lat, mapPosition.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                                        <MapRefresher />
                                        {mapType === 'streets' ? (
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                        ) : (
                                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Tiles &copy; Esri &mdash; Satellite' />
                                        )}
                                        <LocationPicker />
                                    </MapContainer>
                                </div>
                                {!isMapClicked && <p className="text-[11px] text-amber-600 mt-2 font-medium flex items-center gap-1">⚠️ Form submission is disabled until a precise location is pinned.</p>}
                            </div>
                        </section>

                        <hr className="border-slate-100" />

                        {/* 🏦 4. PAYOUT CONFIGURATION */}
                        <section>
                            <SectionHeader step="4" title="Payout Configuration" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Method</label>
                                    <select name="payoutMethod" value={formValues.payoutMethod} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-medium text-slate-700 transition-all cursor-pointer">
                                        <option value="EVC Plus">EVC Plus</option>
                                        <option value="Zaad">Zaad Service</option>
                                        <option value="eDahab">eDahab</option>
                                        <option value="Mastercard">Bank Account</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Account Type</label>
                                    <select name="payoutAccountType" value={formValues.payoutAccountType} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-medium text-slate-700 transition-all cursor-pointer">
                                        <option value="Merchant">Merchant Code</option>
                                        <option value="Personal">Personal Number</option>
                                    </select>
                                </div>
                                <InputField label={formValues.payoutAccountType === 'Merchant' ? "Merchant Code" : "Account Number"} name="payoutAccountNumber" value={formValues.payoutAccountNumber} onChange={handleChange} placeholder="e.g. 612345" />
                                {formValues.payoutAccountType === 'Personal' ? (
                                    <InputField label="Account Holder Name" name="payoutHolderName" value={formValues.payoutHolderName} onChange={handleChange} placeholder="Registered SIM Name" required={true} />
                                ) : <div className="hidden md:block"></div>}
                            </div>
                        </section>

                        <hr className="border-slate-100" />

                        {/* 📝 5. ABOUT */}
                        <section>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">About Pharmacy & Services <span className="text-red-500">*</span></label>
                            <textarea name="about" value={formValues.about} onChange={handleChange} className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 min-h-[80px] max-h-[120px] text-sm transition-all resize-y" placeholder="Briefly describe the pharmacy's specialized services, operating hours, etc..." required></textarea>
                        </section>

                    </div>

                    {/* ✅ FOOTER SUBMIT */}
                    <div className="bg-slate-50 p-4 sm:px-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 font-medium text-xs">Please review all details before completing registration.</p>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full sm:w-auto px-6 py-2.5 text-white font-bold rounded-xl text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20'}`}
                        >
                            {isLoading ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</>
                            ) : "Complete Registration"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

/* 🧩 REUSABLE MICRO-COMPONENTS */
const SectionHeader = ({ step, title }) => (
    <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-black shadow-sm">{step}</span>
        {title}
    </h3>
);

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = true }) => (
    <div className="w-full">
        <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type} name={name} value={value} onChange={onChange} 
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 text-sm transition-all" 
            placeholder={placeholder} required={required} 
        />
    </div>
);

const FileUploadBox = ({ label, preview, onChange, required }) => (
    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex items-center gap-4">
        <div className="w-14 h-14 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm text-[10px]">
            {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-slate-400 font-medium">No File</span>}
        </div>
        <div className="w-full flex flex-col justify-center">
            <label className="block text-xs font-bold text-slate-700 mb-1 truncate">{label}</label>
            <input 
                type="file" accept="image/*" onChange={onChange} required={required}
                className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 file:font-semibold file:cursor-pointer hover:file:bg-blue-200 transition-all cursor-pointer outline-none" 
            />
        </div>
    </div>
);

export default AddPharmacy;