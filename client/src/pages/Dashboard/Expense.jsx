import React, { useEffect, useState } from "react";
import useUserAuth from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import toast from "react-hot-toast";
import { LuMoveDownLeft } from "react-icons/lu";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import Model from "../../components/Model";
import ExpenseList from "../../components/Expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";

const Expense = () => {
  useUserAuth();
  const [expenseData, setExpenseData] = useState([]);
  const [openAddExpenseModel, setOpenAddExpenseModel] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openDeleteExpenseModel, setOpenDeleteExpenseModel] = useState({
    show: false,
    data: null,
  });

  const fetchExpenseDetails = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      );

      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.log("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleAddExpense = async (payload) => {
    if (submitting) return;
    setSubmitting(true);

    const { category = "", amount = "", date = "", icon } = payload || {};

    if (!category.trim() || !date) {
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
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category: category.trim(),
        amount: numericAmount,
        date,
        icon,
      });
      setOpenAddExpenseModel(false);
      toast.success("Expense added successfully.");
      await fetchExpenseDetails();
    } catch (error) {
      console.log(
        "Error adding expense:",
        error.response?.data?.message || error.message
      );
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));

      setOpenDeleteExpenseModel({ show: false, data: null });
      toast.success("Expense record deleted successfully.");
      await fetchExpenseDetails();
    } catch (error) {
      console.log("Error deleting expense:", error);
      toast.error(error.response?.data?.message || "Failed to delete expense");
    }
  };

  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expense_details.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log('Error downloading expense details:', error);
      toast.error(error.response?.data?.message || 'Failed to download expense details');
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
    return () => {};
  }, []);

  return (
  <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-3">
            <ExpenseOverview
              transactions={expenseData}
              onExpenseIncome={() => setOpenAddExpenseModel(true)}
            />
          </div>
          <div className="col-span-1 md:col-span-3">
            <ExpenseList
              transactions={expenseData}
              onDelete={(id) =>
                setOpenDeleteExpenseModel({ show: true, data: id })
              }
              onDownload={handleDownloadExpenseDetails}
            />
          </div>
        </div>
        <Model
          isOpen={openAddExpenseModel}
          onClose={() => setOpenAddExpenseModel(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Model>

        <Model
          isOpen={openDeleteExpenseModel.show}
          onClose={() => setOpenDeleteExpenseModel({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content={`Are you sure you want to delete this expense record? This action cannot be undone.`}
            onDelete={() => deleteExpense(openDeleteExpenseModel.data)}
          />
        </Model>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
