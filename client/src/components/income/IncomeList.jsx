import React from "react";
import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandSeparator } from "../../utils/helper";

const IncomeList = ({ transactions = [], onDelete, onDownload }) => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const total = sorted.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg">Income Sources</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {sorted.length} item{sorted.length !== 1 ? "s" : ""}
            {" • "}Total: ${addThousandSeparator(total)}
          </p>
        </div>
        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      {/* Empty state */}
      {sorted.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          <div className="text-2xl mb-2">💸</div>
          No income records yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((income) => (
            <TransactionInfoCard
              key={income._id}
              title={income.source}
              amount={income.amount}
              date={moment(income.date).format("DD MMM, YYYY")}
              icon={income.icon}
              type="income"
              onDelete={() => onDelete?.(income._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomeList;
