import React, { useContext } from 'react';
import { Package, Activity, DollarSign, Clock } from 'lucide-react';
import { PharmacyContext } from '../../context/PharmacyContext';

const PharmacyDashboard = () => {
    const { dashData, orders } = useContext(PharmacyContext);

    const stats = [
        {
            title: 'Total Orders',
            value: dashData?.totalOrders || 0,
            icon: Package,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            title: 'Pending Orders',
            value: dashData?.pendingOrders || 0,
            icon: Clock,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
        },
        {
            title: 'Completed',
            value: dashData?.completedOrders || 0,
            icon: Activity,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
        },
        {
            title: 'Total Revenue',
            value: `$${Number(dashData?.totalRevenue || 0).toFixed(2)}`,
            icon: DollarSign,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ];

    const recentOrders = orders?.slice(0, 5) || [];

    // Same logic used in PharmacyOrders
    const displayAddress = (addressObj) => {
        if (!addressObj) return 'Address not available';

        if (addressObj.location) return addressObj.location;

        const street =
            addressObj.street ||
            addressObj.line1 ||
            addressObj.address ||
            '';

        const city =
            addressObj.city ||
            addressObj.state ||
            '';

        const country = addressObj.country || '';

        return `${street ? street + ', ' : ''}${city}${country ? ', ' + country : ''}`.trim() || 'Address not available';
    };

    return (
        <div className="p-4 sm:p-8 w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-slate-800">
                    Pharmacy Dashboard
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                    Welcome back! Here is your pharmacy overview.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow"
                    >
                        <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}
                        >
                            <stat.icon size={24} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-500">
                                {stat.title}
                            </p>

                            <h3 className="text-2xl font-bold text-slate-800">
                                {stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">
                        Recent Orders
                    </h3>

                    <button className="text-sm text-blue-600 font-semibold hover:underline">
                        View All
                    </button>
                </div>

                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-sm font-semibold text-slate-600">
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Patient & Contact</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Medications</th>
                                    <th className="px-6 py-4">Description / Note</th>
                                    <th className="px-6 py-4">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="border-t border-slate-100 hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-semibold">
                                                {order.userId?.name || "Unknown"}
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                {order.userId?.email || "-"}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="max-w-[180px] whitespace-normal text-xs text-slate-600">
                                                {displayAddress(order.address)}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {order.items?.map((item, index) => (
                                                    <p
                                                        key={index}
                                                        className="text-sm"
                                                    >
                                                        {item.name} × {item.quantity}
                                                    </p>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="max-w-[250px] whitespace-normal text-xs text-slate-600">
                                                {order.address?.notes ||
                                                    order.address?.note ||
                                                    order.note ||
                                                    order.description ||
                                                    "Faahfaahin dheeri ah laguma soo darin dalabkan."}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-bold text-green-600">
                                            ${Number(order.totalAmount || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-500 py-10">
                        <Package
                            className="mx-auto mb-3 text-slate-300"
                            size={40}
                        />
                        <p>No recent orders found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyDashboard;