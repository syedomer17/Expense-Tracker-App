import React from "react";
import Navbar from "./Navbar.jsx";
import SideMenu from "./SideMenu.jsx";
import { useContext } from "react";
import { UserContext } from "../../context/useContext";

const DashboardLayout = ({children, activeMenu}) => {
    const {user} = useContext(UserContext);
  return (
    <div>
      <Navbar activeMenu={activeMenu} />

      <div className="flex">
        <div className="max-[1080px]:hidden">
          <SideMenu activeMenu={activeMenu} />
        </div>
        <div className="grow mx-5">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
