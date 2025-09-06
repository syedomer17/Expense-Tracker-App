import React from "react";
import moment from "moment";
import { addThousandSeparator } from "../../utils/helper";
import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";

const ExpenseList = ({ transactions = [], onDelete, onDownload }) => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const total = sorted.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg">Expense Sources</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {sorted.length} expense{sorted.length !== 1 ? "s" : ""} •
            Total: ${addThousandSeparator(total)}
          </p>
        </div>
        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      {/* Empty state */}
      {sorted.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          <div className="text-2xl mb-2">🧾</div>
          No expense records yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((expense) => (
            <TransactionInfoCard
              key={expense._id}
              // Backend returns `category`; previous code used non-existent `source`
              title={expense.category || expense.source || "(No Category)"}
              amount={expense.amount}
              date={moment(expense.date).format("DD MMM, YYYY")}
              icon={expense.icon}
              type="expense"
              onDelete={() => onDelete?.(expense._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
