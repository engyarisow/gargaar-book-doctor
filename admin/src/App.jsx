import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Contexts
import { AdminContext } from './context/AdminContext'
import { DoctorContext } from './context/DoctorContext'
import { HospitalContext } from './context/HospitalContext'
import { PharmacyContext } from './context/PharmacyContext' // ➕ KU DAR KAN

// Components & Guard
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { AdminRoute, DoctorRoute, HospitalRoute, PharmacyRoute } from './components/ProtectedRoute' // ➕ KU DAR PharmacyRoute

// Pages
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import VerifyOTP from './pages/VerifyOTP';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard'
import AllAppointments from './pages/Admin/AllAppointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import Appeals from './pages/Admin/Appeals'
import AllUsers from './pages/Admin/AllUsers'
import AddHospital from './pages/Admin/AddHospital'
import HospitalList from './pages/Admin/HospitalList'
import Addpharmacy from './pages/Admin/AddPharmacy'
import PharmacyList from './pages/Admin/PharmacyList';
import DoctorRequests from './pages/Admin/DoctorRequests'
import AllConsultations from './pages/Admin/AllConsultations'
import PharmacyOrdersList from './pages/Admin/PharmacyOrdersList'
import Report from './pages/Admin/Report'

// Admin Pages (ku dar halkan)
import AdminPayouts from './pages/Admin/AdminPayouts'

// Doctor Pages
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import DoctorAddPost from './pages/Doctor/DoctorAddPost'
import DoctorPosts from './pages/Doctor/DoctorPosts'
import DoctorConsultations from './pages/Doctor/DoctorConsultations'
import VideoCall from './pages/Doctor/VideoCall';
import DoctorChatPage from './pages/Doctor/DoctorChatPage';

// Hospital Pages
import HospitalDashboard from './pages/Hospital/HospitalDashboard'
import HospitalAddDoctor from './pages/Hospital/AddDoctor'
import HosDoctorsList from './pages/Hospital/DoctorsList'
import HospitalAllAppointments from './pages/Hospital/HospitalAllAppointments'
import HospitalConsultations from './pages/Hospital/HospitalConsultations'

// 💊 Pharmacy Pages 
import PharmacyDashboard from './pages/Pharmacy/PharmacyDashboard'
import PharmacyOrders from './pages/Pharmacy/PharmacyOrders'
import PharmacyProfile from './pages/Pharmacy/PharmacyProfile' 
import AddProduct from './pages/Pharmacy/AddProduct'
import ProductList from './pages/Pharmacy/ProductList'
import Invoice from './pages/Pharmacy/Invoice'
import OutOfStock from './pages/Pharmacy/OutOfStock'
import PharmacyWallet from './pages/Pharmacy/PharmacyWallet'
import ExpiredMedicines from './pages/Pharmacy/ExpiredMedicines'
import EditProduct from './pages/Pharmacy/EditProduct';

const App = () => {
  const { atoken } = useContext(AdminContext) || {}
  const { dToken } = useContext(DoctorContext) || {}
  const { hToken } = useContext(HospitalContext) || {}
  const { pToken } = useContext(PharmacyContext) || {} // ➕ KU DAR KAN

  // Hubinta in qof uun uu nidaamka ku jiro (Logged in)
  const isAuthenticated = !!atoken || !!dToken || !!hToken || !!pToken // ➕ pToken ku dar

  return (
    <div className="bg-[#F8F9FD] min-h-screen text-left">
      <ToastContainer />

      {isAuthenticated ? (
        <>
          <Navbar />
          <div className="flex items-start">
            <Sidebar />
            <div className="flex-1 p-4">
              <Routes>
                {/* 1. DEFAULT REDIRECTION BASED ON ROLE */}
                <Route path="/" element={
                  atoken ? <Navigate to="/admin-dashboard" /> :
                    dToken ? <Navigate to="/doctor-dashboard" /> :
                      hToken ? <Navigate to="/hospital-dashboard" /> :
                        pToken ? <Navigate to="/pharmacy-dashboard" /> : // ➕ Halkan ku dar
                          <Navigate to="/login" />
                } />

                {/* 2. ADMIN ONLY ROUTES */}
                <Route path="/admin-dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/all-appointments" element={<AdminRoute><AllAppointments /></AdminRoute>} />
               
                {/* 🛠️ FIXED: Changed path from /pharmacy-orders to /admin-pharmacy-orders */}
                <Route path="/admin-pharmacy-orders" element={<AdminRoute><PharmacyOrdersList /></AdminRoute>} />
                <Route path="/admin-reports" element={<AdminRoute><Report /></AdminRoute>} />
                
                <Route path="/add-doctor" element={<AdminRoute><AddDoctor /></AdminRoute>} />
                <Route path="/doctor-list" element={<AdminRoute><DoctorsList /></AdminRoute>} />
                <Route path="/appeals" element={<AdminRoute><Appeals /></AdminRoute>} />
                <Route path="/users-list" element={<AdminRoute><AllUsers /></AdminRoute>} />
                <Route path='/add-hospital' element={<AdminRoute><AddHospital /></AdminRoute>} />
                <Route path='/hospital-list' element={<AdminRoute><HospitalList /></AdminRoute>} />
                <Route path='/Add-pharmacy' element={<AdminRoute><Addpharmacy /></AdminRoute>} />
                <Route path='/pharmacy-list' element={<AdminRoute><PharmacyList /></AdminRoute>} />
                <Route path="/doctor-requests" element={<AdminRoute><DoctorRequests /></AdminRoute>} />
                <Route path="/all-consultations" element={<AdminRoute><AllConsultations /></AdminRoute>} />
                <Route path="/admin-payouts" element={<AdminRoute><AdminPayouts /></AdminRoute>} />

                {/* 3. DOCTOR ONLY ROUTES */}
                <Route path="/doctor-dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
                <Route path="/doctor-appointments" element={<DoctorRoute><DoctorAppointments /></DoctorRoute>} />
                <Route path="/doctor-profile" element={<DoctorRoute><DoctorProfile /></DoctorRoute>} />
                <Route path="/doctor-add-post" element={<DoctorRoute><DoctorAddPost /></DoctorRoute>} />
                <Route path="/doctor-posts" element={<DoctorRoute><DoctorPosts /></DoctorRoute>} />
                <Route path="/doctor-consultations" element={<DoctorRoute><DoctorConsultations /></DoctorRoute>} />
                <Route path='/video-call/:consultationId' element={<DoctorRoute><VideoCall /></DoctorRoute>} />
                <Route path='/doctor/chat/:consultationId' element={<DoctorRoute><DoctorChatPage /></DoctorRoute>} />
                
                {/* 4. HOSPITAL ONLY ROUTES */}
                <Route path="/hospital-dashboard" element={<HospitalRoute><HospitalDashboard /></HospitalRoute>} />
                <Route path="/hos-addDoctor" element={<HospitalRoute><HospitalAddDoctor /></HospitalRoute>} />
                <Route path="/hos-doctor-list" element={<HospitalRoute><HosDoctorsList /></HospitalRoute>} />
                <Route path="/hos-allAppointments" element={<HospitalRoute><HospitalAllAppointments /></HospitalRoute>} />
                <Route path="/hospital-consultations" element={<HospitalRoute> <HospitalConsultations /> </HospitalRoute>} />

                {/* 5. PHARMACY ONLY ROUTES */}
                <Route path="/pharmacy-dashboard" element={<PharmacyRoute><PharmacyDashboard /></PharmacyRoute>} />
                
                {/* ✅ The Pharmacy route can now safely use /pharmacy-orders without conflict */}
                <Route path="/pharmacy-orders" element={<PharmacyRoute><PharmacyOrders /></PharmacyRoute>} />
                
                <Route path="/pharmacy-profile" element={<PharmacyRoute><PharmacyProfile /></PharmacyRoute>} />
                <Route path="/pharmacy-add-product" element={<PharmacyRoute><AddProduct /></PharmacyRoute>} />
                <Route path="/pharmacy-product-list" element={<PharmacyRoute><ProductList /></PharmacyRoute>} />
                <Route path="/pharmacy-invoice" element={<PharmacyRoute><Invoice /></PharmacyRoute>} />
                <Route path="/OutOfStock" element={<PharmacyRoute><OutOfStock /></PharmacyRoute>} /> 
                <Route path="/pharmacy-wallet" element={<PharmacyRoute><PharmacyWallet /></PharmacyRoute>} />
                <Route path="/Expired" element={<PharmacyRoute><ExpiredMedicines /></PharmacyRoute>} />
                <Route path="/pharmacy-edit-product/:id" element={<PharmacyRoute><EditProduct /></PharmacyRoute>} />

                {/* Fallback for Logged-in users */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        /* --- PUBLIC ROUTES (No Login Required) --- */
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          {/* Haddii URL kale la qoro isagoon login ahayn, u celi Login-ka */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  )
}

export default App