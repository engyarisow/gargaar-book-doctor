import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { HospitalContext } from '../context/HospitalContext'
import { PharmacyContext } from '../context/PharmacyContext'

// 1. Admin Route Guard
export const AdminRoute = ({ children }) => {
    const { atoken } = useContext(AdminContext)
    return atoken ? children : <Navigate to="/login" />
}

// 2. Doctor Route Guard
export const DoctorRoute = ({ children }) => {
    const { dToken } = useContext(DoctorContext)
    return dToken ? children : <Navigate to="/login" />
}

// 3. Hospital Route Guard
export const HospitalRoute = ({ children }) => {
    const { hToken } = useContext(HospitalContext)
    return hToken ? children : <Navigate to="/login" />
}

// 4. Pharmacy Route Guard 💊 (Beddelkii Clinic)
export const PharmacyRoute = ({ children }) => {
    const { pToken } = useContext(PharmacyContext)
    return pToken ? children : <Navigate to="/login" />
}