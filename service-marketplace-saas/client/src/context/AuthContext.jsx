import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

const [user,setUser] = useState(null);
const [loading,setLoading] = useState(true);

/* ================= AUTO LOGIN ================= */

useEffect(()=>{

const storedUser = localStorage.getItem("user");
const token = localStorage.getItem("token");

if(storedUser && token){

setUser(JSON.parse(storedUser));

/* attach token to axios */

API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

}

setLoading(false);

},[]);

/* ================= REGISTER ================= */

const register = async(formData)=>{

try{

const { data } = await API.post("/auth/register",formData);

/* backend should return token + user */

localStorage.setItem("token",data.token);
localStorage.setItem("user",JSON.stringify(data.user));

API.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

setUser(data.user);

return data;

}catch(error){

throw error.response?.data || {message:"Register failed"};

}

};

/* ================= LOGIN ================= */

const login = async(formData)=>{

try{

const { data } = await API.post("/auth/login",formData);

localStorage.setItem("token",data.token);
localStorage.setItem("user",JSON.stringify(data.user));

API.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

setUser(data.user);

return data;

}catch(error){

throw error.response?.data || {message:"Login failed"};

}

};

/* ================= LOGOUT ================= */

const logout = ()=>{

localStorage.removeItem("token");
localStorage.removeItem("user");

delete API.defaults.headers.common["Authorization"];

setUser(null);

};

/* ================= PROVIDER ================= */

return(

<AuthContext.Provider value={{
user,
setUser,
login,
register,
logout,
loading
}}>

{children}

</AuthContext.Provider>

);

}