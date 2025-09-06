import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { prepareExpenseChartDetails } from "../../utils/helper";
import CustomLineChart from "../Charts/CustomLineChart";

const ExpenseOverview = ({ transactions, onExpenseIncome }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareExpenseChartDetails(transactions);
    setChartData(result);
    return () => {};
  }, [transactions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg">Expense Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track your expenses over time and analyze your spending.
          </p>
        </div>
        <button onClick={onExpenseIncome} className="add-btn">
          <LuPlus className="text-lg" />
          Add Expense
        </button>
      </div>
      <div className="mt-10">
        <CustomLineChart data={chartData} />
      </div>
    </div>
  );
};

export default ExpenseOverview;
