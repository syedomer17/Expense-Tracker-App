import React from "react";
import { addThousandSeparator } from "../../utils/helper";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomBarChart = ({ data = [], barName = "Amount" }) => {

  const getBarColor = (index) => {
    // Use a pair of harmonious purple shades
    return index % 2 === 0 ? "#875cf5" : "#cbb6ff";
  };

  // Determine x-axis key dynamically: supports {category} or {month}
  const xKey = data?.length
    ? (Object.prototype.hasOwnProperty.call(data[0], "category")
        ? "category"
        : Object.prototype.hasOwnProperty.call(data[0], "month")
        ? "month"
        : "category")
    : "category";

  const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
                    <p className="text-xs font-semibold text-purple-800 mb-1">{payload[0].payload[xKey]}</p>
                    <p className="text-sm text-gray-600">Amount: <span className="text-sm font-medium text-gray-900">{addThousandSeparator(payload[0].payload.amount)}</span></p>
                </div>
            )
        }
        return null;
    }
  const CustomLegend = () => (
    <div className="flex items-center justify-center mt-4">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
          <span className="text-sm font-medium text-gray-800">{barName}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-2">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
          />
          <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" tickFormatter={(v) => addThousandSeparator(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar
            dataKey="amount"
            name={barName}
            fill="#875cf5"
            radius={[10, 10, 0, 0]}
            barSize={28}
            activeDot={{ r: 8, fill: "yellow" }}
            activeStyle={{ fill: "green" }}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
