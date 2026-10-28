import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const PharmacyContext = createContext();

const PharmacyContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [pToken, setPToken] = useState(localStorage.getItem("pToken") || "");
  const [profileData, setProfileData] = useState(false);
  const [dashData, setDashData] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  

  // ---------------- AXIOS INTERCEPTOR (For Blocked/403 Errors) ----------------
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          // 1. Logic to clear state
          setPToken("");
          localStorage.removeItem("pToken");

          // 2. Show the message ONLY ONCE here
          const reason = error.response.data.message || "Access Denied: Account Blocked.";
          toast.error(reason, { toastId: 'block-error' }); // 'toastId' prevents duplicate pops

          // 3. Optional: Redirect to home/login
          if (window.location.pathname !== '/') {
             setTimeout(() => window.location.href = '/', 2000);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ---------------- SYNC TOKEN WITH LOCALSTORAGE ----------------
  useEffect(() => {
    if (pToken) {
      localStorage.setItem("pToken", pToken);
    } else {
      localStorage.removeItem("pToken");
    }
  }, [pToken]);

  // ---------------- GET PHARMACY PROFILE ----------------
  const getPharmacyProfile = async () => {
    if (!pToken) return;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/pharmacy/profile`,
        {
          headers: { ptoken: pToken }
        }
      );

      if (data.success) {
        setProfileData(data.pharmacy);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ---------------- UPDATE PHARMACY PROFILE ----------------
  const updatePharmacyProfile = async (updatedData) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/pharmacy/update-profile`,
        updatedData,
        {
          headers: { ptoken: pToken }
        }
      );

      if (data.success) {
        toast.success(data.message);
        setProfileData(data.pharmacy);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ---------------- 🔥 ADD PRODUCT API (CUSUB) ----------------
  const addProduct = async (productData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/add-product`,
        productData,
        {
          headers: { ptoken: pToken }
        }
      );

      if (data.success) {
        toast.success(data.message);
        getPharmacyProducts(); // Si otomaatig ah ugu update garee liiska shaashada ku furan
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

  // ---------------- 🔥 GET PHARMACY PRODUCTS LIST (CUSUB) ----------------
  const getPharmacyProducts = async () => {
    if (!pToken) return;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/pharmacy/products`,
        {
          headers: { ptoken: pToken }
        }
      );

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  
  const getPharmacyOrders = async () => {
    if (!pToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/orders`, { headers: { ptoken: pToken } });
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
//
const changeOrderStatus = async (orderId, newStatus, verifyCode = null) => {
    try {
      // 🚨 BEDDEL 1: Waxaan u beddelnay 'axios.post' si uu ula jaanqaado Backend-ka
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/change-order-status`,
        {
          orderId,
          newStatus,
          verifyCode,
        },
        {
          headers: {
            ptoken: pToken,
          },
        }
      );

      if (data.success) {
        // Cusboonaysii dalabaadka shaashadda ku jira
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, orderStatus: newStatus, isVerified: true }
              : order
          )
        );

        // 🚀 BEDDEL 2: Toos u soo jiid xogta cusub ee daawooyinka iyo Alerts-ka 
        // (Tani waxay toos u beddelaysaa tirada 'Out of Stock' iyadoo aan page-ka la refresh garayn)
        getPharmacyProducts();
        getPharmacyAlerts();
        getDashboardData(); // Si Dashboard-ka (Revenue/Delivered) isna toos isu beddelo

        return {
          success: true,
          message: data.message,
        };
      }

      return {
        success: false,
        message: data.message,
      };
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setPToken("");
        localStorage.removeItem("pToken");

        return {
          success: false,
          message: "Fadlan mar kale login samee.",
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

const getDashboardData = async () => {
    try {

        const { data } = await axios.get(
            `${backendUrl}/api/pharmacy/dashboard`,
            {
                headers: {
                    ptoken: pToken
                }
            }
        );

        if (data.success) {
            setDashData(data.dashboard);
        } else {
            toast.error(data.message);
        }

    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }
};

// 🔥 2. GET ALERTS (OUT OF STOCK & EXPIRED) CUSUB
  const getPharmacyAlerts = async () => {
    if (!pToken) return;
    try {
      // Out of stock
      const stockRes = await axios.get(`${backendUrl}/api/pharmacy/out-of-stock`, {
        headers: { ptoken: pToken }
      });
      if (stockRes.data.success) {
        setOutOfStockCount(stockRes.data.medicines.length);
      }

      // Expired
      const expRes = await axios.get(`${backendUrl}/api/pharmacy/expired`, {
        headers: { ptoken: pToken }
      });
      if (expRes.data.success) {
        setExpiredCount(expRes.data.medicines.length);
      }
    } catch (error) {
      console.error("Cillad soo qaadashada Alerts-ka:", error);
    }
  };


  // Marka uu token-ku jiro ama isbeddelo, soo jiid Profile-ka iyo Alaabtaba
  useEffect(() => {
    if (pToken) {
      getPharmacyProfile();
      getPharmacyProducts(); 
      getPharmacyOrders();
       getDashboardData();
       getPharmacyAlerts();
    }
  }, [pToken]);

  const value = {
     pToken,
  setPToken,
  backendUrl,

  dashData,
  setDashData,
  getDashboardData,

  profileData,
  setProfileData,
  getPharmacyProfile,
  updatePharmacyProfile,

  products,
  setProducts,
  addProduct,
  getPharmacyProducts,

  orders,
  setOrders,
  getPharmacyOrders,
  changeOrderStatus,
    outOfStockCount,
    expiredCount,
    getPharmacyAlerts,
  };

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
};

export default PharmacyContextProvider;