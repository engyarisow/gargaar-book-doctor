import React, { useEffect } from 'react';
import ReactGA from "react-ga4";
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Myprofile from './pages/Myprofile';
import MyAppointments from './pages/MyAppointments';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Appointments from './pages/Appointments';
import { ToastContainer } from 'react-toastify';
import Post from './pages/Post';
import HospitalDetails from './pages/HospitalDetails'
import MyConsultations from './pages/MyConsultations'
import VideoCall from './pages/VideoCall';
import PatientChatPage from './pages/PatientChatPage';
import VerifyOTP from './pages/VerifyOTP'
import ResetPassword from './pages/ResetPassword'
import VerifyPayment  from './pages/VerifyPayment'
import AllMessagesPage from './pages/AllMessagesPage';
import PharmacyMarketplace from './pages/PharmacyMarketplace';
import PlaceOrder from './pages/PlaceOrder';
import VerifyOrder from './pages/VerifyOrder';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
// 1. Initialize GA4 (Gali ID-gaaga saxda ah halka X-yadu ku jiraan)
ReactGA.initialize("G-PYD6KC6XWH");

const App = () => {
  const location = useLocation();

  // 2. Track page views mar kasta oo URL-ku isbeddelo
  useEffect(() => {
    ReactGA.send({ 
      hitType: "pageview", 
      page: location.pathname + location.search 
    });
  }, [location]);

  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/my-profile' element={<Myprofile />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path="/messages" element={<AllMessagesPage />} />
        <Route path='/appointments/:docId' element={<Appointments />} />
        <Route path="/posts" element={<Post />} />
        {/* Waddada cusub ee la-tashiyada Online-ka */}
     <Route path='/my-consultations' element={<MyConsultations />} />
      <Route path='/video-call/:consultationId' element={<VideoCall />} />
      <Route path='/chat/:consultationId' element={<PatientChatPage />} />
      <Route path='/pharmacy' element={<PharmacyMarketplace />}/>
      
      

        {/* HOSPITAL DETAILS ROUTE */}
        <Route path='/hospital-details/:hospitalId' element={<HospitalDetails />} />
        
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path="/verify-payment" element={<VerifyPayment />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/verify-order" element={<VerifyOrder />} />
        <Route path="/cart" element={<Cart />} />
         <Route path="/my-orders" element={<MyOrders />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;