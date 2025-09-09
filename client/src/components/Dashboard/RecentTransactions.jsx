import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import moment from 'moment'
import TransactionInfoCard from '../Cards/TransactionInfoCard'


const RecentTransactions = ({ transactions, onSeeMore }) => {
  return (
    <div className="card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h5 className="text-lg font-semibold">Recent Transactions</h5>
        <button
          type="button"
          className="card-btn shrink-0 whitespace-nowrap"
          onClick={onSeeMore}
          aria-label="See all transactions"
        >
          See All <LuArrowRight className="text-base" />
        </button>
      </div>

      {/* Transactions */}
      <div className="mt-6 flex-1">
        {transactions?.length > 0 && (
          <ul className="space-y-4">
            {transactions.slice(0, 4).map((item) => (
              <TransactionInfoCard
                key={item._id || item.id}
                title={item.type === 'expense' ? item.category : item.source}
                date={moment(item.date).format('Do MMM YYYY')}
                amount={item.amount}
                type={item.type}
                hideDeleteBtn
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default RecentTransactions
