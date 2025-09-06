import React from "react";

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
      <div
        className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl shrink-0`}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className="text-[22px] font-semibold text-gray-900">${value}</div>
      </div>
    </div>
  );
};

export default InfoCard;
