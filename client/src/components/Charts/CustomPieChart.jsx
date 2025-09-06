import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import { addThousandSeparator } from "../../utils/helper";
import CustomLegend from "./CustomLegend";

const CustomPieChart = ({
  data,
  label,
  totalAmount,
  colors,
  showTextAnchor,
}) => {
  return (
    <div>
      <ResponsiveContainer width="100%" height={380}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            innerRadius={100}
            labelLine={false}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={CustomLegend} verticalAlign="bottom" align="center" iconType="circle" iconSize={10} wrapperStyle={{ marginTop: 12 }} />
          {showTextAnchor && (
            <>
              <text
                x="50%"
                y="50%"
                dy={-20}
                textAnchor="middle"
                fill="#777"
                fontSize="14px"
              >
                {label}
              </text>
              <text
                x="50%"
                y="50%"
                dy={12}
                textAnchor="middle"
                fill="#111"
                fontSize="18px"
                fontWeight="700"
              >
                {addThousandSeparator(Number(totalAmount) || 0)}
              </text>
            </>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomPieChart;
