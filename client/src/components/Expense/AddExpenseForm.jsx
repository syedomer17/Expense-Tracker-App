import React, { useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddExpenseForm = ({ onAddExpense }) => {
  const [income, setIncome] = useState({
    category: "",
    amount: "",
    date: "",
    icon: "",
  });

  const handleChanege = (key, value) => setIncome({ ...income, [key]: value });
  return (
    <>
      <div>
        <EmojiPickerPopup
          icon={income.icon}
          onSelect={(selectedIcon) => handleChanege("icon", selectedIcon)}
        />
        <Input
          label="Category"
          placeholder="Enter category"
          value={income.category}
          onChange={(e) => handleChanege("category", e.target.value)}
          type="text"
        />
        <Input
            label="Amount"
            placeholder="Enter amount"
            value={income.amount}
            onChange={(e) => handleChanege("amount", e.target.value)}
            type="number"
          />
        <Input
          label="Date"
          placeholder="Select date"
          value={income.date}
          onChange={(e) => handleChanege("date", e.target.value)}
          type="date"
        />
        <div className=" flex justify-end mt-6">
          <button
            onClick={() => onAddExpense(income)}
            className="add-btn add-btn-fill"
          >
            Add Expense
          </button>
        </div>  
      </div>
    </>
  );
};

export default AddExpenseForm;
