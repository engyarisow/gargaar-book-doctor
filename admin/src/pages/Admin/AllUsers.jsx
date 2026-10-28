import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FiMail, FiCalendar, FiCopy, FiCheck, FiSearch } from 'react-icons/fi';

const AllUsers = () => {
    const { atoken, users, getAllUsers } = useContext(AdminContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        if (atoken) {
            getAllUsers();
        }
    }, [atoken, getAllUsers]);

    // Handle copying user ID
    const handleCopyId = (id, e) => {
        e.stopPropagation();
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter users based on search input (Name, Email, or last 4 characters of ID)
    const filteredUsers = users ? users.filter(user => {
        const userId = user._id || user.id || '';
        const lastFourId = userId.slice(-4).toLowerCase();
        const query = searchQuery.trim().toLowerCase();

        return (
            (user.name && user.name.toLowerCase().includes(query)) ||
            (user.email && user.email.toLowerCase().includes(query)) ||
            (lastFourId && lastFourId.includes(query))
        );
    }) : [];

    // This function ensures a "Good Design" by assigning 
    // different professional gradients based on the user's name.
    const getAvatarGradient = (name) => {
        const gradients = [
            'from-blue-500 to-indigo-600',
            'from-emerald-500 to-teal-600',
            'from-violet-500 to-purple-600',
            'from-rose-500 to-pink-600',
            'from-amber-500 to-orange-600',
            'from-cyan-500 to-blue-600'
        ];
        // Automatically pick a color based on the name's first letter
        const charCode = name ? name.charCodeAt(0) : 0;
        return gradients[charCode % gradients.length];
    };

    return (
        <div className='m-4 max-h-[85vh] overflow-y-auto no-scrollbar'>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4'>
                <div>
                    <h1 className='text-lg font-bold text-gray-800 tracking-tight'>All Registered Users</h1>
                    <p className='text-xs text-gray-400'>Search by name, email, or last 4 digits of ID</p>
                </div>
                
                <div className='flex items-center gap-3 w-full sm:w-auto'>
                    {/* Search Input Bar */}
                    <div className='relative flex-1 sm:w-72'>
                        <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5' />
                        <input 
                            type='text'
                            placeholder='Search name, email, or last 4 ID...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm'
                        />
                    </div>

                    {/* Modern Badge for User Count */}
                    <span className='bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-3 py-1.5 rounded-full shrink-0'>
                        {filteredUsers.length} Users
                    </span>
                </div>
            </div>
            
            <div className='bg-white border border-gray-100 rounded-xl shadow-sm'>
                {/* Compact Table Header */}
                <div className='hidden sm:grid grid-cols-[0.5fr_2.5fr_2fr_1fr] py-3 px-5 bg-gray-50/80 border-b border-gray-100 text-[11px] uppercase tracking-wider font-semibold text-gray-500 rounded-t-xl'>
                    <p>#</p>
                    <p>User Profile</p>
                    <p>Email Address</p>
                    <p>Joined Date</p>
                </div>

                {/* Users List */}
                {filteredUsers && filteredUsers.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {filteredUsers.map((item, index) => {
                            const userId = item._id || item.id;
                            return (
                                <div 
                                    key={userId || index} 
                                    className='grid grid-cols-[1fr_2fr] sm:grid-cols-[0.5fr_2.5fr_2fr_1fr] items-center py-2.5 px-5 hover:bg-gray-50/50 transition-colors gap-y-3 sm:gap-0'
                                >
                                    <p className='hidden sm:block text-xs text-gray-400 font-medium'>
                                        {index + 1}
                                    </p>
                                    
                                    {/* Profile Section */}
                                    <div className='flex items-center gap-3'>
                                        {/* STRICTOR IMAGE CHECK */}
                                        {item.image && item.image.length > 5 ? (
                                            <img 
                                                src={item.image} 
                                                alt={item.name || 'User'} 
                                                className='w-9 h-9 min-w-[36px] rounded-full object-cover border border-gray-100 shadow-sm' 
                                            />
                                        ) : (
                                            /* AUTOMATED LUXURY AVATAR: Smaller & Sleeker */
                                            <div className={`w-9 h-9 min-w-[36px] rounded-full bg-gradient-to-br ${getAvatarGradient(item.name)} flex items-center justify-center text-white font-semibold text-sm uppercase shadow-sm`}>
                                                {item.name ? item.name.trim().charAt(0) : 'U'}
                                            </div>
                                        )}
                                        
                                        <div className='flex flex-col'>
                                            <div className='flex items-center gap-2'>
                                                <p className='font-semibold text-gray-800 capitalize text-sm leading-tight'>{item.name}</p>
                                                
                                                {/* Click-to-Copy ID Badge */}
                                                {userId && (
                                                    <button 
                                                        onClick={(e) => handleCopyId(userId, e)}
                                                        title="Click to copy ID"
                                                        className='inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] text-gray-500 px-1.5 py-0.5 rounded transition-all group'
                                                    >
                                                        <span className='font-mono'>ID</span>
                                                        {copiedId === userId ? (
                                                            <FiCheck className='w-2.5 h-2.5 text-emerald-600' />
                                                        ) : (
                                                            <FiCopy className='w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600' />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            <p className='text-[9px] text-gray-400 font-medium tracking-wider uppercase sm:hidden mt-0.5'>Admin Verified</p>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <FiMail className='text-gray-400 sm:hidden w-3.5 h-3.5' />
                                        <p className='text-xs text-gray-600 truncate'>{item.email}</p>
                                    </div>

                                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                                        <FiCalendar className='sm:hidden w-3.5 h-3.5' />
                                        <p className='font-medium'>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '12/4/2026'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className='p-12 text-center text-gray-400'>
                        <p className="text-sm font-medium">No users found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllUsers;