import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

const ExpenseTransations = ({transactions, onSeeMore}) => {
  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-5'>
        <h5 className='text-lg'>Expenses</h5>
        <button className='card-btn' onClick={onSeeMore}>
          See All <LuArrowRight className='text-base' />
        </button>
      </div>
      <div>
        {transactions?.slice(0, 5).map((expense) => (
            <TransactionInfoCard
            key={expense._id}
            title={expense.category}
            icon={expense.icon}
            amount={expense.amount}
            date={moment(expense.date).format('Do MMM YYYY')}
            type="expense"
            hideDeleteBtn
            />
        ))}
      </div>
    </div>
  )
}

export default ExpenseTransations
