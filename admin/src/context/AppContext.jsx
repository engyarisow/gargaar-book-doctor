import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currency = '$'

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust if birthday hasn't occurred yet this year
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return "";

    // Support both YYYY_MM_DD and YYYY-MM-DD
    const separator = slotDate.includes('_') ? '_' : '-';
    const [year, month, day] = slotDate.split(separator);

    return `${day} ${months[Number(month)]} ${year}`;
  };

  const value = {
    calculateAge,
    slotDateFormat,
    currency
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;