import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");

  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);

  const [dashData, setDashData] = useState(false);

  const [profileData, setProfileData] = useState(false);
  useEffect(() => {
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 403) {
        // 1. Logic to clear state
        setDToken("");
        localStorage.removeItem("dToken");

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
  
  // Sync token with localStorage
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
  const createPost = async (formData) => {
  try {

    const { data } = await axios.post(
      `${backendUrl}/api/doctor/create-post`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${dToken}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    if (data.success) {
      toast.success(data.message);
      return data.post;
    } else {
      toast.error(data.message);
    }

  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

 // GET all posts by doctor
const getDoctorPosts = async () => {
  if (!dToken) return [];

  try {
    const { data } = await axios.get(`${backendUrl}/api/doctor/posts`, {
      headers: { Authorization: `Bearer ${dToken}` },
    });

    if (data.success && Array.isArray(data.posts)) {
      // Use counts from backend if available, fallback to array lengths
      const postsWithStats = data.posts.map(post => ({
        ...post,
        likesCount: post.likesCount ?? post.likes?.length ?? 0,
        viewsCount: post.viewsCount ?? post.viewers?.length ?? 0,
        commentsCount: post.commentsCount ?? post.comments?.length ?? 0,
      }));
      return postsWithStats;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch doctor posts:", error);
    return [];
  }
};


  // UPDATE a post
  const updateDoctorPost = async (postId, updatedData, imageFile = null) => {
    try {
      const formData = new FormData();
      if (updatedData.title) formData.append("title", updatedData.title);
      if (updatedData.content) formData.append("content", updatedData.content);
      if (updatedData.isPublic !== undefined)
        formData.append("isPublic", updatedData.isPublic);
      if (imageFile) formData.append("image", imageFile);

      const { data } = await axios.put(
        `${backendUrl}/api/doctor/posts/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        return data.post;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // DELETE a post
  const deleteDoctorPost = async (postId) => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/doctor/posts/${postId}`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
      return data.success;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  // ---------------- SEND APPEAL (NEW) ----------------
  const sendDoctorAppeal = async (email, reason) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/send-appeal`, { email, reason });
      if (data.success) {
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Appeal submission failed");
      return false;
    }
  };
// ---------------- GET VIDEO CONSULTATIONS (NEW API) ----------------

  const getConsultations = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/consultations`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      if (data.success) {
        setConsultations(data.consultations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch consultations");
    }
  };
  // 1. Function-ka loogu talagalay in dhakhtarku "Done" riixo (Complete)
// 1. Function-ka loogu talagalay in dhakhtarku "Done" riixo (Complete)
const completeConsultation = async (consultationId) => {
    try {
        const { data } = await axios.post(
            `${backendUrl}/api/doctor/complete-consultation`, 
            { consultationId }, 
            { 
                headers: { Authorization: `Bearer ${dToken}` } // ISKU MID KA DHIG SIDII GET-KA
            }
        );

        if (data.success) {
            toast.success(data.message);
            getConsultations(); 
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Error completing consultation");
    }
};

// 2. Function-ka loogu talagalay in dhakhtarku "Cancel" riixo
const cancelConsultation = async (consultationId) => {
    try {
        const { data } = await axios.post(
            `${backendUrl}/api/doctor/cancel-consultation`, 
            { consultationId }, 
            { 
                headers: { Authorization: `Bearer ${dToken}` } // ISKU MID KA DHIG SIDII GET-KA
            }
        );

        if (data.success) {
            toast.success(data.message);
            getConsultations();
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Error cancelling consultation");
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
    setProfileData,
    updateProfileData,

    createPost,
     getDoctorPosts,
    updateDoctorPost,
    deleteDoctorPost,
    sendDoctorAppeal,
    consultations,
   getConsultations,
   completeConsultation, 
    cancelConsultation ,
  };


  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;