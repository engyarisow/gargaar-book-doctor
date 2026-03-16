import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {

  const [atoken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Get all doctors
  const getAllDoctors = async () => {
    try {
      if (!atoken) return;

      const { data } = await axios.post(
        `${backendUrl}/api/admin/all-doctors`,
        {},
        {
          headers: {
            Authorization: `Bearer ${atoken}`,
          },
        }
      );

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Change doctor availability
  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        { docId },
        {
          headers: {
            Authorization: `Bearer ${atoken}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Get all appointments
  const getAllAppointments = async () => {
    try {

      const { data } = await axios.get(
        backendUrl + "/api/admin/appointments",
        {
          headers: {
            Authorization: `Bearer ${atoken}`,
          },
        }
      );

      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {

      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${atoken}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  // Dashboard data
  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${atoken}`,
          },
        }
      );

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    atoken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    getAllAppointments,
    appointments,
    cancelAppointment,
    dashData,
    getDashData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;