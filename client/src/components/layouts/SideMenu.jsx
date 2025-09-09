import React from "react";
import { SIDE_MENU_DATA } from "../../utils/data.js";
import { useContext } from "react";
import { UserContext } from "../../context/useContext.jsx";
import { useNavigate } from "react-router-dom";
import CharAvatar from "../Cards/CharAvatar.jsx";
import axiosInstance from "@/utils/axiosInstance.js";
import { API_PATHS } from "@/utils/apiPath.js";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);

  const navigate = useNavigate();

  const handleClick = (path) => {
    if (path === "/logout") {
      handleLogout();
      return;
    }
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
    } catch (e) {
      // ignore error
    }
    clearUser();
    navigate("/login");
  };
  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center gap-3 mt-2 mb-6">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-200"
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName || ""}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}
        <h5 className="text-gray-900 font-medium leading-6 text-center truncate max-w-[200px]">
          {user?.fullName || ""}
        </h5>
      </div>

      {SIDE_MENU_DATA.map((item) => {
        const isActive = activeMenu === item.label;
        return (
          <button
            type="button"
            key={item.id}
            className={`w-full flex items-center gap-3 text-[15px] py-2.5 px-4 rounded-lg mb-2 transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon
              className={`text-xl ${isActive ? "text-white" : "text-gray-600"}`}
            />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SideMenu;
