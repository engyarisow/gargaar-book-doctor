import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const Login = () => {

  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {

      // Admin Login
      if (state === "Admin") {

        const { data } = await axios.post(
          backendUrl + "/api/admin/login",
          { email, password }
        );

        if (data.success) {

          localStorage.setItem("aToken", data.token);
          setAToken(data.token);

          toast.success("Admin Login Successful");

        } else {
          toast.error(data.message);
        }

      }

      // Doctor Login
      else {

        const { data } = await axios.post(
          backendUrl + "/api/doctor/login",
          { email, password }
        );

        if (data.success) {

          localStorage.setItem("dToken", data.token);
          setDToken(data.token);

          toast.success("Doctor Login Successful");

        } else {
          toast.error(data.message);
        }

      }

    } catch (error) {

      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");

    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">

      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">

        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-3 mt-1"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-3 mt-1"
            type="password"
            required
          />
        </div>

        <button className="bg-primary text-white w-full py-2 rounded-md text-base">
          Login
        </button>

        {state === "Admin" ? (
          <p>
            Doctor Login
            <span
              className="text-primary underline cursor-pointer ml-1"
              onClick={() => setState("Doctor")}
            >
              Click here?
            </span>
          </p>
        ) : (
          <p>
            Admin Login
            <span
              className="text-primary underline cursor-pointer ml-1"
              onClick={() => setState("Admin")}
            >
              Click here?
            </span>
          </p>
        )}

      </div>

    </form>
  );
};

export default Login;