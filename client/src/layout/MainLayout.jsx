import Navbar from "@/components/Navbar";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
  <>
     <div className="flex bg-[rgb(231,228,235)]  flex-col min-h-screen">
    {/* // <div className="flex bg-[#fbfbfb]  flex-col min-h-screen"> */}
    {/* <div className="flex flex-col min-h-screen">   */}
      <Navbar />
      <div className="flex-1 mt-16">
        <Outlet />
      </div>
    </div>
    </>
  );
};

export default MainLayout;




