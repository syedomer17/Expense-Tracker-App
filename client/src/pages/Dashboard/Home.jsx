import React, { useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { IoMdCard } from "react-icons/io";
import { addThousandSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransations from "../../components/Dashboard/ExpenseTransations";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/Dashboard/RecentIncome";

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const fetchDashboardData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.DASHBOARD.GET_DATA}`
      );
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandSeparator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
          />

          <InfoCard
            icon={<IoMdCard />}
            label="Total Income"
            value={addThousandSeparator(dashboardData?.totalIncome || 0)}
            color="bg-primary"
          />

          <InfoCard
            icon={<IoMdCard />}
            label="Total Expense"
            value={addThousandSeparator(dashboardData?.totalExpense || 0)}
            color="bg-primary"
          />
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="col-span-1">
            <RecentTransactions
              transactions={dashboardData?.recentTransactions}
              onSeeMore={() => navigate("/income")}
            />
          </div>
          <div className="col-span-1">
            <FinanceOverview
              totalBalance={dashboardData?.totalBalance || 0}
              totalIncome={dashboardData?.totalIncome || 0}
              totalExpense={dashboardData?.totalExpense || 0}
            />
          </div>
          <div className="col-span-1">
            <ExpenseTransations
              transactions={
                dashboardData?.last30DaysExpenses?.transactions || []
              }
              onSeeMore={() => navigate("/expense")}
            />
          </div>
          <div className="col-span-1">
            <Last30DaysExpenses
              data={dashboardData?.last30DaysExpenses?.transactions || []}
            />
          </div>
          <div className="col-span-1">
            <RecentIncome
              transactions={dashboardData?.last60DaysIncome?.transactions || []}
              onSeeMore={() => navigate("/income")}
            />
          </div>
          <div className="col-span-1">
            <RecentIncomeWithChart
              data={dashboardData?.last60DaysIncome?.transactions?.slice(0, 4) || []}
              totalIncome={dashboardData?.totalIncome || 0}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
