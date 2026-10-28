import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const HospitalContext = createContext();

const HospitalContextProvider = (props) => {
    
    const [hToken, setHToken] = useState(localStorage.getItem('hToken') ? localStorage.getItem('hToken') : '');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [consultations, setConsultations] = useState([]);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // 2. addDoctor Function
    const addDoctor = async (formData) => {
    try {
        if (!hToken) {
            toast.error("Fadlan login samee markale");
            return false;
        }

        const { data } = await axios.post(`${backendUrl}/api/hospital/add-doctor`, formData, {
            headers: { htoken: hToken } // Hubi inuu yahay 'htoken' xarfo yaryar
        });

        if (data.success) {
            toast.success(data.message);
            return true;
        } else {
            toast.error(data.message);
            return false;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Token-kaagu ma shaqaynayo");
        return false;
    }
};

const getDoctors = async () => {
    try {
        const { data } = await axios.get(backendUrl + '/api/hospital/doctors', {
            headers: { htoken: hToken }
        });

        if (data.success) {
            setDoctors(data.doctors);
            console.log(data.doctors);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
};
const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/hospital/change-availability', 
                { docId }, 
                { headers: { htoken: hToken } }
            );

            if (data.success) {
                toast.success(data.message);
                getDoctors(); 
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Fetch all appointments for the hospital
    const getAppointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/hospital/appointments`, { 
                headers: { hToken } 
            });

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
        const { data } = await axios.post(backendUrl + '/api/hospital/complete-appointment', 
            { appointmentId }, 
            { headers: { htoken: hToken } }
        );
        if (data.success) {
            toast.success(data.message);
            getAppointments(); // Refresh list
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
}

const cancelAppointment = async (appointmentId) => {
    try {
        const { data } = await axios.post(backendUrl + '/api/hospital/cancel-appointment', 
            { appointmentId }, 
            { headers: { htoken: hToken } }
        );

        if (data.success) {
            toast.success(data.message);
            getAppointments(); // Refresh list
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
}
const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital/dashboard', { headers: { hToken } });
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    const getHospitalConsultations = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital/consultations', { headers: { hToken } });
            if (data.success) {
                // Maadaama backend-kaagu uu mar hore soo sameeyay .reverse(), halkan toos u kaydi
                setConsultations(data.consultations);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };
   const acceptConsultation = async (consultationId) => {
    try {
        const { data } = await axios.post(backendUrl + '/api/hospital/accept-consultation', 
            { consultationId }, { headers: { htoken: hToken } });
        if (data.success) {
            toast.success("Ballantii waa la aqbalay!");
            getDashData(); // Dashboard-ka ayaa isku cusboonaysiinaya
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
};
    
    const value = { 
        hToken, 
        setHToken, 
        backendUrl, 
        addDoctor,
        doctors,
        getDoctors,
        changeAvailability,
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        getDashData ,
        consultations, setConsultations,
        getHospitalConsultations, 
        acceptConsultation
    };

    return (
        <HospitalContext.Provider value={value}>
            {props.children}
        </HospitalContext.Provider>
    );
};

export default HospitalContextProvider;