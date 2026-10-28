import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { HospitalContext } from '../context/HospitalContext';
import { PharmacyContext } from '../context/PharmacyContext';
import { NavLink } from 'react-router-dom';

// Modern Icons from Lucide-React
import { 
    LayoutDashboard, CalendarCheck, Video, Wallet, 
    UserPlus, Stethoscope, PlusSquare, Building2, 
    PlusCircle, Store, Users, FileWarning, Bell, 
    Files, FilePlus, User, ShoppingCart, History, 
    PackagePlus, PackageSearch 
} from 'lucide-react';

const Sidebar = () => {
    const { atoken } = useContext(AdminContext);
    const { dToken } = useContext(DoctorContext);
    const { hToken } = useContext(HospitalContext);
    const { pToken } = useContext(PharmacyContext);

    // Responsive Style: Blue theme, centered on mobile, aligned left on desktop
    const navLinkStyle = (isActive) =>
        `flex items-center justify-center md:justify-start gap-4 py-3.5 px-3 mx-2 my-1 rounded-xl transition-all duration-300 ease-in-out group ${
            isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
        }`;

    const adminLinks = [
        { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/all-appointments', icon: CalendarCheck, label: 'Appointments' },
        { to: '/all-consultations', icon: Video, label: 'Video Consultations' },
         { to: '/admin-pharmacy-orders', icon: Bell, label: 'All Orders' },
        { to: '/admin-payouts', icon: Wallet, label: 'Payouts & Transfers' },
        { to: '/add-doctor', icon: UserPlus, label: 'Add Doctor' },
        { to: '/doctor-list', icon: Stethoscope, label: 'Doctor List' },
        { to: '/add-hospital', icon: PlusSquare, label: 'Add Hospital' },
        { to: '/hospital-list', icon: Building2, label: 'Hospital List' },
        { to: '/Add-pharmacy', icon: PlusCircle, label: 'Add Pharmacy' },
        { to: '/pharmacy-list', icon: Store, label: 'Pharmacy list' },
        { to: '/users-list', icon: Users, label: 'Patients' },
        { to: '/appeals', icon: FileWarning, label: 'Doctor Appeals' },
        { to: '/doctor-requests', icon: Bell, label: 'New Requests' },
        { to: '/admin-reports', icon: Bell, label:  'Report' },
         
    ];
   

    const doctorLinks = [
        { to: '/doctor-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/doctor-appointments', icon: CalendarCheck, label: 'Appointments' },
        { to: '/doctor-consultations', icon: Video, label: 'Video Consultations' },
        { to: '/doctor-posts', icon: Files, label: 'Manage Posts' },
        { to: '/doctor-add-post', icon: FilePlus, label: 'Add Post' },
        { to: '/doctor-profile', icon: User, label: 'Profile' },
    ];

    const hospitalLinks = [
        { to: '/hospital-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/hos-addDoctor', icon: UserPlus, label: 'Add Doctor' },
        { to: '/hos-doctor-list', icon: Users, label: 'Doctors List' },
        { to: '/hos-allAppointments', icon: CalendarCheck, label: 'All Appointments' },
        { to: '/hospital-consultations', icon: Video, label: 'Video Consultations' },
    ];

    // Added Pharmacy Links 💊
    const pharmacyLinks = [
        { to: '/pharmacy-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/pharmacy-orders', icon: ShoppingCart, label: 'New Orders' },
        { to: '/OutOfStock', icon: History, label: 'OutOfStock' },
        { to: '/Expired', icon: History, label: 'Expire' },
        { to: '/pharmacy-add-product', icon: PackagePlus, label: 'Add Product' },
        { to: '/pharmacy-product-list', icon: PackageSearch, label: 'Product List' },
        { to: '/pharmacy-wallet', icon: Wallet, label: 'Wallet & Payouts' },
        { to: '/pharmacy-profile', icon: User, label: 'Profile' },
    ];

    const renderLinks = (links) =>
        links.map((link) => {
            const Icon = link.icon; // Get the Lucide component dynamically
            return (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => navLinkStyle(isActive)}>
                    {({ isActive }) => (
                        <>
                            <Icon 
                                size={20} 
                                className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-110' : 'opacity-70'}`} 
                            />
                            <p className="hidden md:block font-medium tracking-wide text-[13px]">{link.label}</p>
                        </>
                    )}
                </NavLink>
            );
        });

    return (
        <div className="h-screen sticky top-0 w-20 md:w-72 bg-blue-950 border-r border-blue-900 flex flex-col transition-all duration-300 overflow-hidden shadow-2xl">
            
            {/* Header/Panel Branding */}
            <div className="pt-8 px-6 mb-6">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                    <span className="hidden md:block text-[11px] font-bold text-blue-300 uppercase tracking-[0.2em]">
                        {atoken ? 'Admin Panel' : hToken ? 'Hospital Portal' : pToken ? 'Pharmacy Portal' : 'Doctor Portal'}
                    </span>
                </div>
            </div>

            {/* Scrollable Navigation */}
            <div className="flex-1 overflow-hidden">
                <nav className="h-full flex flex-col gap-1 px-2 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {atoken ? renderLinks(adminLinks) :
                     dToken ? renderLinks(doctorLinks) :
                     hToken ? renderLinks(hospitalLinks) :
                     pToken ? renderLinks(pharmacyLinks) : null}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-6 text-center hidden md:block bg-blue-950/80 border-t border-blue-900/50 mt-auto">
                <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">Gargaar V2.0</p>
            </div>
        </div>
    );
};

export default Sidebar;