import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/useContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const useUserAuth = () => {
  const { user, updateUser, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {

  // If already have user, do nothing
  if (user) return;

    let isMounted = true;

  const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GE_USER_INFO);
        if (isMounted && response.data?.user) {
          updateUser(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        if (isMounted) {
          clearUser();
          navigate("/login");
        }
      }
    };
    fetchUserInfo();

    return () => {
      isMounted = false;
    };
  }, [user, updateUser, clearUser, navigate]);
};

export default useUserAuth;
