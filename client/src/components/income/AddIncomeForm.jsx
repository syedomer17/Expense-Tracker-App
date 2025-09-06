import React, { useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddIncomeForm = ({ onAddIncome }) => {
  const [income, setIncome] = useState({
    source: "",
    amount: "",
    date: "",
    icon: "",
  });

  const handleChange = (key, value) => {
    setIncome((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    income.source.trim().length > 0 && income.amount !== "" && income.date !== "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    const payload = {
      source: income.source.trim(),
      amount: Number(income.amount),
      date: income.date,
      icon: income.icon || undefined,
    };
    onAddIncome?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EmojiPickerPopup
        icon={income.icon}
        onSelect={(icon) => handleChange("icon", icon)}
      />
      <Input
        value={income.source}
        onChange={({ target }) => handleChange("source", target.value)}
        label="Income Source"
        placeholder="Salary, Freelance, etc."
        type="text"
      />
      <Input
        value={income.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount"
        placeholder="Enter amount"
        type="number"
      />
      <Input
        value={income.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date"
        type="date"
      />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="add-btn add-btn-fill disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isValid}
        >
          Add Income
        </button>
      </div>
    </form>
  );
};

export default AddIncomeForm;
