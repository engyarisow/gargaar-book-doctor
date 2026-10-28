import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { HospitalContext } from '../context/HospitalContext';
import { PharmacyContext } from '../context/PharmacyContext'; // Import this
import { useNavigate } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const { atoken, setAToken } = useContext(AdminContext);
    const { dToken, setDToken } = useContext(DoctorContext);
    const { hToken, setHToken } = useContext(HospitalContext);
    const { pToken, setPToken } = useContext(PharmacyContext); // Use this

    const logout = () => {
        setAToken(''); setDToken(''); setHToken(''); setPToken('');
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="flex justify-between items-center px-4 sm:px-10 py-4 bg-white border-b shadow-sm sticky top-0 z-40">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <HeartHandshake size={22} />
                </div>
                <h1 className="text-xl font-bold text-blue-600">Gargaar</h1>
            </div>
            {(atoken || dToken || hToken || pToken) && (
                <button onClick={logout} className="bg-blue-600 text-white px-7 py-2.5 rounded-xl text-sm font-bold">
                    Logout
                </button>
            )}
        </div>
    );
};

export default Navbar;