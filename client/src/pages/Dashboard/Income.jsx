import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/income/IncomeOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import useUserAuth from "../../hooks/useUserAuth";
import Model from "../../components/Model";
import AddIncomeForm from "../../components/income/AddIncomeForm";
import toast from "react-hot-toast";
import IncomeList from "../../components/income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";

const Income = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [openAddIncomeModel, setOpenAddIncomeModel] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openDeleteIncomeModel, setOpenDeleteIncomeModel] = useState({
    show: false,
    data: null,
  });

  const fetchIncomeDetails = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.INCOME.GET_ALL_INCOME}`
      );

      if (response.data) {
        setIncomeData(response.data);
      }
    } catch (error) {
      console.log("Error fetching income data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleAddIncome = async (payload) => {
    if (submitting) return;
    setSubmitting(true);

    const { source = "", amount = "", date = "", icon } = payload || {};

    if (!source.trim() || !date) {
      toast.error("Please fill all required fields.");
      setSubmitting(false);
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount.");
      setSubmitting(false);
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        source: source.trim(),
        amount: numericAmount,
        date,
        icon,
      });
      setOpenAddIncomeModel(false);
      toast.success("Income added successfully.");
      await fetchIncomeDetails();
    } catch (error) {
      console.log(
        "Error adding income:",
        error.response?.data?.message || error.message
      );
      toast.error(error.response?.data?.message || "Failed to add income");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));

      setOpenDeleteIncomeModel({ show: false, data: null });
      toast.success("Income record deleted successfully.");
      await fetchIncomeDetails();
    } catch (error) {
      console.log("Error deleting income:", error);
      toast.error(error.response?.data?.message || "Failed to delete income");
    }
  };

  const handleDownloadIncomeDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'income_details.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log('Error downloading income details:', error);
      toast.error(error.response?.data?.message || 'Failed to download income details');
    }
  };

  useUserAuth();

  useEffect(() => {
    fetchIncomeDetails();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-3">
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModel(true)}
            />
          </div>
          <div className="col-span-1 md:col-span-3">
            <IncomeList
              transactions={incomeData}
              onDelete={(id) => {
                setOpenDeleteIncomeModel({ show: true, data: id });
              }}
              onDownload={handleDownloadIncomeDetails}
            />
          </div>
        </div>
        <Model
          isOpen={openAddIncomeModel}
          onClose={() => setOpenAddIncomeModel(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Model>

        <Model
          isOpen={openDeleteIncomeModel.show}
          onClose={() => setOpenDeleteIncomeModel({ show: false, data: null })}
          title="Delete Income"
        >
          <DeleteAlert
            content={`Are you sure you want to delete this income record? This action cannot be undone.`}
            onDelete={() => deleteIncome(openDeleteIncomeModel.data)}
          />
        </Model>
      </div>
    </DashboardLayout>
  );
};

export default Income;
