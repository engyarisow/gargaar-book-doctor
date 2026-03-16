import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {

  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") || false
  );
  const [userData, setUserData] = useState(false);

 
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/list`
      );

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (backendUrl) {
      getDoctorsData();
    }
  }, [backendUrl]);

const loadUserProfileData = async () => {
  try {
    if (!token) return

    const { data } = await axios.get(
      `${backendUrl}/api/user/get-profile`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (data.success) {
      setUserData(data.user)
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    console.log(error)
    toast.error(error.response?.data?.message || error.message)
  }
}
const updateUserProfile = async (formData) => {
  try {
    const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (data.success) {
      toast.success(data.message);
      loadUserProfileData(); // refresh userData
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

 
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadUserProfileData();
    } else {
      localStorage.removeItem("token");
      setUserData(false);
    }
  }, [token]);

  const value = {
    doctors,getDoctorsData,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;