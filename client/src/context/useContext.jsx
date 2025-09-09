import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // function to update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // function to clear user data (e.g., on logout)
  const clearUser = () => {
    setUser(null);
  };

  // hydrate user from backend using cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.AUTH.ME);
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
