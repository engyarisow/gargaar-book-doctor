import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";

export const DoctorProfile = () => {

  const { dToken, profileData, getProfileData, updateProfileData } = useContext(DoctorContext);
  const { currency, backendUrl } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  return profileData && (
    <div>
      <div>
        <div>
          <img className='w-40' src={profileData.image} alt="Doctor" />
        </div>

        <div>
          {/* Name - Degree - Experience */}
          <p>{profileData.name}</p>

          <div>
            <p>{profileData.degree}-{profileData.speciality}</p>
          </div>

        </div>
      </div>
    </div>
  );
};