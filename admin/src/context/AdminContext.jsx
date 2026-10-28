import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [atoken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState({});
  const [appeals, setAppeals] = useState([]); 
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacyOrders, setPharmacyOrders] = useState([]);
  const [systemReportData, setSystemReportData] = useState(null);
  
  // XALKA CILADDA: Halkan waxaan ku darnay isReportLoading
  const [isReportLoading, setIsReportLoading] = useState(false);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ================= GET ALL DOCTORS =================
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

  // ================= CHANGE AVAILABILITY =================
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

  // ================= APPOINTMENTS =================
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/appointments`,
        {
          headers: {
            Authorization: `Bearer ${atoken}`,
          },
        }
      );

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
        const { data } = await axios.post(
            backendUrl + '/api/admin/complete-appointment', 
            { appointmentId }, 
            { 
                headers: {
                    Authorization: `Bearer ${atoken}`,
                }
            }
        );

        if (data.success) {
            toast.success(data.message);
            getAllAppointments(); 
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }
  };

  // ================= CANCEL APPOINTMENT =================
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/cancel-appointment`,
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

  // ================= DASHBOARD =================
  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/dashboard`,
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

  // ================= BLOCK DOCTOR =================
  const blockDoctor = async (docId) => {
    try {
      const reason = prompt("Enter reason:");
      if (!reason) return;

      const { data } = await axios.post(
        `${backendUrl}/api/admin/block-doctor`,
        { docId, reason },
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
      toast.error(error.message);
    }
  };

  // ================= DOCTOR APPEALS LOGIC =================
  const getAllAppeals = async () => {
    try {
      if (!atoken) return;
      const { data } = await axios.get(`${backendUrl}/api/admin/appeals`, {
        headers: { Authorization: `Bearer ${atoken}` }
      });
      if (data.success) {
        setAppeals(data.appeals);
      }
    } catch (error) {
      console.log("Error fetching appeals:", error.message);
    }
  };

  const handleStatus = async (appealId, status) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/update-appeal`,
        { appealId, status },
        { headers: { Authorization: `Bearer ${atoken}` } }
      );
      if (data.success) {
        toast.success(`Appeal ${status}!`);
        getAllAppeals(); 
        getAllDoctors(); 
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ================= GET ALL USERS =================
  const getAllUsers = async () => {
    try {
      if (!atoken) return;

      const { data } = await axios.get(
        `${backendUrl}/api/admin/all-users`,
        {
          headers: {
            Authorization: `Bearer ${atoken}`, 
          },
        }
      );

      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch Users Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const registerHospital = async (formData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/register-hospital`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${atoken}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getAllHospitals(); 
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  // ================= GET ALL HOSPITALS =================
  const getAllHospitals = async () => {
    try {
      if (!atoken) return;

      const { data } = await axios.get(`${backendUrl}/api/admin/all-hospitals`, {
        headers: { Authorization: `Bearer ${atoken}` },
      });

      if (data.success) {
        setHospitals(data.hospitals);
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
    }
  };

  const blockHospital = async (hospitalId) => {
    try {
        const { data } = await axios.post(`${backendUrl}/api/admin/block-hospital`, 
            { hospitalId }, 
            { headers: { Authorization: `Bearer ${atoken}` } }
        );

        if (data.success) {
            toast.success(data.message);
            getAllHospitals(); 
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.error(error);
        toast.error("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const addPharmacy = async (formData) => {
    try {
        const { data } = await axios.post(
            `${backendUrl}/api/admin/add-pharmacy`, 
            formData, 
            {
                headers: {
                    Authorization: `Bearer ${atoken}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (data.success) {
            toast.success(data.message);
            getAllPharmacies(); 
            return true;
        } else {
            toast.error(data.message);
            return false;
        }
    } catch (error) {
        console.error("Add Pharmacy Error:", error); 
        toast.error(error.response?.data?.message || error.message);
        return false;
    }
  };

  const getAllPharmacies = async () => {
    try {
        if (!atoken) return;

        const { data } = await axios.get(`${backendUrl}/api/admin/all-pharmacies`, {
            headers: {
                Authorization: `Bearer ${atoken}` 
            }
        });

        if (data.success) {
            setPharmacies(data.pharmacies); 
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.error("Fetch Pharmacies Error:", error);
        toast.error(error.response?.data?.message || error.message);
    }
  };

  const toggleBlockPharmacy = async (pharmacyId) => {
    try {
        const { data } = await axios.post(
            `${backendUrl}/api/admin/toggle-block`,
            { pharmacyId },
            {
                headers: {
                    Authorization: `Bearer ${atoken}` 
                }
            }
        );

        if (data.success) {
            toast.success(data.message);
            getAllPharmacies(); 
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }
  };

  const getPendingDocs = async () => {
    try {
        if (!atoken) return; 

        const { data } = await axios.get(`${backendUrl}/api/admin/pending-doctors`, { 
            headers: { 
                Authorization: `Bearer ${atoken}` 
            } 
        });

        if (data.success) {
            setPendingDocs(data.doctors);
        }
    } catch (error) {
        console.error("Pending Docs Error:", error.response?.data?.message || error.message);
        toast.error(error.response?.data?.message || error.message);
    }
  };

  const getAllConsultations = async () => {
    if (!atoken) return; 
    
    setLoading(true); 
    try {
        const { data } = await axios.get(`${backendUrl}/api/admin/all-consultations`, {
            headers: { 
                Authorization: `Bearer ${atoken}` 
            }
        });

        if (data.success) {
            setConsultations(data.consultations || []);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to fetch consultations");
    } finally {
        setLoading(false);
    }
  };

  // ================= GET ALL PHARMACY ORDERS =================
  const getAllPharmacyOrders = async () => {
      try {
          if (!atoken) return;

          const { data } = await axios.get(`${backendUrl}/api/admin/all-pharmacy-orders`, {
              headers: { 
                  Authorization: `Bearer ${atoken}` 
              }
          });

          if (data.success) {
              setPharmacyOrders(data.orders);
          } else {
              toast.error(data.message);
          }
      } catch (error) {
          console.error("Error fetching pharmacy orders:", error);
          toast.error(error.response?.data?.message || error.message);
      }
  };

  // ================= GET SYSTEM REPORT (DYNAMIC DASHBOARD) =================
  const getSystemReport = async (type, searchId) => {
      setIsReportLoading(true);
      try {
          if (!atoken) return;

          const { data } = await axios.get(
              `${backendUrl}/api/admin/system-report?type=${type}&searchId=${searchId}`,
              { 
                  headers: { 
                      Authorization: `Bearer ${atoken}` 
                  } 
              }
          );

          // Saxidda Condition-ka: Haddii data ay timaado oo aanay wadan success: false
          if (data && data.success !== false) { 
              setSystemReportData(data);
              toast.success("Warbixinta si guul leh ayaa loo soo jiiday!");
          } else {
              toast.error(data.message || "Xogta lama helin");
              setSystemReportData(null); 
          }
      } catch (error) {
          console.error("System Report Error:", error);
          toast.error(error.response?.data?.message || "Cilad ayaa dhacday ama ID-ga lama helin");
          setSystemReportData(null); 
      } finally {
          setIsReportLoading(false);
      }
  };

  // ================= AUTO LOAD =================
  useEffect(() => {
    if (atoken) {
      getAllDoctors();
      getAllUsers();
      getAllHospitals();
      getAllAppeals();
      getAllConsultations();
      getAllPharmacies();
      getAllPharmacyOrders();
    }
  }, [atoken]);

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
    completeAppointment,
    dashData,
    getDashData,
    blockDoctor,
    appeals,
    getAllAppeals,
    handleStatus,
    users,
    getAllUsers,
    hospitals,
    registerHospital,
    getAllHospitals,
    blockHospital,
    pharmacies, 
    setPharmacies,
    addPharmacy,
    getAllPharmacies,
    toggleBlockPharmacy,
    pendingDocs,
    getPendingDocs,
    consultations,       
    getAllConsultations,
    pharmacyOrders,
    getAllPharmacyOrders,
    systemReportData,
    setSystemReportData,
    getSystemReport,
    isReportLoading, // Lagu daray state-kan si uu dashboard-ka ugu shaqeeyo
    setIsReportLoading, // Lagu daray function-kan
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;