import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");

  const [appointments, setAppointments] = useState([]);

  const [dashData, setDashData] = useState(false);

  const [profileData, setProfileData] = useState(false);


  useEffect(() => {
    if (dToken) {
      localStorage.setItem("dToken", dToken);
    } else {
      localStorage.removeItem("dToken");
    }
  }, [dToken]);


  // ---------------- GET APPOINTMENTS ----------------
  const getAppointments = async () => {

    if (!dToken) return;

    try {

      const { data } = await axios.get(
        `${backendUrl}/api/doctor/appointments`,
        {
          headers: { Authorization: `Bearer ${dToken}` }
        }
      );

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  // ---------------- COMPLETE APPOINTMENT ----------------
  const completeAppointments = async (appointmentId) => {

    try {

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/appointment-complete`,
        { appointmentId },
        {
          headers: { Authorization: `Bearer ${dToken}` }
        }
      );

      if (data.success) {

        toast.success(data.message);

        setAppointments(prev =>
          prev.map(app =>
            app._id === appointmentId
              ? { ...app, isCompleted: true }
              : app
          )
        );

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  // ---------------- CANCEL APPOINTMENT ----------------
  const cancelAppointments = async (appointmentId) => {

    try {

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId },
        {
          headers: { Authorization: `Bearer ${dToken}` }
        }
      );

      if (data.success) {

        toast.success(data.message);
        getAppointments();

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  // ---------------- DASHBOARD DATA ----------------
  const getDashData = async () => {

    try {

      const { data } = await axios.get(
        `${backendUrl}/api/doctor/dashboard`,
        {
          headers: { Authorization: `Bearer ${dToken}` }
        }
      );

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  // ---------------- GET DOCTOR PROFILE ----------------
  const getProfileData = async () => {

    try {

      const { data } = await axios.get(
        `${backendUrl}/api/doctor/profile`,
        {
          headers: { Authorization: `Bearer ${dToken}` }
        }
      );

      if (data.success) {
        setProfileData(data.profileData);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  // ---------------- UPDATE PROFILE ----------------
  const updateProfileData = async (updatedData) => {

    try {

      const { data } = await axios.put(
        `${backendUrl}/api/doctor/update-profile`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${dToken}` }
        }
      );

      if (data.success) {

        toast.success(data.message);
        setProfileData(data.doctor);

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  const value = {
    dToken,
    setDToken,

    backendUrl,

    appointments,
    getAppointments,
    completeAppointments,
    cancelAppointments,

    dashData,
    setDashData,
    getDashData,

    profileData,
    getProfileData,
    updateProfileData
  };


  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;